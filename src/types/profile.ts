import type { Session } from '@supabase/supabase-js'

export interface Profile {
  id: string;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female" | "other";
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extra_active";
  goal: "weight_loss" | "maintenance" | "cut" | "bulk";
  tdee: number;
  updated_at?: string;
}

export interface MyRouterContext {
  session: Session | null
  profile: Profile | null
}
