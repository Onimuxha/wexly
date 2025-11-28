import { createClient } from "./supabase/client"
import { type Activity, type DaySchedule, defaultActivities } from "./data"

export function generateId(): string {
  return crypto.randomUUID()
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("activities").select("*").order("sort_order", { ascending: true })

  if (error || !data || data.length === 0) {
    // Return default activities if none exist
    return defaultActivities.map((a, index) => ({
      ...a,
      id: generateId(),
      completed: false,
    }))
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    nameKh: row.name_kh,
    duration: row.duration,
    completed: row.completed,
  }))
}

export async function saveActivities(activities: Activity[]): Promise<void> {
  const supabase = createClient()

  // Delete all existing activities and insert new ones
  await supabase.from("activities").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  const rows = activities.map((a, index) => ({
    id: a.id,
    name: a.name,
    name_kh: a.nameKh,
    duration: a.duration,
    completed: a.completed,
    sort_order: index,
  }))

  await supabase.from("activities").insert(rows)
}

export async function getSchedules(): Promise<Record<string, DaySchedule>> {
  const supabase = createClient()

  const { data, error } = await supabase.from("day_schedules").select("*")

  if (error || !data) {
    return {}
  }

  const schedules: Record<string, DaySchedule> = {}

  for (const row of data) {
    schedules[row.date] = {
      date: row.date,
      isDayOff: row.is_day_off,
      activities: row.activities || [],
    }
  }

  return schedules
}

export async function saveSchedules(schedules: Record<string, DaySchedule>): Promise<void> {
  const supabase = createClient()

  for (const [date, schedule] of Object.entries(schedules)) {
    await supabase.from("day_schedules").upsert(
      {
        date,
        is_day_off: schedule.isDayOff,
        activities: schedule.activities,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "date" },
    )
  }
}

export async function getLanguage(): Promise<"en" | "kh"> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_settings")
    .select("setting_value")
    .eq("setting_key", "language")
    .single()

  if (error || !data) {
    return "en"
  }

  return data.setting_value as "en" | "kh"
}

export async function saveLanguage(lang: "en" | "kh"): Promise<void> {
  const supabase = createClient()

  await supabase.from("user_settings").upsert(
    {
      setting_key: "language",
      setting_value: lang,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "setting_key" },
  )
}
