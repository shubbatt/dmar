"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Waves,
  Fish,
  Camera,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Activity {
  id: number
  title: string
  category: string
  description: string
  location: string
  groupSize: string
  image: string
  featured: boolean
  photos: string[]
}

export default function ActivitiesGalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: "all", label: "All Adventures", icon: Sparkles },
    { id: "diving", label: "Diving & Snorkeling", icon: Waves },
    { id: "fishing", label: "Fishing Trips", icon: Fish },
    { id: "cultural", label: "Cultural Tours", icon: Users },
    { id: "wildlife", label: "Wildlife Encounters", icon: Camera },
  ]

  useEffect(() => {
    async function fetchActivities() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${apiUrl}/api/v1/gallery-activities`)
        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error("Failed to load gallery activities:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  const fallbackActivities: Activity[] = [
    {
      id: 1,
      title: "Whale Shark Encounter",
      category: "wildlife",
      description: "Swimming alongside the gentle giants of the ocean in crystal clear waters",
      location: "South Ari Atoll",
      groupSize: "8-12 people",
      image: "/dhigurah-whale-shark-diving-crystal-clear-water.jpg",
      featured: true,
      photos: [
        "/dhigurah-whale-shark-diving-crystal-clear-water.jpg",
        "/underwater-scuba-diving-colorful-coral-reef-tropic.jpg",
        "/tropical-island-paradise-palm-trees-crystal-clear.jpg",
      ],
    },
    {
      id: 2,
      title: "Traditional Night Fishing",
      category: "fishing",
      description: "Experience authentic Maldivian fishing techniques at sunset",
      location: "Local Islands",
      groupSize: "6-10 people",
      image: "/maafushi-adventure-hub-water-sports-activities.jpg",
      featured: true,
      photos: [
        "/maafushi-adventure-hub-water-sports-activities.jpg",
        "/tropical-island-paradise-palm-trees-crystal-clear.jpg",
        "/maldives-pristine-white-sand-beach-turquoise-water.jpg",
      ],
    },
    {
      id: 3,
      title: "Coral Garden Exploration",
      category: "diving",
      description: "Discover vibrant underwater ecosystems and colorful marine life",
      location: "Multiple Atolls",
      groupSize: "4-8 people",
      image: "/ukulhas-eco-friendly-island-pristine-beach-coral.jpg",
      featured: false,
      photos: [
        "/ukulhas-eco-friendly-island-pristine-beach-coral.jpg",
        "/underwater-scuba-diving-colorful-coral-reef-tropic.jpg",
        "/dhigurah-whale-shark-diving-crystal-clear-water.jpg",
      ],
    },
    {
      id: 4,
      title: "Manta Ray Snorkeling",
      category: "wildlife",
      description: "Unforgettable encounters with graceful manta rays",
      location: "Hanifaru Bay",
      groupSize: "10-15 people",
      image: "/dhigurah-whale-shark-diving-crystal-clear-water.jpg",
      featured: true,
      photos: [
        "/dhigurah-whale-shark-diving-crystal-clear-water.jpg",
        "/maldives-pristine-white-sand-beach-turquoise-water.jpg",
        "/underwater-scuba-diving-colorful-coral-reef-tropic.jpg",
      ],
    },
    {
      id: 5,
      title: "Island Hopping Adventure",
      category: "cultural",
      description: "Explore multiple local islands and experience authentic island life",
      location: "Ari Atoll",
      groupSize: "12-20 people",
      image: "/luxury-maldives-resort-overwater-bungalows-crystal.jpg",
      featured: false,
      photos: [
        "/luxury-maldives-resort-overwater-bungalows-crystal.jpg",
        "/tropical-island-paradise-palm-trees-crystal-clear.jpg",
        "/ellaidhoo-cultural-island-traditional-maldivian.jpg",
      ],
    },
    {
      id: 6,
      title: "Dolphin Sunset Cruise",
      category: "wildlife",
      description: "Watch playful dolphins as the sun sets over the Indian Ocean",
      location: "Male Atoll",
      groupSize: "15-25 people",
      image: "/maafushi-adventure-hub-water-sports-activities.jpg",
      featured: false,
      photos: [
        "/maafushi-adventure-hub-water-sports-activities.jpg",
        "/maldives-pristine-white-sand-beach-turquoise-water.jpg",
        "/tropical-island-paradise-palm-trees-crystal-clear.jpg",
      ],
    },
    {
      id: 7,
      title: "Local Village Experience",
      category: "cultural",
      description: "Immerse yourself in authentic Maldivian culture and traditions",
      location: "Ellaidhoo Island",
      groupSize: "8-12 people",
      image: "/ellaidhoo-cultural-island-traditional-maldivian.jpg",
      featured: false,
      photos: [
        "/ellaidhoo-cultural-island-traditional-maldivian.jpg",
        "/ukulhas-eco-friendly-island-pristine-beach-coral.jpg",
        "/luxury-maldives-resort-overwater-bungalows-crystal.jpg",
      ],
    },
    {
      id: 8,
      title: "Shipwreck Exploration",
      category: "diving",
      description: "Dive into history with fascinating underwater shipwrecks",
      location: "Baa Atoll",
      groupSize: "4-6 people",
      image: "/ukulhas-eco-friendly-island-pristine-beach-coral.jpg",
      featured: false,
      photos: [
        "/ukulhas-eco-friendly-island-pristine-beach-coral.jpg",
        "/underwater-scuba-diving-colorful-coral-reef-tropic.jpg",
        "/dhigurah-whale-shark-diving-crystal-clear-water.jpg",
      ],
    },
  ]

  const displayActivities = activities.length > 0 ? activities : fallbackActivities
  const filteredActivities =
    selectedCategory === "all" ? displayActivities : displayActivities.filter((a) => a.category === selectedCategory)

  const openPhotoViewer = (activityId: number) => {
    setSelectedActivity(activityId)
    setCurrentPhotoIndex(0)
  }

  const closePhotoViewer = () => {
    setSelectedActivity(null)
    setCurrentPhotoIndex(0)
  }

  const nextPhoto = () => {
    const activity = displayActivities.find((a) => a.id === selectedActivity)
    if (activity && currentPhotoIndex < activity.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const selectedActivityData = displayActivities.find((a) => a.id === selectedActivity)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Back to Home</span>
            </Link>
            <Link href="/booking">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Calendar className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-cyan-50 via-blue-50 to-white">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-cyan-100 text-cyan-700 border-cyan-200">
            <Camera className="mr-1 h-3 w-3" />
            Group Adventures Gallery
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Experience Unforgettable
            <span className="block text-cyan-600 mt-2">Maldivian Adventures</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            Explore our collection of exciting activities from past group trips. From diving with whale sharks to
            cultural island tours, discover what awaits you on your next adventure.
          </p>
        </div>
      </section>

      <section className="px-4 pb-12 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`
                  ${
                    selectedCategory === category.id
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  }
                  transition-all duration-200
                `}
              >
                <category.icon className="mr-2 h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="group relative overflow-hidden bg-white border-gray-200 hover:border-cyan-400 hover:shadow-lg transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={activity.image || "/placeholder.svg"}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Featured Badge */}
                  {activity.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-cyan-600 text-white">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {activity.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                      {activity.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{activity.description}</p>
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cyan-600" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-600" />
                      <span>{activity.groupSize}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => openPhotoViewer(activity.id)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    size="sm"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    View Photos ({activity.photos.length})
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-white border-gray-200 p-8 md:p-12 text-center">
            <Compass className="h-12 w-12 text-cyan-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready for Your Adventure?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our next group trip and create your own unforgettable memories. Limited spots available for upcoming
              expeditions!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Trip
                </Button>
              </Link>
              <Link href="/#contact">
                <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                  Contact Us
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Dialog open={!!selectedActivity} onOpenChange={closePhotoViewer}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-black/95">
          <DialogTitle className="sr-only">{selectedActivityData?.title} Photo Gallery</DialogTitle>

          <div className="relative">
            {/* Close Button */}
            <button
              onClick={closePhotoViewer}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
              aria-label="Close photo viewer"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Activity Title */}
            <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <h3 className="text-white font-semibold">{selectedActivityData?.title}</h3>
              <p className="text-white/70 text-sm">
                {currentPhotoIndex + 1} / {selectedActivityData?.photos.length}
              </p>
            </div>

            {/* Main Image */}
            <div className="relative aspect-video w-full bg-black">
              <img
                src={selectedActivityData?.photos[currentPhotoIndex] || "/placeholder.svg"}
                alt={`${selectedActivityData?.title} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {selectedActivityData && selectedActivityData.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  disabled={currentPhotoIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-8 w-8 text-white" />
                </button>

                <button
                  onClick={nextPhoto}
                  disabled={currentPhotoIndex === selectedActivityData.photos.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            <div className="bg-black/80 backdrop-blur-sm p-4">
              <div className="flex gap-2 overflow-x-auto justify-center">
                {selectedActivityData?.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentPhotoIndex === index
                        ? "border-cyan-500 scale-110"
                        : "border-white/20 hover:border-white/40 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
