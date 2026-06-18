# Deepna

Application de développement personnel — habitudes, identité, objectifs, stats.

## Démarrage local

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Déploiement production

Voir **[DEPLOY.md](./DEPLOY.md)** (Vercel + Supabase + Stripe).

## Scripts utiles

```bash
npm run gen-icons
npm run gen:vapid
```

## Rappels push automatiques (cron)

La route `GET /api/cron/push-reminders` envoie les notifications push aux utilisateurs dont l’heure de rappel (`notification_settings.scheduled_time`, UTC) correspond à l’heure actuelle (± 5 minutes).

### Variables d’environnement

Copie `.env.local.example` et configure :

- `CRON_SECRET` — secret partagé avec le service cron (header `Authorization: Bearer …`)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — générés via `npm run gen:vapid`
- `VAPID_SUBJECT` — ex. `mailto:ton@email.com`

### cron-job.org

1. Crée un compte sur [cron-job.org](https://cron-job.org).
2. Nouvelle tâche cron : **toutes les minutes** (`* * * * *`).
3. URL : `https://ton-domaine.com/api/cron/push-reminders`
4. Méthode : **GET**
5. En-tête personnalisé : `Authorization` = `Bearer TON_CRON_SECRET`
6. En production (Vercel), ajoute les mêmes variables dans le dashboard.
