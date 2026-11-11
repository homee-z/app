# Spécification & Architecture d'Authentification — Homee-z
> **Liaison Backend (NestJS) ↔ Frontend (Next.js App Router)**

Ce document détaille l'architecture d'authentification mise en place pour permettre au frontend (Next.js) de protéger ses routes côté serveur (Middleware & Layouts) en toute sécurité.

---

## 1. Contexte : Pourquoi le Front était bloqué ?

Dans **Next.js (App Router)**, les pages protégées (comme `/dashboard`) et les layouts sont exécutés **côté serveur** avant d'envoyer le HTML au navigateur.

* **Le problème initial** : Si les tokens JWT sont renvoyés dans le corps de la réponse JSON (`body`) ou stockés dans le `localStorage` du navigateur, **le serveur Next.js ne peut pas les lire**. Il lui était donc impossible de savoir si l'utilisateur était connecté pour autoriser ou bloquer l'accès.
* **La solution** : Utiliser des **cookies HTTP sécurisés (`httpOnly`)**. Les cookies sont automatiquement joints à chaque requête HTTP par le navigateur, permettant au serveur Next.js et au backend NestJS de valider la session instantanément.

---

## 2. Réponses aux demandes du Front (Mises en œuvre)

### 2.1. Cookies `access_token` et `refresh_token`
- **Au login (`POST /auth/login`)** : L'`access_token` (15 min) et le `refresh_token` (7 jours) sont posés en cookies HTTP.
- **Sécurité** :
  - `httpOnly: true` : Inaccessibles au JavaScript du navigateur (immunité contre le vol de session via failles XSS).
  - `secure: true` (automatique en production via `NODE_ENV === 'production'`).
  - `sameSite: 'lax'` : Protection contre les attaques CSRF.
  - `path: '/'` : Le cookie est actif sur l'ensemble de l'application.
- **Réponse épurée** : Les tokens sont **retirés du corps de la réponse JSON** (`body`).
- **Déconnexion (`POST /auth/logout`)** : Les deux cookies sont immédiatement révoqués (`clearCookie` avec `path: '/'`).

### 2.2. Nouvelle route `GET /auth/me`
Pour permettre au serveur Next.js de savoir quel utilisateur navigue et personnaliser l'affichage :
- **Protection** : Protégée par le `AuthGuard` (renvoie `401 Unauthorized` si le cookie est absent ou expiré).
- **Format de réponse (`200 OK`)** :
  ```json
  {
    "id": "b1a2c3d4-...",
    "firstName": "Karen",
    "role": "member",
    "householdId": null
  }
  ```
- **Nommage** : On utilise expressément **`firstName`** (et non `name`), conformément aux besoins des profils et des maquettes.

### 2.3. Guard & Configuration NestJS (`main.ts`)
- **`cookie-parser`** : Activé dans `main.ts` pour que NestJS puisse parser et lire `request.cookies`.
- **`AuthGuard`** : Lit directement le jeton dans `request.cookies['access_token']`.
- **`trust proxy: 1`** : Activé dans `main.ts`. En production, NestJS est situé derrière le reverse proxy Nginx. Cette directive permet à NestJS de savoir que la connexion client est bien chiffrée en HTTPS afin d'émettre des cookies avec le flag `secure`.

---

## 3. Arbitrage sur le `refresh_token` (`path: '/'`)

> **Question soulevée** :  
> *Quand l'access_token (15 min) expire, qui appelle `/auth/refresh` ? Si le refresh_token est restreint à `path: '/auth/refresh'`, le serveur Next.js ne le voit pas.*

### Décision adoptée :
Le cookie `refresh_token` a été configuré avec **`path: '/'`** :
1. De cette manière, le serveur Next.js peut intercepter l'expiration des 15 minutes.
2. Lorsque l'`access_token` expire, le client ou le middleware Next.js appelle silencieusement `POST /auth/refresh`.
3. Le backend NestJS lit le `refresh_token`, génère une nouvelle paire de cookies en `path: '/'` et l'utilisateur continue sa navigation sans aucune déconnexion intempestive.

---

## 4. Tableau complet des Endpoints Auth

| Méthode | Route | Description | Protection | Cookies émis / lus |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Inscription avec validation CNIL (12 car., symboles...) | Public | - |
| `POST` | `/auth/login` | Connexion par email / mot de passe | Public | Émet `access_token` & `refresh_token` |
| `POST` | `/auth/refresh` | Renouvellement de la session | Public | Lit `refresh_token`, réémet les 2 cookies |
| `POST` | `/auth/logout` | Déconnexion | Public | Supprime `access_token` & `refresh_token` |
| `GET` | `/auth/me` | Récupère le profil de session | **AuthGuard** | Lit `access_token` |
| `POST` | `/auth/magic-link/request` | Demande d'un lien de connexion par email | Public | - |
| `POST` | `/auth/magic-link/verify` | Validation du lien magique | Public | Émet `access_token` & `refresh_token` |

---

## 5. Comment l'expliquer à l'oral (Guide simple)

Si un professeur ou un membre de l'équipe demande :  
**« Comment avez-vous résolu l'authentification entre Next.js et NestJS ? »**

> **Explication en 3 étapes :**
> 1. *"Next.js exécute ses layouts et middlewares côté serveur. Pour qu'il puisse vérifier la session avant d'afficher la page, nous avons remplacé le stockage en localStorage par des **cookies HttpOnly** et **SameSite Lax** émis au login."*
> 2. *"Le backend a été configuré avec `cookie-parser` et un `AuthGuard` qui extrait le token du cookie, complété par la route `GET /auth/me` qui fournit au front le prénom (`firstName`) et le rôle de l'utilisateur."*
> 3. *"Pour la gestion de l'expiration des 15 minutes, nous avons positionné le `refresh_token` sur `path: '/'`. Ainsi, le front peut contacter automatiquement `/auth/refresh` en tâche de fond pour renouveler la session sans déconnecter l'utilisateur."*
