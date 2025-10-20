/**
 * Database connection pool management
 * Handles PostgreSQL connection pooling and lifecycle
 */

import type { PoolClient } from 'pg';
import { Pool } from 'pg';
import type { DatabaseConfig } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('DatabaseConnection');

let pool: Pool | null = null;
const activeListeners = new Map<string, PoolClient>();

/**
 * Initializes the database connection pool
 * @param config Database configuration
 * @returns Initialized pool instance
 */
export function initializePool(config: DatabaseConfig): Pool {
	if (pool) {
		logger.warn('Database pool already initialized');
		return pool;
	}

	pool = new Pool({
		host: config.host,
		user: config.user,
		password: config.password,
		database: config.database,
		port: config.port,
		max: config.max,
		idleTimeoutMillis: config.idleTimeoutMillis,
		min: config.min,
	});

	// Connection pool event handlers
	pool.on('connect', (_client: PoolClient) => {
		logger.info('New client connected to database');
	});

	pool.on('error', (err: Error) => {
		logger.error('Database pool error', err);
	});

	pool.on('remove', () => {
		logger.info('Client removed from pool');
	});

	return pool;
}

/**
 * Gets the database connection pool
 * @throws Error if pool is not initialized
 * @returns Database pool instance
 */
export function getPool(): Pool {
	if (!pool) {
		throw new Error(
			'Database pool not initialized. Call initializePool first.'
		);
	}
	return pool;
}

/**
 * Performs a database health check
 * @returns Promise resolving to true if database is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
	try {
		const result = await getPool().query('SELECT 1');
		return result.rows.length > 0;
	} catch (error) {
		logger.error('Database health check failed', error);
		return false;
	}
}

/**
 * Registers an active listener client for tracking
 * @param channelName Channel name
 * @param client Pool client
 * @returns Listener ID for cleanup
 */
export function registerListener(
	channelName: string,
	client: PoolClient
): string {
	const listenerId = `${channelName}_${Date.now()}`;
	activeListeners.set(listenerId, client);
	return listenerId;
}

/**
 * Unregisters an active listener
 * @param listenerId Listener ID to remove
 */
export function unregisterListener(listenerId: string): void {
	activeListeners.delete(listenerId);
}

/**
 * Closes all active listener connections and the pool
 * Called during graceful shutdown
 */
export async function closePool(): Promise<void> {
	if (!pool) {
		return;
	}

	try {
		// Close all active listeners
		for (const [listenerId, client] of activeListeners.entries()) {
			try {
				await client.query('UNLISTEN *');
				client.release();
				activeListeners.delete(listenerId);
			} catch (error) {
				logger.error(`Error cleaning up listener ${listenerId}`, error);
			}
		}

		// Close the pool
		await pool.end();
		pool = null;
		logger.info('Database pool closed successfully');
	} catch (error) {
		logger.error('Error closing database pool', error);
		throw error;
	}
}
