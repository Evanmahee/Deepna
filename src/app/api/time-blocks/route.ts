import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Body = {
  title?: string;
  icon_emoji?: string | null;
  starts_at?: string;
  ends_at?: string;
  block_date?: string;
  notes?: string | null;
  day_of_week?: number | null;
};

function utcDayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  }

  const block_date = body.block_date ?? utcDayString();
  const starts_at =
    body.starts_at ?? `${block_date}T09:00:00.000Z`;
  const ends_at = body.ends_at ?? `${block_date}T10:00:00.000Z`;

  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: agg } = await supabase
    .from("time_blocks")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (agg?.sort_order ?? -1) + 1;

  const { data: row, error } = await supabase
    .from("time_blocks")
    .insert({
      user_id: user.id,
      title,
      notes: body.notes ?? null,
      day_of_week: body.day_of_week ?? null,
      starts_at,
      ends_at,
      block_date,
      sort_order: nextSort,
      icon_emoji: body.icon_emoji?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: row.id });
}
