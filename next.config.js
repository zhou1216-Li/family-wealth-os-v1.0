/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supabase代理配置（解决海外服务访问问题）
  async rewrites() {
    return [
      {
        source: '/api/supabase/:path*',
        destination: 'https://xazcpfumfuzeccexovsh.supabase.co/:path*',
      },
    ]
  },
  // 环境变量配置
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig
