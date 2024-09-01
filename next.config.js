/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'utfs.io',
          port: '',
          pathname: '/**',
        },
      ],
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
  
  export default config;
  