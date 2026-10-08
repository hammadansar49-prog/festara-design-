export type ErrorCode = "invalid" | "forbidden" | "not_found" | "last_admin" | "invite_invalid" | "exists" | "auth";

export type Result<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; message: string };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (code: ErrorCode, message: string): Result<never> => ({ ok: false, code, message });
