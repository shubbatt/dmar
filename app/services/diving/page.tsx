"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Award, MapPin, Calendar, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { getServiceContent } from "@/lib/laravel-api"

export default function DivingPage() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true)
        const data = await getServiceContent('diving')
        setContent(data)
      } catch (err) {
        console.error('[Diving] Failed to load page content:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="text-center">
          <p className="text-gray-600">Content not available</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const courses = content.features || []
  const funDives = content.packages || []
  const diveSites = content.info_bullets || []
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Back to Home</span>
            </Link>
            <Link href="/booking?service=diving">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                {content.hero_cta_text || 'Book Diving'}
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
            backgroundImage: content.hero_image_url ? `url("${content.hero_image_url}")` : `url('/image1.png')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-cyan-900/40 to-teal-900/60" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          {content.hero_badge && (
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {content.hero_badge}
            </Badge>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
            {content.hero_title || 'Scuba Diving Adventures'}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            {content.hero_subtitle || 'Dive into adventures with expert instruction and premium gear. From beginner discovery dives to advanced PADI certifications in the crystal-clear waters of the Maldives.'}
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              {content.packages_section_title || 'Diving Courses'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.intro_paragraph || 'From first-time experiences to advanced certifications, we offer comprehensive diving education with experienced PADI instructors.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {courses.map((course: any, index: number) => (
              <Card
                key={index}
                className="group overflow-hidden backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{course.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{course.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      {course.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      Max {course.maxDepth}
                    </div>
                  </div>

                  {course.includes && course.includes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Includes:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {course.includes.map((item: string, i: number) => (
                          <li key={i} className="flex items-center">
                            <Award className="h-3 w-3 mr-2 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-600">{course.price}</span>
                    <Link href="/booking?service=diving">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Dives Section */}
      {funDives && funDives.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Fun Dives</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Enjoy the most beautiful dives in our atoll and have the best experience under the Maldivian ocean.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {funDives.map((dive: any, index: number) => (
                <Card 
                  key={index}
                  className={`text-center p-8 backdrop-blur-sm bg-white/60 border-white/20 ${
                    dive.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {dive.popular && (
                    <Badge className="mb-4 bg-blue-600 text-white">Most Popular</Badge>
                  )}
                  <div className="text-4xl font-bold text-blue-600 mb-2">{dive.name}</div>
                  <div className="text-3xl font-bold text-gray-800 mb-4">{dive.price}</div>
                  <p className="text-gray-600">{dive.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dive Sites Section */}
      {diveSites && diveSites.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                {content.info_section_title || 'Popular Dive Sites'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.info_paragraph || 'Explore some of the most spectacular underwater locations in the Maldives with our expert guides.'}
              </p>
            </div>

          <div className="grid md:grid-cols-3 gap-8">
            {diveSites.map((site: any, index: number) => (
              <Card
                key={index}
                className="p-6 backdrop-blur-sm bg-white/60 border-white/20 hover:bg-white/80 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">{site.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{site.description}</p>
                <div className="flex justify-between items-center text-sm">
                  {site.depth && <span className="text-blue-600 font-semibold">{site.depth}</span>}
                  {site.level && (
                    <Badge variant="outline" className="border-green-200 text-green-700">
                      {site.level}
                    </Badge>
                  )}
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
