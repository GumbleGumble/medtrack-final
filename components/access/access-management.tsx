"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MedicationGroupWithMeds } from "@/types/medication"
import { UserAccess } from "@prisma/client"

interface AccessManagementProps {
  groups: MedicationGroupWithMeds[]
}

export function AccessManagement({ groups }: AccessManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accessGrants, setAccessGrants] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchAccessGrants()
  }, [])

  async function fetchAccessGrants() {
    try {
      const response = await fetch('/api/access')
      if (!response.ok) throw new Error('Failed to fetch access grants')
      const data = await response.json()
      setAccessGrants(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load access grants",
        variant: "destructive",
      })
    }
  }

  async function handleGrantAccess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const groupIds = Array.from(formData.getAll("groupIds")) as string[]
    const canEdit = formData.get("canEdit") === "on"

    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, groupIds, canEdit }),
      })

      if (!response.ok) throw new Error('Failed to grant access')

      toast({
        title: "Success",
        description: "Access granted successfully",
      })
      setIsOpen(false)
      fetchAccessGrants()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grant access",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRevokeAccess(accessId: string) {
    try {
      const response = await fetch(`/api/access/${accessId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to revoke access')

      toast({
        title: "Success",
        description: "Access revoked successfully",
      })
      fetchAccessGrants()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Access Management</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Grant Access</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Medication Access</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="caregiver@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Medication Groups</Label>
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`group-${group.id}`}
                      name="groupIds"
                      value={group.id}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`group-${group.id}`}>{group.name}</Label>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canEdit">Allow Editing</Label>
                <Switch id="canEdit" name="canEdit" />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Granting Access..." : "Grant Access"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y">
        {accessGrants.map((access) => (
          <div
            key={access.id}
            className="py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">
                {access.grantedTo.primaryEmail}
              </p>
              <p className="text-sm text-muted-foreground">
                {access.group.name} • {access.canEdit ? "Can edit" : "View only"}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRevokeAccess(access.id)}
            >
              Revoke
            </Button>
          </div>
        ))}
        {accessGrants.length === 0 && (
          <p className="py-4 text-center text-muted-foreground">
            No access grants yet
          </p>
        )}
      </div>
    </div>
  )
} 