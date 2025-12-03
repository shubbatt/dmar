// Laravel API Client for D'Mar Travels Next.js Frontend

// For now, hardcode the API URL. In production, set NEXT_PUBLIC_LARAVEL_API_URL in .env
const API_BASE_URL = 'http://localhost:8000/api/v1'

// Session management for cart
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('dmar-session-id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('dmar-session-id', sessionId)
  }
  return sessionId
}

// Generic fetch wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const sessionId = getSessionId()
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId,
    ...options.headers,
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// Package API
export interface Package {
  id: number
  name: string
  description: string
  dates: string
  start_date: string
  end_date: string
  duration: string
  accommodation_id: number
  accommodation_type: 'hotel' | 'resort'
  activities: string[] // JSON string
  price: string
  spots_total: number
  spots_available: number
  is_women_only: boolean
  image_url: string
  is_active: boolean
  accommodation?: Hotel | Resort
}

export interface Hotel {
  id: number
  name: string
  type: string
  category: 'hotel'
  description: string
  features: string[] // JSON string
  price_per_night: string
  location: string
  image_url: string
  is_active: boolean
}

export interface Resort {
  id: number
  name: string
  type: string
  category: 'resort'
  description: string
  features: string[] // JSON string
  price_per_night: string
  location: string
  image_url: string
  is_active: boolean
}

export interface Activity {
  id: number
  name: string
  description: string
  duration: string
  price: string
  icon: string
  is_active: boolean
}

export interface Service {
  id: number
  name: string
  description: string
  price?: string
  price_per_day?: string
  icon: string
  is_active: boolean
}

export interface HomeSettings {
  id: number
  hero_video_url: string | null
  hero_image_url: string | null
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  hero_secondary_cta_text: string
  show_services_section: boolean
  show_accommodations_section: boolean
  show_group_trips_section: boolean
}

export interface FeaturedAccommodations {
  hotels: Hotel[]
  resorts: Resort[]
}

export interface Cart {
  cart: {
    id: number
    items: CartItem[]
  }
  total: number
  session_id: string
}

export interface CartItem {
  id: number
  cart_id: number
  item_type: 'package' | 'custom_package'
  item_id: number
  quantity: number
  guest_count: number
  price_snapshot: string
  item?: Package
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_whatsapp?: string
  special_requests?: string
  total_amount: string
  payment_status: string
  payment_method?: string
  status: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  item_type: 'package' | 'custom_package'
  item_id: number
  item_name: string
  item_details: any
  quantity: number
  guest_count: number
  unit_price: string
  subtotal: string
}

// API Functions

// Packages
export async function getPackages(filters?: {
  available?: boolean
  is_women_only?: boolean
  start_date?: string
}): Promise<Package[]> {
  const params = new URLSearchParams()
  if (filters?.available !== undefined) params.append('available', String(filters.available))
  if (filters?.is_women_only !== undefined) params.append('is_women_only', String(filters.is_women_only))
  if (filters?.start_date) params.append('start_date', filters.start_date)
  
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<Package[]>(`/packages${query}`)
}

export async function getPackage(id: number): Promise<Package> {
  return apiFetch<Package>(`/packages/${id}`)
}

// Hotels & Resorts
export async function getHotels(filters?: { category?: string; max_price?: number; locale?: string }): Promise<Hotel[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.max_price) params.append('max_price', String(filters.max_price))
  if (filters?.locale) params.append('locale', filters.locale)
  
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<Hotel[]>(`/hotels${query}`)
}

export async function getResorts(filters?: { category?: string; max_price?: number; locale?: string }): Promise<Resort[]> {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.max_price) params.append('max_price', String(filters.max_price))
  if (filters?.locale) params.append('locale', filters.locale)
  
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<Resort[]>(`/resorts${query}`)
}

// Activities & Services
export async function getActivities(): Promise<Activity[]> {
  return apiFetch<Activity[]>('/activities')
}

export async function getServices(): Promise<Service[]> {
  return apiFetch<Service[]>('/services')
}

// Custom Packages
export async function createCustomPackage(data: {
  accommodation_type: 'hotel' | 'resort'
  accommodation_id: number
  check_in: string
  check_out: string
  guests: number
  activities?: Array<{ id: number; quantity: number }>
  services?: Array<{ id: number; quantity: number }>
}): Promise<{ message: string; package: any }> {
  return apiFetch('/custom-packages', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Cart
export async function getCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart')
}

export async function addToCart(data: {
  item_type: 'package' | 'custom_package'
  item_id: number
  guest_count?: number
  quantity?: number
}): Promise<{ message: string; cart: any; total: number }> {
  return apiFetch('/cart', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCartItem(
  itemId: number,
  data: { guest_count: number; quantity: number }
): Promise<{ message: string; cart: any; total: number }> {
  return apiFetch(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function removeFromCart(itemId: number): Promise<{ message: string; cart: any; total: number }> {
  return apiFetch(`/cart/${itemId}`, {
    method: 'DELETE',
  })
}

export async function clearCart(): Promise<{ message: string; cart: any; total: number }> {
  return apiFetch('/cart/clear', {
    method: 'POST',
  })
}

// Orders
export async function createOrder(data: {
  session_id: string
  name: string
  email: string
  phone?: string
  whatsapp?: string
  special_requests?: string
  payment_method?: string
}): Promise<{ message: string; order: Order }> {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getOrder(orderNumber: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderNumber}`)
}

// Content (CMS)
export async function getPageContent(page: string, language: string = 'en'): Promise<any[]> {
  return apiFetch(`/content/${page}?language=${language}`)
}

export async function getSectionContent(page: string, section: string, language: string = 'en'): Promise<any> {
  return apiFetch(`/content/${page}/${section}?language=${language}`)
}

// Home Page
export async function getHomeSettings(): Promise<HomeSettings> {
  return apiFetch<HomeSettings>('/home-settings')
}

export async function getFeaturedAccommodations(locale?: string): Promise<FeaturedAccommodations> {
  const query = locale ? `?locale=${locale}` : ''
  return apiFetch<FeaturedAccommodations>(`/featured-accommodations${query}`)
}

export async function getGroupTripsContent(): Promise<any> {
  return apiFetch('/group-trips-content')
}

export async function getAboutContent(): Promise<any> {
  return apiFetch('/about-content')
}

export interface ServicePackage {
  name: string
  description: string
  price: string
  duration?: string
  capacity?: string
  schedule?: string
  includes?: string[]
  image?: string
  icon?: string
  location?: string
  departure?: string
  return?: string
  popular?: boolean
  badge?: string
  maxDepth?: string
}

export interface ServiceFeature {
  title: string
  description: string
  icon?: string
  image?: string
  price?: string
  duration?: string
  maxDepth?: string
  includes?: string[]
  location?: string
  departure?: string
  return?: string
}

export interface ServiceInfoItem {
  name: string
  description: string
  depth?: string
  level?: string
}

export interface ServiceContentData {
  id: number
  service_type: 'diving' | 'fishing' | 'excursions'
  hero_image_url: string | null
  hero_badge: string | null
  hero_title: string
  hero_subtitle: string | null
  hero_cta_text: string
  intro_paragraph: string | null
  description_paragraph: string | null
  features_section_title: string | null
  features: ServiceFeature[] | null
  packages_section_title: string | null
  packages: ServicePackage[] | null
  info_section_title: string | null
  info_paragraph: string | null
  info_bullets: ServiceInfoItem[] | null
  meta_title: string | null
  meta_description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getServiceContent(serviceType: 'diving' | 'fishing' | 'excursions'): Promise<ServiceContentData> {
  return apiFetch(`/services/${serviceType}`)
}

export async function getAllServiceContent(): Promise<ServiceContentData[]> {
  return apiFetch('/services')
}

// Ocean Excursions Section
export interface OceanExcursionCard {
  title: string
  description: string
  image?: string
  icon: string
  color: string
  link: string
}

export interface OceanExcursionsSection {
  id: number
  badge_text: string
  title: string
  subtitle: string | null
  cards: OceanExcursionCard[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getOceanExcursionsSection(): Promise<OceanExcursionsSection> {
  return apiFetch('/ocean-excursions-section')
}
