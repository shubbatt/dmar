"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Calendar, ArrowLeft, Waves, Camera, Heart } from "lucide-react"
import Link from "next/link"
import { getServiceContent, type ServiceContentData } from "@/lib/laravel-api"

export default function ExcursionsPage() {
  const [content, setContent] = useState<ServiceContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getServiceContent('excursions')
        setContent(data)
      } catch (err) {
        console.error('Error fetching excursions content:', err)
        setError('Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Icon mapping
  const iconMap: Record<string, any> = {
    Waves,
    Heart,
    MapPin,
    Camera,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading excursions content...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Content not found'}</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const excursions = content.features || []
  const resortVisits = content.packages || []

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
            <Link href="/booking?service=excursions">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {content.hero_cta_text}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${content.hero_image_url || '/image8.jpg'}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/60 via-blue-900/40 to-purple-900/60" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          {content.hero_badge && (
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {content.hero_badge}
            </Badge>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
            {content.hero_title}
          </h1>
          {content.hero_subtitle && (
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
              {content.hero_subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Marine Excursions */}
      {excursions.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                {content.features_section_title || 'Marine Adventures'}
              </h2>
              {content.intro_paragraph && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {content.intro_paragraph}
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {excursions.map((excursion, index) => {
                const IconComponent = excursion.icon && iconMap[excursion.icon] 
                  ? iconMap[excursion.icon] 
                  : Waves
                return (
                  <Card
                    key={index}
                    className="group overflow-hidden backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={excursion.image || "/placeholder.svg"}
                        alt={excursion.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{excursion.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                        {excursion.description}
                      </p>

                      {(excursion.duration || excursion.location) && (
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                          {excursion.duration && (
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-3 w-3 mr-1 text-cyan-500" />
                              {excursion.duration}
                            </div>
                          )}
                          {excursion.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-3 w-3 mr-1 text-cyan-500" />
                              {excursion.location}
                            </div>
                          )}
                        </div>
                      )}

                      {(excursion.departure || excursion.return) && (
                        <div className="mb-4 text-xs">
                          <p className="text-gray-600">
                            {excursion.departure && (
                              <>
                                <span className="font-medium">Departure:</span> {excursion.departure}
                              </>
                            )}
                            {excursion.departure && excursion.return && ' | '}
                            {excursion.return && (
                              <>
                                <span className="font-medium">Return:</span> {excursion.return}
                              </>
                            )}
                          </p>
                        </div>
                      )}

                      {excursion.includes && excursion.includes.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Includes:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {excursion.includes.slice(0, 3).map((item, i) => (
                              <li key={i} className="flex items-center">
                                <Waves className="h-2 w-2 mr-2 text-green-500" />
                                {item}
                              </li>
                            ))}
                            {excursion.includes.length > 3 && (
                              <li className="text-cyan-600 font-medium">
                                +{excursion.includes.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-cyan-600">
                          ${excursion.price}
                        </span>
                        <Link href="/booking?service=excursions">
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                            <Calendar className="mr-1 h-3 w-3" />
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Resort Visits */}
      {resortVisits.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                {content.packages_section_title || 'Resort Day Visits'}
              </h2>
              {content.description_paragraph && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {content.description_paragraph}
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {resortVisits.map((resort, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={resort.image || "/placeholder.svg"}
                      alt={resort.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{resort.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{resort.description}</p>

                    {(resort.duration || resort.schedule) && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {resort.duration && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 text-cyan-500" />
                            {resort.duration}
                          </div>
                        )}
                        {resort.schedule && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                            {resort.schedule}
                          </div>
                        )}
                      </div>
                    )}

                    {resort.includes && resort.includes.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">Includes:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {resort.includes.map((item, i) => (
                            <li key={i} className="flex items-center">
                              <Heart className="h-3 w-3 mr-2 text-pink-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-cyan-600">${resort.price}</span>
                      <Link href="/booking?service=excursions">
                        <Button className="bg-cyan-600 hover:bg-cyan-700">
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Resort Visit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
