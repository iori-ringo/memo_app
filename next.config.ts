import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'export',
	assetPrefix: '.',
	images: {
		unoptimized: true,
	},
}

export default process.env.ANALYZE === 'true'
	? withBundleAnalyzer({ enabled: true })(nextConfig)
	: nextConfig
