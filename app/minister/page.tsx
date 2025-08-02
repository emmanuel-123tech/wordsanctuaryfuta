"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, RefreshCw, ChevronDown } from "lucide-react"
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

export default function MinisterPortal() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/get-guests")
      if (response.ok) {
        const guestData = await response.json()
        setGuests(guestData)
      }
    } catch (error) {
      console.error("Error fetching guests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "guestId") {
      const guest = guests.find((g) => g.id === value)
      setSelectedGuest(guest || null)
    }

    // Clear custom department if not "others"
    if (field === "department" && value !== "others") {
      setFormData((prev) => ({ ...prev, customDepartment: "" }))
    }

    // Clear custom service day if not "others"
    if (field === "serviceDay" && value !== "others") {
      setFormData((prev) => ({ ...prev, customServiceDay: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGuest) return

    // Immediate UI feedback
    setIsSubmitting(true)

    // Show success quickly for better UX
    setTimeout(() => {
      setIsSubmitted(true)
      // Refresh the guests list in background
      fetchGuests()
    }, 600) // Very fast feedback

    try {
      // Determine final department assignment
      const finalDepartment = formData.department === "others" ? formData.customDepartment : formData.department

      // Determine final service day
      const finalServiceDay = formData.serviceDay === "others" ? formData.customServiceDay : formData.serviceDay

      // Submit in background - don't block UI
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
      })

      // Handle background submission
      submitPromise.catch((error) => {
        console.error("Background submission error:", error)
        // Could add retry logic here
      })
    } catch (error) {
      console.error("Error submitting minister data:", error)
      // Reset UI if there's an immediate error
      setIsSubmitting(false)
      setIsSubmitted(false)
      alert("There was an error submitting the data. Please try again.")
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setSelectedGuest(null)
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
  }

  // Get department options based on guest's original choice
  const getDepartmentOptions = () => {
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
      // Guest originally said no, but might change mind
      return [
        { value: "none", label: "No Department (Guest's Original Choice)" },
        ...standardDepartments,
        { value: "others", label: "Others (Specify)" },
      ]
    } else if (guestWantedDepartment === "yes" && guestSelectedDepartment) {
      // Guest originally chose a department, but might want to change
      return [...standardDepartments, { value: "others", label: "Others (Specify)" }]
    }

    return [...standardDepartments, { value: "others", label: "Others (Specify)" }]
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white">
        {/* Navbar */}
        <nav className="sticky top-0 bg-white shadow-md border-b border-blue-200 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1">
                  <Image
                    src="/word-sanctuary-logo-black.png"
                    alt="Word Sanctuary Logo"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-blue-900">Word Sanctuary</span>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-blue-900">Attending Minister Portal</h1>
              </div>
              <div className="text-sm text-blue-700">
                Logged in as <span className="font-medium">Minister Jerry</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="text-center space-y-6 animate-fade-in">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold text-blue-900">Thank you!</h2>
            <p className="text-xl text-blue-700">Entry recorded successfully.</p>
            <div className="flex justify-center">
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Submit Another Entry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white shadow-md border-b border-blue-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1">
                <Image
                  src="/word-sanctuary-logo-black.png"
                  alt="Word Sanctuary Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-semibold text-blue-900">Word Sanctuary</span>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-blue-900">Attending Minister Portal</h1>
            </div>
            <div className="text-sm text-blue-700">
              Logged in as <span className="font-medium">Attending Minister</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">First Time Guests</h2>
            <Button
              onClick={fetchGuests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Guest Selection and Info */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Select Guest</CardTitle>
                <CardDescription className="text-green-100">
                  Choose a first-time guest to follow up with
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium text-lg">Guest Name</Label>
                    <div className="relative">
                      <Select
                        value={formData.guestId}
                        onValueChange={(value) => handleInputChange("guestId", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="border-2 border-blue-300 focus:border-blue-500 bg-white text-gray-900 font-medium h-12 text-base">
                          <SelectValue
                            placeholder={isLoading ? "Loading guests..." : "Click here to select a guest"}
                            className="text-gray-900 font-medium"
                          />
                          <ChevronDown className="h-5 w-5 text-blue-600" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-blue-200 shadow-lg max-h-60">
                          {guests
                            .filter((guest) => guest.status === "Pending Minister Follow-up")
                            .map((guest) => (
                              <SelectItem
                                key={guest.id}
                                value={guest.id}
                                className="text-gray-900 font-medium py-3 px-4 hover:bg-blue-50 focus:bg-blue-100 cursor-pointer text-base"
                              >
                                <div className="flex flex-col">
                                  <span className="font-semibold text-blue-900">
                                    {guest.fullName || guest.fullname}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {guest.email} • {guest.phoneNumber || guest.phonenumber}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          {guests.filter((guest) => guest.status === "Pending Minister Follow-up").length === 0 && (
                            <SelectItem value="no-guests" disabled className="text-gray-500 py-3 px-4">
                              No pending guests found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {guests.length > 0 && (
                      <p className="text-sm text-blue-600 mt-2">
                        Found {guests.filter((guest) => guest.status === "Pending Minister Follow-up").length} guests
                        pending follow-up
                      </p>
                    )}
                  </div>

                  {selectedGuest && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-3">Guest Information</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Name:</strong> {selectedGuest.fullName || selectedGuest.fullname}
                        </p>
                        <p>
                          <strong>Phone:</strong> {selectedGuest.phoneNumber || selectedGuest.phonenumber}
                        </p>
                        <p>
                          <strong>WhatsApp:</strong> {selectedGuest.whatsappNumber || selectedGuest.whatsappnumber}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedGuest.email || "Not provided"}
                        </p>
                        <p>
                          <strong>Profession:</strong> {selectedGuest.profession}
                        </p>
                        {selectedGuest.schoolLevel && (
                          <p>
                            <strong>School Level:</strong> {selectedGuest.schoolLevel}
                          </p>
                        )}
                        {selectedGuest.schoolDepartment && (
                          <p>
                            <strong>School Department:</strong> {selectedGuest.schoolDepartment}
                          </p>
                        )}
                        <p>
                          <strong>Gender:</strong> {selectedGuest.gender}
                        </p>
                        <p>
                          <strong>Marital Status:</strong> {selectedGuest.maritalStatus || selectedGuest.maritalstatus}
                        </p>
                        <p>
                          <strong>How they heard about us:</strong>{" "}
                          {selectedGuest.howDidYouHear || selectedGuest.howdidyouhear}
                        </p>
                        {selectedGuest.invitedBy && (
                          <p>
                            <strong>Invited By:</strong> {selectedGuest.invitedBy || selectedGuest.invitedby}
                          </p>
                        )}
                        <p>
                          <strong>Home Address:</strong> {selectedGuest.houseAddress || selectedGuest.houseaddress}
                        </p>
                        {selectedGuest.officeAddress && (
                          <p>
                            <strong>Office Address:</strong>{" "}
                            {selectedGuest.officeAddress || selectedGuest.officeaddress}
                          </p>
                        )}
                        <p>
                          <strong>Birthday:</strong> {selectedGuest.birthday}
                        </p>
                        <p>
                          <strong>Best Contact Method:</strong>{" "}
                          {selectedGuest.bestReachMethod || selectedGuest.bestreachmethod}
                        </p>
                        <p>
                          <strong>Wants to Join Church:</strong> {selectedGuest.joinChurch || selectedGuest.joinchurch}
                        </p>
                        <p>
                          <strong>Wants to Join Department:</strong>{" "}
                          {selectedGuest.joinDepartment || selectedGuest.joindepartment}
                        </p>
                        {(selectedGuest.selectedDepartment || selectedGuest.selecteddepartment) && (
                          <p>
                            <strong>Preferred Department:</strong>{" "}
                            {selectedGuest.selectedDepartment || selectedGuest.selecteddepartment}
                          </p>
                        )}
                        <p>
                          <strong>What Blessed Them:</strong> {selectedGuest.blessings}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Minister Follow-up Form */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">Minister's Follow-Up</CardTitle>
                <CardDescription className="text-blue-100">Fill this after attending to the guest</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Service Day */}
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium">
                      Service Day <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.serviceDay}
                      onValueChange={(value) => handleInputChange("serviceDay", value)}
                      required
                    >
                      <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11">
                        <SelectValue placeholder="Select service day" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                        <SelectItem value="friday" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Friday
                        </SelectItem>
                        <SelectItem value="sunday" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Sunday
                        </SelectItem>
                        <SelectItem value="wednesday" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Wednesday
                        </SelectItem>
                        <SelectItem value="others" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Others (Specify)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Service Day Input */}
                  {formData.serviceDay === "others" && (
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label htmlFor="customServiceDay" className="text-blue-900 font-medium">
                        Specify Service Day <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customServiceDay"
                        value={formData.customServiceDay}
                        onChange={(e) => handleInputChange("customServiceDay", e.target.value)}
                        className="border-blue-200 focus:border-blue-500"
                        placeholder="Enter service day (e.g., Saturday, Monday, etc.)"
                        required
                      />
                    </div>
                  )}

                  {/* 1. Minister Who Attended to FTG */}
                  <div className="space-y-2">
                    <Label htmlFor="ministerName" className="text-blue-900 font-medium">
                      Minister Who Attended to FTG <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ministerName"
                      value={formData.ministerName}
                      onChange={(e) => handleInputChange("ministerName", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                      placeholder="Enter minister's name"
                      required
                    />
                  </div>

                  {/* 2. Life Class Teacher */}
                  <div className="space-y-2">
                    <Label htmlFor="lifeClassTeacher" className="text-blue-900 font-medium">
                      Life Class Teacher <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lifeClassTeacher"
                      value={formData.lifeClassTeacher}
                      onChange={(e) => handleInputChange("lifeClassTeacher", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                      placeholder="Enter teacher's name"
                      required
                    />
                  </div>

                  {/* 3. Joined the Church */}
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium">
                      Joined the Church? <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.joinedChurch}
                      onValueChange={(value) => handleInputChange("joinedChurch", value)}
                      required
                    >
                      <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11">
                        <SelectValue placeholder="Select option" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-blue-200">
                        <SelectItem value="yes" className="text-gray-900 hover:bg-blue-50 py-2">
                          Yes
                        </SelectItem>
                        <SelectItem value="no" className="text-gray-900 hover:bg-blue-50 py-2">
                          No
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 4. Department Assigned */}
                  <div className="space-y-2">
                    <Label className="text-blue-900 font-medium">
                      Department Assigned <span className="text-red-500">*</span>
                    </Label>
                    {selectedGuest && (
                      <div className="text-sm text-blue-600 mb-2 p-2 bg-blue-50 rounded">
                        <strong>Guest's Original Choice:</strong>{" "}
                        {(selectedGuest.joinDepartment || selectedGuest.joindepartment) === "no"
                          ? "Did not want to join a department"
                          : `Wanted to join: ${selectedGuest.selectedDepartment || selectedGuest.selecteddepartment || "Any department"}`}
                      </div>
                    )}
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleInputChange("department", value)}
                      required
                    >
                      <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11">
                        <SelectValue placeholder="Select department" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-blue-200">
                        {getDepartmentOptions().map((dept) => (
                          <SelectItem
                            key={dept.value}
                            value={dept.value}
                            className="text-gray-900 hover:bg-blue-50 py-2"
                          >
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Department Input */}
                  {formData.department === "others" && (
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label htmlFor="customDepartment" className="text-blue-900 font-medium">
                        Specify Department <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customDepartment"
                        value={formData.customDepartment}
                        onChange={(e) => handleInputChange("customDepartment", e.target.value)}
                        className="border-blue-200 focus:border-blue-500"
                        placeholder="Enter department name"
                        required
                      />
                    </div>
                  )}

                  {/* 5. HOD in Charge of Department */}
                  <div className="space-y-2">
                    <Label htmlFor="hodInCharge" className="text-blue-900 font-medium">
                      HOD in Charge of Department <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hodInCharge"
                      value={formData.hodInCharge}
                      onChange={(e) => handleInputChange("hodInCharge", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                      placeholder="Enter HOD's name"
                      required
                    />
                  </div>

                  {/* 6. Minister's Comments */}
                  <div className="space-y-2">
                    <Label htmlFor="ministerComment" className="text-blue-900 font-medium">
                      Minister's Comments <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="ministerComment"
                      value={formData.ministerComment}
                      onChange={(e) => handleInputChange("ministerComment", e.target.value)}
                      className="border-blue-200 focus:border-blue-500 min-h-[100px]"
                      placeholder="Enter your comments about the guest interaction..."
                      required
                    />
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={!selectedGuest || isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Office Data</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Footer Warning */}
          <div className="mt-8 text-center">
            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              This portal is for attending ministers only. Do not share this link publicly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
