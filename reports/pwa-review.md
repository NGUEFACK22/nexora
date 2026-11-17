# Relecture de conformité — nouveau code PWA du fork Postiz « Nexora »

Date : 2026-11-17. Relecteur : agent indépendant (lecture seule, aucun fichier modifié).

Périmètre : les 6 fichiers listés dans la demande. Méthode : lecture intégrale des fichiers,
`git diff HEAD` pour isoler les ajouts (le dépôt n'a qu'un commit « first commit » ; le seul
fichier non suivi est `service.worker.registration.tsx`, sw.js / offline.html / manifest /
icônes / SVG nexora sont déjà suivis), comparaison avec les composants voisins
(`sentry.component.tsx`, `logout.component.tsx`), avec `colors.scss`, avec les routes réelles
de `apps/frontend/src/app` (28 pages énumérées) et avec le contenu de `public/`.
Version Next vérifiée : 16.4.2 (package.json:177).

## Verdict global

CONFORME — 0 anomalie bloquante, 3 mineures. Le nouveau code suit les patterns du dépôt et le
service worker ne met en cache aucune donnée sensible (API, uploads, réponses non-GET, origines
tierces, pages authentifiées).

## Verdict par fichier

### 1. apps/frontend/src/components/layout/service.worker.registration.tsx (nouveau)

CONFORME. Style identique aux composants voisins du même dossier :
- `'use client'` (l.1), import typé `FC, useEffect` (l.2), `export const ServiceWorkerRegistration: FC = () =>` (l.5) — même forme que `sentry.component.tsx` (l.1-6 : `'use client'`, `FC`, `useEffect`, early-returns) ;
- commentaires explicatifs en anglais comme dans le dépôt (cf. « Always render children » dans sentry.component.tsx) ;
- `useEffect` unique au niveau racine : rules-of-hooks respectées, aucun `eslint-disable` ;
- gating production : `process.env.NODE_ENV !== 'production'` (l.7-9) — remplacé statiquement par Next, donc aucun SW en dev : HMR ne peut pas être cassé ;
- échec d'enregistrement silencieux et non bloquant (l.13-15), enregistré sur `window.load` si le document n'est pas prêt (l.20-25) — pattern classique ;
- chemin `/sw.js` à la racine de public/ → scope `/` correct.

### 2. apps/frontend/src/app/(app)/layout.tsx

CONFORME. `git diff HEAD` montre que seuls les ajouts annoncés existent :
- import de `ServiceWorkerRegistration` (l.2-4) : écriture multi-lignes conforme à prettier (`.prettierrc` ne fixe que `singleQuote`, printWidth par défaut 80 ; la ligne unique ferait ~108 caractères) ;
- `export const viewport: Viewport` (l.7-12) : méthode officielle depuis Next 14 ([blog Next 14](https://nextjs.org/blog/next-14), [generateViewport](https://nextjs.org/docs/app/api-reference/functions/generateViewport)) ; dépôt en 16.4.2 ;
- `themeColor: '#612BD3'` (l.10) = `--new-btn-primary: #612bd3` (colors.scss:17) ;
- `<link rel="manifest" href="/manifest.webmanifest" />` (l.48) : seul manifest de tout apps/frontend/src (grep `rel="manifest"` : 1 résultat) ;
- `apple-touch-icon /pwa/icon-180.png` (l.49) : fichier présent dans public/pwa/ ;
- 3 metas iOS (l.50-52), titre « Nexora » cohérent avec le rebranding ;
- `<ServiceWorkerRegistration />` (l.116) placé parmi les autres composants clients (`HtmlComponent`, `DubAnalytics`, ...) — même emplacement que les composants du même type ;
- `export const dynamic = 'force-dynamic'` et tout le reste du fichier inchangés par le diff.

### 3. apps/frontend/next.config.js

CONFORME. Les 3 blocs s'insèrent dans le `async headers()` déjà présent avec exactement la même
structure `source` + `headers: [{ key, value }]` que le bloc Document-Policy préexistant
(nouveaux blocs l.21-46 vs existant l.9-18). Seul le commentaire de ce bloc a été étendu
(« + PWA assets », l.9). Valeurs pertinentes :
- `/sw.js` : `public, max-age=0, must-revalidate` (l.27) — bonne pratique pour que les mises à jour du SW soient prises en compte à chaque visite ;
- `/manifest.webmanifest` : 1 h (l.36) ;
- `/pwa/:path*` : 1 an immutable (l.46) — voir anomalie mineure M1.

### 4. apps/frontend/public/sw.js

CONFORME — sûreté vérifiée ligne par ligne :
- **non-GET jamais intercepté** : `if (request.method !== 'GET') return;` (l.68), avant toute autre logique ;
- **origines tierces jamais interceptées** : `if (url.origin !== self.location.origin) return;` (l.71) ;
- **`/api/**` et `/uploads/**` jamais cachés** : `BYPASS_PREFIXES` (l.25-26) et le check `isBypassed` (l.72) s'exécute avant tout `respondWith` — aucun accès au cache possible pour ces routes. Le commentaire d'en-tête sur Range/206 d'/uploads correspond au fonctionnement réel ;
- **rien d'autre n'est jamais mis en cache** : seuls `/_next/static/` (assets hashés par Next), `/pwa/`, `/icons/platforms/` (l.12-16, répertoires présents dans public/) et 3 fichiers statiques (l.18-22) passent en cache-first (l.74-88) ; une réponse n'est persistée que si `response.ok && response.type === 'basic'` (l.79) → jamais de redirection (3xx), d'erreur (4xx/5xx) ni de réponse opaque en cache. Donc jamais de cookie `auth` ni de données par organisation en cache ;
- **navigations** : network-first sans aucun `cache.put` (l.90-94) → aucune page authentifiée (/launches, /settings, /billing, /analytics, /media, /agents...) n'est jamais persistée ; fallback `/offline.html` pré-caché à l'install (l.39) ;
- **bypass des routes frontend sensibles vérifié contre les routes réelles de apps/frontend/src/app** : `/p/` ↔ `(preview)/p/[id]`, `/auth/` ↔ `auth/*` (login, activate, forgot...), `/oauth/` ↔ `oauth/authorize`, `/integrations/` ↔ `integrations/*`, `/provider/` ↔ `(provider)/provider/*`. Pas de collision `/p/` vs `/pwa/` ('/pwa/'.startsWith('/p/') === false) ni avec `/plugs`. Le bypass `/_next/webpack-hmr` est une ceinture-bretelles (le SW n'est jamais enregistré en dev) ;
- `skipWaiting` + `clients.claim` (l.40, l.55) sûrs dans cette configuration : HTML jamais caché, `/_next/static` hashé par contenu ;
- purge `activate` par préfixe `VERSION` (l.51) : montée de version propre.

### 5. apps/frontend/public/offline.html et manifest.webmanifest

CONFORME.
- offline.html totalement autonome (CSS inline, SVG inline, aucune requête réseau) → se rend correctement hors ligne ; c'est aussi ce qui justifie du CSS brut plutôt que Tailwind (fichier hors du pipeline React) ;
- couleurs conformes au design system : `background: #0e0e0e` (l.14) = `--new-bgColor` (colors.scss:6) ; bouton `background: #612bd3` (l.31) = `--new-btn-primary` (colors.scss:17) ; SVG du logo `fill="#612BD3"` (l.44) ;
- `onclick` inline (l.50) acceptable : aucune CSP détectée côté frontend (grep `Content-Security-Policy` : 0 résultat dans apps/frontend) ;
- `lang="fr"` (l.2) cohérent avec `lang: fr` du manifest (l.12) ; police Arial au lieu de Plus Jakarta Sans — choix acceptable pour une page offline autonome (la webfont ne peut pas être chargée hors ligne) ;
- manifest : `start_url: /launches` (l.6) pointe vers une route existante (`(site)/launches/page.tsx`) ; `scope: /` (l.7) ; `theme_color: #612BD3` (l.11) et `background_color: #0e0e0e` (l.10) conformes à colors.scss ; les 4 icônes référencées (l.14-17) existent dans public/pwa/ (icon-192, icon-512, icon-maskable-512) + nexora.svg à la racine ; `id: /` évite les doublons d'application installée.

### 6. libraries/react-shared-libraries/src/sentry/initialize.sentry.next.basic.ts

CONFORME. `git diff HEAD` : une seule ligne changée, l.73 : `name: 'Postiz Frontend'` →
`name: 'Nexora Frontend'`, même champ `contexts.app.name`. Renommage minimal conforme au
rebranding, aucun autre effet de bord dans le fichier.

## Anomalies

### Bloquant — 0

Aucune. Aucun scénario réel trouvé où le SW cacherait une donnée sensible, casserait l'auth,
le HMR ou un flux OAuth/extension.

### Mineur — 3

- **M1 — next.config.js:41,46 (+ sw.js:14)** : le commentaire « hashed-by-name PWA icons never
  change » est factuellement faux — les icônes de public/pwa/ ont des noms fixes
  (icon-180/192/512/maskable-512.png, aucun hash). Combiné à `max-age=31536000, immutable`
  (l.46) et au cache-first SW sur `/pwa/` (sw.js:14), un remplacement d'icône ne se propagera
  qu'après renommage du fichier ou bump de `VERSION` (sw.js:8) — sinon icônes périmées jusqu'à
  1 an chez les clients. Impact cosmétique uniquement. Direction : corriger le commentaire et
  renommer les fichiers à chaque changement d'icône (ou retirer `immutable`).
- **M2 — layout.tsx:50** : `apple-mobile-web-app-capable` est la variante dépréciée ; la
  graphie actuelle est `mobile-web-app-capable`. Sans effet négatif sur iOS actuel ; conserver
  les deux est la pratique courante.
- **M3 — sw.js:24-33** : `/modal/` (groupe `(extension)`, utilisé par l'extension de
  navigateur) n'est pas dans `BYPASS_PREFIXES`. Sans risque réel (les navigations ne sont
  jamais mises en cache ; en cas de coupure l'utilisateur voit offline.html), à ajouter
  seulement si l'on veut un comportement « réseau pur » pour l'extension.

### Ok — constats positifs (extraits)

- Composant de registration : copie conforme du style maison, zéro hack.
- Le SW ne touche jamais aux réponses non-GET, aux origines tierces, à /api/, /uploads/ ni aux pages authentifiées — vérifié ligne par ligne.
- Cohérence chromatique complète entre offline.html, manifest, viewport et colors.scss.
- Les routes de bypass correspondent exactement aux routes réelles du dépôt.
- Aucun pattern « bizarre » : rien de spécifique à un provider, aucune logique métier dans les fichiers statiques.

## Suite donnée aux anomalies (17/11/2026, après relecture)

- **M1 — corrigé** : commentaire de `next.config.js` réécrit (les icônes ont des noms FIXES ; tout changement d'icône doit passer par un nouveau nom de fichier + bump de `VERSION` dans sw.js) ; valeur de cache inchangée.
- **M2 — corrigé** : `<meta name="mobile-web-app-capable" content="yes" />` ajouté dans `(app)/layout.tsx` au-dessus de la variante dépréciée (conservée pour les anciens iOS).
- **M3 — non modifié** : sans risque réel (navigations jamais mises en cache) ; ajout de `/modal/` au bypass laissé à une évolution ultérieure si souhaité.

Type-check frontend re-exécuté après correction : 0 erreur.

## Portée de la relecture et non vérifié

Vérifié : contenu intégral des 6 fichiers ; diffs git vs HEAD ; existence des fichiers référencés
(public/pwa/, public/icons/platforms/, nexora*.svg) ; correspondance bypass ↔ routes réelles ;
couleurs ↔ colors.scss ; absence de CSP ; style des composants voisins ; version Next
(package.json:177) ; support de l'export `viewport` (doc Next : blog Next 14, generateViewport).

Non vérifié (aucune instance en cours d'exécution, mission en lecture seule) :
- l'application effective des headers de next.config.js aux fichiers statiques de public/ sur le
  déploiement réel — recommandation QA : `curl -I https://<host>/sw.js` doit renvoyer
  `cache-control: public, max-age=0, must-revalidate` ;
- le comportement du SW dans un navigateur (install / activate / offline) ;
- lint et build non exécutés (lecture seule demandée).
