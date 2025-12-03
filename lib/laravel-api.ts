const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}/api/v1${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response.json()
}

// Packages
export async function getPackages() {
  return apiFetch('/packages')
}

// Translations
export async function getTranslations(locale: string) {
  return apiFetch(`/translations/${locale}`)
}

// Home
export async function getHomeSettings() {
  return apiFetch('/home-settings')
}

// Accommodations
export async function getFeaturedAccommodations(locale: string) {
  return apiFetch(`/featured-accommodations?locale=${locale}`)
}

export async function getHotels() {
  return apiFetch('/hotels')
}

export async function getResorts() {
  return apiFetch('/resorts')
}

// Content
export async function getGroupTripsContent() {
  return apiFetch('/group-trips-content')
}

export async function getAboutContent() {
  return apiFetch('/about-content')
}

export async function getOceanExcursionsSection() {
  return apiFetch('/ocean-excursions-section')
}

// Services
export async function getServiceContent(serviceSlug: string) {
  return apiFetch(`/services/${serviceSlug}`)
}

export async function getDivingContent() {
  return apiFetch('/diving-content')
}

export async function getSnorkelingContent() {
  return apiFetch('/snorkeling-content')
}

// Gallery
export async function getGalleryActivities() {
  return apiFetch('/gallery-activities')
}

// Generic API object
export const laravelApi = {
  fetch: apiFetch,
}
