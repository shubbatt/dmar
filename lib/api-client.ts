// Client-side API helper functions
export class ApiClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "API request failed")
    }

    return response.json()
  }

  // Booking methods
  static async createBooking(bookingData: any) {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    })
  }

  static async getBookings() {
    return this.request("/bookings")
  }

  static async updateBooking(id: string, bookingData: any) {
    return this.request(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    })
  }

  // Content methods
  static async getContent() {
    return this.request("/content")
  }

  static async createContent(contentData: any) {
    return this.request("/content", {
      method: "POST",
      body: JSON.stringify(contentData),
    })
  }

  static async updateContent(id: string, contentData: any) {
    return this.request(`/content/${id}`, {
      method: "PUT",
      body: JSON.stringify(contentData),
    })
  }

  static async deleteContent(id: string) {
    return this.request(`/content/${id}`, {
      method: "DELETE",
    })
  }

  // Schedule methods
  static async getSchedules() {
    return this.request("/schedules")
  }

  static async createSchedule(scheduleData: any) {
    return this.request("/schedules", {
      method: "POST",
      body: JSON.stringify(scheduleData),
    })
  }
}
