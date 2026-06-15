export interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  )

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  }
}

export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(key: CryptoKey, data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  )
  
  const encryptedArray = new Uint8Array(encryptedBuffer)
  const combined = new Uint8Array(iv.length + encryptedArray.length)
  combined.set(iv, 0)
  combined.set(encryptedArray, iv.length)
  
  return btoa(String.fromCharCode(...combined))
}

export async function decryptData(key: CryptoKey, encryptedData: string): Promise<string> {
  const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)))
  
  const iv = combined.slice(0, 12)
  const encryptedBuffer = combined.slice(12)
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedBuffer
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

export async function encryptWithRSA(publicKey: CryptoKey, data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    dataBuffer
  )
  
  return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
}

export async function decryptWithRSA(privateKey: CryptoKey, encryptedData: string): Promise<string> {
  const encryptedBuffer = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)))
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encryptedBuffer
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('jwk', key)
  return JSON.stringify(exported)
}

export async function importAESKey(jwkKey: string): Promise<CryptoKey> {
  const keyData = JSON.parse(jwkKey)
  return crypto.subtle.importKey(
    'jwk',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function importRSAKey(jwkKey: string, isPublic: boolean): Promise<CryptoKey> {
  const keyData = JSON.parse(jwkKey)
  const usages = isPublic ? ['encrypt'] : ['decrypt']
  
  return crypto.subtle.importKey(
    'jwk',
    keyData as JsonWebKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    usages as KeyUsage[]
  )
}