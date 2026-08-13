export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json() as { error?: string | { message?: string }; message?: string }
      message = typeof body.error === "string" ? body.error : body.error?.message ?? body.message ?? message
    } catch {
      // The backend may return an HTML error page.
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export function jsonRequest<T>(path: string, method: "POST" | "PUT" | "DELETE", payload: unknown) {
  return request<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}
