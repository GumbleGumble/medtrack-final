import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Edit, MoreVertical, Pill } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatDistanceToNow } from "date-fns"
import { Medication, DoseRecord } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"

interface MedicationCardProps {
  medication: Medication & {
    doseRecords?: DoseRecord[]
  }
  onUpdate: () => void
}

export function MedicationCard({ medication, onUpdate }: MedicationCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const { toast } = useToast()

  const lastDose = medication.doseRecords?.[0]
  const canTakeDose = !medication.minTimeBetweenDoses || !lastDose || 
    (Date.now() - new Date(lastDose.timestamp).getTime()) > medication.minTimeBetweenDoses * 60 * 1000

  async function handleTakeDose() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/medications/${medication.id}/doses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: new Date() }),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to record dose")
      }
      
      toast({
        title: "Success",
        description: "Dose recorded successfully",
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record dose",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const updateData = {
      name: formData.get("name"),
      dosage: formData.get("dosage"),
      unit: formData.get("unit"),
      frequency: formData.get("frequency"),
      isAsNeeded: formData.get("isAsNeeded") === "on",
      minTimeBetweenDoses: formData.get("minTimeBetweenDoses") 
        ? parseInt(formData.get("minTimeBetweenDoses") as string) 
        : null,
    }

    try {
      const response = await fetch(`/api/medications/${medication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) throw new Error("Failed to update medication")

      toast({
        title: "Success",
        description: "Medication updated successfully",
      })
      setIsEditOpen(false)
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update medication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/medications/${medication.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete medication")

      toast({
        title: "Success",
        description: "Medication deleted successfully",
      })
      setIsDeleteOpen(false)
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <h3 className="font-semibold">{medication.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onSelect={() => setIsDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {medication.dosage} {medication.unit} • {medication.frequency}
          </div>
          {lastDose && (
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              Last taken {formatDistanceToNow(new Date(lastDose.timestamp))} ago
            </div>
          )}
          {!canTakeDose && (
            <div className="mt-2 text-xs text-destructive">
              Next dose available in {formatDistanceToNow(
                new Date(lastDose!.timestamp.getTime() + medication.minTimeBetweenDoses! * 60 * 1000)
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleTakeDose} 
            disabled={isLoading || !canTakeDose}
          >
            {isLoading ? "Recording..." : "Take Dose"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={medication.name}
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input 
                  id="dosage" 
                  name="dosage" 
                  defaultValue={medication.dosage}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select name="unit" defaultValue={medication.unit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="pill">pill(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select name="frequency" defaultValue={medication.frequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice_daily">Twice Daily</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isAsNeeded">Take as needed</Label>
              <Switch 
                id="isAsNeeded" 
                name="isAsNeeded"
                defaultChecked={medication.isAsNeeded} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minTimeBetweenDoses">
                Minimum time between doses (minutes)
              </Label>
              <Input
                id="minTimeBetweenDoses"
                name="minTimeBetweenDoses"
                type="number"
                min="0"
                defaultValue={medication.minTimeBetweenDoses ?? ""}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {medication.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 