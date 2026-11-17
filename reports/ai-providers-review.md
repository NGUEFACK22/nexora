# Relecture — câblage multi-provider IA du fork « Nexora »

Date : 2026-11-17. Périmètre : `libraries/nestjs-libraries/src/chat/ai.model.ts` (nouveau), `apps/backend/src/api/routes/copilot.controller.ts`, `libraries/nestjs-libraries/src/chat/load.tools.service.ts`, gates `OPENAI_API_KEY` restants (apps/backend + libraries), `.env.example` / `.env`, et inspection de `node_modules/@copilotkit/runtime` (v1.72.0) / `@ai-sdk/*`. Relecture en lecture seule ; aucune modification de fichier hors de ce rapport.

Standard appliqué : patterns du dépôt (commentaires `//` anglais dans les libs, logique serveur dans `libraries/nestjs-libraries`, fabrique générique type `upload.factory`), préservation du comportement openai par défaut (diff `git diff HEAD`), cohérence des noms de clés env contre les implémentations réelles des paquets (versions constatées : `@copilotkit/runtime` 1.72.0, `@ai-sdk/openai` 2.0.98, `@ai-sdk/anthropic` 3.0.118, `@ai-sdk/google` 3.0.123, `@mastra/core` 1.67.x, `.npmrc` avec `node-linker=hoisted`).

## 1. Verdict global

PROBLÈMES : 1 bloquant (chemin google : mismatch de variable d'environnement entre la garde du code et l'adaptateur CopilotKit), 2 mineurs (dépendances fantômes non déclarées, documentation .env.example incomplète). Le comportement openai par défaut est intégralement préservé ; le chemin anthropic est cohérent de bout en bout ; le style et la localisation du nouveau code sont conformes au dépôt.

## 2. Verdict par fichier

| Fichier | Verdict | Synthèse |
|---|---|---|
| `libraries/nestjs-libraries/src/chat/ai.model.ts` | OK (1 mineur) | Fabrique générique propre, style conforme ; imports `@ai-sdk/anthropic`/`google` non déclarés dans package.json (mineur n°2) |
| `apps/backend/src/api/routes/copilot.controller.ts` | BLOQUANT (google) / OK (openai, anthropic) | Gardes équivalentes, adaptateurs construits avec `{model}` ; `serviceAdapter()` ne transmet pas de clé à `GoogleGenerativeAIAdapter` qui lit `GOOGLE_API_KEY` (bloquant n°1) |
| `libraries/nestjs-libraries/src/chat/load.tools.service.ts` | OK | `openai('gpt-5.2')` → `aiSdkModel('gpt-5.2')` = comportement identique pour openai ; import `@ai-sdk/openai` retiré proprement |
| `.env.example` | OK (1 mineur doc) | Bloc Misc Settings (l.170-180) complet ; commentaire l.176 sous-documente ce qui reste OpenAI-only |
| `.env` | OK | Bloc IA (l.68-75) présent ; aucune clé active → fonctionnalités IA désactivées, comportement identique à l'ancien garde sans clé |

## 3. Anomalies bloquantes

### B1 — Provider google : l'adaptateur CopilotKit lit `GOOGLE_API_KEY`, jamais `GOOGLE_GENERATIVE_AI_API_KEY`

- **Position** : `libraries/nestjs-libraries/src/chat/ai.model.ts:12` (mapping `google: 'GOOGLE_GENERATIVE_AI_API_KEY'`) + `apps/backend/src/api/routes/copilot.controller.ts:67` (`new GoogleGenerativeAIAdapter({ model })` sans `apiKey`).
- **Problème** : la garde `aiModelConfigured()` valide `GOOGLE_GENERATIVE_AI_API_KEY` et `.env.example:180` l'expose comme clé du provider google. Or l'implémentation réelle de `@copilotkit/runtime@1.72.0` ne lit jamais cette variable :
  - `dist/service-adapters/google/google-genai-adapter.cjs` — chaîne LangChain : `new ChatGoogle({ apiKey: options?.apiKey ?? process.env.GOOGLE_API_KEY, ... })` ; `getLanguageModel()` : `createGoogleGenerativeAI({ apiKey: this._apiKey ?? process.env.GOOGLE_API_KEY })`.
  - Fallback identique dans `@langchain/google-common/dist/chat_models.js:246` : `fields?.apiKey ?? getEnvironmentVariable("GOOGLE_API_KEY")`.
  - Contre-preuve : `@ai-sdk/google` (utilisé par `aiSdkModel`) déclare `environmentVariableName: "GOOGLE_GENERATIVE_AI_API_KEY"` — la variable choisie est correcte pour le chemin Mastra, mauvaise pour le chemin CopilotKit.
- **Impact** : avec `AI_PROVIDER=google` et uniquement `GOOGLE_GENERATIVE_AI_API_KEY` définie : la garde passe (clé trouvée), les endpoints répondent, puis toute requête servie par le `serviceAdapter` — `/copilot/chat` (chat classique) et les requêtes non-agent de `/copilot/agent` — échoue à l'appel modèle (apiKey `undefined` remontée jusqu'à ChatGoogle). Les requêtes routées vers l'agent Mastra passent par `aiSdkModel`/`@ai-sdk/google` (bonne clé) et fonctionnent, ce qui rend le bug partiel et difficile à voir en QA superficielle.
- **Direction de fix** : l'option existe déjà dans `GoogleGenerativeAIAdapterOptions` (`{ model?, apiVersion?, apiKey? }`, voir `dist/service-adapters/google/google-genai-adapter.d.cts`) : passer la clé explicitement dans `serviceAdapter()` — `new GoogleGenerativeAIAdapter({ model, apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })`. Une ligne ; ne change rien pour openai/anthropic.
- **QA à prévoir après fix** : streaming réel du chat avec une clé Google (non testable ici) ; `ChatGoogle` vient d'`@langchain/google-gauth` (auth Google), le mode de défaillance exact hors mismatch de clé n'a pas été tracé plus loin.

## 4. Anomalies mineures

### M1 — Dépendances fantômes : `@ai-sdk/anthropic` et `@ai-sdk/google` importés mais non déclarés

- **Position** : `libraries/nestjs-libraries/src/chat/ai.model.ts:1-2` vs `package.json` racine (seul `"@ai-sdk/openai": "^2.0.52"` est déclaré).
- **Constat vérifié** : les paquets sont physiquement présents à la racine de `node_modules` (anthropic 3.0.118, google 3.0.123) uniquement parce que `.npmrc` déclare `node-linker=hoisted` et que `pnpm-lock.yaml` les contient comme transitives (via `@copilotkit/runtime` qui dépend de `@ai-sdk/anthropic ^3.0.49` / `@ai-sdk/google ^3.0.33`). Aujourd'hui ça compile et s'exécute ; mais la version est flottante (pilotée par un transitive ; le lock contient aussi des 2.x : anthropic 2.0.102, google 2.0.97) et une future montée de `@copilotkit/runtime` peut changer ou retirer le hoist et casser la build. Le commentaire `ai.model.ts:48` (« the three provider packages are installed ») n'est vrai que par transitivité.
- **Fix** : ajouter `"@ai-sdk/anthropic"` et `"@ai-sdk/google"` (alignés sur le lock, ex. `^3.0.118` / `^3.0.123`) dans `package.json` racine + `pnpm install` pour figer le lock.

### M2 — Documentation .env.example incomplète sur ce qui reste OpenAI-only

- **Position** : `.env.example:176` — « Image generation stays on OpenAI (no equivalent at Anthropic) ».
- **Problème** : outre la génération d'images, les features suivantes restent dépendantes d'`OPENAI_API_KEY` même avec `AI_PROVIDER=anthropic|google` : vidéos slides (`libraries/nestjs-libraries/src/videos/images-slides/images.slides.ts:68`), clipping (`libraries/nestjs-libraries/src/upload/upload.factory.ts:64`), voix/prompts structurés (`libraries/nestjs-libraries/src/openai/openai.service.ts:8`), générateur langgraph (`libraries/nestjs-libraries/src/agent/agent.graph.service.ts:26,32`), autopost (`libraries/nestjs-libraries/src/database/prisma/autopost/autopost.service.ts:39,45`), `agent.graph.insert.service.ts:12`.
- **Impact** : un self-hosted qui ne renseigne qu'une clé Anthropic/Google aura chat + agent OK mais images/vidéos/clips silencieusement indisponibles (les gates rendent la feature cachée, pas crash — comportement gracieux, vérifié).
- **Fix** : compléter la ligne de commentaire, ex. « Image/video/voice/clips generation stays on OpenAI — set OPENAI_API_KEY even when AI_PROVIDER is anthropic or google ».

## 5. Points de contrôle vérifiés conformes

**a) Style et patterns de `ai.model.ts`** — conformes. Commentaires `//` anglais minuscule, identiques aux voisins (`load.tools.service.ts:52-53`, `upload.factory.ts:54-56`) ; aucune logique métier (pur mapping env) ; imports triés ; fonctions nommées exportées ; pas de DI nécessaire ; situé dans `libraries/nestjs-libraries/src/chat` (conforme « server logic in libs »). Le `switch(aiProvider())` au point de composition suit le pattern existant de fabrique du dépôt (`upload.factory` bascule sur `STORAGE_PROVIDER`) — pas une violation de la règle « pas de logique spécifique provider dans du code générique » : les implémentations restent dans les paquets/adaptateurs.

**b) Préservation openai par défaut** — conforme, prouvé par `git diff HEAD` :
- Gardes : ancien `process.env.OPENAI_API_KEY === undefined || process.env.OPENAI_API_KEY === ''` → nouveau `!aiModelConfigured()` avec `!!key && key !== ''` (`ai.model.ts:33-36`). Table de vérité identique pour une variable d'env (undefined/'' → blocage ; toute autre valeur → passage). Même structure (Logger.warn + return sans réponse), message enrichi du nom de clé/provider (`copilot.controller.ts:74-79` et `98-103`).
- Chat copilot : `aiModelName('gpt-4.1')` (`copilot.controller.ts:62`) → openai+sans AI_MODEL = `'gpt-4.1'`, identique à l'ancien `new OpenAIAdapter({ model: 'gpt-4.1' })`.
- Agent Mastra : `aiSdkModel('gpt-5.2')` (`load.tools.service.ts:117`) → openai+sans AI_MODEL = `openai('gpt-5.2')`, identique à l'ancien code.
- `AI_MODEL` écrase les deux modèles à la fois — comportement voulu, documenté (`.env.example:175`).

**c) Adaptateurs CopilotKit** — `{model}` correct pour les trois : `AnthropicAdapterParams.model?: string`, `OpenAIAdapterParams.model?: string`, `GoogleGenerativeAIAdapterOptions.model?: string` (`.d.cts` de `@copilotkit/runtime/dist/service-adapters/...`). Les trois classes sont bien exportées par `@copilotkit/runtime` (`dist/index.d.cts:5,12,72,254`). Clés env :
- `OpenAIAdapter` → `createOpenAI` → `OPENAI_API_KEY` : cohérent.
- `AnthropicAdapter` → `ensureAnthropic()` crée `new Anthropic({})` et le SDK lit `ANTHROPIC_API_KEY` (`@anthropic-ai/sdk/index.mjs` : `apiKey = readEnv('ANTHROPIC_API_KEY') ?? null`) ; `getLanguageModel()` repasse cette clé à `createAnthropic` : cohérent avec `ai.model.ts:11` et `.env.example:179`.
- `GoogleGenerativeAIAdapter` → `GOOGLE_API_KEY` : **incohérent** (voir B1).
- Dépendances d'exécution présentes : `@langchain/google-gauth` et `@anthropic-ai/sdk` installés.

**d) Gates `OPENAI_API_KEY` restants** — aucun dans `apps/backend` (le grep complet ne remonte que `copilot.controller.ts` via `ai.model`). Tous les usages restants sont des features OpenAI-only (liste au M2) ; cohérent car aucun équivalent Anthropic/Google n'est câblé dans le dépôt, et les gates rendent la feature indisponible plutôt que de planter. Les chemins chat/agent génériques ne portent plus aucune hypothèse openai hors la valeur par défaut. Documentation partielle → M2.

**e) `.env.example` et `.env`** — présents et commentés :
- `.env.example:170-180` (« Misc Settings ») : `OPENAI_API_KEY=""`, `#AI_PROVIDER="openai"`, `#AI_MODEL=""`, `ANTHROPIC_API_KEY=""`, `GOOGLE_GENERATIVE_AI_API_KEY=""`, avec commentaires explicatifs (provider, AI_MODEL, clé du seul provider choisi).
- `.env:68-75` (bloc « === IA ») : `AI_PROVIDER="openai"` actif ; les 3 clés et `AI_MODEL` présents mais commentés. Conséquence (constatée, non bloquante) : `aiModelConfigured()` = false → `/copilot/chat` et `/copilot/agent` répondent vide avec `Logger.warn`, exactement comme l'ancien garde sans `OPENAI_API_KEY`. Pour activer l'IA en dev, décommenter et renseigner une clé.

**f) Autres problèmes concrets** — voir B1, M1, M2 ; rien d'autre trouvé lors du balayage (grep `OPENAI_API_KEY`, `AI_PROVIDER`, `AI_MODEL`, `@ai-sdk`, `gpt-4.1|gpt-5.2`, `OpenAIAdapter` sur apps + libraries hors node_modules).

## 6. Observations (informatif, sans action)

- `ai.model.ts:18` — `providerDefaults.openai = 'gpt-4.1'` n'est jamais lu (le chemin openai retourne toujours le paramètre `providerDefault`). Documentation morte, sans effet.
- `aiProvider()` (`ai.model.ts:22-25`) retombe silencieusement sur `openai` pour toute valeur inconnue ou mal cassee (ex. `AI_PROVIDER="Anthropic"` → openai). Documenté dans le commentaire ; acceptable, mais la coquille est muette pour l'utilisateur.
- `serviceAdapter()` reconstruit un adaptateur par requête — identique à l'ancien code (`new OpenAIAdapter(...)` par requête), pas de régression.
- Le diff de `load.tools.service.ts` inclut le rebrand `postiz`→`Nexora` (id/nom de l'agent, instructions) — hors périmètre de cette relecture, mentionné pour mémoire.
- Mélange de majors `@ai-sdk` (openai 2.0.98 déclaré directement vs anthropic/google 3.x) : `@mastra/core@1.67` embarque les aliases `@ai-sdk/provider-v5/v6/v7` + `@mastra/schema-compat@1.3.10` qui normalisent les specs de modèles — cohérent a priori, QA runtime recommandée sur les chemins anthropic/google.

## 7. Suite donnée aux anomalies (17/11/2026, après relecture)

- **Bloquant google — corrigé** : vérifié dans le source (`service-adapters/google/google-genai-adapter.cjs`) : `apiKey: options?.apiKey ?? process.env.GOOGLE_API_KEY` → `copilot.controller.ts` passe désormais explicitement `apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY` (même variable que la garde `aiModelConfigured()`). Anthropic vérifié sain (`@anthropic-ai/sdk` lit `ANTHROPIC_API_KEY` nativement).
- **Mineur deps — corrigé** : `@ai-sdk/anthropic` + `@ai-sdk/google` déclarés dans package.json (versions installées ^3.0.118 / ^3.0.123). Le lockfile sera régénéré au prochain `pnpm install` (store E: mort, à réinstaller sur D:).
- **Mineur doc — corrigé** : commentaire `.env.example` précise que images/vidéos/voix/clipping restent sur OpenAI.

Type-check backend re-exécuté après correctifs : 0 erreur.

## 8. Non vérifié / commandes suggérées

- Compilation et type-check non exécutés (consigne lecture seule). Suggéré : `pnpm build:backend` ou `pnpm exec tsc --noEmit -p apps/backend`, puis `pnpm test` filtré sur chat/copilot.
- Streaming réel `/copilot/chat` avec clés anthropic/google — non testable sans clés externes ; le mismatch google (B1) est prouvé statiquement, le mode de défaillance exact de `ChatGoogle` hors mismatch de clé n'a pas été tracé.
- `.env` n'est pas suivi par git : impossible de prouver l'ancienne valeur d'`OPENAI_API_KEY`. L'équivalence des gardes est prouvée sur le diff du code (`git diff HEAD`), pas de l'environnement.
- Hors périmètre : les autres fichiers modifiés du fork (rebrand global, billing.controller, mcp.relay/start.mcp, frontends) — aucun gate IA caché n'y a été détecté par les greps, mais ils n'ont pas été relus fichier par fichier.