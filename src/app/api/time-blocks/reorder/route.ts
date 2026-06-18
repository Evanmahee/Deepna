import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

type ReorderBody = {
  block_ids?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as ReorderBody;
  if (!body.block_ids?.length) {
    return NextResponse.json({ error: "block_ids requis" }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  for (let i = 0; i < body.block_ids.length; i++) {
    const id = body.block_ids[i];
    const { error } = await supabase
      .from("time_blocks")
      .update({ sort_order: i })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
