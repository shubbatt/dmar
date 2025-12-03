interface BookingData {
  service: string
  date: string
  time: string
  guests: number
  customer: {
    name: string
    email: string
    phone: string
    whatsapp?: string
    specialRequests?: string
  }
  totalPrice: number
}

export async function submitBooking(bookingData: BookingData) {
  try {
    // Generate a booking ID
    const bookingId = `DMR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Store booking in localStorage for demo purposes
    const booking = {
      id: bookingId,
      ...bookingData,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem("dmar-bookings") || "[]")
    existingBookings.push(booking)
    localStorage.setItem("dmar-bookings", JSON.stringify(existingBookings))

    console.log("[v0] Calling email API for booking:", bookingId)

    const emailResponse = await fetch("/api/send-booking-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })

    const emailResult = await emailResponse.json()
    console.log("[v0] Email API response:", emailResult)

    // Return success response
    return {
      success: true,
      bookingId,
      emailSent: emailResult.emailSent || false,
      whatsappSent: false,
      message: "Booking confirmed successfully!",
    }
  } catch (error) {
    console.error("[v0] Booking submission error:", error)
    throw error
  }
}
