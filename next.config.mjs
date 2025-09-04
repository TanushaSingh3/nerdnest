/** @type {import('next').NextConfig} */
// next.config.js
const nextConfig = {
    async headers() {
      return [
        {
          // ✅ Match all files served from /public (any extension)
          source: "/:path*",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "https://report.sand-box.info" // or "*" if you want fully public
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET, OPTIONS"
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "Content-Type"
            }
          ]
        }
      ];
    }
  };
  
 // module.exports = nextConfig;
  

export default nextConfig;


