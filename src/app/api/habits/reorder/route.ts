import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

type ReorderBody = {
  groups?: Array<{
    time_block_id: string | null;
    habit_ids: string[];
  }>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ReorderBody;
  if (!body.groups?.length) {
    return NextResponse.json({ error: "groups requis" }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  for (const group of body.groups) {
    for (let i = 0; i < group.habit_ids.length; i++) {
      const id = group.habit_ids[i];
      const { error } = await supabase
        .from("habits")
        .update({
          sort_order: i,
          time_block_id: group.time_block_id,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
