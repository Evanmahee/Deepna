import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Body = {
  name?: string;
  icon_emoji?: string | null;
  habit_type?: "good" | "bad" | "neutral";
  time_block_id?: string | null;
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const habit_type = body.habit_type;
  if (!habit_type || !["good", "bad", "neutral"].includes(habit_type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  const supabase = await supabaseRoute();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (body.time_block_id) {
    const { data: block } = await supabase
      .from("time_blocks")
      .select("id")
      .eq("id", body.time_block_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!block) {
      return NextResponse.json({ error: "Créneau invalide" }, { status: 400 });
    }
  }

  const { data: row, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name,
      icon_emoji: body.icon_emoji?.trim() || "⭐",
      habit_type,
      ...(body.time_block_id ? { time_block_id: body.time_block_id } : {}),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: row.id });
}
