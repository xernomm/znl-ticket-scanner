import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios"

// in-memory token
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (token) {
    localStorage.setItem("scanner_token", token)
  } else {
    localStorage.removeItem("scanner_token")
  }
}

// Initial token from localStorage
accessToken = localStorage.getItem("scanner_token")

// Base URL - menggunakan URL produksi sesuai permintaan user
const BASE_URL = import.meta.env.DEV ? "" : "https://znlapi.com"

// axios JSON instance
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ----------------- Helper API object (apiService) -----------------
export const apiService = {
  // Scanner specific endpoints
  scanner: {
    getVehicles: () => api.get("/api/scanner/vehicles"),
    login: (vehicleId: string, vehicleType: string) => api.post("/api/scanner/login", {
      vehicle_id: vehicleId,
      vehicle_type: vehicleType,
      device_info: navigator.userAgent
    }),
    logout: () => api.post("/api/scanner/logout"),
    forceLogout: (vehicleId: string, vehicleType: string) => api.post("/api/scanner/force-logout", {
      vehicle_id: vehicleId,
      vehicle_type: vehicleType
    }),
    getSession: () => api.get("/api/scanner/session"),
    verifyTicket: (ticketId: string, lat: number | null, lng: number | null) => api.post("/api/scanner/verify-ticket", {
      ticket_id: ticketId,
      latitude: lat,
      longitude: lng
    }),
  },

  // Common helpers
  tickets: {
    getDetail: (id: string) => api.get(`/api/bookings/public-transport/ticket/${id}`),
  }
}

// ----------------- apiHelpers -----------------
export const apiHelpers = {
  handleError: (error: any) => {
    const message = error?.response?.data?.message || error?.response?.data?.msg || error?.message || "An error occurred"
    const status = error?.response?.status || 0

    console.warn(`[Scanner API Warning] ${message} (${status})`)

    return {
      success: false,
      message,
      status,
      data: error?.response?.data,
    }
  },

  handleSuccess: (response: any) => {
    return {
      success: true,
      message: response.data?.message || "Success",
      data: response.data,
      status: response.status,
    }
  },
}

export default api
