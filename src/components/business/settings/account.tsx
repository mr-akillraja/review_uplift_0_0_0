"use client"

import { useEffect, useState } from "react"
import {
  onAuthStateChanged,
  updatePassword,
  User,
} from "firebase/auth"
import { auth } from "@/firebase/firebase"
import { db } from "@/firebase/firebase" // Firestore DB
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { toast } from "@/components/ui/use-toast"

export default function AccountPage() {
  const [userData, setUserData] = useState({
    storedmail: "",
    firstName: "",
    lastName: "",
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email || ""
        const displayName = user.displayName || ""
        const nameParts = displayName.split(" ")
        const firstName = nameParts[0] || ""
        const lastName = nameParts.slice(1).join(" ") || ""

        setUserData({
          storedmail: email,
          firstName,
          lastName,
        })
        setCurrentUser(user)
      } else {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validatePasswords = () => {
    let isValid = true
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
      isValid = false
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
      isValid = false
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswords()) return

    setIsUpdating(true)

    try {
      const user = auth.currentUser

      if (user) {
        await updatePassword(user, passwordData.newPassword)

        // Store password in Firestore (for demo purposes only!)
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          await updateDoc(userRef, {
            password: passwordData.newPassword,
          })
        } else {
          await setDoc(userRef, {
            email: user.email,
            password: passwordData.newPassword,
          })
        }

        toast({
          title: "Success",
          description: "Password updated successfully",
          variant: "default",
        })

        setPasswordData({ newPassword: "", confirmPassword: "" })
      } else {
        toast({
          title: "Error",
          description: "No authenticated user found",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={false} />
      <div className="flex-1 md:ml-64 p-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-muted-foreground">Manage the settings of your account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Business Owner</Label>
                <p className="text-sm text-muted-foreground">{userData.storedmail}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={userData.firstName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={userData.lastName} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={userData.storedmail} readOnly />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
