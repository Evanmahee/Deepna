import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { serializeSupabaseError } from "@/lib/supabase-errors";

type PatchBody = { share_public?: boolean };

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function GET() {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("share_token, share_public, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  const token = data?.share_token ?? null;
  return NextResponse.json({
    share_token: token,
    share_public: data?.share_public ?? false,
    display_name: data?.display_name ?? null,
    share_url: token ? `${appBaseUrl()}/share/${token}` : null,
  });
}

export async function POST() {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const token = randomUUID();

  const { error } = await supabase
    .from("profiles")
    .update({ share_token: token })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    share_token: token,
    share_url: `${appBaseUrl()}/share/${token}`,
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as PatchBody;
  if (typeof body.share_public !== "boolean") {
    return NextResponse.json({ error: "share_public requis" }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ share_public: body.share_public })
    .eq("id", user.id)
    .select("share_token, share_public")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, supabase: serializeSupabaseError(error) },
      { status: 500 },
    );
  }

  const token = data?.share_token ?? null;
  return NextResponse.json({
    ok: true,
    share_public: data?.share_public ?? false,
    share_url: token ? `${appBaseUrl()}/share/${token}` : null,
  });
}
