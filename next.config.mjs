/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/joky-deck-h5',
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        })
    
        return config
    },
};

export default nextConfig;
