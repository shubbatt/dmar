import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    console.log("[v0] Received booking data:", JSON.stringify(bookingData, null, 2))
    
    // Check for package booking
    const packageName = bookingData.selectedPackage || bookingData.service
    const isPackageBooking = Boolean(packageName)
    
    console.log("[v0] Package name:", packageName)
    console.log("[v0] Is package booking:", isPackageBooking)
    
    // Transform data
    const transformedData = {
      booking_type: isPackageBooking ? 'package' : 'custom',
      customer_name: bookingData.customer?.name || '',
      customer_email: bookingData.customer?.email || '',
      customer_phone: bookingData.customer?.phone || '',
      customer_whatsapp: bookingData.customer?.whatsapp || null,
      special_requests: bookingData.customer?.specialRequests || null,
      guests: bookingData.guests || 1,
      total_price: bookingData.totalPrice || 0,
      ...(isPackageBooking ? {
        package_name: packageName,
        package_details: bookingData.packageDetails || null,
        dates: bookingData.dates || bookingData.date || null,
      } : {
        check_in_date: bookingData.customBooking?.checkIn || null,
        check_out_date: bookingData.customBooking?.checkOut || null,
        accommodation_id: bookingData.customBooking?.accommodationId || null,
        activities: bookingData.customBooking?.activities || null,
        services: bookingData.customBooking?.services || null,
      }),
    }
    
    console.log("[v0] Transformed data:", JSON.stringify(transformedData, null, 2))
    
    const response = await fetch(`${backendUrl}/api/v1/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    })

    const responseText = await response.text()
    console.log("[v0] Backend response:", responseText)
    
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] Failed to parse response:", responseText.substring(0, 200))
      throw new Error("Invalid response from backend")
    }

    if (!response.ok) {
      console.error("[v0] Backend error:", result)
      return NextResponse.json(result, { status: response.status })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Booking error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process booking" },
      { status: 500 }
    )
  }
}
