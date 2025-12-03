import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

export type Supabase = SupabaseClient<Database>;