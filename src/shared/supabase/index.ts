import { SupabaseClient } from "@supabase/supabase-js";
import {
  Database,
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./types";

export type Supabase = SupabaseClient<Database>;
export type { Database, Tables, TablesInsert, TablesUpdate, Enums };

export type Appointment = Tables<"appointments">;
export type Client = Tables<"clients">;
export type Service = Tables<"services">;
export type Entity = Tables<"entity">;
export type EntityMember = Tables<"entity_members">;

export type AppointmentStatus = Database["public"]["Enums"]["status"];
export type AppointmentCancelReason =
  Database["public"]["Enums"]["appointment_cancel_reason"];
