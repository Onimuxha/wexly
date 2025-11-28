"use client"

import { useState, useEffect } from "react"
import type { Activity } from "@/lib/data"
import { useLanguage } from "@/lib/language-context"
import { generateId } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ActivityModalProps {
  open: boolean
  onClose: () => void
  onSave: (activity: Activity) => void
  activity?: Activity | null
}

export function ActivityModal({ open, onClose, onSave, activity }: ActivityModalProps) {
  const { t, language } = useLanguage()
  const [name, setName] = useState("")
  const [nameKh, setNameKh] = useState("")
  const [duration, setDuration] = useState(30)

  useEffect(() => {
    if (activity) {
      setName(activity.name)
      setNameKh(activity.nameKh)
      setDuration(activity.duration)
    } else {
      setName("")
      setNameKh("")
      setDuration(30)
    }
  }, [activity, open])

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      id: activity?.id || generateId(),
      name: name.trim(),
      nameKh: nameKh.trim() || name.trim(),
      duration,
      completed: activity?.completed || false,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className={language === "kh" ? "font-khmer" : ""}>
            {activity ? t.editActivity : t.addActivity}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">English Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Activity name"
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nameKh" className="font-khmer">
              ឈ្មោះខ្មែរ
            </Label>
            <Input
              id="nameKh"
              value={nameKh}
              onChange={(e) => setNameKh(e.target.value)}
              placeholder="ឈ្មោះសកម្មភាព"
              className="bg-secondary font-khmer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">{t.duration}</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              max={240}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-secondary"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {t.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
