/**
 * Electron Logger Configuration
 * Configures electron-log for file and console logging
 */
import log from 'electron-log'

/** Log level for file output */
const FILE_LOG_LEVEL = 'info'

/** Log level for console output */
const CONSOLE_LOG_LEVEL = 'debug'

/**
 * Initialize the logger with default settings
 */
export function initLogger(): void {
	log.transports.file.level = FILE_LOG_LEVEL
	log.transports.console.level = CONSOLE_LOG_LEVEL
}

export { log }
