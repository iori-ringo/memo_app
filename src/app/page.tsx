import type { Metadata } from 'next'

import { HomeContent } from '@/features/notes/components/home-content'

export const metadata: Metadata = {
	title: 'Magic Memo - ノート',
	description: '事実・抽象化・転用の構造化メモで思考を整理するキャンバスノート',
}

const Home = () => {
	return <HomeContent />
}

export default Home
