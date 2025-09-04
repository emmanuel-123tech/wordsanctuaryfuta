"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

export default function WelcomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    whatsappNumber: "",
    email: "",
    profession: "",
    schoolLevel: "",
    schoolDepartment: "",
    gender: "",
    maritalStatus: "",
    howDidYouHear: "",
    invitedBy: "",
    houseAddress: "",
    officeAddress: "",
    birthday: "",
    bestReachMethod: "",
    joinChurch: "",
    joinDepartment: "",
    selectedDepartment: "",
    blessings: [] as string[],
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear dependent fields when parent field changes
    if (field === "profession" && value !== "student") {
      setFormData((prev) => ({ ...prev, schoolLevel: "", schoolDepartment: "" }))
    }
    if (field === "howDidYouHear" && !["friend", "evangelism"].includes(value)) {
      setFormData((prev) => ({ ...prev, invitedBy: "" }))
    }
    if (field === "profession" && value !== "working-class") {
      setFormData((prev) => ({ ...prev, officeAddress: "" }))
    }
  }

  const handleBlessingsChange = (blessing: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      blessings: checked ? [...prev.blessings, blessing] : prev.blessings.filter((b) => b !== blessing),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Immediate UI feedback - don't wait for API
    setIsSubmitting(true)

    // Show success immediately for better UX
    setTimeout(() => {
      setIsSubmitted(true)
    }, 800) // Fast visual feedback

    try {
      // Submit in background - don't block UI
      const submitPromise = fetch("/api/submit-guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          blessings: formData.blessings.join(", "),
          submissionDate: new Date().toISOString(),
          status: "Pending Minister Follow-up",
        }),
      })

      // Don't wait for the full response - submit in background
      submitPromise.catch((error) => {
        console.error("Background submission error:", error)
        // Could add retry logic here if needed
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      // Reset UI if there's an immediate error
      setIsSubmitting(false)
      setIsSubmitted(false)
      alert("There was an error submitting your form. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center p-4">
              <Image
                src="/word-sanctuary-logo-black.png"
                alt="Word Sanctuary Logo"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Word Sanctuary</h1>
          <p className="text-xl text-purple-200 mb-12 italic">...a church like heaven</p>

          {/* Loading Progress Bar */}
          <div className="w-80 mx-auto">
            <div className="bg-purple-400/30 rounded-full h-2 mb-4 overflow-hidden">
              <div className="bg-white h-2 rounded-full animate-loading-progress"></div>
            </div>
            <p className="text-purple-200 text-sm">Loading experience...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-fade-in">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-3xl font-bold text-blue-900">Thank you!</h2>
          <p className="text-xl text-blue-700">We look forward to seeing you again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center p-3 shadow-lg">
            <Image
              src="/word-sanctuary-logo-black.png"
              alt="Word Sanctuary Logo"
              width={72}
              height={72}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Word Sanctuary</h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">We're Blessed to have you in Church!</CardTitle>
            <CardDescription className="text-blue-100">Kindly fill this form to help us stay in touch.</CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-blue-900 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                  required
                />
              </div>

              {/* 2. Phone */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-blue-900 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                  required
                />
              </div>

              {/* 3. WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-blue-900 font-medium">
                  WhatsApp Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                  required
                />
              </div>

              {/* 4. Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-900 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              {/* 5. Profession */}
              <div className="space-y-2">
                <Label className="text-blue-900 font-medium">
                  Profession <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.profession}
                  onValueChange={(value) => handleInputChange("profession", value)}
                  required
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11">
                    <SelectValue placeholder="Select your profession" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                    <SelectItem value="student" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Student
                    </SelectItem>
                    <SelectItem value="working-class" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Working Class
                    </SelectItem>
                    <SelectItem value="job-applicant" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Job Applicant
                    </SelectItem>
                    <SelectItem value="business" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Business
                    </SelectItem>
                    <SelectItem value="others" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Others
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Student Details (Conditional) */}
              {formData.profession === "student" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <Label htmlFor="schoolLevel" className="text-blue-900 font-medium">
                      What level in school <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="schoolLevel"
                      value={formData.schoolLevel}
                      onChange={(e) => handleInputChange("schoolLevel", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                      placeholder="e.g., 100 Level, SS3, etc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolDepartment" className="text-blue-900 font-medium">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="schoolDepartment"
                      value={formData.schoolDepartment}
                      onChange={(e) => handleInputChange("schoolDepartment", e.target.value)}
                      className="border-blue-200 focus:border-blue-500"
                      placeholder="e.g., Computer Science, Arts, etc."
                      required
                    />
                  </div>
                </div>
              )}

              {/* 6. Gender */}
              <div className="space-y-3">
                <Label className="text-blue-900 font-medium text-center block">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <div className="flex justify-center">
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    required
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11 w-full max-w-xs">
                      <SelectValue placeholder="Select gender" className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                      <SelectItem value="male" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                        Male
                      </SelectItem>
                      <SelectItem value="female" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 7. Marital Status */}
              <div className="space-y-3">
                <Label className="text-blue-900 font-medium text-center block">
                  Marital Status <span className="text-red-500">*</span>
                </Label>
                <div className="flex justify-center">
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleInputChange("maritalStatus", value)}
                    required
                  >
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11 w-full max-w-xs">
                      <SelectValue placeholder="Select status" className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                      <SelectItem value="single" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                        Single
                      </SelectItem>
                      <SelectItem value="married" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                        Married
                      </SelectItem>
                      <SelectItem value="others" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                        Others
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 8. How did you hear about the church */}
              <div className="space-y-2">
                <Label className="text-blue-900 font-medium">
                  How did you hear about the church? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.howDidYouHear}
                  onValueChange={(value) => handleInputChange("howDidYouHear", value)}
                  required
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11">
                    <SelectValue placeholder="Select how you heard about us" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                    <SelectItem value="social-media" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Social Media
                    </SelectItem>
                    <SelectItem value="friend" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Friend
                    </SelectItem>
                    <SelectItem value="evangelism" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Evangelism
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Invited By (Conditional) */}
              {(formData.howDidYouHear === "friend" || formData.howDidYouHear === "evangelism") && (
                <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label htmlFor="invitedBy" className="text-blue-900 font-medium">
                    Invited By <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invitedBy"
                    value={formData.invitedBy}
                    onChange={(e) => handleInputChange("invitedBy", e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                    placeholder="Enter the name of who invited you"
                    required
                  />
                </div>
              )}

              {/* 9. Home Address */}
              <div className="space-y-2">
                <Label htmlFor="houseAddress" className="text-blue-900 font-medium">
                  Home Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="houseAddress"
                  value={formData.houseAddress}
                  onChange={(e) => handleInputChange("houseAddress", e.target.value)}
                  className="border-blue-200 focus:border-blue-500 min-h-[80px]"
                  required
                />
              </div>

              {/* 10. Office Address (Conditional for Working Class) */}
              {formData.profession === "working-class" && (
                <div className="space-y-2">
                  <Label htmlFor="officeAddress" className="text-blue-900 font-medium">
                    Office Address
                  </Label>
                  <Textarea
                    id="officeAddress"
                    value={formData.officeAddress}
                    onChange={(e) => handleInputChange("officeAddress", e.target.value)}
                    className="border-blue-200 focus:border-blue-500 min-h-[80px]"
                  />
                </div>
              )}

              {/* 11. Birthday (Month and Day only) */}
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-blue-900 font-medium">
                  Birthday (Month and Day) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthday"
                  type="text"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange("birthday", e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                  placeholder="e.g., January 15, March 22"
                  required
                />
              </div>

              {/* 12. Best means of reaching out */}
              <div className="space-y-2">
                <Label className="text-blue-900 font-medium">
                  What's the best means of reaching out to you? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.bestReachMethod}
                  onValueChange={(value) => handleInputChange("bestReachMethod", value)}
                  required
                >
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11">
                    <SelectValue placeholder="Select best contact method" className="text-gray-900" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                    <SelectItem value="calls" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Calls
                    </SelectItem>
                    <SelectItem value="sms" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      SMS
                    </SelectItem>
                    <SelectItem value="whatsapp" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      WhatsApp
                    </SelectItem>
                    <SelectItem value="telegram" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Telegram
                    </SelectItem>
                    <SelectItem value="others" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                      Others
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 13. Would you like to join the church */}
              <div className="space-y-4">
                <Label className="text-blue-900 font-medium text-center block text-lg">
                  Would you like to join the church? <span className="text-red-500">*</span>
                </Label>
                <div className="flex justify-center">
                  <RadioGroup
                    value={formData.joinChurch}
                    onValueChange={(value) => handleInputChange("joinChurch", value)}
                    className="flex flex-row space-x-8"
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="join-church-yes" className="border-blue-400" />
                      <Label htmlFor="join-church-yes" className="font-medium">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="join-church-no" className="border-blue-400" />
                      <Label htmlFor="join-church-no" className="font-medium">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* 14. Would you like to join a department */}
              <div className="space-y-4">
                <Label className="text-blue-900 font-medium text-center block text-lg">
                  Would you like to join a department? <span className="text-red-500">*</span>
                </Label>
                <div className="flex justify-center">
                  <RadioGroup
                    value={formData.joinDepartment}
                    onValueChange={(value) => handleInputChange("joinDepartment", value)}
                    className="flex flex-row space-x-8"
                    required
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="join-dept-yes" className="border-blue-400" />
                      <Label htmlFor="join-dept-yes" className="font-medium">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="join-dept-no" className="border-blue-400" />
                      <Label htmlFor="join-dept-no" className="font-medium">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Department Selection (Conditional) */}
              {formData.joinDepartment === "yes" && (
                <div className="space-y-3">
                  <Label className="text-blue-900 font-medium text-center block">
                    Select Department <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex justify-center">
                    <Select
                      value={formData.selectedDepartment}
                      onValueChange={(value) => handleInputChange("selectedDepartment", value)}
                      required
                    >
                      <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500 bg-white text-gray-900 h-11 w-full max-w-sm">
                        <SelectValue placeholder="Choose a department" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-blue-200 shadow-lg">
                        <SelectItem value="media" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Media
                        </SelectItem>
                        <SelectItem value="choir" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Choir
                        </SelectItem>
                        <SelectItem value="power-sound" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Power and Sound
                        </SelectItem>
                        <SelectItem value="ushering" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Ushering
                        </SelectItem>
                        <SelectItem value="love-care" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Love and Care
                        </SelectItem>
                        <SelectItem value="zoe" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Zoe
                        </SelectItem>
                        <SelectItem value="sid" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          SID
                        </SelectItem>
                        <SelectItem value="drama" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Drama
                        </SelectItem>
                        <SelectItem value="evangelism" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Evangelism
                        </SelectItem>
                        <SelectItem value="orison" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Orison
                        </SelectItem>
                        <SelectItem value="decoration" className="text-gray-900 hover:bg-blue-50 py-2 font-medium">
                          Decoration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* 15. What blessed you in the service */}
              <div className="space-y-4">
                <Label className="text-blue-900 font-medium text-center block text-lg">
                  What blessed you in the service? <span className="text-red-500">*</span>
                </Label>
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                    {["Word", "Choir Ministration", "Drama", "Worship", "Praise", "Edification"].map((blessing) => (
                      <div key={blessing} className="flex items-center space-x-2 justify-center md:justify-start">
                        <Checkbox
                          id={blessing}
                          checked={formData.blessings.includes(blessing)}
                          onCheckedChange={(checked) => handleBlessingsChange(blessing, checked as boolean)}
                          className="border-blue-400"
                        />
                        <Label htmlFor={blessing} className="text-sm font-medium">
                          {blessing}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Guest Form</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
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
        {/* Footer Warning */}
        <div className="mt-8 text-center">
          <p className="text-xs text-blue-500 mb-2">
            <a href="/minister" className="hover:text-blue-700 underline transition-colors duration-200">
              @2025 WORD SANCTUARY
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
