import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    console.log("[v0] Forwarding booking to Laravel backend:", backendUrl)
    
    const response = await fetch(`${backendUrl}/api/v1/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to process booking" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] Booking error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process booking" },
      { status: 500 }
    )
  }
}
