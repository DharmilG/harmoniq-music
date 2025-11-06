export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export async function api(path, { method = 'GET', body, headers } = {}){
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // include cookies
    body: body ? JSON.stringify(body) : undefined,
  })
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : null
  if(!res.ok){
    const msg = data?.error || `${res.status} ${res.statusText}`
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}