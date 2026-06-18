import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Signature invalide" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  async function setSubscription(
    userId: string,
    data: {
      subscription_status: string;
      stripe_customer_id?: string;
      stripe_subscription_id?: string | null;
    },
  ) {
    await admin.from("profiles").update(data).eq("id", userId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.client_reference_id || session.metadata?.user_id || null;
      if (!userId) break;
      await setSubscription(userId, {
        subscription_status: "active",
        stripe_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id,
        stripe_subscription_id:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null,
      });
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const status =
        sub.status === "active" || sub.status === "trialing"
          ? "active"
          : "free";
      const { data: rows } = await admin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .limit(1);
      if (rows?.[0]?.id) {
        await setSubscription(rows[0].id, {
          subscription_status: status,
          stripe_subscription_id: sub.id,
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const { data: rows } = await admin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .limit(1);
      if (rows?.[0]?.id) {
        await setSubscription(rows[0].id, {
          subscription_status: "free",
          stripe_subscription_id: null,
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
