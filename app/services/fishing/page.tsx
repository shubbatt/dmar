"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Fish, Calendar, ArrowLeft, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { getServiceContent, type ServiceContentData } from "@/lib/laravel-api"

export default function FishingPage() {
  const [content, setContent] = useState<ServiceContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        const data = await getServiceContent('fishing')
        setContent(data)
      } catch (err) {
        console.error('Error fetching fishing content:', err)
        setError('Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Icon mapping
  const iconMap: Record<string, any> = {
    Sun,
    Moon,
    Fish,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fishing content...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Content not found'}</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const fishingPackages = content.packages || []
  const fishSpecies = content.info_bullets || []
  const techniques = content.features || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Back to Home</span>
            </Link>
            <Link href="/booking?service=fishing">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
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
            backgroundImage: `url('${content.hero_image_url || '/fish3.jpeg'}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/60 via-green-900/40 to-blue-900/60" />

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

      {/* Fishing Packages */}
      {fishingPackages.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                {content.packages_section_title || 'Fishing Packages'}
              </h2>
              {content.intro_paragraph && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {content.intro_paragraph}
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {fishingPackages.map((pkg, index) => {
                const IconComponent = pkg.icon && iconMap[pkg.icon] ? iconMap[pkg.icon] : Fish
                return (
                  <Card
                    key={index}
                    className="group overflow-hidden backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={pkg.image || "/placeholder.svg"}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{pkg.name}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{pkg.description}</p>

                      {(pkg.duration || pkg.capacity) && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {pkg.duration && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-teal-500" />
                              {pkg.duration}
                            </div>
                          )}
                          {pkg.capacity && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2 text-teal-500" />
                              {pkg.capacity}
                            </div>
                          )}
                        </div>
                      )}

                      {pkg.schedule && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 font-medium mb-2">Schedule:</p>
                          <p className="text-sm text-gray-600">{pkg.schedule}</p>
                        </div>
                      )}

                      {pkg.includes && pkg.includes.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-2">Includes:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {pkg.includes.map((item, i) => (
                              <li key={i} className="flex items-center">
                                <Fish className="h-3 w-3 mr-2 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-teal-600">${pkg.price}</span>
                        <Link href="/booking?service=fishing">
                          <Button className="bg-teal-600 hover:bg-teal-700">
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Now
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

      {/* Fish Species Section */}
      {fishSpecies.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-r from-teal-50 to-green-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                {content.info_section_title || 'Target Species'}
              </h2>
              {content.description_paragraph && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {content.description_paragraph}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fishSpecies.map((fish, index) => (
                <Card
                  key={index}
                  className="p-6 backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
                >
                  <div className="flex items-center mb-3">
                    <Fish className="h-6 w-6 text-teal-600 mr-3" />
                    <h3 className="text-lg font-bold text-gray-800">{fish.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{fish.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Techniques Section */}
      {techniques.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                {content.features_section_title || 'Fishing Techniques'}
              </h2>
              {content.info_paragraph && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {content.info_paragraph}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {techniques.map((technique, index) => (
                <Card
                  key={index}
                  className="text-center p-8 backdrop-blur-sm bg-white/60 border-white/20"
                >
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Fish className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{technique.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{technique.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
