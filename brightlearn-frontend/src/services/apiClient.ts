import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

export default apiClient
