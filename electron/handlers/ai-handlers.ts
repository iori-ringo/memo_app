/**
 * AI IPC Handlers
 * Handles Gemini API integration for abstraction, diversion, and summary generation
 */
import * as path from 'node:path'
import { IPC_CHANNELS } from '@electron/ipc/types'
import { log } from '@electron/utils/logger'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'
import { app, ipcMain } from 'electron'

/**
 * Load environment variables
 * Development: Load from .env.local / .env files in project root
 * Production: Expect environment variables to be set externally
 * (e.g., via system environment, or future server integration)
 */
if (!app.isPackaged) {
	dotenv.config({ path: path.join(app.getAppPath(), '.env.local') })
	dotenv.config({ path: path.join(app.getAppPath(), '.env') })
}

/** API key for Gemini (from environment variable) */
const API_KEY = process.env.GEMINI_API_KEY

/** Gemini AI client instance (null if API key not configured) */
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

/** Mock responses when API key is not configured */
const MOCK_RESPONSES = {
	abstraction:
		'これは抽象化のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
	diversion:
		'これは転用のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
	summary:
		'これは要約のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
} as const

/** Response type keys */
type MockResponseType = keyof typeof MOCK_RESPONSES

/**
 * Calls Gemini API with the given prompt
 * Falls back to mock response if API key is not configured
 * @param prompt - The prompt to send to Gemini
 * @param type - The type of response for mock fallback
 * @returns Generated text response
 */
async function callGemini(prompt: string, type: MockResponseType): Promise<string> {
	if (!genAI) {
		await new Promise((resolve) => setTimeout(resolve, 1000))
		return MOCK_RESPONSES[type]
	}
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
		const result = await model.generateContent(prompt)
		const response = await result.response
		return response.text()
	} catch (error) {
		log.error('Gemini API error:', error)
		throw new Error('AI生成に失敗しました。')
	}
}

/**
 * Registers all AI-related IPC handlers
 * Call this once during app initialization
 */
export function registerAiHandlers(): void {
	// Generate abstraction handler
	ipcMain.handle(
		IPC_CHANNELS.GENERATE_ABSTRACTION,
		async (_event, fact: unknown): Promise<string> => {
			if (typeof fact !== 'string') {
				log.warn('Invalid fact format for abstraction')
				throw new Error('Invalid input')
			}
			const prompt = `以下の「事実」から、本質的な気づきや法則を抽出してください。

事実:
${fact}

抽象化（気づき・法則・本質）:`
			return callGemini(prompt, 'abstraction')
		}
	)

	// Generate diversion handler
	ipcMain.handle(
		IPC_CHANNELS.GENERATE_DIVERSION,
		async (_event, fact: unknown, abstraction: unknown): Promise<string> => {
			if (typeof fact !== 'string' || typeof abstraction !== 'string') {
				log.warn('Invalid input format for diversion')
				throw new Error('Invalid input')
			}
			const prompt = `以下の「抽象化」から、具体的なアクションや他の分野への応用アイデアを提案してください。

事実:
${fact}

抽象化:
${abstraction}

転用（アクション・適用アイデア）:`
			return callGemini(prompt, 'diversion')
		}
	)

	// Generate summary handler
	ipcMain.handle(
		IPC_CHANNELS.GENERATE_SUMMARY,
		async (_event, content: unknown): Promise<string> => {
			if (typeof content !== 'string') {
				log.warn('Invalid content format for summary')
				throw new Error('Invalid input')
			}
			const prompt = `以下のテキストを簡潔に要約してください（1-2文で）:

${content}

要約:`
			return callGemini(prompt, 'summary')
		}
	)
}
