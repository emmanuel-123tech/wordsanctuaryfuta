"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  RefreshCw,
  User,
  Calendar,
  MessageSquare,
  Building2,
  Users,
  Phone,
  Heart,
  ChevronDown,
  Mail,
  Briefcase,
  Loader2,
} from "lucide-react"
import Image from "next/image"

interface Guest {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  whatsappNumber: string
  profession: string
  schoolLevel?: string
  schoolDepartment?: string
  birthday: string
  invitedBy: string
  howDidYouHear: string
  gender: string
  maritalStatus: string
  houseAddress: string
  officeAddress: string
  bestReachMethod: string
  joinChurch: string
  joinDepartment: string
  selectedDepartment: string
  blessings: string
  submissionDate: string
  status: string
}

// Cache for guests data
let guestsCache: Guest[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 30000 // 30 seconds

export default function MinisterPortal() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showGuestDetails, setShowGuestDetails] = useState(false)
  const [formData, setFormData] = useState({
    guestId: "",
    serviceDay: "",
    customServiceDay: "",
    ministerName: "",
    lifeClassTeacher: "",
    joinedChurch: "",
    department: "",
    customDepartment: "",
    hodInCharge: "",
    ministerComment: "",
  })

  // Memoized pending guests for better performance
  const pendingGuests = useMemo(() => {
    return guests.filter((guest) => guest.status === "Pending Minister Follow-up")
  }, [guests])

  const fetchGuests = useCallback(async (forceRefresh = false) => {
    const now = Date.now()

    // Use cache if available and not expired (unless force refresh)
    if (!forceRefresh && guestsCache && now - cacheTimestamp < CACHE_DURATION) {
      setGuests(guestsCache)
      setIsInitialLoad(false)
      return
    }

    try {
      setIsLoading(true)

      // Create AbortController for request timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch("/api/get-guests", {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const guestData = await response.json()

        // Update cache
        guestsCache = guestData
        cacheTimestamp = now

        setGuests(guestData)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching guests:", error)

      // Use cached data as fallback if available
      if (guestsCache) {
        setGuests(guestsCache)
        console.log("Using cached guest data as fallback")
      } else {
        // Show mock data for development/testing
        const mockGuests = [
          {
            id: "mock-1",
            fullName: "Sample Guest (Demo)",
            email: "demo@example.com",
            phoneNumber: "+1234567890",
            whatsappNumber: "+1234567890",
            profession: "Student",
            birthday: "January 15",
            invitedBy: "John Doe",
            howDidYouHear: "friend",
            gender: "male",
            maritalStatus: "single",
            houseAddress: "123 Demo Street",
            officeAddress: "",
            bestReachMethod: "whatsapp",
            joinChurch: "yes",
            joinDepartment: "yes",
            selectedDepartment: "media",
            blessings: "Word, Worship",
            submissionDate: new Date().toISOString(),
            status: "Pending Minister Follow-up",
          },
        ]
        setGuests(mockGuests)
      }
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      if (field === "guestId") {
        const guest = guests.find((g) => g.id === value)
        setSelectedGuest(guest || null)
        if (guest) {
          setShowGuestDetails(true)
        }
      }

      if (field === "department" && value !== "others") {
        setFormData((prev) => ({ ...prev, customDepartment: "" }))
      }

      if (field === "serviceDay" && value !== "others") {
        setFormData((prev) => ({ ...prev, customServiceDay: "" }))
      }
    },
    [guests],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGuest) return

    setIsSubmitting(true)

    // Show success immediately for better UX
    setTimeout(() => {
      setIsSubmitted(true)
      // Invalidate cache to force refresh on next load
      guestsCache = null
      cacheTimestamp = 0
    }, 600)

    try {
      const finalDepartment = formData.department === "others" ? formData.customDepartment : formData.department
      const finalServiceDay = formData.serviceDay === "others" ? formData.customServiceDay : formData.serviceDay

      // Submit in background with shorter timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const submitPromise = fetch("/api/update-guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: selectedGuest.id,
          ministerData: {
            ...formData,
            serviceDay: finalServiceDay,
            department: finalDepartment,
          },
          status: "Completed",
        }),
        signal: controller.signal,
      })

      submitPromise
        .then(() => {
          clearTimeout(timeoutId)
          // Invalidate cache after successful submission
          guestsCache = null
          cacheTimestamp = 0
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          console.error("Background submission error:", error)
        })
    } catch (error) {
      console.error("Error submitting minister data:", error)
      setIsSubmitting(false)
      setIsSubmitted(false)
      alert("There was an error submitting the data. Please try again.")
    }
  }

  const resetForm = useCallback(() => {
    setIsSubmitted(false)
    setSelectedGuest(null)
    setShowGuestDetails(false)
    setFormData({
      guestId: "",
      serviceDay: "",
      customServiceDay: "",
      ministerName: "",
      lifeClassTeacher: "",
      joinedChurch: "",
      department: "",
      customDepartment: "",
      hodInCharge: "",
      ministerComment: "",
    })
  }, [])

  const getDepartmentOptions = useMemo(() => {
    const standardDepartments = [
      { value: "media", label: "Media" },
      { value: "choir", label: "Choir" },
      { value: "power-sound", label: "Power and Sound" },
      { value: "ushering", label: "Ushering" },
      { value: "love-care", label: "Love and Care" },
      { value: "zoe", label: "Zoe" },
      { value: "sid", label: "SID" },
      { value: "drama", label: "Drama" },
      { value: "evangelism", label: "Evangelism" },
      { value: "orison", label: "Orison" },
      { value: "decoration", label: "Decoration" },
    ]

    if (!selectedGuest) return standardDepartments

    const guestWantedDepartment = selectedGuest.joinDepartment || selectedGuest.joindepartment
    const guestSelectedDepartment = selectedGuest.selectedDepartment || selectedGuest.selecteddepartment

    if (guestWantedDepartment === "no") {
      return [
        { value: "none", label: "No Department (Guest's Original Choice)" },
        ...standardDepartments,
        { value: "others", label: "Others (Specify)" },
      ]
    } else if (guestWantedDepartment === "yes" && guestSelectedDepartment) {
      return [...standardDepartments, { value: "others", label: "Others (Specify)" }]
    }

    return [...standardDepartments, { value: "others", label: "Others (Specify)" }]
  }, [selectedGuest])

  const handleRefresh = useCallback(() => {
    fetchGuests(true) // Force refresh
  }, [fetchGuests])

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Success!</h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Guest follow-up has been completed successfully.
            </p>
            <Button
              onClick={resetForm}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-medium text-sm sm:text-base"
            >
              Process Another Guest
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/word-sanctuary-logo-white.png"
                  alt="Word Sanctuary"
                  width={20}
                  height={20}
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Word Sanctuary</h1>
                <p className="text-xs sm:text-sm text-gray-500">Minister Portal</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center space-x-1 sm:space-x-2 bg-transparent text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span className="hidden sm:inline">{isLoading ? "Loading..." : "Refresh"}</span>
              <span className="sm:hidden">{isLoading ? "..." : "↻"}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Guest Selection */}
        <div className="mb-6 sm:mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                <span>Select Guest</span>
              </CardTitle>
              <CardDescription className="text-blue-100 text-sm sm:text-base">
                Choose a first-time guest to follow up with
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Guest Name</Label>

                  {isInitialLoad ? (
                    // Initial loading skeleton
                    <div className="h-12 sm:h-14 border-2 border-gray-200 rounded-lg bg-gray-100 animate-pulse flex items-center px-4">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-400 text-sm">Loading guests...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.guestId}
                      onValueChange={(value) => handleInputChange("guestId", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-300 focus:border-blue-500 bg-white text-gray-900 font-medium text-sm sm:text-base rounded-lg">
                        <SelectValue
                          placeholder={isLoading ? "Refreshing..." : "👆 Tap here to select a guest"}
                          className="text-gray-900 font-medium"
                        />
                        <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 opacity-75 ml-2" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 shadow-xl rounded-lg max-h-60 sm:max-h-80">
                        {pendingGuests.map((guest) => (
                          <SelectItem
                            key={guest.id}
                            value={guest.id}
                            className="text-gray-900 font-medium py-3 sm:py-4 px-3 sm:px-4 hover:bg-blue-50 focus:bg-blue-100 cursor-pointer text-sm sm:text-base rounded-md m-1"
                          >
                            <div className="flex flex-col w-full">
                              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                {guest.fullName || guest.fullname}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600 mt-1">
                                📞 {guest.phoneNumber || guest.phonenumber}
                              </span>
                              {guest.email && (
                                <span className="text-xs sm:text-sm text-gray-500 mt-0.5">✉️ {guest.email}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                        {pendingGuests.length === 0 && !isLoading && (
                          <SelectItem
                            value="no-guests"
                            disabled
                            className="text-gray-500 py-4 px-4 text-sm sm:text-base"
                          >
                            No pending guests found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {!isInitialLoad && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-700 font-medium flex items-center space-x-2">
                      <span>📊 {pendingGuests.length} guests pending follow-up</span>
                      {guestsCache && (
                        <span className="text-blue-500 text-xs">
                          (Cached {Math.round((Date.now() - cacheTimestamp) / 1000)}s ago)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guest Details */}
        {selectedGuest && showGuestDetails && (
          <div className="mb-6 sm:mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  <span>Guest Information</span>
                </CardTitle>
                <CardDescription className="text-green-100 text-sm sm:text-base">
                  Details for {selectedGuest.fullName || selectedGuest.fullname}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Contact Info */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2 text-sm sm:text-base border-b border-gray-200 pb-2">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <p className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>
                          <strong>Phone:</strong> {selectedGuest.phoneNumber || selectedGuest.phonenumber}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <MessageSquare className="h-3 w-3 text-green-500" />
                        <span>
                          <strong>WhatsApp:</strong> {selectedGuest.whatsappNumber || selectedGuest.whatsappnumber}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-red-500" />
                        <span>
                          <strong>Email:</strong> {selectedGuest.email || "Not provided"}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Heart className="h-3 w-3 text-purple-500" />
                        <span>
                          <strong>Best Contact:</strong>{" "}
                          {selectedGuest.bestReachMethod || selectedGuest.bestreachmethod}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2 text-sm sm:text-base border-b border-gray-200 pb-2">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span>Personal Details</span>
                    </h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <p className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span>
                          <strong>Gender:</strong> {selectedGuest.gender}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Heart className="h-3 w-3 text-pink-500" />
                        <span>
                          <strong>Marital Status:</strong> {selectedGuest.maritalStatus || selectedGuest.maritalstatus}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        <span>
                          <strong>Birthday:</strong> {selectedGuest.birthday}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Briefcase className="h-3 w-3 text-orange-500" />
                        <span>
                          <strong>Profession:</strong> {selectedGuest.profession}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Church Info */}
                  <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2 text-sm sm:text-base border-b border-gray-200 pb-2">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      <span>Church Interest</span>
                    </h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <p className="flex items-center space-x-2">
                        <Building2 className="h-3 w-3 text-blue-500" />
                        <span>
                          <strong>Join Church:</strong> {selectedGuest.joinChurch || selectedGuest.joinchurch}
                        </span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Users className="h-3 w-3 text-green-500" />
                        <span>
                          <strong>Join Department:</strong>{" "}
                          {selectedGuest.joinDepartment || selectedGuest.joindepartment}
                        </span>
                      </p>
                      {(selectedGuest.selectedDepartment || selectedGuest.selecteddepartment) && (
                        <p className="flex items-center space-x-2">
                          <Heart className="h-3 w-3 text-purple-500" />
                          <span>
                            <strong>Preferred Dept:</strong>{" "}
                            {selectedGuest.selectedDepartment || selectedGuest.selecteddepartment}
                          </span>
                        </p>
                      )}
                      <p className="flex items-center space-x-2">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span>
                          <strong>What Blessed Them:</strong> {selectedGuest.blessings}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Follow-up Form */}
        {selectedGuest && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                <span>Minister Follow-up</span>
              </CardTitle>
              <CardDescription className="text-purple-100 text-sm sm:text-base">
                Complete the follow-up details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Service Day */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <span>Service Day *</span>
                    </Label>
                    <Select
                      value={formData.serviceDay}
                      onValueChange={(value) => handleInputChange("serviceDay", value)}
                      required
                    >
                      <SelectTrigger className="h-11 sm:h-12 border-2 border-gray-200 focus:border-blue-500 text-sm sm:text-base">
                        <SelectValue placeholder="Select service day" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="friday" className="py-2 sm:py-3 text-sm sm:text-base">
                          Friday
                        </SelectItem>
                        <SelectItem value="sunday" className="py-2 sm:py-3 text-sm sm:text-base">
                          Sunday
                        </SelectItem>
                        <SelectItem value="wednesday" className="py-2 sm:py-3 text-sm sm:text-base">
                          Wednesday
                        </SelectItem>
                        <SelectItem value="others" className="py-2 sm:py-3 text-sm sm:text-base">
                          Others (Specify)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.serviceDay === "others" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Specify Service Day *</Label>
                      <Input
                        value={formData.customServiceDay}
                        onChange={(e) => handleInputChange("customServiceDay", e.target.value)}
                        placeholder="Enter service day"
                        className="h-11 sm:h-12 text-sm sm:text-base"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Minister Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4 text-green-600" />
                      <span>Minister Who Attended to FTG *</span>
                    </Label>
                    <Input
                      value={formData.ministerName}
                      onChange={(e) => handleInputChange("ministerName", e.target.value)}
                      placeholder="Enter minister's name"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Life Class Teacher *</span>
                    </Label>
                    <Input
                      value={formData.lifeClassTeacher}
                      onChange={(e) => handleInputChange("lifeClassTeacher", e.target.value)}
                      placeholder="Enter teacher's name"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* Church and Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Building2 className="h-4 w-4 text-orange-600" />
                      <span>Joined the Church? *</span>
                    </Label>
                    <Select
                      value={formData.joinedChurch}
                      onValueChange={(value) => handleInputChange("joinedChurch", value)}
                      required
                    >
                      <SelectTrigger className="h-11 sm:h-12 border-2 border-gray-200 focus:border-blue-500 text-sm sm:text-base">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="yes" className="py-2 sm:py-3 text-sm sm:text-base">
                          Yes
                        </SelectItem>
                        <SelectItem value="no" className="py-2 sm:py-3 text-sm sm:text-base">
                          No
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      <span>Department Assigned *</span>
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                      required
                    >
                      <SelectTrigger className="h-11 sm:h-12 border-2 border-gray-200 focus:border-blue-500 text-sm sm:text-base">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 shadow-lg rounded-lg max-h-60">
                        {getDepartmentOptions.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value} className="py-2 sm:py-3 text-sm sm:text-base">
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.department === "others" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Specify Department *</Label>
                    <Input
                      value={formData.customDepartment}
                      onChange={(e) => handleInputChange("customDepartment", e.target.value)}
                      placeholder="Enter department name"
                      className="h-11 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>
                )}

                {/* HOD */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 text-purple-600" />
                    <span>HOD in Charge of Department *</span>
                  </Label>
                  <Input
                    value={formData.hodInCharge}
                    onChange={(e) => handleInputChange("hodInCharge", e.target.value)}
                    placeholder="Enter HOD's name"
                    className="h-11 sm:h-12 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span>Minister's Comments *</span>
                  </Label>
                  <Textarea
                    value={formData.ministerComment}
                    onChange={(e) => handleInputChange("ministerComment", e.target.value)}
                    placeholder="Enter your comments about the guest interaction..."
                    className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Complete Follow-up</span>
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            This portal is for attending ministers only. Keep information confidential.
          </p>
        </div>
      </div>
    </div>
  )
}
