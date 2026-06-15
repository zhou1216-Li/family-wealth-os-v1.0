import { supabase } from '@/lib/supabase'

const AVATARS_BUCKET = 'avatars'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * 上传头像到 Supabase Storage
 * @param userId 用户ID
 * @param file 文件对象
 * @param onProgress 进度回调
 * @returns 上传结果
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: '仅支持 JPG、PNG、WebP 格式的图片',
      }
    }

    // 验证文件大小 (最大 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: '图片大小不能超过 2MB',
      }
    }

    // 生成文件名: userId_timestamp.extension
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId}_${timestamp}.${extension}`
    const filePath = `${userId}/${fileName}`

    // 上传文件
    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return {
        success: false,
        error: uploadError.message,
      }
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(AVATARS_BUCKET)
      .getPublicUrl(filePath)

    // 模拟进度回调（Supabase JS SDK 不支持原生进度回调）
    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 })
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error('Upload avatar error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    }
  }
}

/**
 * 获取头像公开URL
 * @param userId 用户ID
 * @param fileName 文件名（可选，如果不提供则返回用户头像目录的URL）
 * @returns 公开URL
 */
export function getAvatarUrl(userId: string, fileName?: string): string {
  const filePath = fileName ? `${userId}/${fileName}` : `${userId}/`
  
  const { data } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * 删除旧头像
 * @param userId 用户ID
 * @param fileName 要删除的文件名
 * @returns 删除结果
 */
export async function deleteAvatar(
  userId: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const filePath = `${userId}/${fileName}`

    const { error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete avatar error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    }
  }
}

/**
 * 列出用户的所有头像文件
 * @param userId 用户ID
 * @returns 文件列表
 */
export async function listUserAvatars(
  userId: string
): Promise<{ success: boolean; files?: string[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(AVATARS_BUCKET)
      .list(userId)

    if (error) {
      console.error('List error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    const files = data?.map((item) => item.name) || []
    return { success: true, files }
  } catch (error) {
    console.error('List avatars error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取文件列表失败',
    }
  }
}

/**
 * 清理用户的旧头像（保留最新的）
 * @param userId 用户ID
 * @param currentFileName 当前使用的文件名
 */
export async function cleanupOldAvatars(
  userId: string,
  currentFileName: string
): Promise<void> {
  try {
    const result = await listUserAvatars(userId)
    
    if (!result.success || !result.files) {
      return
    }

    // 删除除当前文件外的所有旧文件
    const filesToDelete = result.files.filter((name) => name !== currentFileName)
    
    if (filesToDelete.length > 0) {
      const filePaths = filesToDelete.map((name) => `${userId}/${name}`)
      await supabase.storage.from(AVATARS_BUCKET).remove(filePaths)
    }
  } catch (error) {
    console.error('Cleanup old avatars error:', error)
  }
}
