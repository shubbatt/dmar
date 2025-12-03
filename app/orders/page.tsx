"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  Users,
  Mail,
  Phone,
  MessageCircle,
  BedDouble,
  Waves,
  ArrowLeft,
  Loader2,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface OrderItem {
  item_type: string
  item_name: string
  quantity: number
  unit_price: number
  guest_count: number
  booking_dates: string | null
  package_details?: {
    name?: string
    date?: string
    dates?: {
      checkIn: string
      checkOut: string
    }
    accommodation?: {
      name: string
      type: string
      [key: string]: any
    }
    activities?: string[] | number
    services?: number
  }
}

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_whatsapp: string
  total_amount: number
  payment_status: string
  payment_method: string
  status: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from localStorage first (for demo/testing)
      const sessionBookings = JSON.parse(localStorage.getItem("dmar-bookings") || "[]")
      
      // Transform localStorage bookings to match Order interface
      const localOrders = sessionBookings.map((booking: any, index: number) => ({
        id: index + 1,
        order_number: booking.id || `DMR-${Date.now()}`,
        customer_name: booking.customer?.name || "Guest",
        customer_email: booking.customer?.email || "",
        customer_phone: booking.customer?.phone || "",
        customer_whatsapp: booking.customer?.whatsapp || "",
        total_amount: booking.totalPrice || 0,
        payment_status: booking.paymentStatus || "pending",
        payment_method: booking.paymentMethod || "pending",
        status: booking.status || "pending",
        created_at: booking.createdAt || new Date().toISOString(),
        updated_at: booking.updatedAt || new Date().toISOString(),
        items: [{
          item_type: booking.selectedPackage ? "package" : "custom",
          item_name: booking.service || booking.selectedPackage || "Custom Trip",
          quantity: 1,
          unit_price: booking.totalPrice || 0,
          guest_count: booking.guests || 1,
          booking_dates: booking.date || (booking.dates ? `${booking.dates.checkIn} to ${booking.dates.checkOut}` : null),
          package_details: booking.packageDetails || booking.customBooking,
        }],
      }))
      
      setOrders(localOrders)
      setError(null)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">{t("backToHome")}</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">D'Mar Travels</h1>
                <p className="text-xs text-gray-600">{t("oceanConnection")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t("myBookings")}</h1>
            <p className="text-gray-600">{t("viewBookingHistory")}</p>
          </div>

          {error && (
            <Card className="bg-red-50 border-red-200 p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </Card>
          )}

          {orders.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("noBookings")}</h3>
              <p className="text-gray-600 mb-6">{t("startBooking")}</p>
              <Link href="/booking">
                <Button className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {t("bookNow")}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-white/60 backdrop-blur-sm border-white/20 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-sm opacity-90 mb-1">{t("orderNumber")}</p>
                        <p className="text-2xl font-bold">{order.order_number}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 text-sm py-1.5 px-3`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="mt-4 text-sm opacity-90">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      {t("booked")}: {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    {/* Booking Items */}
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                            {item.item_type === "package" ? (
                              <Package className="h-6 w-6 text-cyan-600" />
                            ) : (
                              <Waves className="h-6 w-6 text-cyan-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{item.item_name}</h3>
                            <p className="text-sm text-gray-600">
                              {item.item_type === "package" ? t("groupPackage") : t("customTrip")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-cyan-600">${item.unit_price.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          {item.booking_dates && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <Calendar className="h-5 w-5 text-cyan-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">{t("dates")}</p>
                                <p className="text-gray-900">{item.booking_dates}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Users className="h-5 w-5 text-cyan-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{t("guests")}</p>
                              <p className="text-gray-900">
                                {item.guest_count} {item.guest_count === 1 ? t("person") : t("people")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Package Details - if available */}
                        {item.package_details && (
                          <div className="space-y-3 border-t pt-4">
                            {/* Dates for custom bookings */}
                            {item.package_details.dates && (
                              <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-cyan-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700">{t("travelDates")}</p>
                                  <p className="text-gray-900 font-semibold">
                                    {item.package_details.dates.checkIn} - {item.package_details.dates.checkOut}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {/* Accommodation */}
                            {item.package_details.accommodation && (
                              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <BedDouble className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700">{t("accommodation")}</p>
                                  <p className="text-gray-900 font-semibold">
                                    {item.package_details.accommodation.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {item.package_details.accommodation.type}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Activities - Array */}
                            {item.package_details.activities && Array.isArray(item.package_details.activities) && item.package_details.activities.length > 0 && (
                              <div className="p-3 bg-teal-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Waves className="h-5 w-5 text-teal-600" />
                                  <p className="text-sm font-medium text-gray-700">{t("includedActivities")}</p>
                                </div>
                                <ul className="space-y-1 ml-7">
                                  {item.package_details.activities.map((activity: string, i: number) => (
                                    <li key={i} className="text-gray-900 flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                      {activity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Activities - Count (for custom bookings) */}
                            {item.package_details.activities && typeof item.package_details.activities === 'number' && item.package_details.activities > 0 && (
                              <div className="p-3 bg-teal-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Waves className="h-5 w-5 text-teal-600" />
                                  <p className="text-sm font-medium text-gray-700">
                                    {item.package_details.activities} {item.package_details.activities === 1 ? 'Activity' : 'Activities'} Selected
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {/* Services - Array */}
                            {item.package_details.services && Array.isArray(item.package_details.services) && item.package_details.services.length > 0 && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="h-5 w-5 text-purple-600" />
                                  <p className="text-sm font-medium text-gray-700">{t("additionalServices")}</p>
                                </div>
                                <ul className="space-y-1 ml-7">
                                  {item.package_details.services.map((service: string, i: number) => (
                                    <li key={i} className="text-gray-900 flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                                      {service}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Services - Count (for custom bookings) */}
                            {item.package_details.services && typeof item.package_details.services === 'number' && item.package_details.services > 0 && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Package className="h-5 w-5 text-purple-600" />
                                  <p className="text-sm font-medium text-gray-700">
                                    {item.package_details.services} {item.package_details.services === 1 ? 'Service' : 'Services'} Selected
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Customer Information */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">{t("customerInformation")}</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-cyan-600" />
                          <div>
                            <p className="text-sm text-gray-600">{t("email")}</p>
                            <p className="text-gray-900">{order.customer_email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-5 w-5 text-cyan-600" />
                          <div>
                            <p className="text-sm text-gray-600">{t("phone")}</p>
                            <p className="text-gray-900">{order.customer_phone}</p>
                          </div>
                        </div>

                        {order.customer_whatsapp && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MessageCircle className="h-5 w-5 text-cyan-600" />
                            <div>
                              <p className="text-sm text-gray-600">WhatsApp</p>
                              <p className="text-gray-900">{order.customer_whatsapp}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="border-t mt-4 pt-4 flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{t("totalAmount")}</span>
                      <span className="text-2xl font-bold text-cyan-600">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-800">{t("paymentPending")}</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            {t("paymentPendingMessage")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
