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

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, headers = {} } = options
  const requestHeaders: Record<string, string> = {
    ...headers,
    'Content-Type': 'application/json',
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
    let errorMessage = 'Yêu cầu thất bại'
    let errorCode = 'UNKNOWN_ERROR'

    if (hasJson) {
      try {
        const errorBody = await response.json()
        errorMessage = errorBody?.message || errorBody?.title || errorMessage
        errorCode = errorBody?.code || errorCode
      } catch {
        // Ignore JSON parsing errors
      }
    }

    throw new ApiError(response.status, errorCode, errorMessage)
  }

  if (response.status === 204) {
    return {} as T
  }

  if (hasJson) {
    return (await response.json()) as T
  }

  return (await response.text()) as unknown as T
}
