const REFRESH_TOKEN_KEY = 'brightlearn_refresh_token'
let accessToken: string | null = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

export function getRefreshToken() {
  return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

export function clearRefreshToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}
