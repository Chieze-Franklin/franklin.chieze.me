/**
 * Build a 500 JSON response that includes the real error message (and stack) so
 * failures are visible in the browser's network tab and surfaced in the UI.
 */
export function serverError(context: string, err: unknown) {
  console.error(`${context}:`, err);
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  return Response.json({ error: `${context}: ${message}`, stack }, { status: 500 });
}
