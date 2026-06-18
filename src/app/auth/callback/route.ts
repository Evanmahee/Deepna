import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = url.origin;
  const code = url.searchParams.get("code");
  let next = url.searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  const oauthError = url.searchParams.get("error");
  const oauthDesc = url.searchParams.get("error_description");
  if (oauthError) {
    const msg = oauthDesc
      ? decodeURIComponent(oauthDesc.replace(/\+/g, " "))
      : oauthError;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(msg)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isDev = process.env.NODE_ENV === "development";

  const base =
    isDev || !forwardedHost
      ? origin
      : `${forwardedProto ?? "https"}://${forwardedHost}`;

  const successUrl = `${base}${next}`;

  // Même objet Response pour les Set-Cookie + headers anti-cache (requis @supabase/ssr)
  const response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("onboarding_done")
      .eq("id", user.id)
      .maybeSingle();
    if (!prof?.onboarding_done) {
      return NextResponse.redirect(`${base}/onboarding`);
    }
  }

  return response;
}
