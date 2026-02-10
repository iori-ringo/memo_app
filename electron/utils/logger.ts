/**
 * Electronロガー設定
 * electron-logを使用したファイル出力・コンソール出力のログ設定
 */
import log from 'electron-log'

/** ファイル出力のログレベル */
const FILE_LOG_LEVEL = 'info'

/** コンソール出力のログレベル */
const CONSOLE_LOG_LEVEL = 'debug'

/**
 * ロガーを既定の設定で初期化する
 */
export function initLogger(): void {
	log.transports.file.level = FILE_LOG_LEVEL
	log.transports.console.level = CONSOLE_LOG_LEVEL
}

export { log }
