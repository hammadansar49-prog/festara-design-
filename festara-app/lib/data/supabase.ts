import type { DataSource } from "./types";

// Replaced in Task 12. Until then DATA_SOURCE must stay "mock".
export const SupabaseDataSource = class {
  constructor() {
    throw new Error("The Supabase data source is added in Task 12. Set DATA_SOURCE=mock.");
  }
} as unknown as new () => DataSource;
