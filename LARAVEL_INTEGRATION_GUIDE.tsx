// Example: How to integrate Laravel API into booking page
// This file shows the key changes needed for app/booking/page.tsx

/*
STEP 1: Add API imports at the top
*/
import { useState, useEffect } from "react"
import { getPackages, getHotels, getResorts, getActivities, getServices, type Package, type Hotel, type Resort, type Activity, type Service } from "@/lib/laravel-api"

/*
STEP 2: Replace hardcoded data with state variables and useEffect
*/

export default function BookingPage() {
  // Replace hardcoded arrays with state
  const [groupTravelPackages, setGroupTravelPackages] = useState<Package[]>([])
  const [accommodations, setAccommodations] = useState<(Hotel | Resort)[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from Laravel API on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [packagesData, hotelsData, resortsData, activitiesData, servicesData] = await Promise.all([
          getPackages(),
          getHotels(),
          getResorts(),
          getActivities(),
          getServices(),
        ])
        
        setGroupTravelPackages(packagesData)
        setAccommodations([...hotelsData, ...resortsData])
        setActivities(activitiesData)
        setServices(servicesData)
        setError(null)
      } catch (err) {
        console.error('Error fetching booking data:', err)
        setError('Failed to load booking data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Rest of the booking page component remains the same
  // The groupTravelPackages, accommodations, activities, services now come from API
  
  return (
    // ... existing JSX code
  )
}

/*
STEP 3: Update data transformations for API response format

The API returns:
- activities as JSON string array in packages → parse with JSON.parse(package.activities)
- features as JSON string array in hotels/resorts → parse with JSON.parse(hotel.features)
- price as string ("1299.00") → parse with Number(package.price) or parseFloat()
- dates need conversion → new Date(package.start_date)

Example transformation:
*/

function transformPackageForDisplay(apiPackage: Package) {
  return {
    id: apiPackage.id,
    name: apiPackage.name,
    dates: apiPackage.dates,
    startDate: new Date(apiPackage.start_date),
    endDate: new Date(apiPackage.end_date),
    duration: apiPackage.duration,
    available: apiPackage.spots_available > 0,
    spotsLeft: apiPackage.spots_available,
    accommodation: {
      name: apiPackage.accommodation?.name || '',
      type: apiPackage.accommodation?.type || '',
      features: JSON.parse(apiPackage.accommodation?.features as any || '[]'),
    },
    activities: JSON.parse(apiPackage.activities as any),
    price: Number(apiPackage.price),
    image: apiPackage.image_url,
    isWomenOnly: apiPackage.is_women_only,
  }
}

/*
STEP 4: Alternative - Keep hardcoded data as fallback

For a safer migration, you can keep the hardcoded arrays and only use API when available:
*/

const FALLBACK_PACKAGES = [
  // ... original hardcoded data
]

useEffect(() => {
  async function fetchData() {
    try {
      const packagesData = await getPackages()
      if (packagesData.length > 0) {
        setGroupTravelPackages(packagesData)
      } else {
        setGroupTravelPackages(FALLBACK_PACKAGES)
      }
    } catch (err) {
      console.error('API failed, using fallback data:', err)
      setGroupTravelPackages(FALLBACK_PACKAGES)
    }
  }
  
  fetchData()
}, [])
