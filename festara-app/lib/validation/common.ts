import type { z } from "zod";

export type FieldErrors = Record<string, string>;
export type ParseResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors };

/** Parse input with a schema; on failure return the first message per field. */
export function parseForm<S extends z.ZodTypeAny>(schema: S, input: unknown): ParseResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors };
}

export function formDataToObject(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of fd.entries()) if (typeof value === "string") out[key] = value;
  return out;
}
