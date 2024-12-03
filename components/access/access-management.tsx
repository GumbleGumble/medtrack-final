"use client"

import { useState, useEffect } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { ErrorDialog } from "@/components/ui/error-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { MedicationGroupWithMeds } from "@/types/medication"
import { UserAccess } from "@prisma/client"
import { z } from "zod"
import { Form, FormField, FormSection, FormSubmit } from "@/components/ui/form"

interface AccessManagementProps {
  groups: MedicationGroupWithMeds[]
  onUpdate: () => void
}

interface ServerValidationError {
  errors: Record<string, string[]>
}

function isServerValidationError(error: unknown): error is ServerValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    typeof (error as any).errors === 'object'
  )
}

const accessGrantSchema = z.object({
  email: z.string().email("Invalid email address"),
  groupIds: z.array(z.string()).min(1, "Select at least one medication group"),
  canEdit: z.coerce.boolean(),
}) satisfies z.ZodType<{
  email: string
  groupIds: string[]
  canEdit: boolean
}>

type AccessGrantFormData = z.infer<typeof accessGrantSchema>

export function AccessManagement({ groups, onUpdate }: AccessManagementProps) {
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [selectedAccessId, setSelectedAccessId] = useState<string>("")
  const [accessList, setAccessList] = useState<UserAccess[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAccessList()
  }, [])

  async function fetchAccessList() {
    try {
      const response = await fetch('/api/access')
      if (!response.ok) throw new Error('Failed to fetch access list')
      const data = await response.json()
      setAccessList(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load access list",
        variant: "destructive",
      })
    }
  }

  async function handleGrantAccess(data: AccessGrantFormData) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 422 && isServerValidationError(errorData)) {
          throw new Error(JSON.stringify(errorData.errors))
        }
        throw new Error('Failed to grant access')
      }

      toast({
        title: "Success",
        description: "Access granted successfully",
      })
      setIsGrantDialogOpen(false)
      onUpdate()
      fetchAccessList()
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('{')) {
        try {
          const errors = JSON.parse(error.message) as Record<string, string[]>
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              toast({
                title: "Validation Error",
                description: messages[0],
                variant: "destructive",
              })
            }
          })
        } catch {
          toast({
            title: "Error",
            description: "Failed to grant access",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to grant access",
          variant: "destructive",
        })
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRevokeAccess() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/access/${selectedAccessId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to revoke access')

      toast({
        title: "Success",
        description: "Access revoked successfully",
      })
      setIsRevokeDialogOpen(false)
      onUpdate()
      fetchAccessList()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setIsGrantDialogOpen(true)}>
            Grant Access
          </Button>
        </div>

        <ErrorDialog
          open={isGrantDialogOpen}
          onOpenChange={setIsGrantDialogOpen}
          title="Grant Access"
          description="Grant access to your medications"
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Access</DialogTitle>
            </DialogHeader>
            <Form
              schema={accessGrantSchema}
              onSubmit={handleGrantAccess}
              onError={(error) => {
                toast({
                  title: "Error",
                  description: error.message,
                  variant: "destructive",
                })
              }}
            >
              <FormSection>
                <FormField
                  name="email"
                  label="Email Address"
                  required
                  description="Enter the email address of the person you want to grant access to"
                >
                  <Input
                    type="email"
                    placeholder="caregiver@example.com"
                    autoComplete="email"
                  />
                </FormField>

                <FormField
                  name="groupIds"
                  label="Medication Groups"
                  required
                  description="Select the medication groups you want to grant access to"
                >
                  <div className="space-y-2">
                    {groups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`group-${group.id}`}
                          name="groupIds"
                          value={group.id}
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor={`group-${group.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {group.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormField>

                <FormField
                  name="canEdit"
                  label="Allow Editing"
                  description="When enabled, the person will be able to edit medications and record doses"
                >
                  <Switch />
                </FormField>

                <DialogFooter>
                  <FormSubmit
                    disabled={isLoading}
                    isSubmitting={isLoading}
                    submittingText="Granting Access..."
                    className="w-full"
                  >
                    Grant Access
                  </FormSubmit>
                </DialogFooter>
              </FormSection>
            </Form>
          </DialogContent>
        </ErrorDialog>

        <ErrorDialog
          open={isRevokeDialogOpen}
          onOpenChange={setIsRevokeDialogOpen}
          title="Confirm Revoke Access"
          description="Are you sure you want to revoke access?"
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Revoke Access</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The person will no longer have access to the selected medications.
              </p>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleRevokeAccess}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Revoking..." : "Yes, revoke access"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </ErrorDialog>

        <div className="rounded-md border">
          <div className="p-4">
            <table className="w-full" role="table">
              <thead>
                <tr className="text-left">
                  <th scope="col" className="font-medium">Email</th>
                  <th scope="col" className="font-medium">Groups</th>
                  <th scope="col" className="font-medium">Permissions</th>
                  <th scope="col" className="font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {accessList.map((access) => (
                  <tr key={access.id} className="hover:bg-muted/50">
                    <td className="py-3">{access.grantedToId}</td>
                    <td className="py-3">{access.groupId}</td>
                    <td className="py-3">
                      {access.canEdit ? "Can edit" : "View only"}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedAccessId(access.id)
                          setIsRevokeDialogOpen(true)
                        }}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
                {accessList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No access grants yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
} 