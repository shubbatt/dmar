"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Star,
  BedDoubleIcon,
  CheckCircle2,
  CalendarIcon,
  Users,
  Home,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Waves,
  Heart,
  UtensilsCrossed,
  Anchor,
  Ship,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  getPackages, 
  getHotels, 
  getResorts, 
  getActivities, 
  getServices,
  type Package,
  type Hotel,
  type Resort,
  type Activity,
  type Service
} from "@/lib/laravel-api"

export default function BookingPage() {
  // API data state
  const [groupTravelPackages, setGroupTravelPackages] = useState<any[]>([])
  const [accommodations, setAccommodations] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const [bookingType, setBookingType] = useState<"package" | "custom">("package")
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  // ADDING STATE FOR CUSTOM BOOKING SELECTIONS
  const [customStep, setCustomStep] = useState(1)
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null)
  const [selectedActivities, setSelectedActivities] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [customDates, setCustomDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [guests, setGuests] = useState(2)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    specialRequests: "",
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)

  // ADDING STATE FOR EXPANDABLE ACTIVITIES IN PACKAGES
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({})

  // Fetch data from Laravel API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        console.log('[D\'Mar] Fetching data from Laravel API...')
        
        const [packagesData, hotelsData, resortsData, activitiesData, servicesData] = await Promise.all([
          getPackages(),
          getHotels(),
          getResorts(),
          getActivities(),
          getServices(),
        ])
        
        console.log('[D\'Mar] API data received:', {
          packages: packagesData.length,
          hotels: hotelsData.length,
          resorts: resortsData.length,
          activities: activitiesData.length,
          services: servicesData.length,
        })
        
        // Transform API packages to match frontend format
        const transformedPackages = packagesData.map((pkg: Package) => ({
          id: `group-${pkg.id}`,
          name: pkg.name,
          dates: pkg.dates,
          startDate: new Date(pkg.start_date),
          endDate: new Date(pkg.end_date),
          duration: pkg.duration,
          available: pkg.spots_available > 0,
          spotsLeft: pkg.spots_available,
          accommodation: pkg.accommodation ? {
            name: pkg.accommodation.name,
            type: pkg.accommodation.type,
            features: JSON.parse(pkg.accommodation.features as any || '[]'),
          } : null,
          activities: JSON.parse(pkg.activities as any || '[]'),
          price: Number(pkg.price),
          image: pkg.image_url,
          isWomenOnly: pkg.is_women_only,
        }))
        
        // Transform accommodations
        const transformedAccommodations = [...hotelsData, ...resortsData].map((acc: Hotel | Resort) => ({
          id: `${acc.category}-${acc.id}`,
          name: acc.name,
          type: acc.type,
          category: acc.category,
          features: JSON.parse(acc.features as any || '[]'),
          pricePerNight: Number(acc.price_per_night),
          image: acc.image_url,
        }))
        
        console.log('[D\'Mar] Transformed accommodations:', transformedAccommodations)
        console.log('[D\'Mar] Hotels:', transformedAccommodations.filter(a => a.category === 'hotel').length)
        console.log('[D\'Mar] Resorts:', transformedAccommodations.filter(a => a.category === 'resort').length)
        
        // Transform activities
        const transformedActivities = activitiesData.map((act: Activity) => ({
          id: `activity-${act.id}`,
          name: act.name,
          description: act.description,
          duration: act.duration,
          price: Number(act.price),
          icon: act.icon,
        }))
        
        // Transform services
        const transformedServices = servicesData.map((svc: Service) => ({
          id: `service-${svc.id}`,
          name: svc.name,
          description: svc.description,
          price: svc.price ? Number(svc.price) : undefined,
          pricePerDay: svc.price_per_day ? Number(svc.price_per_day) : undefined,
          icon: svc.icon,
        }))
        
        setGroupTravelPackages(transformedPackages)
        setAccommodations(transformedAccommodations)
        setActivities(transformedActivities)
        setServices(transformedServices)
        setApiError(null)
        
        console.log('[D\'Mar] Data successfully loaded from API!')
      } catch (err) {
        console.error('[D\'Mar] Error fetching from API:', err)
        setApiError(err instanceof Error ? err.message : 'Failed to load data from server')
        setGroupTravelPackages([])
        setAccommodations([])
        setActivities([])
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const togglePackageActivities = (packageId: string) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [packageId]: !prev[packageId],
    }))
  }

  // ADDING CONSTANTS FOR CUSTOM DATES (to align with API call later)
  const checkIn = customDates.from ? customDates.from.toISOString().split("T")[0] : ""
  const checkOut = customDates.to ? customDates.to.toISOString().split("T")[0] : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting booking with data:", {
        selectedPackage: selectedPackage?.name,
        customBooking: {
          accommodation: selectedAccommodation?.name,
          activities: selectedActivities.length,
          services: selectedServices.length,
        },
        dates: { checkIn, checkOut },
        guests,
        customer: customerInfo,
      })

      // Prepare booking data for email
      const bookingData = {
        service: selectedPackage
          ? selectedPackage.name
          : `Custom Trip - ${selectedAccommodation?.name || "No accommodation"}`,
        date: selectedPackage ? selectedPackage.dates : `${checkIn} to ${checkOut}`,
        time: "TBD", // This will be determined later
        guests,
        customer: customerInfo,
        totalPrice: selectedPackage ? (selectedPackage.price * guests) : calculateCustomTotal(),
        packageDetails: selectedPackage
          ? {
              accommodation: selectedPackage.accommodation,
              activities: selectedPackage.activities,
            }
          : {
              accommodation: selectedAccommodation?.name,
              activities: selectedActivities.map((a) => a.name),
              services: selectedServices.map((s) => s.name),
            },
      }

      console.log("[v0] Sending booking confirmation email...")

      // Send email to customer and admin
      const response = await fetch("/api/send-booking-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()
      console.log("[v0] Email API response:", result)

      if (result.success) {
        console.log("[v0] Booking confirmation email sent successfully!")
        if (result.bookingNumber) {
          setBookingNumber(result.bookingNumber)
          console.log("[v0] Booking number:", result.bookingNumber)
        }
      } else {
        console.error("[v0] Failed to send email:", result.error)
      }

      setIsBooked(true)
    } catch (error) {
      console.error("[v0] Error submitting booking:", error)
      // Still show success to user even if email fails
      setIsBooked(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ADDING HELPER FUNCTION TO CALCULATE NUMBER OF NIGHTS
  const calculateNights = () => {
    if (customDates.from && customDates.to) {
      const diffTime = Math.abs(customDates.to.getTime() - customDates.from.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    return 0
  }

  // ADDING HELPER FUNCTION TO CALCULATE TOTAL PRICE FOR CUSTOM BOOKING
  const calculateCustomTotal = () => {
    if (!selectedAccommodation) return 0
    const nights = calculateNights()
    const accommodationCost = selectedAccommodation.pricePerNight * nights * guests
    const activitiesCost = selectedActivities.reduce((sum, activity) => sum + activity.price * guests, 0)
    const servicesCost = selectedServices.reduce((sum, service) => {
      if (service.pricePerDay) {
        return sum + service.pricePerDay * nights * guests
      }
      return sum + service.price
    }, 0)
    return accommodationCost + activitiesCost + servicesCost
  }

  // ADDING TOGGLE FUNCTIONS FOR ACTIVITIES AND SERVICES
  const toggleActivity = (activity: any) => {
    setSelectedActivities((prev) => {
      const exists = prev.find((a) => a.id === activity.id)
      if (exists) {
        return prev.filter((a) => a.id !== activity.id)
      }
      return [...prev, activity]
    })
  }

  const toggleService = (service: any) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id)
      if (exists) {
        return prev.filter((s) => s.id !== service.id)
      }
      return [...prev, service]
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading packages from D'Mar Travels...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching the latest availability</p>
        </div>
      </div>
    )
  }

  // Error state - API failed
  if (apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center bg-white/80 backdrop-blur-sm">
          <div className="mb-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{apiError}</p>
          <div className="bg-cyan-50 rounded-lg p-4 mb-6 text-sm text-left">
            <p className="font-semibold text-gray-800 mb-2">Please try:</p>
            <ul className="space-y-1 text-gray-700">
              <li>• Checking your internet connection</li>
              <li>• Refreshing the page</li>
              <li>• Contacting us directly via WhatsApp</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            >
              Retry
            </Button>
            <Button 
              onClick={() => window.location.href = "/"} 
              variant="outline"
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (isBooked) {
    const totalAmount = selectedPackage ? (selectedPackage.price * guests) : calculateCustomTotal()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="p-8 bg-white/80 backdrop-blur-sm">
            <div className="text-center mb-6">
              <CheckCircle2 className="h-20 w-20 mx-auto text-cyan-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
              {bookingNumber && (
                <div className="bg-cyan-100 border-2 border-cyan-500 rounded-lg px-6 py-3 mb-4 inline-block">
                  <p className="text-sm text-cyan-700 font-semibold">Your Booking Number</p>
                  <p className="text-2xl font-bold text-cyan-900">{bookingNumber}</p>
                </div>
              )}
              <p className="text-lg text-gray-600">
                Thank you for choosing D'Mar Travels! We've received your booking request.
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-cyan-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Booking Summary</h3>
              
              {selectedPackage ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-700 font-medium">Package:</span>
                    <span className="text-gray-900 font-semibold text-right">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-700">Dates:</span>
                    <span className="text-gray-900 text-right">{selectedPackage.dates}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-700">Duration:</span>
                    <span className="text-gray-900">{selectedPackage.duration}</span>
                  </div>
                  {selectedPackage.accommodation && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">Accommodation:</span>
                      <span className="text-gray-900 text-right">{selectedPackage.accommodation.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-700">Guests:</span>
                    <span className="text-gray-900">{guests} {guests === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-cyan-200">
                    <span className="text-gray-800 font-bold text-lg">Total Amount:</span>
                    <span className="text-cyan-600 font-bold text-2xl">${totalAmount}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-700 font-medium">Custom Trip</span>
                  </div>
                  {customDates.from && customDates.to && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">Dates:</span>
                      <span className="text-gray-900 text-right">
                        {customDates.from.toLocaleDateString()} - {customDates.to.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {selectedAccommodation && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">Accommodation:</span>
                      <span className="text-gray-900 text-right">{selectedAccommodation.name}</span>
                    </div>
                  )}
                  {selectedActivities.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700">Activities:</span>
                      <span className="text-gray-900">{selectedActivities.length} selected</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-700">Guests:</span>
                    <span className="text-gray-900">{guests} {guests === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-cyan-200">
                    <span className="text-gray-800 font-bold text-lg">Total Amount:</span>
                    <span className="text-cyan-600 font-bold text-2xl">${totalAmount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="text-gray-900 font-medium">{customerInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{customerInfo.email}</span>
                </div>
                {customerInfo.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-900">{customerInfo.phone}</span>
                  </div>
                )}
                {customerInfo.whatsapp && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="text-gray-900">{customerInfo.whatsapp}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-cyan-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">What's Next?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>You'll receive a confirmation email within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Our team will contact you via WhatsApp to finalize details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <span>Payment instructions will be sent after confirmation</span>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Button onClick={() => (window.location.href = "/")} className="bg-cyan-600 hover:bg-cyan-700 px-8">
                Return to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 py-16 px-4">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src="/dmar-logo-final.png" alt="D'Mar Travels Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-gray-800">D'Mar</span>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 bg-transparent">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Book Your Maldives Experience</h1>
          <p className="text-xl text-gray-600">Choose a group travel package or create your custom adventure</p>
        </div>

        {/* Booking Type Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="flex justify-center gap-4 mb-8">
              <Button
                onClick={() => {
                  setBookingType("package")
                  setCustomStep(1)
                }}
                variant={bookingType === "package" ? "default" : "outline"}
                className={
                  bookingType === "package"
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "border-cyan-600 text-cyan-600"
                }
                size="lg"
              >
                Group Travel Packages
              </Button>
              {/* 
              <Button
                onClick={() => {
                  setBookingType("custom")
                  setCustomStep(1)
                }}
                variant={bookingType === "custom" ? "default" : "outline"}
                className={
                  bookingType === "custom"
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "border-cyan-600 text-cyan-600"
                }
                size="lg"
              >
                Custom Dates
              </Button>
              */}
            </div>

            {bookingType === "package" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Group Travel Packages</h2>
                  <p className="text-gray-600">Join our guided group adventures with all-inclusive experiences</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {groupTravelPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedPackage?.id === pkg.id
                          ? "border-cyan-500 shadow-xl shadow-cyan-500/20"
                          : "border-gray-200 hover:border-cyan-300 hover:shadow-lg"
                      } ${!pkg.available ? "opacity-60" : ""}`}
                      onClick={() => pkg.available && setSelectedPackage(pkg)}
                    >
                      {/* Image with overlay */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={pkg.image || "/placeholder.svg"}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Status badges */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          {pkg.isWomenOnly && (
                            <Badge className="bg-pink-500/90 text-white backdrop-blur-sm border-0">
                              <Users className="h-3 w-3 mr-1" />
                              Women Only
                            </Badge>
                          )}
                          {!pkg.available && (
                            <Badge className="bg-red-500/90 text-white backdrop-blur-sm border-0">Fully Booked</Badge>
                          )}
                          {pkg.available && pkg.spotsLeft <= 3 && (
                            <Badge className="bg-orange-500/90 text-white backdrop-blur-sm border-0 animate-pulse">
                              Only {pkg.spotsLeft} spots left!
                            </Badge>
                          )}
                        </div>

                        {/* Package name and date overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{pkg.dates}</span>
                            <span className="mx-2">•</span>
                            <span>{pkg.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Package details */}
                      <div className="p-6">
                        {/* Accommodation info */}
                        {pkg.accommodation && (
                          <div className="mb-4 p-3 bg-cyan-50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Home className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{pkg.accommodation.name}</p>
                                <p className="text-xs text-cyan-700 mb-2">{pkg.accommodation.type}</p>
                                <div className="flex flex-wrap gap-1">
                                  {pkg.accommodation.features.map((feature, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600 border border-cyan-100"
                                    >
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-cyan-600" />
                              Included Activities
                            </p>
                            {pkg.activities.length > 3 && (
                              <button
                                onClick={() => togglePackageActivities(pkg.id)}
                                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 transition-colors"
                              >
                                {expandedPackages[pkg.id] ? (
                                  <>
                                    Show Less <ChevronUp className="h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    Show All ({pkg.activities.length}) <ChevronDown className="h-3 w-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {(expandedPackages[pkg.id] ? pkg.activities : pkg.activities.slice(0, 3)).map(
                              (activity, idx) => {
                                // Get appropriate icon for activity type
                                let ActivityIcon = CheckCircle2
                                if (
                                  activity.toLowerCase().includes("snorkel") ||
                                  activity.toLowerCase().includes("dive")
                                ) {
                                  ActivityIcon = Waves
                                } else if (
                                  activity.toLowerCase().includes("yoga") ||
                                  activity.toLowerCase().includes("wellness")
                                ) {
                                  ActivityIcon = Heart
                                } else if (
                                  activity.toLowerCase().includes("food") ||
                                  activity.toLowerCase().includes("meal") ||
                                  activity.toLowerCase().includes("breakfast") ||
                                  activity.toLowerCase().includes("dinner")
                                ) {
                                  ActivityIcon = UtensilsCrossed
                                } else if (activity.toLowerCase().includes("fish")) {
                                  ActivityIcon = Anchor
                                } else if (
                                  activity.toLowerCase().includes("cruise") ||
                                  activity.toLowerCase().includes("boat")
                                ) {
                                  ActivityIcon = Ship
                                }

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                  >
                                    <ActivityIcon className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-gray-700">{activity}</span>
                                  </div>
                                )
                              },
                            )}
                          </div>

                          {!expandedPackages[pkg.id] && pkg.activities.length > 3 && (
                            <div className="mt-2 text-center">
                              <div className="inline-flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                                <Plus className="h-3 w-3" />
                                <span>{pkg.activities.length - 3} more amazing experiences</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-2xl font-bold text-cyan-600">${pkg.price}</p>
                            <p className="text-xs text-gray-500">per person</p>
                          </div>
                          {pkg.available && (
                            <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                              {pkg.spotsLeft} spots left
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedPackage}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg"
                    size="lg"
                  >
                    Continue to Guest Details
                  </Button>
                </div>
              </div>
            )}

            {/* REPLACING SIMPLE CALENDAR WITH MULTI-STEP CUSTOM BOOKING FLOW */}
            {bookingType === "custom" && (
              <div className="space-y-8">
                {/* Step Progress Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  {[
                    { num: 1, label: "Dates" },
                    { num: 2, label: "Stay" },
                    { num: 3, label: "Activities" },
                    { num: 4, label: "Services" },
                  ].map((step, idx) => (
                    <div key={step.num} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            customStep >= step.num ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step.num}
                        </div>
                        <span className="text-xs mt-1 text-gray-600">{step.label}</span>
                      </div>
                      {idx < 3 && (
                        <div className={`w-12 h-1 mx-2 ${customStep > step.num ? "bg-cyan-600" : "bg-gray-200"}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Select Dates */}
                {customStep === 1 && (
                  <Card className="p-8 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Select Your Travel Dates</h2>
                    <p className="text-center text-gray-600 mb-8">Choose when you'd like to visit the Maldives</p>

                    <div className="flex justify-center mb-6">
                      <Calendar
                        mode="range"
                        selected={{ from: customDates.from, to: customDates.to }}
                        onSelect={(range: any) => setCustomDates(range || { from: undefined, to: undefined })}
                        numberOfMonths={2}
                        className="rounded-md border"
                        disabled={(date) => date < new Date()}
                      />
                    </div>

                    {customDates.from && customDates.to && (
                      <div className="bg-cyan-50 rounded-lg p-6 text-center mb-6">
                        <p className="text-lg font-semibold text-gray-800">{calculateNights()} nights selected</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {customDates.from.toLocaleDateString()} - {customDates.to.toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => setCustomStep(2)}
                      disabled={!customDates.from || !customDates.to}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 text-lg"
                      size="lg"
                    >
                      Continue to Accommodation Selection
                    </Button>
                  </Card>
                )}

                {/* Step 2: Choose Accommodation */}
                {customStep === 2 && (
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <Button onClick={() => setCustomStep(1)} variant="outline">
                        ← Back
                      </Button>
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Choose Your Accommodation</h2>
                        <p className="text-gray-600 mt-1">Select where you'd like to stay</p>
                      </div>
                      <div className="w-20"></div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Star className="h-5 w-5 text-cyan-600" />
                          Luxury Resorts ({accommodations.filter((acc) => acc.category === "resort").length})
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          {accommodations.filter((acc) => acc.category === "resort").length === 0 && (
                            <div className="col-span-2 text-center py-8 text-gray-500">
                              No resorts available. Please check back later.
                            </div>
                          )}
                          {accommodations
                            .filter((acc) => acc.category === "resort")
                            .map((accommodation) => (
                              <Card
                                key={accommodation.id}
                                className={`cursor-pointer transition-all duration-300 ${
                                  selectedAccommodation?.id === accommodation.id
                                    ? "ring-4 ring-cyan-600 shadow-xl"
                                    : "hover:shadow-lg"
                                }`}
                                onClick={() => setSelectedAccommodation(accommodation)}
                              >
                                <div className="relative h-48">
                                  <Image
                                    src={accommodation.image || "/placeholder.svg"}
                                    alt={accommodation.name}
                                    fill
                                    className="object-cover rounded-t-lg"
                                  />
                                  {selectedAccommodation?.id === accommodation.id && (
                                    <div className="absolute top-4 right-4 bg-cyan-600 text-white rounded-full p-2">
                                      <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-6">
                                  <h4 className="text-xl font-bold text-gray-800 mb-2">{accommodation.name}</h4>
                                  <p className="text-sm text-gray-600 mb-4">{accommodation.type}</p>
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {accommodation.features.map((feature, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-2xl font-bold text-cyan-600">
                                    ${accommodation.pricePerNight}{" "}
                                    <span className="text-sm text-gray-600">/ night</span>
                                  </p>
                                </div>
                              </Card>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <BedDoubleIcon className="h-5 w-5 text-cyan-600" />
                          Hotels & Local Island Stays ({accommodations.filter((acc) => acc.category === "hotel").length})
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                          {accommodations.filter((acc) => acc.category === "hotel").length === 0 && (
                            <div className="col-span-3 text-center py-8 text-gray-500">
                              No hotels available. Please check back later.
                            </div>
                          )}
                          {accommodations
                            .filter((acc) => acc.category === "hotel")
                            .map((accommodation) => (
                              <Card
                                key={accommodation.id}
                                className={`cursor-pointer transition-all duration-300 ${
                                  selectedAccommodation?.id === accommodation.id
                                    ? "ring-4 ring-cyan-600 shadow-xl"
                                    : "hover:shadow-lg"
                                }`}
                                onClick={() => setSelectedAccommodation(accommodation)}
                              >
                                <div className="relative h-40">
                                  <Image
                                    src={accommodation.image || "/placeholder.svg"}
                                    alt={accommodation.name}
                                    fill
                                    className="object-cover rounded-t-lg"
                                  />
                                  {selectedAccommodation?.id === accommodation.id && (
                                    <div className="absolute top-3 right-3 bg-cyan-600 text-white rounded-full p-1.5">
                                      <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <h4 className="font-bold text-gray-800 mb-1">{accommodation.name}</h4>
                                  <p className="text-xs text-gray-600 mb-3">{accommodation.type}</p>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {accommodation.features.slice(0, 2).map((feature, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-lg font-bold text-cyan-600">
                                    ${accommodation.pricePerNight}{" "}
                                    <span className="text-xs text-gray-600">/ night</span>
                                  </p>
                                </div>
                              </Card>
                            ))}
                        </div>
                      </div>
                    </div>

                    {selectedAccommodation && (
                      <div className="mt-8 bg-cyan-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Selected Accommodation</p>
                            <p className="text-lg font-bold text-gray-800">{selectedAccommodation.name}</p>
                            <p className="text-sm text-gray-600">
                              ${selectedAccommodation.pricePerNight} × {calculateNights()} nights = $
                              {selectedAccommodation.pricePerNight * calculateNights()}
                            </p>
                          </div>
                          <Button
                            onClick={() => setCustomStep(3)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
                            size="lg"
                          >
                            Continue to Activities
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Step 3: Add Activities */}
                {customStep === 3 && (
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <Button onClick={() => setCustomStep(2)} variant="outline">
                        ← Back
                      </Button>
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Add Activities & Experiences</h2>
                        <p className="text-gray-600 mt-1">Select the activities you'd like to include (optional)</p>
                      </div>
                      <div className="w-20"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {activities.map((activity) => {
                        const isSelected = selectedActivities.find((a) => a.id === activity.id)
                        return (
                          <Card
                            key={activity.id}
                            className={`cursor-pointer transition-all duration-300 ${
                              isSelected ? "ring-4 ring-cyan-600 bg-cyan-50 shadow-xl" : "hover:shadow-lg"
                            }`}
                            onClick={() => toggleActivity(activity)}
                          >
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <span className="text-4xl">{activity.icon}</span>
                                {isSelected && (
                                  <div className="bg-cyan-600 text-white rounded-full p-1">
                                    <CheckCircle2 className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-800 mb-2">{activity.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">{activity.duration}</span>
                                <span className="text-lg font-bold text-cyan-600">${activity.price}</span>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>

                    <div className="bg-cyan-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Activities Selected</p>
                          <p className="text-lg font-bold text-gray-800">
                            {selectedActivities.length} activities ($
                            {selectedActivities.reduce((sum, a) => sum + a.price, 0)} per person)
                          </p>
                        </div>
                        <Button
                          onClick={() => setCustomStep(4)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
                          size="lg"
                        >
                          {selectedActivities.length > 0 ? "Continue to Services" : "Skip to Services"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Step 4: Add Services */}
                {customStep === 4 && (
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <Button onClick={() => setCustomStep(3)} variant="outline">
                        ← Back
                      </Button>
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Additional Services</h2>
                        <p className="text-gray-600 mt-1">Enhance your experience (optional)</p>
                      </div>
                      <div className="w-20"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {services.map((service) => {
                        const isSelected = selectedServices.find((s) => s.id === service.id)
                        return (
                          <Card
                            key={service.id}
                            className={`cursor-pointer transition-all duration-300 ${
                              isSelected ? "ring-4 ring-cyan-600 bg-cyan-50 shadow-xl" : "hover:shadow-lg"
                            }`}
                            onClick={() => toggleService(service)}
                          >
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <span className="text-4xl">{service.icon}</span>
                                {isSelected && (
                                  <div className="bg-cyan-600 text-white rounded-full p-1">
                                    <CheckCircle2 className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-800 mb-2">{service.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                              <span className="text-lg font-bold text-cyan-600">
                                ${service.price || `${service.pricePerDay}/day`}
                              </span>
                            </div>
                          </Card>
                        )
                      })}
                    </div>

                    <div className="bg-cyan-50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Services Selected</p>
                          <p className="text-lg font-bold text-gray-800">{selectedServices.length} services</p>
                        </div>
                        <Button
                          onClick={() => setCurrentStep(2)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
                          size="lg"
                        >
                          Continue to Guest Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Guest Details & Confirmation */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
            <Button onClick={() => setCurrentStep(1)} variant="outline" className="mb-4">
              ← Back to Selection
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="p-8 bg-white/80 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Guest Information</h2>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guests">Number of Guests *</Label>
                        <Input
                          id="guests"
                          type="number"
                          min="1"
                          max="20"
                          value={guests}
                          onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                      <Input
                        id="whatsapp"
                        value={customerInfo.whatsapp}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, whatsapp: e.target.value })}
                        className="mt-1"
                        placeholder="For quick booking updates"
                      />
                    </div>

                    <div>
                      <Label htmlFor="requests">Special Requests or Questions</Label>
                      <Textarea
                        id="requests"
                        value={customerInfo.specialRequests}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, specialRequests: e.target.value })}
                        className="mt-1"
                        placeholder="Dietary restrictions, celebrations, accessibility needs, etc."
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 bg-white/80 backdrop-blur-sm sticky top-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>

                  {selectedPackage && (
                    <div className="space-y-4">
                      <div className="relative h-32 rounded-lg overflow-hidden">
                        <Image
                          src={selectedPackage.image || "/placeholder.svg"}
                          alt={selectedPackage.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-800">{selectedPackage.name}</h4>
                        <p className="text-sm text-gray-600">{selectedPackage.dates}</p>
                        <p className="text-sm text-gray-600">{selectedPackage.duration}</p>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-800 mb-2">Accommodation</h4>
                        <p className="text-sm text-gray-700">{selectedPackage.accommodation.name}</p>
                        <p className="text-xs text-gray-500">{selectedPackage.accommodation.type}</p>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-800 mb-2">Activities Included</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {selectedPackage.activities.map((activity: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-cyan-600 mt-0.5 flex-shrink-0" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Price per person:</span>
                          <span className="font-medium text-gray-800">${selectedPackage.price}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Guests:</span>
                          <span className="font-medium text-gray-800">×{guests}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-bold text-lg text-gray-800">Total:</span>
                          <span className="font-bold text-2xl text-cyan-600">${selectedPackage.price * guests}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ENHANCED CUSTOM BOOKING SUMMARY WITH ACCOMMODATION, ACTIVITIES, AND SERVICES */}
                  {bookingType === "custom" && customDates.from && customDates.to && selectedAccommodation && (
                    <div className="space-y-4">
                      <div className="bg-cyan-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Travel Dates</h4>
                        <p className="text-sm text-gray-700">
                          {customDates.from.toLocaleDateString()} - {customDates.to.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">{calculateNights()} nights</p>
                      </div>

                      <div className="bg-cyan-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Accommodation</h4>
                        <p className="text-sm text-gray-700">{selectedAccommodation.name}</p>
                        <p className="text-xs text-gray-600">{selectedAccommodation.type}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          ${selectedAccommodation.pricePerNight} × {calculateNights()} nights × {guests} guests
                        </p>
                      </div>

                      {selectedActivities.length > 0 && (
                        <div className="bg-cyan-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Activities ({selectedActivities.length})</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {selectedActivities.map((activity) => (
                              <li key={activity.id} className="flex justify-between">
                                <span>{activity.name}</span>
                                <span>
                                  ${activity.price} × {guests}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedServices.length > 0 && (
                        <div className="bg-cyan-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Services ({selectedServices.length})</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {selectedServices.map((service) => (
                              <li key={service.id} className="flex justify-between">
                                <span>{service.name}</span>
                                <span>
                                  {service.pricePerDay
                                    ? `$${service.pricePerDay}/day × ${calculateNights()} nights × ${guests}`
                                    : `$${service.price}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-cyan-100 rounded-lg p-4 border-2 border-cyan-600">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-gray-800">Total Price:</span>
                          <span className="font-bold text-2xl text-cyan-600">${calculateCustomTotal()}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">For {guests} guests</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-6 py-6 text-lg"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    You won't be charged yet. Our team will confirm availability and send payment details.
                  </p>
                </Card>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
