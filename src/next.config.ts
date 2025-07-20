const isProd = process.env.NODE_ENV === 'production';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Plaza';

const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  trailingSlash: true,
  images: {
      unoptimized: true,
  },
};

export default nextConfig;