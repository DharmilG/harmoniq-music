export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

<<<<<<< HEAD
export async function api(path, { method = 'GET', body, headers } = {}) {
  const url = `${API_BASE}${path}`
  console.log('[api] Request ->', method, url, body) // debug
  const res = await fetch(url, {
=======
export async function api(path, { method = 'GET', body, headers } = {}){
  const res = await fetch(`${API_BASE}${path}`, {
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
<<<<<<< HEAD
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    console.error('[api] Response error', res.status, data)
    const msg = data?.error || data?.message || `${res.status} ${res.statusText}`
=======
    credentials: 'include', // include cookies
    body: body ? JSON.stringify(body) : undefined,
  })
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : null
  if(!res.ok){
    const msg = data?.error || `${res.status} ${res.statusText}`
>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
    const error = new Error(msg)
    error.status = res.status
    error.data = data
    throw error
  }
<<<<<<< HEAD

  console.log('[api] Response OK', data)
  return data
}
=======
  return data
}

>>>>>>> 290fa6ca4b404c4517359c72053dc28160a053b4
