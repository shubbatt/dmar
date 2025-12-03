"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Waves, ArrowLeft, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { getResorts, type Resort } from "@/lib/laravel-api"

export default function ResortsPage() {
  const { t, language } = useLanguage()
  const [resorts, setResorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResorts() {
      try {
        setLoading(true)
        const resortsData = await getResorts({ locale: language })
        
        const transformedResorts = resortsData.map((resort: Resort) => ({
          id: `resort-${resort.id}`,
          name: resort.name,
          category: resort.type,
          rating: 4.5,
          location: resort.location || 'Maldives',
          price: Number(resort.price_per_night),
          originalPrice: Number(resort.price_per_night) * 1.25,
          description: resort.description || '',
          images: [resort.image_url, resort.image_url, resort.image_url],
          amenities: JSON.parse(resort.features as any || '[]').slice(0, 6),
          features: JSON.parse(resort.features as any || '[]'),
          dayVisit: {
            available: true,
            price: Math.round(Number(resort.price_per_night) * 0.35),
            includes: ['Resort facilities', 'Lunch', 'Beach access', 'Transfer'],
          },
        }))
        
        setResorts(transformedResorts)
        setError(null)
      } catch (err) {
        console.error('Error fetching resorts:', err)
        setError('Failed to load resorts from database')
        setResorts([])
      } finally {
        setLoading(false)
      }
    }
    fetchResorts()
  }, [language])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading resorts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Resorts</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-cyan-600 hover:bg-cyan-700">Retry</Button>
        </Card>
      </div>
    )
  }

  const categories = ["All", "Luxury Resort", "Boutique Resort", "Local Guesthouse", "Eco-Friendly", "Adults-Only"]

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
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Book Resort</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/image4.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-purple-900/60" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">Luxury Accommodations</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Resorts & Hotels</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            Discover the finest accommodations in the Maldives, from luxury overwater villas to authentic local island
            experiences.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                className="bg-white/60 hover:bg-cyan-100 border-white/30"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Resort Listings */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {resorts.map((resort) => (
              <Card
                key={resort.id}
                className="group overflow-hidden backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
              >
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={resort.images[0] || "/placeholder.svg"}
                      alt={resort.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-800">{resort.category}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{resort.rating}</span>
                    </div>
                  </div>
                  {resort.originalPrice > resort.price && (
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-red-500 text-white">Save ${resort.originalPrice - resort.price}</Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{resort.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {resort.location}
                      </div>
                    </div>
                    <div className="text-right">
                      {resort.originalPrice > resort.price && (
                        <div className="text-sm text-gray-500 line-through">${resort.originalPrice}</div>
                      )}
                      <div className="text-2xl font-bold text-cyan-600">${resort.price}</div>
                      <div className="text-xs text-gray-500">per night</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{resort.description}</p>

                  {/* Amenities */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Amenities</h4>
                    <div className="flex flex-wrap gap-1">
                      {resort.amenities.slice(0, 4).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {resort.amenities.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{resort.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Features</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                      {resort.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Waves className="h-3 w-3 mr-1 text-cyan-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day Visit Option */}
                  {resort.dayVisit.available && (
                    <div className="mb-4 p-3 bg-cyan-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">Day Visit Available</span>
                        <span className="text-lg font-bold text-cyan-600">${resort.dayVisit.price}</span>
                      </div>
                      <div className="text-xs text-gray-600">Includes: {resort.dayVisit.includes.join(", ")}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/booking?service=${resort.id}`} className="flex-1">
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Stay
                      </Button>
                    </Link>
                    {resort.dayVisit.available && (
                      <Link href={`/booking?service=${resort.id}-day-visit`}>
                        <Button variant="outline" size="sm">
                          Day Visit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Resorts */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Why Choose Our Partner Resorts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've carefully selected the finest accommodations to ensure your Maldivian experience is unforgettable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center backdrop-blur-sm bg-white/60 border-white/20">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Premium Quality</h3>
              <p className="text-gray-600">
                Hand-picked resorts and hotels that meet our high standards for service, comfort, and location.
              </p>
            </Card>

            <Card className="p-6 text-center backdrop-blur-sm bg-white/60 border-white/20">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Prime Locations</h3>
              <p className="text-gray-600">
                Strategic locations near the best diving spots, beaches, and cultural attractions in the Maldives.
              </p>
            </Card>

            <Card className="p-6 text-center backdrop-blur-sm bg-white/60 border-white/20">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Local Expertise</h3>
              <p className="text-gray-600">
                Benefit from our local knowledge and partnerships to get the best rates and exclusive experiences.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
