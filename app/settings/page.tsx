"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { signOut } from "next-auth/react"
import {
  Bell,
  Download,
  HelpCircle,
  LogOut,
  Mail,
  Moon,
  Users,
} from "lucide-react"

export default function SettingsPage() {
  const [inviteEmail, setInviteEmail] = useState("")
  const { toast } = useToast()

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/access/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (!response.ok) throw new Error("Failed to send invitation")

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      })
      setInviteEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-md mx-auto p-4 pb-20">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Account
            </h2>
            <Card className="divide-y">
              <div className="p-4 flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your email preferences
                  </p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Shared Access</p>
                    <p className="text-sm text-muted-foreground">
                      Invite others to help manage medications
                    </p>
                  </div>
                </div>

                <form onSubmit={handleInvite} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                  <Button type="submit">Invite</Button>
                </form>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Data & Privacy
            </h2>
            <Card className="divide-y">
              <div className="p-4 flex items-center gap-3">
                <Download className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download your medication history
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Support
            </h2>
            <Card className="divide-y">
              <div className="p-4 flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Help & Support</p>
                  <p className="text-sm text-muted-foreground">
                    Get help with MedTracker
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <Card>
            <Button
              variant="ghost"
              className="w-full p-4 text-destructive hover:text-destructive"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </Card>
        </div>
      </main>
      <Navigation />
    </div>
  )
}