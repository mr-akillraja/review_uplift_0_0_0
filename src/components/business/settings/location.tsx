"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { useState } from "react"
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, PowerIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, XIcon, MapPinIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface Location {
  id: string
  name: string
  address: string
  createdAt: string
  isActive: boolean
  isExpanded?: boolean
  isEditing?: boolean
}

export default function LocationPage() {
  const [locations, setLocations] = useState<Location[]>([
    { id: "1", name: "Doner Hut", address: "123 Main St, New York, NY 10001", createdAt: "May 9, 2024", isActive: true },
    { id: "2", name: "Doner Hut Downtown", address: "456 Center Ave, Chicago, IL 60601", createdAt: "April 15, 2024", isActive: true },
    { id: "3", name: "Doner Hut West", address: "789 West Blvd, Los Angeles, CA 90001", createdAt: "March 22, 2024", isActive: true },
    { id: "4", name: "Doner Hut Express", address: "321 Quick Lane, Miami, FL 33101", createdAt: "June 5, 2024", isActive: false },
    { id: "5", name: "Doner Hut Central", address: "654 Middle Rd, Dallas, TX 75201", createdAt: "May 18, 2024", isActive: true },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: ""
  })
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    address: ""
  })

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.address) return
    
    const locationToAdd = {
      id: (locations.length + 1).toString(),
      name: newLocation.name,
      address: newLocation.address,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isActive: true
    }
    
    setLocations([...locations, locationToAdd])
    setNewLocation({ name: "", address: "" })
    setIsAdding(false)
  }

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(location => location.id !== id))
  }

  const toggleActiveStatus = (id: string) => {
    setLocations(locations.map(location => 
      location.id === id ? { ...location, isActive: !location.isActive } : location
    ))
  }

  const toggleExpand = (id: string) => {
    setLocations(locations.map(location => 
      location.id === id ? { ...location, isExpanded: !location.isExpanded } : location
    ))
  }

  const startEditing = (location: Location) => {
    setEditData({
      id: location.id,
      name: location.name,
      address: location.address
    })
    setLocations(locations.map(loc => 
      loc.id === location.id ? { ...loc, isEditing: true } : loc
    ))
  }

  const cancelEditing = (id: string) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, isEditing: false } : loc
    ))
  }

  const saveEditing = (id: string) => {
    setLocations(locations.map(location => 
      location.id === id ? { 
        ...location, 
        name: editData.name,
        address: editData.address,
        isEditing: false 
      } : location
    ))
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={false} />

      <div className="flex-1 md:ml-64 p-4 md:p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Locations</h1>
              <p className="text-sm text-muted-foreground">Manage your business locations</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-accent/10 px-3 py-1 rounded-full border">
                <MapPinIcon className="h-4 w-4 mr-1.5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {locations.length}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  {locations.length === 1 ? 'Location' : 'Locations'}
                </span>
              </div>
              <Button onClick={() => setIsAdding(true)} size="sm" className="h-9">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isAdding && (
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Add New Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Location Name</label>
                  <Input
                    placeholder="Enter location name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Address</label>
                  <Input
                    placeholder="Enter full address"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddLocation}>
                    Add Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-3">
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-7 w-7 ${location.isActive ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
                            onClick={() => toggleActiveStatus(location.id)}
                          >
                            <PowerIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {location.isActive ? 'Deactivate location' : 'Activate location'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="flex-1 min-w-0">
                      {location.isEditing ? (
                        <Input
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          className="text-base font-medium h-8"
                        />
                      ) : (
                        <CardTitle className="text-base font-medium flex items-center truncate">
                          {location.name}
                          <Badge 
                            variant={location.isActive ? "default" : "secondary"} 
                            className="ml-2 text-xs"
                          >
                            {location.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                      )}
                      {location.isEditing ? (
                        <Input
                          name="address"
                          value={editData.address}
                          onChange={handleEditChange}
                          className="text-sm mt-1 h-8"
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground truncate">
                          {location.address.split(',')[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => toggleExpand(location.id)}
                          >
                            {location.isExpanded ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {location.isExpanded ? 'Collapse details' : 'Expand details'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {location.isEditing ? (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-green-500 hover:text-green-600"
                                onClick={() => saveEditing(location.id)}
                              >
                                <CheckIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Save changes</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-600"
                                onClick={() => cancelEditing(location.id)}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancel editing</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-blue-500 hover:text-blue-600"
                                onClick={() => startEditing(location)}
                                disabled={!location.isActive}
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {location.isActive ? 'Edit location' : 'Activate to edit'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteLocation(location.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete location</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                {location.isExpanded && (
                  <CardContent className="p-3 pt-0 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Full Address</h4>
                        {location.isEditing ? (
                          <Input
                            name="address"
                            value={editData.address}
                            onChange={handleEditChange}
                            className="text-sm h-8"
                          />
                        ) : (
                          <p className="text-sm">{location.address}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Added On</h4>
                        <p className="text-sm">{location.createdAt}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Status</h4>
                        <p className="text-sm">
                          {location.isActive ? (
                            <span className="text-green-500">Active</span>
                          ) : (
                            <span className="text-gray-500">Inactive</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Location ID</h4>
                        <p className="text-sm">{location.id}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {filteredLocations.length === 0 && (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No locations match your search" : "No locations added yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}