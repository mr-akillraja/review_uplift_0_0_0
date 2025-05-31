"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mountain, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Default state - should match the one in your main component
const defaultState = {
  businessName: "DONER HUT",
  previewText: "How was your experience with Doner Hut?",
  previewImage: null as string | null,
  socialPreviewTitle: "Do you want to leave us a review?",
  reviewLinkUrl: "https://go.reviewuplift.com/doner-hut",
  isReviewGatingEnabled: true,
  rating: 0 // Add rating to persisted state
}

// Decode state from URL-safe string
const decodeState = (encoded: string): typeof defaultState => {
  try {
    const decoded = JSON.parse(atob(encoded))
    return { ...defaultState, ...decoded }
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
    try {
      const encoded = btoa(JSON.stringify(state))
      const newUrl = `${window.location.pathname}${window.location.search}#${encoded}`
      window.history.replaceState(null, '', newUrl)
    } catch (error) {
      console.warn('Failed to persist state to URL:', error)
    }
  }
}

// Live Preview Component
interface LivePreviewProps {
  previewImage: string | null
  businessName: string
  previewText: string
  rating: number
  setRating: (rating: number) => void
  handleLeaveReview: () => void
}

const LivePreview: React.FC<LivePreviewProps> = ({
  previewImage,
  businessName,
  previewText,
  rating,
  setRating,
  handleLeaveReview
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>How customers will see your review page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-6 border rounded-lg min-h-[500px] flex flex-col">
          <div className="flex-grow">
            {previewImage ? (
              <div className="mb-4">
                <img
                  src={previewImage}
                  alt="Business Preview"
                  className="w-full h-auto max-h-40 object-contain rounded mx-auto"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mountain className="h-8 w-8 text-orange-500" aria-hidden="true" />
              </div>
            )}
            <h3 className="font-bold text-xl mb-3 text-center">{businessName}</h3>
            <p className="text-gray-600 mb-6 text-center">{previewText}</p>

            {/* Star Rating Display */}
            <div className="mb-6 text-center">
              <div className="flex justify-center space-x-1" role="group" aria-label="Rate your experience">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                    aria-pressed={star <= rating}
                  >
                    {star <= rating ? (
                      <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ) : (
                      <Star className="h-8 w-8 text-gray-300" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {rating > 0
                  ? `You selected ${rating} star${rating !== 1 ? "s" : ""}`
                  : "Rate your experience"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleLeaveReview} disabled={rating === 0} aria-label="Leave review">
              Leave Review
            </Button>
            <p className="text-xs text-gray-600 mt-3">Powered by ReviewHUT</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Review Page Component
export default function ReviewPage() {
  // State for the preview
  const [businessName, setBusinessName] = useState("")
  const [previewText, setPreviewText] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [reviewLinkUrl, setReviewLinkUrl] = useState("")
  const [isReviewGatingEnabled, setIsReviewGatingEnabled] = useState(true)
  const [rating, setRating] = useState(0)
  const [isStateLoaded, setIsStateLoaded] = useState(false)

  // Initialize state from persisted data on component mount
  useEffect(() => {
    const loadInitialState = () => {
      const persistedState = getPersistedState()
      console.log('Loading persisted state in review page:', persistedState) // Debug log
      
      setBusinessName(persistedState.businessName)
      setPreviewText(persistedState.previewText)
      setPreviewImage(persistedState.previewImage)
      setReviewLinkUrl(persistedState.reviewLinkUrl)
      setIsReviewGatingEnabled(persistedState.isReviewGatingEnabled)
      setRating(persistedState.rating || 0)
      setIsStateLoaded(true)
    }

    // Load initial state immediately
    loadInitialState()

    // Also try loading after a small delay to handle any async loading issues
    const timeoutId = setTimeout(loadInitialState, 100)

    return () => clearTimeout(timeoutId)
  }, [])

  // Persist state whenever any state changes (including rating)
  useEffect(() => {
    if (isStateLoaded) {
      const currentState = {
        businessName,
        previewText,
        previewImage,
        socialPreviewTitle: "Do you want to leave us a review?", // Keep default
        reviewLinkUrl,
        isReviewGatingEnabled,
        rating
      }
      console.log('Persisting state from review page:', currentState) // Debug log
      persistState(currentState)
    }
  }, [businessName, previewText, previewImage, reviewLinkUrl, isReviewGatingEnabled, rating, isStateLoaded])

  // Listen for external state changes (from main page or other sources)
  useEffect(() => {
    const handleStateUpdate = () => {
      if (isStateLoaded) {
        const persistedState = getPersistedState()
        
        // Only update if the values are actually different to avoid infinite loops
        if (
          persistedState.businessName !== businessName ||
          persistedState.previewText !== previewText ||
          persistedState.previewImage !== previewImage ||
          persistedState.reviewLinkUrl !== reviewLinkUrl ||
          persistedState.isReviewGatingEnabled !== isReviewGatingEnabled
        ) {
          console.log('Updating state from external source:', persistedState)
          setBusinessName(persistedState.businessName)
          setPreviewText(persistedState.previewText)
          setPreviewImage(persistedState.previewImage)
          setReviewLinkUrl(persistedState.reviewLinkUrl)
          setIsReviewGatingEnabled(persistedState.isReviewGatingEnabled)
          // Don't update rating from external sources to preserve user selection
        }
      }
    }

    // Listen for hash changes (when URL is updated from main page)
    window.addEventListener('hashchange', handleStateUpdate)
    
    // Listen for custom storage events (when window global is updated)
    window.addEventListener('storage', handleStateUpdate)
    
    // Poll for changes in window global every 1000ms (reduced frequency)
    const interval = setInterval(() => {
      const currentWindowState = (window as any).reviewLinkState
      if (currentWindowState && isStateLoaded) {
        // Check if any values have changed (excluding rating to avoid overwriting user selection)
        if (
          currentWindowState.businessName !== businessName ||
          currentWindowState.previewText !== previewText ||
          currentWindowState.previewImage !== previewImage ||
          currentWindowState.reviewLinkUrl !== reviewLinkUrl ||
          currentWindowState.isReviewGatingEnabled !== isReviewGatingEnabled
        ) {
          handleStateUpdate()
        }
      }
    }, 1000)

    return () => {
      window.removeEventListener('hashchange', handleStateUpdate)
      window.removeEventListener('storage', handleStateUpdate)
      clearInterval(interval)
    }
  }, [businessName, previewText, previewImage, reviewLinkUrl, isReviewGatingEnabled, isStateLoaded])

  // Handle review submission based on rating
  const handleLeaveReview = () => {
    if (isReviewGatingEnabled) {
      if (rating > 3) {
        // Redirect to review link for positive reviews
        window.open(reviewLinkUrl, "_blank")
      } else {
        // Redirect to feedback form for negative reviews with rating and business name
        const params = new URLSearchParams({
          rating: rating.toString(),
          business: businessName
        })
        window.location.href = `/feedback?${params.toString()}`
      }
    } else {
      // If review gating is disabled, always go to review link
      window.open(reviewLinkUrl, "_blank")
    }
  }

  // Enhanced setRating function that also persists the state
  const handleSetRating = (newRating: number) => {
    setRating(newRating)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <LivePreview
        previewImage={previewImage}
        businessName={businessName}
        previewText={previewText}
        rating={rating}
        setRating={handleSetRating}
        handleLeaveReview={handleLeaveReview}
      />
    </div>
  )
}