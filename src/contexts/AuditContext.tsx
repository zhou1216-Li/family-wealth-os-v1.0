'use client'

import { createContext, useContext, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { logAction, type ActionType, type LogActionInput } from '@/services/auditService'

interface AuditContextType {
  log: (actionType: ActionType, description: string, targetType?: string, targetId?: string) => void
  trackLogin: () => void
  trackLogout: () => void
}

const AuditContext = createContext<AuditContextType | undefined>(undefined)

export function AuditProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const isMounted = useRef(true)
  
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const getIpAddress = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || ''
    } catch {
      return ''
    }
  }, [])

  const getDefaultInput = useCallback(async (): Promise<{ ipAddress: string; userAgent: string }> => {
    return {
      ipAddress: await getIpAddress(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    }
  }, [getIpAddress])

  const log = useCallback(async (
    actionType: ActionType,
    description: string,
    targetType?: string,
    targetId?: string
  ) => {
    if (!userId || !isMounted.current) return
    
    try {
      const { ipAddress, userAgent } = await getDefaultInput()
      const input: LogActionInput = {
        userId,
        actionType,
        actionDescription: description,
        targetType,
        targetId,
        ipAddress,
        userAgent,
      }
      await logAction(input)
    } catch (error) {
      console.error('Failed to log action:', error)
    }
  }, [userId, getDefaultInput])

  const trackLogin = useCallback(async () => {
    if (!userId) return
    
    try {
      const { ipAddress, userAgent } = await getDefaultInput()
      await logAction({
        userId,
        actionType: 'LOGIN',
        actionDescription: '用户登录系统',
        ipAddress,
        userAgent,
      })
    } catch (error) {
      console.error('Failed to track login:', error)
    }
  }, [userId, getDefaultInput])

  const trackLogout = useCallback(async () => {
    if (!userId) return
    
    try {
      const { ipAddress, userAgent } = await getDefaultInput()
      await logAction({
        userId,
        actionType: 'LOGOUT',
        actionDescription: '用户退出登录',
        ipAddress,
        userAgent,
      })
    } catch (error) {
      console.error('Failed to track logout:', error)
    }
  }, [userId, getDefaultInput])

  return (
    <AuditContext.Provider value={{ log, trackLogin, trackLogout }}>
      {children}
    </AuditContext.Provider>
  )
}

export function useAudit() {
  const context = useContext(AuditContext)
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider')
  }
  return context
}