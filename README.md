# Nexora

> **Publiez une fois, publiez partout, au bon moment.**

Nexora permet aux créateurs de contenu de déposer **une seule vidéo** et de la **distribuer automatiquement sur tous leurs réseaux sociaux** — TikTok, YouTube, Instagram, X, Facebook, LinkedIn et plus de 30 autres canaux — avec une **planification dédiée par réseau** depuis un seul calendrier visuel.

## ✨ Fonctionnalités

- 🎬 **Upload unique** → diffusion multi-plateformes automatique (cross-posting)
- ⏰ **Planification par réseau** : créneaux de publication dédiés à chaque canal, plusieurs comptes par réseau supportés
- 📅 **Calendrier visuel** avec glisser-déposer, vues jour / semaine / mois / liste
- 🗂️ **Médiathèque centrale** : vidéos, images, miniatures réutilisables
- 📊 **Analytics** par plateforme et par publication
- 👥 **Équipes & clients** : organisations, rôles, droits
- 🤖 **IA intégrée** : copilote, génération de textes et d'images
- 🔌 **Automatisations** : API publique, autopost RSS, plugs (reposts conditionnels), webhooks

## 🚀 Démarrage rapide

Prérequis : Node.js 22+, pnpm 10, Docker (PostgreSQL, Redis, Temporal).

```bash
pnpm install                      # installe les dépendances + génère le client Prisma
pnpm dev:docker                   # démarre PostgreSQL, Redis et la stack Temporal
pnpm prisma-db-push               # crée le schéma en base
pnpm dev                          # backend :3000 + frontend :4200 + orchestrator
```

La configuration se fait par variables d'environnement dans `.env`
(voir `.env.example` et la [référence de configuration](https://docs.postiz.com/configuration/reference)).

Variables minimales : `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `FRONTEND_URL`,
`NEXT_PUBLIC_BACKEND_URL`, `BACKEND_INTERNAL_URL`, `TEMPORAL_ADDRESS`.

Pour connecter un réseau social, créez une app développeur sur la plateforme
et renseignez ses clés (`X_API_KEY`, `FACEBOOK_APP_ID`, `TIKTOK_CLIENT_ID`, …)
dans le `.env`.

## 🏗️ Architecture

Monorepo pnpm :

| Dossier | Rôle |
|---|---|
| `apps/backend` | API NestJS (contrôleurs, API publique `/public/v1`, serveur MCP) |
| `apps/orchestrator` | Worker Temporal — exécution des publications planifiées |
| `apps/frontend` | Interface Next.js (calendrier, éditeur, analytics) |
| `apps/extension` | Extension navigateur (canaux à authentification par cookies) |
| `apps/sdk` | SDK Node `@postiz/node` pour l'API publique |
| `libraries/` | Logique partagée (services serveur, composants React, utilitaires) |

Couches backend : `DTO → Controller → Service → Repository` — la logique serveur
vit dans `libraries/nestjs-libraries`, les contrôleurs restent minces.

## 📄 Licence

Ce projet est un fork de [Postiz](https://github.com/gitroomhq/postiz-app) —
code source publié sous licence [AGPL-3.0](LICENSE). Les mentions de licence et
l'attribution envers le projet amont sont conservées.
