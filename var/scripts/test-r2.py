# Test Cloudflare R2 pour Nexora — lit les CLOUDFLARE_* du .env racine.
# Usage :
#   python var/scripts/test-r2.py <bucket> [url-publique]
#   ex: python var/scripts/test-r2.py nexora-media https://pub-xxxx.r2.dev
# Vérifie : PUT objet via S3 (SigV4) -> GET via S3 -> GET via URL publique -> DELETE.
import hashlib, hmac, datetime, os, sys, urllib.request, re

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env = {}
with open(os.path.join(root, ".env"), encoding="utf-8") as f:
    for line in f:
        m = re.match(r"\s*([A-Z_]+)\s*=\s*\"?([^\"\r\n]*)", line)
        if m:
            env[m.group(1)] = m.group(2)

ACC = env["CLOUDFLARE_ACCOUNT_ID"]
AK = env["CLOUDFLARE_ACCESS_KEY"]
SK = env["CLOUDFLARE_SECRET_ACCESS_KEY"]
REGION = env.get("CLOUDFLARE_REGION", "auto")
HOST = f"{ACC}.r2.cloudflarestorage.com"
SERVICE = "s3"
BUCKET = sys.argv[1] if len(sys.argv) > 1 else None
PUBLIC = sys.argv[2].rstrip("/") if len(sys.argv) > 2 else None
KEY = "test/nexora-hello.txt"
BODY = b"Nexora R2 integration test"

if not BUCKET:
    sys.exit("Usage: python var/scripts/test-r2.py <bucket> [url-publique]")


def call(method, path, payload=b""):
    now = datetime.datetime.now(datetime.timezone.utc)
    amzdate = now.strftime("%Y%m%dT%H%M%SZ")
    datestamp = now.strftime("%Y%m%d")
    payload_hash = hashlib.sha256(payload).hexdigest()
    hdrs = {"host": HOST, "x-amz-content-sha256": payload_hash, "x-amz-date": amzdate}
    signed = ";".join(sorted(hdrs))
    canon = "\n".join(
        [method, path, "", "".join(f"{k}:{v}\n" for k, v in sorted(hdrs.items())),
         signed, payload_hash]
    )
    scope = f"{datestamp}/{REGION}/{SERVICE}/aws4_request"
    sts = "\n".join(["AWS4-HMAC-SHA256", amzdate, scope,
                     hashlib.sha256(canon.encode()).hexdigest()])
    def _h(k, m):
        return hmac.new(k, m.encode(), hashlib.sha256).digest()
    kk = _h(_h(_h(_h(("AWS4" + SK).encode(), datestamp), REGION), SERVICE), "aws4_request")
    sig = hmac.new(kk, sts.encode(), hashlib.sha256).hexdigest()
    hdrs["Authorization"] = (f"AWS4-HMAC-SHA256 Credential={AK}/{scope}, "
                             f"SignedHeaders={signed}, Signature={sig}")
    req = urllib.request.Request(f"https://{HOST}{path}", data=payload or None,
                                 method=method, headers=hdrs)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


code, _ = call("PUT", f"/{BUCKET}/{KEY}", BODY)
print(f"PUT  s3://{BUCKET}/{KEY} -> {code}", "OK" if code == 200 else "ECHEC")

code, data = call("GET", f"/{BUCKET}/{KEY}")
print(f"GET  s3 (contenu)        -> {code}", "OK" if data == BODY else "ECHEC")

if PUBLIC:
    try:
        with urllib.request.urlopen(f"{PUBLIC}/{KEY}") as r:
            print(f"GET  public {PUBLIC}/{KEY} -> {r.status}", "OK" if r.read() == BODY else "ECHEC")
    except urllib.error.HTTPError as e:
        print(f"GET  public              -> {e.code} ECHEC (activer Public access r2.dev sur le bucket)")

code, _ = call("DELETE", f"/{BUCKET}/{KEY}")
print(f"DELETE s3://{BUCKET}/{KEY} -> {code}", "OK" if code in (200, 204) else "ECHEC")
