export default {
  experimental: {
    ppr: true,
    useCache: true,
    inlineCss: true
  },
  images: {
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.sofascore.com',
        port: '',
        search: ''
      }
    ]
  }
};
