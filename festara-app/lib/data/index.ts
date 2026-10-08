import { cookies } from "next/headers";
import { createStore, MockDataSource, type SessionStore, type Store } from "./mock";
import { seedStore } from "./seed";
import type { DataSource } from "./types";

const g = globalThis as unknown as { __festaraStore?: Store };

function cookieSession(): SessionStore {
  return {
    async get() { return (await cookies()).get("festara_mock_uid")?.value; },
    async set(id) { (await cookies()).set("festara_mock_uid", id, { httpOnly: true, sameSite: "lax", path: "/" }); },
    async clear() { (await cookies()).delete("festara_mock_uid"); },
  };
}

/** The one place that chooses the backend. Screens and actions call this, never an implementation. */
export async function getDataSource(): Promise<DataSource> {
  if (process.env.DATA_SOURCE === "supabase") {
    const { SupabaseDataSource } = await import("./supabase");
    return new SupabaseDataSource();
  }
  g.__festaraStore ??= seedStore(createStore());
  return new MockDataSource(g.__festaraStore, { session: cookieSession() });
}

export const isMock = () => process.env.DATA_SOURCE !== "supabase";
