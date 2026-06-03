/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'd2gi9i8g5kw08c.cloudfront.net' },
    ],
  },
}

export default nextConfig
