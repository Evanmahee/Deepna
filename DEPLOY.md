# Déploiement Deepna (Vercel + Supabase + Stripe)

## 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. SQL Editor — exécute :
   - `supabase/schema.sql`
   - `supabase/migrations/000_production_align.sql` (si base déjà existante)
3. Authentication → URL : site + redirect `…/auth/callback`
4. Variables : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## 2. Stripe

1. Produit **Deepna Pro** + prix récurrent → `STRIPE_PRICE_ID`
2. `STRIPE_SECRET_KEY`
3. Webhook `https://ton-domaine.vercel.app/api/stripe/webhook`  
   Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`  
   → `STRIPE_WEBHOOK_SECRET`

## 3. Vercel

Variables : voir `.env.example` + `DEPLOY.md` (toutes les clés listées).

```bash
npm install
npm run test
npm run build
```

Connecte le repo, deploy, mets à jour les URLs Supabase/Stripe avec le domaine final.

## 4. PWA

```bash
npm run gen-icons
npm run gen-vapid
```

## 5. Checklist

- [ ] Landing `/` sans compte
- [ ] Onboarding + habitudes
- [ ] `/settings` : prénom, Stripe, suppression compte
- [ ] Webhook Stripe 200 OK

## 6. Tests locaux Stripe

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
