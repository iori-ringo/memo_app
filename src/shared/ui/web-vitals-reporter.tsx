'use client'

import { useEffect } from 'react'

/**
 * Core Web Vitals（LCP / CLS / INP）をコンソールに出力する計測コンポーネント。
 * Attribution Build を使用し、ボトルネックの内訳を可視化する。
 * 開発環境でのみ有効。
 */
export const WebVitalsReporter = () => {
	useEffect(() => {
		import('web-vitals/attribution').then(({ onLCP, onCLS, onINP }) => {
			onLCP((metric) => {
				const { attribution } = metric
				console.group(`⚡ [LCP] ${metric.value.toFixed(0)}ms (${metric.rating})`)
				console.log(`Target: ${attribution.target}`)
				console.log(`TTFB: ${attribution.timeToFirstByte.toFixed(0)}ms`)
				console.log(`Resource Load Delay: ${attribution.resourceLoadDelay.toFixed(0)}ms`)
				console.log(`Resource Load Duration: ${attribution.resourceLoadDuration.toFixed(0)}ms`)
				console.log(`Element Render Delay: ${attribution.elementRenderDelay.toFixed(0)}ms`)
				console.groupEnd()
			})

			onCLS((metric) => {
				const { attribution } = metric
				console.group(`📐 [CLS] ${metric.value.toFixed(3)} (${metric.rating})`)
				console.log(`Target: ${attribution.largestShiftTarget}`)
				console.log(`Shift Time: ${attribution.largestShiftTime?.toFixed(0) ?? 'N/A'}ms`)
				console.log(`Shift Value: ${attribution.largestShiftValue?.toFixed(4) ?? 'N/A'}`)
				console.log(`Load State: ${attribution.loadState}`)
				console.groupEnd()
			})

			onINP((metric) => {
				const { attribution } = metric
				console.group(`👆 [INP] ${metric.value.toFixed(0)}ms (${metric.rating})`)
				console.log(`Target: ${attribution.interactionTarget}`)
				console.log(`Type: ${attribution.interactionType}`)
				console.log(`Input Delay: ${attribution.inputDelay.toFixed(0)}ms`)
				console.log(`Processing: ${attribution.processingDuration.toFixed(0)}ms`)
				console.log(`Presentation Delay: ${attribution.presentationDelay.toFixed(0)}ms`)
				console.groupEnd()
			})
		})
	}, [])

	return null
}
