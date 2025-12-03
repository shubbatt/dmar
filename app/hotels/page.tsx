"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ArrowLeft, Calendar, Bed, Users } from "lucide-react"
import Link from "next/link"
import { getHotels, type Hotel } from "@/lib/laravel-api"
import { useLanguage } from "@/lib/language-context"

export default function HotelsPage() {
  const { language } = useLanguage()
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHotels() {
      try {
        setLoading(true)
        const hotelsData = await getHotels({ locale: language })
        
        const transformedHotels = hotelsData.map((hotel: Hotel) => ({
          id: `hotel-${hotel.id}`,
          name: hotel.name,
          category: hotel.type,
          rating: 4.2,
          location: hotel.location || 'Maldives',
          price: Number(hotel.price_per_night),
          originalPrice: Number(hotel.price_per_night) * 1.25,
          description: hotel.description || '',
          images: [hotel.image_url, hotel.image_url, hotel.image_url],
          amenities: JSON.parse(hotel.features as any || '[]').slice(0, 5),
          roomTypes: [
            { type: 'Standard Room', beds: '1 Double Bed', guests: 2, price: Number(hotel.price_per_night) },
            { type: 'Superior Room', beds: '1 King Bed', guests: 2, price: Number(hotel.price_per_night) * 1.2 },
            { type: 'Family Room', beds: '2 Double Beds', guests: 4, price: Number(hotel.price_per_night) * 1.5 },
          ],
        }))
        
        setHotels(transformedHotels)
        setError(null)
      } catch (err) {
        console.error('Error fetching hotels:', err)
        setError('Failed to load hotels from database')
        setHotels([])
      } finally {
        setLoading(false)
      }
    }
    fetchHotels()
  }, [language])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading hotels...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Hotels</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-cyan-600 hover:bg-cyan-700">Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Back to Home</span>
            </Link>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Book Hotel</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/maafushi-adventure-hub-water-sports-activities.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-purple-900/60" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">Comfortable Stays</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Hotels & Guesthouses</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            From city hotels to local island guesthouses, find the perfect accommodation for your Maldivian adventure.
          </p>
        </div>
      </section>

      {/* Hotel Listings */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {hotels.map((hotel) => (
              <Card
                key={hotel.id}
                className="overflow-hidden backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Hotel Image */}
                  <div className="relative">
                    <div className="aspect-video lg:aspect-square overflow-hidden">
                      <img
                        src={hotel.images[0] || "/placeholder.svg"}
                        alt={hotel.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-gray-800">{hotel.category}</Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="lg:col-span-2 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{hotel.name}</h3>
                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {hotel.location}
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">{hotel.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        {hotel.originalPrice > hotel.price && (
                          <div className="text-sm text-gray-500 line-through">${hotel.originalPrice}</div>
                        )}
                        <div className="text-3xl font-bold text-cyan-600">${hotel.price}</div>
                        <div className="text-sm text-gray-500">per night</div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Room Types */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Room Types</h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        {hotel.roomTypes.map((room, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-800 text-sm mb-1">{room.type}</div>
                            <div className="flex items-center text-xs text-gray-600 mb-1">
                              <Bed className="h-3 w-3 mr-1" />
                              {room.beds}
                            </div>
                            <div className="flex items-center text-xs text-gray-600 mb-2">
                              <Users className="h-3 w-3 mr-1" />
                              Up to {room.guests} guests
                            </div>
                            <div className="font-bold text-cyan-600">${room.price}/night</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link href={`/booking?service=${hotel.id}`} className="flex-1">
                        <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Now
                        </Button>
                      </Link>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
