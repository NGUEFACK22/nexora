# One-off: generate the backend Vercel env file (no secret literals here —
# values are copied file-to-file from the local .env).
import io, os

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env = {}
for line in io.open(os.path.join(root, ".env"), "rb").read().decode("utf-8").split("\n"):
    l = line.strip()
    if l and not l.startswith("#") and "=" in l:
        k, v = l.split("=", 1)
        env[k] = v

def val(key):
    return env.get(key, "")

SITE_FRONT = "https://nexora-eta-gold.vercel.app"

sections = [
    ("1) Mode serverless — OBLIGATOIRE", [
        ("SERVERLESS", "true"),
    ]),
    ("2) Socle (obligatoires — vérifiées au boot)", [
        ("DATABASE_URL", val("DATABASE_URL")),
        ("JWT_SECRET", val("JWT_SECRET")),
        ("ENCRYPTION_PROVIDER", "local"),
        ("ENCRYPTION_KEY", val("ENCRYPTION_KEY")),
        ("IS_GENERAL", "true"),
    ]),
    ("3) URLs (le frontend Vercel appelle ce backend)", [
        ("FRONTEND_URL", SITE_FRONT),
        ("MAIN_URL", SITE_FRONT),
        ("NEXT_PUBLIC_BACKEND_URL", "<URL de CE projet backend après déploiement>"),
        ("BACKEND_INTERNAL_URL", "<URL de CE projet backend après déploiement>"),
    ]),
    ("4) Stockage Cloudflare R2 (validé)", [
        ("STORAGE_PROVIDER", "cloudflare"),
        ("CLOUDFLARE_ACCOUNT_ID", val("CLOUDFLARE_ACCOUNT_ID")),
        ("CLOUDFLARE_ACCESS_KEY", val("CLOUDFLARE_ACCESS_KEY")),
        ("CLOUDFLARE_SECRET_ACCESS_KEY", val("CLOUDFLARE_SECRET_ACCESS_KEY")),
        ("CLOUDFLARE_REGION", "auto"),
        ("CLOUDFLARE_BUCKETNAME", val("CLOUDFLARE_BUCKETNAME")),
        ("CLOUDFLARE_BUCKET_URL", val("CLOUDFLARE_BUCKET_URL")),
    ]),
    ("5) Emails — AgentMail (validé)", [
        ("EMAIL_PROVIDER", "agentmail"),
        ("AGENTMAIL_API_KEY", val("AGENTMAIL_API_KEY")),
        ("AGENTMAIL_INBOX_ID", val("AGENTMAIL_INBOX_ID")),
        ("EMAIL_FROM_ADDRESS", val("EMAIL_FROM_ADDRESS")),
        ("EMAIL_FROM_NAME", "Nexora"),
    ]),
    ("6) IA — Google Gemini (validé)", [
        ("AI_PROVIDER", "google"),
        ("GOOGLE_GENERATIVE_AI_API_KEY", val("GOOGLE_GENERATIVE_AI_API_KEY")),
        ("AI_MODEL", val("AI_MODEL") or "gemini-flash-lite-latest"),
    ]),
    ("7) Canal Telegram (token validé)", [
        ("TELEGRAM_TOKEN", val("TELEGRAM_TOKEN")),
        ("TELEGRAM_BOT_NAME", val("TELEGRAM_BOT_NAME")),
    ]),
    ("8) Infrastructure — À COMPLÉTER (gratuit)", [
        ("REDIS_URL", "<À CRÉER : Upstash gratuit (sans carte) → copier l'URL redis>"),
        ("TEMPORAL_ADDRESS", "<à régler avec le guide — le worker de publication reste à héberger>"),
    ]),
]

out = [
    "# ============================================================",
    "# NEXORA — Variables d'environnement pour le projet VERCEL « backend »",
    "# (Root Directory = apps/backend — le serveur NestJS en serverless)",
    "#",
    "# IMPORT : Vercel → Settings → Environment Variables → Import env file",
    "# ⚠️  Contient des secrets : ne jamais committer ni partager.",
    "# ============================================================",
]
missing = []
for title, pairs in sections:
    out.append("")
    out.append("# === " + title + " ===")
    for k, v in pairs:
        if v.startswith("<"):
            missing.append(k)
        out.append(f"{k}={v}")
out.append("")
out.append("# ⚠️  Ne définissez jamais NOT_SECURED en production.")
out.append("")

with io.open(os.path.join(root, "env.backend.vercel"), "wb") as f:
    f.write("\n".join(out).encode("utf-8"))

print("env.backend.vercel généré :", len(out), "lignes")
print("À compléter :", ", ".join(missing) if missing else "rien")
