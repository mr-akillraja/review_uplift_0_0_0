"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Sidebar from "@/components/sidebar"
import { Search, Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { db } from "@/firebase/firebase"
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import { getAuth, onAuthStateChanged, User } from "firebase/auth"

interface BusinessUser {
  id: string
  name: string
  email: string
  locations: string
  role: "Business Owner" | "Location Manager"
}

export default function BusinessUsersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<BusinessUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<BusinessUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 6
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState({
    name: "",
    email: "",
    locations: "",
  })

  const [userForm, setUserForm] = useState<Omit<BusinessUser, "id"> & { id: string }>({
    id: "",
    name: "",
    email: "",
    locations: "",
    role: "Business Owner",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Track authentication state
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Fetch users from Firestore when auth state changes
  useEffect(() => {
    if (!currentUser?.uid) return

    setLoading(true)
    const businessUsersRef = collection(db, "users", currentUser.uid, "businessusers")
    const unsubscribe = onSnapshot(businessUsersRef, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as BusinessUser[]
      setUsers(usersData)
      setFilteredUsers(usersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser?.uid])

  // Filter users based on search terms
  useEffect(() => {
    const filtered = users.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchTerm.name.toLowerCase()) &&
        user.email.toLowerCase().includes(searchTerm.email.toLowerCase()) &&
        user.locations.toLowerCase().includes(searchTerm.locations.toLowerCase())
      )
    })
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, users])

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const handleAddUser = async () => {
    if (!currentUser?.uid) return
    if (userForm.name && userForm.email && userForm.locations) {
      try {
        const businessUsersRef = collection(db, "users", currentUser.uid, "businessusers")
        
        if (isEditing && userForm.id) {
          // Update existing user
          const userDoc = doc(businessUsersRef, userForm.id)
          await setDoc(userDoc, {
            name: userForm.name,
            email: userForm.email,
            locations: userForm.locations,
            role: userForm.role
          })
        } else {
          // Add new user
          const newUserRef = doc(businessUsersRef)
          await setDoc(newUserRef, {
            name: userForm.name,
            email: userForm.email,
            locations: userForm.locations,
            role: userForm.role
          })
        }
        resetForm()
        setIsDialogOpen(false)
      } catch (error) {
        console.error("Error adding/updating user: ", error)
      }
    }
  }

  const handleEditUser = (user: BusinessUser) => {
    setUserForm(user)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDeleteUser = async (id: string) => {
    if (!currentUser?.uid) return
    try {
      const userDoc = doc(db, "users", currentUser.uid, "businessusers", id)
      await deleteDoc(userDoc)
    } catch (error) {
      console.error("Error deleting user: ", error)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchTerm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setUserForm({
      id: "",
      name: "",
      email: "",
      locations: "",
      role: "Business Owner",
    })
    setIsEditing(false)
  }

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isAdmin={false} />
        <div className="flex-1 md:ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <p>Loading user data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isAdmin={false} />
        <div className="flex-1 md:ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <p>Please sign in to access this page</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={false} />

      <div className="flex-1 md:ml-64 p-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">Business Users</h1>
            <p className="text-muted-foreground">Manage your business users and their permissions</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="name"
                      placeholder="Search by name"
                      className="pl-9"
                      value={searchTerm.name}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="email"
                      placeholder="Search by email"
                      className="pl-9"
                      value={searchTerm.email}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="locations"
                      placeholder="Search by locations"
                      className="pl-9"
                      value={searchTerm.locations}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) resetForm()
                    setIsDialogOpen(open)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto" onClick={() => setIsEditing(false)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        {isEditing ? "Edit User" : "Add New User"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter user's full name"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter user's email address"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locations">Locations</Label>
                        <Input
                          id="locations"
                          placeholder="Enter location(s)"
                          value={userForm.locations}
                          onChange={(e) => setUserForm({ ...userForm, locations: e.target.value })}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>User Role</Label>
                        <RadioGroup
                          value={userForm.role}
                          onValueChange={(value) => setUserForm({ ...userForm, role: value as "Business Owner" | "Location Manager" })}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="Business Owner" id="business-owner" />
                            <Label htmlFor="business-owner" className="cursor-pointer">
                              Business Owner
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="Location Manager" id="location-manager" />
                            <Label htmlFor="location-manager" className="cursor-pointer">
                              Location Manager
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser} className="px-6">
                          {isEditing ? "Update User" : "Add User"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.locations}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit User</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete User</TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found. Add your first business user.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length > usersPerPage && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}