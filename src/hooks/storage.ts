export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : (JSON.parse(value) as T)
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export async function withStorageLock<T>(key: string, operation: () => T | Promise<T>): Promise<T> {
  return navigator.locks ? navigator.locks.request(key, operation) : operation()
}
