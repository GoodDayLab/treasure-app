/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開發模式預設用 eval 產生 source map,若瀏覽器環境的 CSP 擋掉 eval
  // 會導致整包 client JS 執行失敗、所有互動元件失效,改用不需要 eval 的 source map。
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "cheap-module-source-map";
    }
    return config;
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
