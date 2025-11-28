"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Activity } from "@/lib/data"
import { useLanguage } from "@/lib/language-context"
import { ActivityItem } from "./activity-item"
import { ActivityModal } from "./activity-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ListTodo } from "lucide-react"

interface ActivitiesManagerProps {
  activities: Activity[]
  onUpdateActivities: (activities: Activity[]) => void
}

export function ActivitiesManager({ activities, onUpdateActivities }: ActivitiesManagerProps) {
  const { t, language } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = activities.findIndex((a) => a.id === active.id)
      const newIndex = activities.findIndex((a) => a.id === over.id)
      onUpdateActivities(arrayMove(activities, oldIndex, newIndex))
    }
  }

  const handleToggle = (id: string) => {
    onUpdateActivities(activities.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)))
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    onUpdateActivities(activities.filter((a) => a.id !== id))
  }

  const handleSave = (activity: Activity) => {
    if (editingActivity) {
      onUpdateActivities(activities.map((a) => (a.id === activity.id ? activity : a)))
    } else {
      onUpdateActivities([...activities, activity])
    }
    setEditingActivity(null)
  }

  const handleOpenModal = () => {
    setEditingActivity(null)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className={`flex items-center gap-2 ${language === "kh" ? "font-khmer" : ""}`}>
            <ListTodo className="h-5 w-5 text-primary" />
            {t.manageActivities}
          </CardTitle>
          <Button size="sm" onClick={handleOpenModal}>
            <Plus className="mr-2 h-4 w-4" />
            <span className={language === "kh" ? "font-khmer" : ""}>{t.addActivity}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {activities.length === 0 && (
            <p className={`py-8 text-center text-muted-foreground ${language === "kh" ? "font-khmer" : ""}`}>
              {t.noActivities}
            </p>
          )}
        </CardContent>
      </Card>

      <ActivityModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingActivity(null)
        }}
        onSave={handleSave}
        activity={editingActivity}
      />
    </>
  )
}
