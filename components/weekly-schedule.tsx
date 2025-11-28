"use client"

import type { DaySchedule, ScheduledActivity } from "@/lib/data"
import { useLanguage } from "@/lib/language-context"
import { getWeekDates, formatDateKey } from "@/lib/schedule-utils"
import { DayCard } from "./day-card"

interface WeeklyScheduleProps {
  schedules: Record<string, DaySchedule>
  onToggleDayOff: (dateKey: string) => void
  onToggleActivity: (dateKey: string, activityId: string) => void
  onRemind: (activity: ScheduledActivity) => void
  onReorderActivities: (dateKey: string, activities: ScheduledActivity[]) => void
  onUpdateActivityTime: (dateKey: string, activityId: string, startTime: string) => void
  onUpdateDayStartTime: (dateKey: string, startTime: string) => void
}

export function WeeklySchedule({
  schedules,
  onToggleDayOff,
  onToggleActivity,
  onRemind,
  onReorderActivities,
  onUpdateActivityTime,
  onUpdateDayStartTime,
}: WeeklyScheduleProps) {
  const { t, language } = useLanguage()
  const weekDates = getWeekDates()

  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-semibold ${language === "kh" ? "font-khmer" : ""}`}>{t.schedule}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weekDates.map((date, index) => {
          const dateKey = formatDateKey(date)
          return (
            <DayCard
              key={dateKey}
              date={date}
              dayIndex={index}
              schedule={schedules[dateKey] || null}
              onToggleDayOff={() => onToggleDayOff(dateKey)}
              onToggleActivity={(activityId) => onToggleActivity(dateKey, activityId)}
              onRemind={onRemind}
              onReorderActivities={(activities) => onReorderActivities(dateKey, activities)}
              onUpdateActivityTime={(activityId, startTime) => onUpdateActivityTime(dateKey, activityId, startTime)}
              onUpdateDayStartTime={(startTime) => onUpdateDayStartTime(dateKey, startTime)}
            />
          )
        })}
      </div>
    </div>
  )
}
