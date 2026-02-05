export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5068'

type ApiRequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

const getToken = (): string | null => {
  return localStorage.getItem('authToken')
}

export const setToken = (token: string | null): void => {
  if (!token) {
    localStorage.removeItem('authToken')
    return
  }
  localStorage.setItem('authToken', token)
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, headers = {} } = options
  const requestHeaders: Record<string, string> = { ...headers }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const hasJson = contentType.includes('application/json')

  if (!response.ok) {
    if (hasJson) {
      const errorBody = await response.json()
      const message = errorBody?.message || errorBody?.title || 'Yêu cầu thất bại'
      throw new Error(message)
    }
    const text = await response.text()
    throw new Error(text || 'Yêu cầu thất bại')
  }

  if (response.status === 204) {
    return {} as T
  }

  if (hasJson) {
    return (await response.json()) as T
  }

  return (await response.text()) as unknown as T
}
