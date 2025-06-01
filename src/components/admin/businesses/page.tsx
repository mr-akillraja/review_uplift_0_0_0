"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Edit, Mountain, Star, Upload, ChevronRight, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import ConfirmDialog from "@/components/confirm-dialog"
import { useNavigate } from "react-router-dom"
import { Textarea } from "@/components/ui/textarea"

// Default state
const defaultState = {
  businessName: "DONER HUT",
  previewText: "How was your experience with Doner Hut?",
  previewImage: null as string | null,
  logoImage: null as string | null,
  reviewLinkUrl: "https://go.reviewuplift.com/doner-hut",
  isReviewGatingEnabled: true,
  rating: 0,
  welcomeTitle: "We value your opinion!",
  welcomeText: "Share your dining experience and help us serve you better"
}

// Encode state to a URL-safe string
const encodeState = (state: typeof defaultState): string => {
  try {
    return btoa(JSON.stringify(state))
  } catch {
    return ''
  }
}

// Decode state from URL-safe string
const decodeState = (encoded: string): typeof defaultState => {
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return defaultState
  }
}

// Get state from multiple sources (URL hash, window global, or default)
const getPersistedState = (): typeof defaultState => {
  // First try to get from URL hash
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      try {
        const decoded = decodeState(hash)
        return { ...defaultState, ...decoded }
      } catch {
        // If hash decode fails, continue to next method
      }
    }

    // Then try window global (for same-session persistence)
    if ((window as any).reviewLinkState) {
      return { ...defaultState, ...(window as any).reviewLinkState }
    }
  }

  return defaultState
}

// Save state to multiple places
const persistState = (state: typeof defaultState) => {
  if (typeof window !== 'undefined') {
    // Save to window global for same-session persistence
    (window as any).reviewLinkState = state
    
    // Save to URL hash for reload persistence
    const encoded = encodeState(state)
    const newUrl = `${window.location.pathname}${window.location.search}#${encoded}`
    window.history.replaceState(null, '', newUrl)
  }
}

export default function ReviewLinkPage() {
  const navigate = useNavigate()
  
  // State for review link settings
  const [reviewLinkUrl, setReviewLinkUrl] = useState("")
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [tempUrl, setTempUrl] = useState("")
  const [tempBusinessSlug, setTempBusinessSlug] = useState("")

  // State for review gating
  const [isReviewGatingEnabled, setIsReviewGatingEnabled] = useState(true)
  const [showGatingConfirm, setShowGatingConfirm] = useState(false)

  // State for desktop preview customization
  const [businessName, setBusinessName] = useState("")
  const [previewText, setPreviewText] = useState("")
  const [welcomeTitle, setWelcomeTitle] = useState("")
  const [welcomeText, setWelcomeText] = useState("")
  const [isEditingPreview, setIsEditingPreview] = useState(false)
  const [tempBusinessName, setTempBusinessName] = useState("")
  const [tempPreviewText, setTempPreviewText] = useState("")
  const [tempWelcomeTitle, setTempWelcomeTitle] = useState("")
  const [tempWelcomeText, setTempWelcomeText] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    branchname: '',
    review: ''
  })
  const [formErrors, setFormErrors] = useState({
    name: false,
    phone: false,
    email: false,
    branchname: false,
    review: false
  })
  const [submitted, setSubmitted] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Initialize state from persisted data on component mount
  useEffect(() => {
    const persistedState = getPersistedState()
    console.log('Loading persisted state:', persistedState) // Debug log
    
    setReviewLinkUrl(persistedState.reviewLinkUrl)
    setTempUrl(persistedState.reviewLinkUrl)
    // Extract business slug from URL
    const slug = persistedState.reviewLinkUrl.replace('https://go.reviewuplift.com/', '')
    setTempBusinessSlug(slug)
    setIsReviewGatingEnabled(persistedState.isReviewGatingEnabled)
    setBusinessName(persistedState.businessName)
    setPreviewText(persistedState.previewText)
    setWelcomeTitle(persistedState.welcomeTitle || defaultState.welcomeTitle)
    setWelcomeText(persistedState.welcomeText || defaultState.welcomeText)
    setTempBusinessName(persistedState.businessName)
    setTempPreviewText(persistedState.previewText)
    setTempWelcomeTitle(persistedState.welcomeTitle || defaultState.welcomeTitle)
    setTempWelcomeText(persistedState.welcomeText || defaultState.welcomeText)
    setPreviewImage(persistedState.previewImage)
    setLogoImage(persistedState.logoImage)
    setRating(persistedState.rating || 0)
  }, [])

  // Persist state whenever local state changes
  useEffect(() => {
    // Skip the first render to avoid overwriting with empty initial state
    if (businessName || previewText || reviewLinkUrl) {
      const currentState = {
        businessName,
        previewText,
        previewImage,
        logoImage,
        reviewLinkUrl,
        isReviewGatingEnabled,
        rating,
        welcomeTitle,
        welcomeText
      }
      console.log('Persisting state:', currentState) // Debug log
      persistState(currentState)
    }
  }, [businessName, previewText, previewImage, logoImage, reviewLinkUrl, isReviewGatingEnabled, rating, welcomeTitle, welcomeText])

  // Handle URL edit
  const handleUrlEdit = () => {
    if (isEditingUrl) {
      const newUrl = `https://go.reviewuplift.com/${tempBusinessSlug}`
      setReviewLinkUrl(newUrl)
      setTempUrl(newUrl)
    }
    setIsEditingUrl(!isEditingUrl)
  }

  // Handle preview edit
  const handlePreviewEdit = () => {
    if (isEditingPreview) {
      setBusinessName(tempBusinessName)
      setPreviewText(tempPreviewText)
      setWelcomeTitle(tempWelcomeTitle)
      setWelcomeText(tempWelcomeText)
    } else {
      // When starting to edit, sync temp values with current values
      setTempBusinessName(businessName)
      setTempPreviewText(previewText)
      setTempWelcomeTitle(welcomeTitle)
      setTempWelcomeText(welcomeText)
    }
    setIsEditingPreview(!isEditingPreview)
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Delete uploaded image
  const handleDeleteImage = () => {
    setPreviewImage(null)
  }

  // Delete uploaded logo
  const handleDeleteLogo = () => {
    setLogoImage(null)
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Trigger logo input click
  const triggerLogoInput = () => {
    logoInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    setFormErrors(prev => ({
      ...prev,
      [name]: false
    }))
  }

  // Validate form
  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      phone: !formData.phone.trim(),
      email: !formData.email.trim(),
      branchname: !formData.branchname.trim(),
      review: !formData.review.trim()
    }
    setFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  // Handle review submission based on rating
  const handleLeaveReview = () => {
    if (rating === 0) return
    
    // If review gating is disabled, always go to review link
    if (!isReviewGatingEnabled) {
      window.open(reviewLinkUrl, "_blank")
      return
    }

    // For 4-5 stars with gating enabled, go to review link
    if (rating >= 4) {
      window.open(reviewLinkUrl, "_blank")
      return
    }

    // For 1-3 stars with gating enabled
    if (!showForm) {
      setShowForm(true)
      return
    }

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    // Form is valid, proceed with submission
    setSubmitted(true)
    setSubmissionMessage("We're sorry to hear about your experience. Thank you for your feedback.")
  }

  // Toggle review gating with confirmation
  const handleToggleReviewGating = () => {
    if (isReviewGatingEnabled) {
      setShowGatingConfirm(true)
    } else {
      setIsReviewGatingEnabled(true)
    }
  }

  // Confirm disabling review gating
  const confirmDisableGating = () => {
    setIsReviewGatingEnabled(false)
    setShowGatingConfirm(false)
  }

  // Navigate to full preview page
  const navigateToPreviewPage = () => {
    navigate('/review')
  }

  // Reset form for new review
  const resetForm = () => {
    setRating(0)
    setShowForm(false)
    setSubmitted(false)
    setSubmissionMessage("")
    setFormData({
      name: '',
      phone: '',
      email: '',
      branchname: '',
      review: ''
    })
    setFormErrors({
      name: false,
      phone: false,
      email: false,
      branchname: false,
      review: false
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={false} />

      <div className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Review Link</h1>
          <p className="text-muted-foreground mb-8">
            Customize the behavior, text, and images of your Review Link. If only one integration is active, customers
            will be sent directly to the review site, skipping the "Positive Experience" page.
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Review Link URL */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Edit Review Link URL</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUrlEdit}
                      aria-label={isEditingUrl ? "Save URL" : "Edit URL"}
                    >
                      <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                      {isEditingUrl ? "Save" : "Edit"}
                    </Button>
                  </div>
                  <CardDescription>This is the URL you'll share with customers to collect reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditingUrl ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <span className="whitespace-nowrap mr-2">https://go.reviewuplift.com/</span>
                        <Input
                          value={tempBusinessSlug}
                          onChange={(e) => setTempBusinessSlug(e.target.value)}
                          aria-label="Review link business slug"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-muted p-3 rounded">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{reviewLinkUrl}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={reviewLinkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Test review link in new window"
                          >
                            Test Link
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={navigateToPreviewPage}
                          aria-label="View full preview"
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Gating */}
              <Card>
                <CardHeader>
                  <CardTitle>Review Gating (Star Filter)</CardTitle>
                  <CardDescription>
                    When enabled, only customers with positive experiences (4-5 stars) will be directed to leave public
                    reviews. Negative reviews will be collected privately.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="review-gating">{isReviewGatingEnabled ? "Enabled" : "Disabled"}</Label>
                      {isReviewGatingEnabled ? (
                        <p className="text-sm text-muted-foreground">
                          Negative reviews will be sent to your feedback form
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          All reviews will be sent to public review sites
                        </p>
                      )}
                    </div>
                    <Switch
                      id="review-gating"
                      checked={isReviewGatingEnabled}
                      onCheckedChange={handleToggleReviewGating}
                      aria-label="Toggle review gating"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview Editor */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Preview Editor</CardTitle>
                    <Button
                      variant="outline"
                      onClick={handlePreviewEdit}
                      aria-label={isEditingPreview ? "Save preview" : "Edit preview"}
                    >
                      {isEditingPreview ? "Save Preview" : "Edit Preview"}
                    </Button>
                  </div>
                  <CardDescription>Customize how your review collection page looks to customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditingPreview ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input
                          id="business-name"
                          value={tempBusinessName}
                          onChange={(e) => setTempBusinessName(e.target.value)}
                          aria-label="Business name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="welcome-title">Welcome Title</Label>
                        <Input
                          id="welcome-title"
                          value={tempWelcomeTitle}
                          onChange={(e) => setTempWelcomeTitle(e.target.value)}
                          aria-label="Welcome title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="welcome-text">Welcome Text</Label>
                        <Textarea
                          id="welcome-text"
                          value={tempWelcomeText}
                          onChange={(e) => setTempWelcomeText(e.target.value)}
                          aria-label="Welcome text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preview-text">Preview Text</Label>
                        <Input
                          id="preview-text"
                          value={tempPreviewText}
                          onChange={(e) => setTempPreviewText(e.target.value)}
                          aria-label="Preview text"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-image">Business Image</Label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          aria-label="Upload business image"
                        />
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={triggerFileInput} aria-label="Upload business image">
                            <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                            Upload Image
                          </Button>
                          {previewImage && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleDeleteImage}
                              aria-label="Delete business image"
                            >
                              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                              Remove
                            </Button>
                          )}
                        </div>
                        {previewImage && (
                          <div className="mt-2">
                            <img
                              src={previewImage}
                              alt="Current business image"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-logo">Business Logo</Label>
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                          aria-label="Upload business logo"
                        />
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={triggerLogoInput} aria-label="Upload business logo">
                            <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                            Upload Logo
                          </Button>
                          {logoImage && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleDeleteLogo}
                              aria-label="Delete business logo"
                            >
                              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                              Remove
                            </Button>
                          )}
                        </div>
                        {logoImage && (
                          <div className="mt-2">
                            <img
                              src={logoImage}
                              alt="Current business logo"
                              className="w-20 h-20 object-contain rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Click "Edit Preview" to customize your review collection page
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Desktop Preview - Updated Design */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>How customers will see your review page</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div 
                      className="w-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
                      style={{ maxHeight: 'calc(100vh - 200px)' }}
                    >
                      <div 
                        ref={previewRef}
                        className="overflow-y-auto"
                      >
                        {/* Left Side - Image/Pattern */}
                        <div className="w-full bg-gradient-to-b from-orange-50 to-orange-100 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRjk4MDAiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMCAwYzExLjA0NiAwIDIwIDguOTU0IDIwIDIwSDBWMHoiLz48cGF0aCBkPSJNNDAgNDBjLTExLjA0NiAwLTIwLTguOTU0LTIwLTIwSDB2MjBjMCAxMS4wNDYgOC45NTQgMjAgMjAgMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
                          <div className="relative h-full flex flex-col justify-center items-center p-6">
                            {previewImage ? (
                              <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                  src={previewImage}
                                  alt={businessName}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                              </div>
                            ) : (
                              <div className="w-full max-w-xs aspect-square rounded-2xl bg-white shadow-2xl flex items-center justify-center">
                                <div className="text-center p-6">
                                  <Mountain className="h-16 w-16 mx-auto text-orange-500 mb-4" />
                                  <h3 className="text-xl font-bold text-gray-800">{businessName}</h3>
                                </div>
                              </div>
                            )}
                            <div className="mt-6 text-center max-w-xs">
                              <h3 className="text-2xl font-bold text-gray-800 mb-3">{welcomeTitle}</h3>
                              <p className="text-gray-600">
                                {welcomeText}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Review Form */}
                        <div className="w-full bg-white p-6 flex flex-col justify-center">
                          <div className="max-w-xs mx-auto w-full">
                            {submitted ? (
                              <div className="text-center space-y-4">
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                  <p className="text-gray-700 font-medium">
                                    {submissionMessage}
                                  </p>
                                </div>
                                <Button 
                                  onClick={resetForm}
                                  variant="outline"
                                >
                                  Leave Another Review
                                </Button>
                              </div>
                            ) : (
                              <>
                                {logoImage && (
                                  <div className="flex justify-center mb-4">
                                    <img 
                                      src={logoImage} 
                                      alt={`${businessName} Logo`} 
                                      className="h-16 object-contain"
                                    />
                                  </div>
                                )}
                                <div className="text-center mb-6">
                                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Experience</h2>
                                  <p className="text-gray-600">{previewText}</p>
                                </div>

                                <div className="mb-6">
                                  <div className="flex justify-center space-x-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className={`p-1 rounded-full transition-all ${
                                          star <= (hoveredStar || rating) ? 'bg-orange-50' : 'hover:bg-gray-50'
                                        }`}
                                      >
                                        <Star
                                          className={`h-8 w-8 ${
                                            star <= (hoveredStar || rating)
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>

                                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>Not satisfied</span>
                                    <span>Very satisfied</span>
                                  </div>

                                  {rating > 0 && (
                                    <div className={`mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200`}>
                                      <p className="text-gray-700 font-medium text-center flex items-center justify-center text-sm">
                                        {rating >= 4 ? (
                                          <>
                                            <ThumbsUp className="mr-2 text-green-500 h-4 w-4" />
                                            We're glad you enjoyed your meal!
                                          </>
                                        ) : (
                                          <>
                                            <ThumbsDown className="mr-2 text-orange-500 h-4 w-4" />
                                            We're sorry to hear that. We'll use your feedback to improve.
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {showForm && rating <= 3 && isReviewGatingEnabled && (
                                  <div className="mb-4 space-y-3">
                                    <div>
                                      <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                                        Your Name <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                      />
                                      {formErrors.name && (
                                        <p className="mt-1 text-xs text-red-500">This field is required</p>
                                      )}
                                    </div>

                                    <div>
                                      <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                      />
                                      {formErrors.phone && (
                                        <p className="mt-1 text-xs text-red-500">This field is required</p>
                                      )}
                                    </div>

                                    <div>
                                      <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                      />
                                      {formErrors.email && (
                                        <p className="mt-1 text-xs text-red-500">This field is required</p>
                                      )}
                                    </div>
                                     <div>
                                      <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                                        Branch Name <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        id="branchname"
                                        name="branchname"
                                        value={formData.branchname}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                          formErrors.branchname ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                      />
                                      {formErrors.branchname && (
                                        <p className="mt-1 text-xs text-red-500">This field is required</p>
                                      )}
                                    </div>

                                    <div>
                                      <label htmlFor="review" className="block text-xs font-medium text-gray-700 mb-1">
                                        Your Review <span className="text-red-500">*</span>
                                      </label>
                                      <textarea
                                        id="review"
                                        name="review"
                                        rows={2}
                                        value={formData.review}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                                          formErrors.review ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                      ></textarea>
                                      {formErrors.review && (
                                        <p className="mt-1 text-xs text-red-500">This field is required</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <button
                                  onClick={handleLeaveReview}
                                  disabled={rating === 0}
                                  className={`
                                    w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center
                                    transition-all duration-300 text-sm
                                    ${rating === 0
                                      ? 'bg-gray-300 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
                                    }
                                  `}
                                >
                                  {rating > 0 ? 
                                    (rating >= 4 ? 'Continue to Review' : 
                                     (showForm ? 'Submit Your Feedback' : 'Continue to Feedback')) : 
                                    'Select a Rating to Continue'}
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </button>
                              </>
                            )}

                            <p className="text-xs text-gray-400 mt-4 text-center">
                              Powered by <span className="font-medium">ReviewUplift</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog for Disabling Review Gating */}
      <ConfirmDialog
        isOpen={showGatingConfirm}
        onClose={() => setShowGatingConfirm(false)}
        onConfirm={confirmDisableGating}
        title="Disable Review Gating"
        description="Are you sure you want to disable review gating? All customers will be directed to leave public reviews regardless of their rating."
        confirmText="Disable"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}