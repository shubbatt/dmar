import { type NextRequest, NextResponse } from "next/server"

interface BookingData {
  service?: string
  date?: string
  time?: string
  selectedPackage?: string
  packageDetails?: {
    accommodation?: any
    activities?: any[]
  }
  customBooking?: {
    accommodation?: any
    activities?: number
    services?: number
    dates?: {
      checkIn: string
      checkOut: string
    }
  }
  dates?: {
    checkIn: string
    checkOut: string
  }
  guests: number
  customer: {
    name: string
    email: string
    phone: string
    whatsapp?: string
    specialRequests?: string
  }
  totalPrice?: number
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json()

    console.log("[v0] Received booking data:", JSON.stringify(bookingData, null, 2))

    // Send booking to Laravel backend (which handles DB + email)
    let bookingResult = null
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      console.log("[v0] Sending booking to backend:", backendUrl)
      
      // Prepare order data for Laravel
      const isCustomBooking = bookingData.service && bookingData.service.includes("Custom Trip")
      
      // Build package_details from packageDetails (works for both custom and package bookings)
      let packageDetails: any = {}
      if (bookingData.packageDetails) {
        packageDetails = {
          name: bookingData.service || "Package",
          date: bookingData.date || "",
          accommodation: bookingData.packageDetails.accommodation,
          activities: Array.isArray(bookingData.packageDetails.activities) 
            ? bookingData.packageDetails.activities 
            : [],
          services: Array.isArray(bookingData.packageDetails.services) 
            ? bookingData.packageDetails.services 
            : [],
        }
      }

      const orderData = {
        session_id: `web_${Date.now()}`,
        name: bookingData.customer.name,
        email: bookingData.customer.email,
        phone: bookingData.customer.phone || "",
        whatsapp: bookingData.customer.whatsapp || "",
        special_requests: bookingData.customer.specialRequests || "",
        payment_method: "pending",
        items: [{
          item_type: isCustomBooking ? "custom" : "package",
          item_name: bookingData.service || "Custom Trip",
          quantity: 1,
          unit_price: bookingData.totalPrice || 0,
          guest_count: bookingData.guests || 1,
          booking_dates: bookingData.date || (bookingData.dates ? `${bookingData.dates.checkIn} to ${bookingData.dates.checkOut}` : null),
          package_details: packageDetails,
        }],
        total_amount: bookingData.totalPrice || 0,
        send_emails: true, // Flag to send emails
      }
      
      console.log("[v0] Backend order data:", JSON.stringify(orderData, null, 2))

      const response = await fetch(`${backendUrl}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        bookingResult = await response.json()
        console.log("[v0] Order saved to backend and emails sent:", bookingResult)
      } else {
        const errorText = await response.text()
        console.error("[v0] Failed to process order on backend:", response.status, errorText)
        
        return NextResponse.json({
          success: false,
          error: "Failed to process booking",
          details: errorText,
        }, { status: response.status })
      }
    } catch (backendError) {
      console.error("[v0] Error connecting to backend:", backendError)
      
      return NextResponse.json({
        success: false,
        error: "Failed to connect to booking system",
        details: backendError instanceof Error ? backendError.message : "Unknown error",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      bookingSaved: true,
      bookingNumber: bookingResult?.order?.order_number,
      message: "Booking confirmed and emails sent successfully",
      booking: bookingResult?.order,
    })
  } catch (error) {
    console.error("[v0] Error in booking confirmation API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process booking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function sendEmailConfirmation(bookingData: BookingData) {
  try {
    const emailContent = generateEmailTemplate(bookingData)

    console.log("[v0] Preparing email for customer:", bookingData.customer.email)

    const apiKey = process.env.resend || process.env.RESEND_API_KEY

    if (!apiKey) {
      console.warn("[v0] Resend API key not configured - simulating email send")
      console.log("[v0] Email would be sent to:", bookingData.customer.email)
      console.log("[v0] Email content prepared successfully")
      return {
        success: true,
        simulated: true,
        message: "Email simulated (no API key)",
      }
    }

    console.log("[v0] Resend API key found, sending real email...")
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: "D'Mar Travels <onboarding@resend.dev>",
      to: [bookingData.customer.email],
      subject: "Booking Confirmation - D'Mar Travels",
      html: emailContent,
    })

    if (error) {
      console.error("[v0] Resend customer email error:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Customer email sent successfully:", data)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] Error in sendEmailConfirmation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function sendAdminNotification(bookingData: BookingData, orderResult?: any) {
  try {
    const adminEmailContent = generateAdminEmailTemplate(bookingData, orderResult)

    console.log("[v0] Preparing admin notification email")

    const apiKey = process.env.resend || process.env.RESEND_API_KEY

    if (!apiKey) {
      console.warn("[v0] Resend API key not configured - simulating admin email")
      console.log("[v0] Admin email would be sent to: dmar.oceana@gmail.com")
      console.log("[v0] Admin email content prepared successfully")
      return {
        success: true,
        simulated: true,
        message: "Admin email simulated (no API key)",
      }
    }

    console.log("[v0] Resend API key found, sending admin email...")
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: "D'Mar Travels <onboarding@resend.dev>",
      to: ["dmar.oceana@gmail.com"],
      subject: `New Booking - ${bookingData.selectedPackage || "Custom Trip"}`,
      html: adminEmailContent,
    })

    if (error) {
      console.error("[v0] Resend admin email error:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Admin email sent successfully:", data)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] Error in sendAdminNotification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function generateEmailTemplate(bookingData: BookingData): string {
  const bookingType = bookingData.selectedPackage ? "Package" : "Custom Trip"
  const serviceName = bookingData.service || bookingData.selectedPackage || "Custom Maldives Experience"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - D'Mar Travels</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #0891b2; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌊 D'Mar Travels</h1>
          <h2>Booking Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${bookingData.customer.name},</p>
          <p>Thank you for booking with D'Mar Travels! Your Maldivian adventure is confirmed.</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span><strong>Type:</strong></span>
              <span>${bookingType}</span>
            </div>
            <div class="detail-row">
              <span><strong>Service:</strong></span>
              <span>${serviceName}</span>
            </div>
            ${
              bookingData.date
                ? `
            <div class="detail-row">
              <span><strong>Dates:</strong></span>
              <span>${bookingData.date}</span>
            </div>
            `
                : ""
            }
            ${
              bookingData.packageDetails?.accommodation?.name
                ? `
            <div class="detail-row">
              <span><strong>Accommodation:</strong></span>
              <span>${bookingData.packageDetails.accommodation.name}</span>
            </div>
            <div class="detail-row">
              <span><strong>Type:</strong></span>
              <span>${bookingData.packageDetails.accommodation.type}</span>
            </div>
            `
                : ""
            }
            <div class="detail-row">
              <span><strong>Guests:</strong></span>
              <span>${bookingData.guests} ${bookingData.guests === 1 ? "person" : "people"}</span>
            </div>
            ${
              bookingData.totalPrice
                ? `
            <div class="detail-row total">
              <span><strong>Total Price:</strong></span>
              <span>$${bookingData.totalPrice}</span>
            </div>
            `
                : ""
            }
          </div>
          
          ${
            bookingData.packageDetails?.activities && bookingData.packageDetails.activities.length > 0
              ? `
          <div class="booking-details">
            <h3>Included Activities</h3>
            <ul>
              ${bookingData.packageDetails.activities.map(activity => `<li>${activity}</li>`).join('')}
            </ul>
          </div>
          `
              : ""
          }
          
          ${
            bookingData.customer.specialRequests
              ? `
            <div class="booking-details">
              <h3>Special Requests</h3>
              <p>${bookingData.customer.specialRequests}</p>
            </div>
          `
              : ""
          }
          
          <p><strong>What to bring:</strong></p>
          <ul>
            <li>Swimwear and towel</li>
            <li>Sunscreen (reef-safe)</li>
            <li>Camera for memories</li>
            <li>Valid ID or passport</li>
          </ul>
          
          <p><strong>Meeting Point:</strong> Main jetty of Ukulhas Island</p>
          <p><strong>Contact:</strong> dmar.oceana@gmail.com | +49 1512 6720043</p>
          
          <p>We will contact you within 24 hours to confirm all details and finalize your booking.</p>
          
          <p>We're excited to share the magic of the Maldivian ocean with you!</p>
          
          <p>Best regards,<br>
          Daniela Mora & the D'Mar Team</p>
        </div>
        <div class="footer">
          <p>D'Mar Travels | Ukulhas, Maldives | dmarexplore.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateAdminEmailTemplate(bookingData: BookingData, orderResult?: any): string {
  const bookingType = bookingData.selectedPackage ? "Package" : "Custom Trip"
  const serviceName = bookingData.service || bookingData.selectedPackage || "Custom Maldives Experience"
  const orderNumber = orderResult?.order?.order_number || "N/A"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking - D'Mar Travels</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .total { font-size: 18px; font-weight: bold; color: #dc2626; }
        .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .order-number { background: #0891b2; color: white; padding: 10px 20px; border-radius: 8px; font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Booking Alert</h1>
          <h2>D'Mar Travels</h2>
        </div>
        <div class="content">
          <div class="alert">
            <strong>⚠️ Action Required:</strong> A new booking has been received and requires your attention.
          </div>
          
          <div class="order-number">
            Order #${orderNumber}
          </div>
          
          <div class="booking-details">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <span><strong>Name:</strong></span>
              <span>${bookingData.customer.name}</span>
            </div>
            <div class="detail-row">
              <span><strong>Email:</strong></span>
              <span><a href="mailto:${bookingData.customer.email}">${bookingData.customer.email}</a></span>
            </div>
            <div class="detail-row">
              <span><strong>Phone:</strong></span>
              <span><a href="tel:${bookingData.customer.phone}">${bookingData.customer.phone}</a></span>
            </div>
            ${
              bookingData.customer.whatsapp
                ? `
            <div class="detail-row">
              <span><strong>WhatsApp:</strong></span>
              <span><a href="https://wa.me/${bookingData.customer.whatsapp}">${bookingData.customer.whatsapp}</a></span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span><strong>Type:</strong></span>
              <span>${bookingType}</span>
            </div>
            <div class="detail-row">
              <span><strong>Service:</strong></span>
              <span>${serviceName}</span>
            </div>
            ${
              bookingData.date
                ? `
            <div class="detail-row">
              <span><strong>Dates:</strong></span>
              <span>${bookingData.date}</span>
            </div>
            `
                : ""
            }
            ${
              bookingData.packageDetails?.accommodation?.name
                ? `
            <div class="detail-row">
              <span><strong>Accommodation:</strong></span>
              <span>${bookingData.packageDetails.accommodation.name}</span>
            </div>
            <div class="detail-row">
              <span><strong>Accommodation Type:</strong></span>
              <span>${bookingData.packageDetails.accommodation.type}</span>
            </div>
            `
                : ""
            }
            <div class="detail-row">
              <span><strong>Guests:</strong></span>
              <span>${bookingData.guests} ${bookingData.guests === 1 ? "person" : "people"}</span>
            </div>
            ${
              bookingData.totalPrice
                ? `
            <div class="detail-row total">
              <span><strong>Total Price:</strong></span>
              <span>$${bookingData.totalPrice}</span>
            </div>
            `
                : ""
            }
          </div>
          
          ${
            bookingData.packageDetails?.activities && bookingData.packageDetails.activities.length > 0
              ? `
          <div class="booking-details">
            <h3>Included Activities</h3>
            <ul>
              ${bookingData.packageDetails.activities.map(activity => `<li>${activity}</li>`).join('')}
            </ul>
          </div>
          `
              : ""
          }
          
          ${
            bookingData.customer.specialRequests
              ? `
            <div class="booking-details">
              <h3>Special Requests</h3>
              <p>${bookingData.customer.specialRequests}</p>
            </div>
          `
              : ""
          }
          
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Review the booking details</li>
            <li>Contact the customer within 24 hours</li>
            <li>Confirm availability and finalize arrangements</li>
            <li>Send payment instructions if needed</li>
          </ol>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
            <strong>Booking received at:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
