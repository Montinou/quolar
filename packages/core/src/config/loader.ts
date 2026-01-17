import { quolarConfigSchema, type QuolarConfig } from './schema.js'
import type { ZodError } from 'zod'

/**
 * Configuration loading utilities for Quolar
 */

export interface LoadConfigOptions {
  /** Path to the config file (optional, auto-detected if not provided) */
  configPath?: string
  /** Working directory to search for config (defaults to cwd) */
  cwd?: string
}

export interface LoadConfigResult {
  config: QuolarConfig
  configPath: string
}

export interface ConfigError {
  type: 'not_found' | 'parse_error' | 'validation_error'
  message: string
  details?: ZodError
}

/**
 * Default configuration values
 */
export const defaultConfig: Partial<QuolarConfig> = {
  vcs: {
    provider: 'github',
  },
  workflow: {
    maxRetries: 3,
    autoHealingThreshold: 70,
    parallelAgents: 3,
  },
}

/**
 * Validate configuration against schema
 * @param config - Raw configuration object
 * @returns Validated configuration or error
 */
export function validateConfig(
  config: unknown
): { success: true; data: QuolarConfig } | { success: false; error: ConfigError } {
  const result = quolarConfigSchema.safeParse(config)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    error: {
      type: 'validation_error',
      message: 'Configuration validation failed',
      details: result.error,
    },
  }
}

/**
 * Merge user config with defaults
 * @param userConfig - User-provided configuration
 * @returns Merged configuration
 */
export function mergeWithDefaults(userConfig: Partial<QuolarConfig>): QuolarConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    vcs: {
      ...defaultConfig.vcs,
      ...userConfig.vcs,
    },
    workflow: {
      ...defaultConfig.workflow,
      ...userConfig.workflow,
    },
  } as QuolarConfig
}

/**
 * Config file names to search for (in order of priority)
 */
export const CONFIG_FILE_NAMES = [
  'quolar.config.ts',
  'quolar.config.js',
  'quolar.config.mjs',
  'quolar.config.json',
]
