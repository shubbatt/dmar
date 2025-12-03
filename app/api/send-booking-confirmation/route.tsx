import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    
    console.log("[v0] Received booking data:", bookingData)
    
    const isPackageBooking = !!bookingData.selectedPackage
    
    // Transform frontend data to backend format
    const transformedData: any = {
      booking_type: isPackageBooking ? 'package' : 'custom',
      customer_name: bookingData.customer?.name,
      customer_email: bookingData.customer?.email,
      customer_phone: bookingData.customer?.phone,
      customer_whatsapp: bookingData.customer?.whatsapp,
      special_requests: bookingData.customer?.specialRequests,
      guests: bookingData.guests,
      total_price: bookingData.totalPrice,
    }
    
    // Add package-specific fields
    if (isPackageBooking) {
      transformedData.package_name = bookingData.selectedPackage
      transformedData.package_details = bookingData.packageDetails
      transformedData.dates = bookingData.dates
    } else {
      // Add custom booking fields
      transformedData.check_in_date = bookingData.customBooking?.checkIn
      transformedData.check_out_date = bookingData.customBooking?.checkOut
      transformedData.accommodation_id = bookingData.customBooking?.accommodationId
      transformedData.activities = bookingData.customBooking?.activities
      transformedData.services = bookingData.customBooking?.services
    }
    
    console.log("[v0] Transformed data:", transformedData)
    
    const response = await fetch(`${backendUrl}/api/v1/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Backend error:", errorData)
      return NextResponse.json(errorData, { status: response.status })
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
