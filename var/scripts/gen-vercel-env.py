# One-off: generate the complete coordinated Vercel import file from the
# local .env. Secrets are copied file-to-file and never printed.
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

SITE = "https://nexora-eta-gold.vercel.app"

sections = []

sections.append(("1) URLs — tout sur le même domaine Vercel (un seul projet)", [
    ("NEXT_PUBLIC_BACKEND_URL", SITE),
    ("FRONTEND_URL", SITE),
    ("MAIN_URL", SITE),
    ("BACKEND_INTERNAL_URL", SITE),
]))

sections.append(("2) Socle backend — Neon + sécurité", [
    ("IS_GENERAL", "true"),
    ("DATABASE_URL", val("DATABASE_URL")),
    ("JWT_SECRET", val("JWT_SECRET")),
    ("ENCRYPTION_PROVIDER", "local"),
    ("ENCRYPTION_KEY", val("ENCRYPTION_KEY")),
]))

sections.append(("3) Infrastructure — À COMPLÉTER (créer gratuitement puis coller l'URL)", [
    ("REDIS_URL", "<À CRÉER : Upstash gratuit (upstash.com, sans carte) → copier l'URL redis>"),
    ("TEMPORAL_ADDRESS", "<À CRÉER : serveur Temporal — voir guide 08-deploiement.md>"),
]))

sections.append(("4) Stockage Cloudflare R2 — validé et opérationnel", [
    ("STORAGE_PROVIDER", "cloudflare"),
    ("CLOUDFLARE_ACCOUNT_ID", val("CLOUDFLARE_ACCOUNT_ID")),
    ("CLOUDFLARE_ACCESS_KEY", val("CLOUDFLARE_ACCESS_KEY")),
    ("CLOUDFLARE_SECRET_ACCESS_KEY", val("CLOUDFLARE_SECRET_ACCESS_KEY")),
    ("CLOUDFLARE_REGION", "auto"),
    ("CLOUDFLARE_BUCKETNAME", val("CLOUDFLARE_BUCKETNAME")),
    ("CLOUDFLARE_BUCKET_URL", val("CLOUDFLARE_BUCKET_URL")),
]))

sections.append(("5) Emails — AgentMail (validé)", [
    ("EMAIL_PROVIDER", "agentmail"),
    ("AGENTMAIL_API_KEY", val("AGENTMAIL_API_KEY")),
    ("AGENTMAIL_INBOX_ID", val("AGENTMAIL_INBOX_ID")),
    ("EMAIL_FROM_ADDRESS", val("EMAIL_FROM_ADDRESS")),
    ("EMAIL_FROM_NAME", "Nexora"),
]))

sections.append(("6) IA — Google Gemini (validé)", [
    ("AI_PROVIDER", "google"),
    ("GOOGLE_GENERATIVE_AI_API_KEY", val("GOOGLE_GENERATIVE_AI_API_KEY")),
    ("AI_MODEL", val("AI_MODEL") or "gemini-flash-lite-latest"),
]))

sections.append(("7) Canal Telegram — token validé", [
    ("TELEGRAM_TOKEN", val("TELEGRAM_TOKEN")),
    ("TELEGRAM_BOT_NAME", val("TELEGRAM_BOT_NAME")),
]))

out = [
    "# ============================================================",
    "# NEXORA — Fichier d'import complet pour VERCEL (back + front, un projet)",
    "# Généré le 17/11/2026 depuis la configuration locale validée.",
    "#",
    "# IMPORT : Vercel → Settings → Environment Variables → Import env file",
    "# ⚠️  Ce fichier contient des secrets : ne le partagez pas, ne le committez pas.",
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
out.append("# === Optionnelles (fonction désactivée si absente) ===")
for k in (
    "NEXT_PUBLIC_GTM_ID", "NEXT_PUBLIC_POLOTNO", "NEXT_PUBLIC_SENTRY_DSN",
    "NEXT_PUBLIC_FACEBOOK_PIXEL", "NEXT_PUBLIC_DISCORD_SUPPORT",
    "EXTENSION_ID", "MCP_URL", "RECAPTCHA_SITE_KEY", "NEXT_PUBLIC_VERSION",
):
    out.append(f"#{k}=")
out.append("")
out.append("# Ne définissez jamais NOT_SECURED en production.")
out.append("")

with io.open(os.path.join(root, "env.vercel"), "wb") as f:
    f.write("\n".join(out).encode("utf-8"))

print("env.vercel généré :", len(out), "lignes")
print("variables copiées avec valeur réelle :", sum(1 for t, p in sections for k, v in p if not v.startswith("<")))
print("À compléter :", ", ".join(missing) if missing else "rien")
