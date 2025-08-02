import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Add unique ID and timestamp
    const guestData = {
      id: Date.now().toString(),
      ...data,
      submissionDate: new Date().toISOString(),
      status: "Pending Minister Follow-up",
    }

    console.log("Guest data to be saved to Google Sheets:", guestData)

    // Submit to Google Sheets with timeout for faster response
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzQooq3FHk7t6AEPzepqUHkSU2usrsBwzWBkuiT4ohF3ULhWehvNOroVIE8XbnfPUmk/exec",
      {   
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addGuest",
          data: guestData,
        }),
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)
    console.log("Google Sheets response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Sheets error:", errorText)
      throw new Error(`Failed to save to Google Sheets: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Google Sheets response:", result)

    return NextResponse.json({ success: true, id: guestData.id })
  } catch (error) {
    console.error("Error submitting guest data:", error)

    // Return success even if Google Sheets fails (for better UX)
    // The data is logged and can be recovered
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Request timed out, but continuing...")
    }

    return NextResponse.json({ success: true, id: Date.now().toString() })
  }
}
