"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function TestHeroPage() {
  const [videoUrl, setVideoUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:8000/api/v1/home-settings')
        const json = await response.json()
        console.log('Raw API response:', json)
        setData(json)
        
        const video = json.hero_video_url
        const image = json.hero_image_url
        
        const videoFullUrl = video.startsWith('http') ? video : `http://localhost:8000/storage/${video}`
        const imageFullUrl = image.startsWith('http') ? image : `http://localhost:8000/storage/${image}`
        
        console.log('Video URL:', videoFullUrl)
        console.log('Image URL:', imageFullUrl)
        
        setVideoUrl(videoFullUrl)
        setImageUrl(imageFullUrl)
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Hero Media Test Page</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Raw API Data</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Video Test</h2>
          <p className="mb-2 text-sm text-gray-600">URL: {videoUrl}</p>
          <div className="bg-black rounded overflow-hidden" style={{ height: '400px' }}>
            <video 
              src={videoUrl}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              onError={(e) => console.error('Video error:', e)}
              onLoadStart={() => console.log('Video loading started')}
              onLoadedData={() => console.log('Video data loaded')}
              onCanPlay={() => console.log('Video can play')}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Image Test (Fallback)</h2>
          <p className="mb-2 text-sm text-gray-600">URL: {imageUrl}</p>
          <div className="bg-black rounded overflow-hidden" style={{ height: '400px' }}>
            <img 
              src={imageUrl}
              alt="Hero"
              className="w-full h-full object-cover"
              onError={(e) => console.error('Image error:', e)}
              onLoad={() => console.log('Image loaded successfully')}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Direct URL Tests</h2>
          <div className="space-y-2">
            <div>
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open Video in New Tab
              </a>
            </div>
            <div>
              <a 
                href={imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open Image in New Tab
              </a>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button asChild>
            <a href="/">Back to Home Page</a>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Test Page
          </Button>
        </div>
      </div>
    </div>
  )
}
