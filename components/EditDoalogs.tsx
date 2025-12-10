import { type ScheduledActivity } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModernTimePicker } from "./ModernTimePicker";

interface EditActivityDialogProps {
  activity: ScheduledActivity | null;
  newStartTime: string;
  language: string;
  onClose: () => void;
  onSave: () => void;
  onTimeChange: (time: string) => void;
  translations: {
    editSchedule: string;
    startTime: string;
    cancel: string;
    save: string;
  };
}

export function EditActivityDialog({
  activity,
  newStartTime,
  language,
  onClose,
  onSave,
  onTimeChange,
  translations,
}: EditActivityDialogProps) {
  return (
    <Dialog open={!!activity} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className={language === "kh" ? "font-khmer" : ""}>
            {translations.editSchedule}
            <span className="text-primary">
              {' '}{language === "kh" ? activity?.nameKh : activity?.name}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">{translations.startTime}</Label>
            <ModernTimePicker value={newStartTime} onChange={onTimeChange} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {translations.cancel}
          </Button>
          <Button onClick={onSave}>{translations.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditDayTimeDialogProps {
  isOpen: boolean;
  dayStartTime: string;
  language: string;
  onClose: () => void;
  onSave: () => void;
  onTimeChange: (time: string) => void;
  translations: {
    editDayTime: string;
    dayStartTime: string;
    cancel: string;
    save: string;
  };
}

export function EditDayTimeDialog({
  isOpen,
  dayStartTime,
  language,
  onClose,
  onSave,
  onTimeChange,
  translations,
}: EditDayTimeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className={language === "kh" ? "font-khmer" : ""}>
            {translations.editDayTime}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dayStartTime">{translations.dayStartTime}</Label>
            <ModernTimePicker value={dayStartTime} onChange={onTimeChange} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {translations.cancel}
          </Button>
          <Button onClick={onSave}>{translations.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
