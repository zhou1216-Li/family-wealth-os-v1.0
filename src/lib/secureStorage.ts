import { generateAESKey, encryptData, decryptData, exportKey, importAESKey } from '@/services/encryptionService'

const ENCRYPTION_KEY_KEY = 'fwos_encryption_key'

let cachedKey: CryptoKey | null = null

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) {
    return cachedKey
  }

  const storedKey = localStorage.getItem(ENCRYPTION_KEY_KEY)
  
  if (storedKey) {
    try {
      cachedKey = await importAESKey(storedKey)
      return cachedKey
    } catch {
      localStorage.removeItem(ENCRYPTION_KEY_KEY)
    }
  }

  const newKey = await generateAESKey()
  const exportedKey = await exportKey(newKey)
  localStorage.setItem(ENCRYPTION_KEY_KEY, exportedKey)
  cachedKey = newKey
  
  return newKey
}

export async function secureSetItem(key: string, value: string): Promise<void> {
  const encryptionKey = await getEncryptionKey()
  const encryptedValue = await encryptData(encryptionKey, value)
  localStorage.setItem(key, encryptedValue)
}

export async function secureGetItem(key: string): Promise<string | null> {
  const encryptedValue = localStorage.getItem(key)
  
  if (!encryptedValue) {
    return null
  }

  try {
    const encryptionKey = await getEncryptionKey()
    return await decryptData(encryptionKey, encryptedValue)
  } catch {
    return null
  }
}

export async function secureRemoveItem(key: string): Promise<void> {
  localStorage.removeItem(key)
}

export async function secureSetObject<T>(key: string, value: T): Promise<void> {
  const jsonString = JSON.stringify(value)
  await secureSetItem(key, jsonString)
}

export async function secureGetObject<T>(key: string): Promise<T | null> {
  const jsonString = await secureGetItem(key)
  
  if (!jsonString) {
    return null
  }

  try {
    return JSON.parse(jsonString) as T
  } catch {
    return null
  }
}

export function clearSecureStorage(): void {
  localStorage.removeItem(ENCRYPTION_KEY_KEY)
}

export function isSecureStorageAvailable(): boolean {
  try {
    const testKey = '__fwos_storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}