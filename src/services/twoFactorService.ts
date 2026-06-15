/**
 * Two-Factor Authentication (TOTP) Service
 * 使用 otplib 实现 TOTP 两步验证
 */

import { TOTP, generateSecret, generateURI, verify } from 'otplib'
import { supabase } from '@/lib/supabase'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  manualEntryKey: string
}

export interface TwoFactorStatus {
  enabled: boolean
  createdAt?: string
}

export function generateTOTPSecret(): string {
  return generateSecret()
}

export function generateTOTPQRCode(secret: string, email: string): string {
  const issuer = 'Family Wealth OS'
  return generateURI({ secret, label: email, issuer })
}

export async function verifyTOTPToken(secret: string, token: string): Promise<boolean> {
  try {
    const result = await verify({ token, secret })
    return result?.valid === true
  } catch {
    return false
  }
}

export async function getTwoFactorStatus(userId: string): Promise<TwoFactorStatus> {
  const { data, error } = await supabase
    .from('family_members')
    .select('two_factor_enabled, two_factor_secret, created_at')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error getting two-factor status:', error)
    return { enabled: false }
  }

  return {
    enabled: data.two_factor_enabled || false,
    createdAt: data.created_at,
  }
}

export async function setupTwoFactor(userId: string, email?: string): Promise<TwoFactorSetup> {
  const secret = generateTOTPSecret()
  
  const { error } = await supabase
    .from('family_members')
    .update({ two_factor_secret: secret, two_factor_enabled: false })
    .eq('id', userId)

  if (error) {
    console.error('Error setting up two-factor:', error)
    throw new Error('Failed to set up two-factor authentication')
  }

  return {
    secret,
    qrCodeUrl: generateTOTPQRCode(secret, email || userId),
    manualEntryKey: secret,
  }
}

export async function enableTwoFactor(userId: string, token: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('family_members')
    .select('two_factor_secret')
    .eq('id', userId)
    .single()

  if (error || !data.two_factor_secret) {
    throw new Error('Two-factor setup not found')
  }

  if (!(await verifyTOTPToken(data.two_factor_secret, token))) {
    return false
  }

  const { error: updateError } = await supabase
    .from('family_members')
    .update({ two_factor_enabled: true })
    .eq('id', userId)

  if (updateError) {
    console.error('Error enabling two-factor:', updateError)
    throw new Error('Failed to enable two-factor authentication')
  }

  return true
}

export async function disableTwoFactor(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('family_members')
    .update({ two_factor_enabled: false, two_factor_secret: null })
    .eq('id', userId)

  if (error) {
    console.error('Error disabling two-factor:', error)
    throw new Error('Failed to disable two-factor authentication')
  }

  return true
}

export async function verifyTwoFactor(userId: string, token: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('family_members')
    .select('two_factor_secret, two_factor_enabled')
    .eq('id', userId)
    .single()

  if (error || !data.two_factor_enabled || !data.two_factor_secret) {
    return false
  }

  return verifyTOTPToken(data.two_factor_secret, token)
}