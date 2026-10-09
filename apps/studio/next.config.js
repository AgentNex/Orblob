const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: [
    '@orblob/core',
    '@orblob/config',
    '@orblob/react',
    '@orblob/codegen',
  ],
  webpack: (config) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
};

module.exports = nextConfig;
