"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { getHomeSettings, getFeaturedAccommodations } from "@/lib/laravel-api"

export default function HomePage() {
  const { t } = useLanguage()
  const [homeSettings, setHomeSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true)
        const settings = await getHomeSettings()
        setHomeSettings(settings)
      } catch (err) {
        console.error('Failed to load:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center">Test Page</h1>
        {loading && <p>Loading...</p>}
        {homeSettings && (
          <div className="mt-8">
            <h2>{homeSettings.hero_title}</h2>
            <p>{homeSettings.hero_subtitle}</p>
          </div>
        )}
      </div>
    </div>
  )
}
