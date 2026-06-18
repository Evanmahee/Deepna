import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { GoalStatus, GoalTerm } from "@/types/goals";

const TERMS: GoalTerm[] = ["short", "mid", "long"];
const STATUSES: GoalStatus[] = ["active", "completed", "abandoned"];

type PostBody = {
  title?: string;
  description?: string | null;
  term?: GoalTerm;
  target_date?: string | null;
};

type PatchBody = {
  id?: string;
  status?: GoalStatus;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PostBody;
  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  }
  const term = body.term;
  if (!term || !TERMS.includes(term)) {
    return NextResponse.json({ error: "Terme invalide" }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: row, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      title,
      description: body.description?.trim() || null,
      term,
      target_date: body.target_date || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: row.id });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as PatchBody;
  const id = body.id?.trim();
  const status = body.status;
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "status invalide" }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
