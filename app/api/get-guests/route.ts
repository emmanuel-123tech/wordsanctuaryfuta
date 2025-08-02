import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching guests from Google Sheets...")

    // Fetch from Google Sheets with new corrected URL
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzQooq3FHk7t6AEPzepqUHkSU2usrsBwzWBkuiT4ohF3ULhWehvNOroVIE8XbnfPUmk/exec?action=getGuests",
    )  

    console.log("Google Sheets response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Sheets error:", errorText)
      throw new Error(`Failed to fetch from Google Sheets: ${response.status} - ${errorText}`)
    }

    const guests = await response.json()
    console.log("Raw guests data from Google Sheets:", guests)
    console.log("Number of guests:", guests.length)
    if (guests.length > 0) {
      console.log("First guest structure:", Object.keys(guests[0]))
      console.log("First guest data:", guests[0])
    }
    console.log("Fetched guests:", guests)

    // If no guests found, return empty array
    return NextResponse.json(Array.isArray(guests) ? guests : [])
  } catch (error) {
    console.error("Error fetching guests:", error)

    // Return mock data as fallback for testing
    const mockGuests = [
      {
        id: "mock-1",
        fullname: "Test Guest (Fallback)",
        email: "test@example.com",
        phonenumber: "+1234567890",
        whatsappnumber: "+1234567890",
        profession: "Engineer",
        birthday: "1990-01-01",
        invitedby: "Sarah Johnson",
        gender: "male",
        maritalstatus: "single",
        houseaddress: "123 Main St",
        officeaddress: "456 Work Ave",
        joinchurch: "yes",
        joindepartment: "yes",
        selecteddepartment: "media",
        blessings: "Word, Worship",
        submissiondate: new Date().toISOString(),
        status: "Pending Minister Follow-up",
      },
    ]

    return NextResponse.json(mockGuests)
  }
}
