import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isValidHabitColor } from "@/lib/habit-colors";

type PatchBody = {
  name?: string;
  icon_emoji?: string | null;
  icon_color?: string | null;
  habit_type?: "good" | "bad" | "neutral";
  description?: string | null;
};

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

  const { error } = await supabase
    .from("habits")
    .update({ archived: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const body = (await request.json()) as PatchBody;
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }
    updates.name = name;
  }
  if (body.icon_emoji !== undefined) {
    updates.icon_emoji = body.icon_emoji?.trim() || "⭐";
  }
  if (body.habit_type !== undefined) {
    if (!["good", "bad", "neutral"].includes(body.habit_type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    updates.habit_type = body.habit_type;
  }
  if (body.description !== undefined) {
    updates.description = body.description?.trim() || null;
  }
  if (body.icon_color !== undefined) {
    if (body.icon_color !== null && !isValidHabitColor(body.icon_color)) {
      return NextResponse.json({ error: "Couleur invalide" }, { status: 400 });
    }
    updates.icon_color = body.icon_color
      ? body.icon_color.toUpperCase()
      : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const supabase = await supabaseRoute();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { error } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
