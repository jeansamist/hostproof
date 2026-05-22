/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@packages/ui",
    "@packages/hooks",
    "@packages/functions",
    "api",
  ],
}

export default nextConfig
