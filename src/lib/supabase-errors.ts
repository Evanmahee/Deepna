/** Sérialise une erreur PostgREST / Supabase pour la réponse JSON. */
export function serializeSupabaseError(err: unknown): Record<string, unknown> {
  if (!err || typeof err !== "object") {
    return { message: String(err) };
  }
  const e = err as Record<string, unknown>;
  return {
    message: e.message,
    code: e.code,
    details: e.details,
    hint: e.hint,
  };
}
