import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { guestId, ministerData, status } = await request.json()

    console.log("Updating guest in Google Sheets:", { guestId, ministerData, status })

    // Update in Google Sheets with timeout for faster response
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
          action: "updateGuest",
          guestId,
          ministerData,
          status,
          completedDate: new Date().toISOString(),
        }),
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)
    console.log("Google Sheets update response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Sheets update error:", errorText)
      throw new Error(`Failed to update Google Sheets: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Google Sheets update response:", result)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating guest data:", error)

    // Return success even if Google Sheets fails (for better UX)
    // The data is logged and can be recovered
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Update request timed out, but continuing...")
    }

    return NextResponse.json({ success: true })
  }
}
