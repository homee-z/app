# Homee'z

Application de gestion de foyer partagé — corvées, courses, calendrier, chat et budget, pensée pour les colocations et les familles.

> Projet annuel — ESGI Paris, Master 2 Ingénierie du Web (2026–2027)
> Équipe : Karen, Lyly, Elias, Dane

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer le projet en local](#lancer-le-projet-en-local)
- [Accéder à l'application](#accéder-à-lapplication)
- [Lancer les tests](#lancer-les-tests)
- [Structure du projet](#structure-du-projet)
- [Conventions & contribution](#conventions--contribution)
- [Dépannage](#dépannage)
- [Documentation complémentaire](#documentation-complémentaire)

## Prérequis

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/) (ou daemon Docker) — **démarré**, pas juste installé
- Node.js 20+ et npm — optionnel, uniquement si vous voulez lancer des commandes hors conteneur (tests, lint, etc.)

## Installation

```bash
git clone https://github.com/homee-z/app.git
cd app
```

## Variables d'environnement

Toutes les variables (front, back et Postgres) sont regroupées dans **un seul fichier `.env` à la racine du repo** — utilisé à la fois pour la substitution dans `docker-compose.yml` (les `${VAR}`) et injecté dans chaque conteneur via `env_file`. Un `.env.example` avec toutes les clés attendues est versionné :

```bash
cp .env.example .env
```

```bash
# Ports (valeurs par défaut si absentes du .env)
FRONT_PORT=3000
BACK_PORT=3001
POSTGRES_PORT=5432

# Base de données
POSTGRES_USER=homeez
POSTGRES_PASSWORD=homeez
POSTGRES_DB=homeez

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# URLs inter-services
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Optionnel — vides pour l'instant, pas nécessaire en dev
MAIL_HOST=
MAIL_USER=
MAIL_PASS=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
SENTRY_DSN=
```

Les clés VAPID (notifications push PWA) se génèrent une seule fois, à partager ensuite avec toute l'équipe :

```bash
npx web-push generate-vapid-keys
```

⚠️ Ne jamais commiter le `.env` — il est listé dans le `.gitignore`. Seul `.env.example` est versionné.

## Lancer le projet en local

Tout tourne via Docker Compose : front, back, base PostgreSQL et Adminer (interface d'administration de la BDD). Assurez-vous d'abord que **Docker Desktop est bien lancé** (pas juste installé).

```bash
docker-compose up
```

Au premier lancement, ou après une modification d'un `Dockerfile` :

```bash
docker-compose up --build
```

Si vous ajoutez un **nouveau paquet npm** (front ou back), `--build` seul ne suffit pas : le `node_modules` du conteneur est un volume anonyme qui n'est pas renouvelé automatiquement. Relancez avec :

```bash
docker-compose up --build --renew-anon-volumes
```

Autres commandes utiles :

```bash
docker-compose logs -f back      # suivre les logs d'un service
docker-compose exec back sh      # ouvrir un shell dans un conteneur
docker-compose down              # arrêter les conteneurs
docker-compose down -v           # arrêter ET supprimer les volumes, y compris postgres_data (reset complet de la BDD — à utiliser en connaissance de cause)
```

## Accéder à l'application

| Service | URL |
|---|---|
| Front (Next.js) | http://localhost:3000 |
| Back (API NestJS) | http://localhost:3001 |
| Adminer (interface BDD) | http://localhost:8080 |

Sur Adminer : système **PostgreSQL**, serveur `postgres`, puis l'utilisateur, le mot de passe et le nom de base définis dans votre `.env`.

## Lancer les tests

### Back

```bash
cd back
npm run test        # tests unitaires (Jest) — domain, use cases
npm run test:e2e     # tests fonctionnels (Supertest) — endpoints HTTP
```

### Front

```bash
cd front
npm run test        # tests unitaires (Jest + React Testing Library) — composants, hooks
npm run test:e2e     # tests d'interface (Playwright) — parcours utilisateur
```

Ou directement dans les conteneurs déjà lancés :

```bash
docker-compose exec back npm run test
docker-compose exec front npm run test
```

## Structure du projet

```
homeez/
├── front/                     # Next.js (App Router) + TypeScript + Tailwind CSS
├── back/                      # NestJS — Clean Architecture (domain / application / infrastructure)
├── docker-compose.yml         # environnement de développement
├── docker-compose.prod.yml    # environnement de production
├── nginx.conf                 # reverse proxy (production)
└── .github/workflows/         # pipeline CI/CD (GitHub Actions)
```

Le détail de chaque couche (arborescence complète du front et du back, endpoints, composants) est dans la documentation complémentaire ci-dessous.

## Conventions & contribution

- **Branches** : `feature/<scope>-<description>`, `fix/<scope>-<description>`, `chore/<scope>-<description>` — toujours créées depuis `develop`, jamais depuis `main`.
- **Commits** : Conventional Commits avec scope, en anglais, à l'impératif présent — ex. `feat(chores): add kanban board with drag and drop`.
- **`main` et `develop` sont protégées** : toute contribution passe par une Pull Request, avec au moins une relecture approuvée et les conversations résolues avant merge.

Le détail complet (types, scopes, exemples commentés) est dans le document de conventions de l'équipe.

## Dépannage

- **`Cannot connect to the Docker daemon`** → Docker Desktop n'est pas lancé. Ouvrez l'application et attendez qu'elle affiche "running".
- **`WARN ... variable is not set`** au lancement → le `.env` est manquant à la racine. `cp .env.example .env`.
- **Un paquet npm fraîchement installé n'est pas reconnu dans le conteneur** → relancez avec `docker-compose up --build --renew-anon-volumes`.

## Documentation complémentaire

- Conventions & nommage
- Documentation back-end (Clean Architecture, endpoints, modules)
- Documentation front-end (pages, composants, hooks)
- Documentation infrastructure (Docker, VPS, CI/CD, observabilité, backup)
- Maquettage Figma
- Répartition des tâches & planning