import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function supabaseRoute() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const supabase = await supabaseRoute();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: habit } = await supabase
    .from("habits")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!habit) {
    return NextResponse.json({ error: "Habitude introuvable" }, { status: 404 });
  }

  const { error: logsErr } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", id)
    .eq("user_id", user.id);

  if (logsErr) {
    return NextResponse.json({ error: logsErr.message }, { status: 500 });
  }

  const { error: habitErr } = await supabase
    .from("habits")
    .update({ missed_days_count: 0 })
    .eq("id", id)
    .eq("user_id", user.id);

  if (habitErr) {
    return NextResponse.json({ error: habitErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
