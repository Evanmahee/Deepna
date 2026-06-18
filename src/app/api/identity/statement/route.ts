import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

type Body = { identity_statement?: string | null };

export async function PATCH(request: Request) {
  const body = (await request.json()) as Body;
  const identity_statement =
    body.identity_statement === undefined
      ? undefined
      : body.identity_statement;

  if (identity_statement === undefined) {
    return NextResponse.json(
      { error: "identity_statement requis" },
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
    .update({ identity_statement })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
