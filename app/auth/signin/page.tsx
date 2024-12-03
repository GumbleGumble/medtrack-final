"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { Pill } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("email", {
        email,
        callbackUrl: "/medications",
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Check your email",
        description: "A sign in link has been sent to your email address.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send sign in link.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Pill className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">Welcome to MedTracker</h1>
          <p className="text-muted-foreground mt-2 text-center">
            Sign in with your email to manage your medications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending link..." : "Sign in with Email"}
          </Button>
        </form>
      </Card>
    </div>
  )
}