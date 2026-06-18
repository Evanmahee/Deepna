import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createAdminClient } from "@/lib/supabase/admin";
import { serializeSupabaseError } from "@/lib/supabase-errors";

type Body = { display_name?: string | null; confirm?: string };

export async function GET() {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "display_name, identity_statement, subscription_status, stripe_customer_id",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  return NextResponse.json({
    email: user.email,
    display_name: profile?.display_name ?? null,
    identity_statement: profile?.identity_statement ?? null,
    subscription_status: profile?.subscription_status ?? "free",
    has_stripe_customer: Boolean(profile?.stripe_customer_id),
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Body;
  const display_name =
    typeof body.display_name === "string" ? body.display_name.trim() : "";

  if (!display_name) {
    return NextResponse.json(
      { error: "display_name requis (non vide)" },
      { status: 400 },
    );
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  if (body.confirm !== "SUPPRIMER") {
    return NextResponse.json(
      { error: 'Envoyez { "confirm": "SUPPRIMER" } pour confirmer' },
      { status: 400 },
    );
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Suppression impossible" },
      { status: 500 },
    );
  }
}
