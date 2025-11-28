/**
 * gRPC service implementation for database operations
 * Uses ts-proto generated types for full type safety
 */

import * as grpc from '@grpc/grpc-js';
import type { PoolClient, QueryResult } from 'pg';
import {
	getPool,
	registerListener,
	unregisterListener,
} from '../db/connection';
import type {
	ChannelRequest,
	ChannelResponse,
	DBServiceServer,
	StoredProcRequest,
	StoredProcResponse,
} from '../generated/db';
import { createLogger } from '../utils/logger';

const logger = createLogger('DBService');

/**
 * Database service implementation with full type safety
 */
export const dbServiceImplementation: DBServiceServer = {
	/**
	 * Executes a database query with parameters
	 */
	executeQuery: async (
		call: grpc.ServerUnaryCall<StoredProcRequest, StoredProcResponse>,
		callback: grpc.sendUnaryData<StoredProcResponse>
	): Promise<void> => {
		let client: PoolClient | null = null;

		try {
			const request = call.request;
			const query = request.query;
			const params = request.params || [];

			// Validate input
			if (!query || typeof query !== 'string') {
				callback({
					code: grpc.status.INVALID_ARGUMENT,
					details: 'Query must be a non-empty string',
				});
				return;
			}

			if (!Array.isArray(params)) {
				callback({
					code: grpc.status.INVALID_ARGUMENT,
					details: 'Params must be an array',
				});
				return;
			}

			// Parse params - each param is a JSON-encoded string
			// Special handling for base64-encoded buffers (bytea)
			const parsedParams = params.map((param: string) => {
				try {
					const parsed = JSON.parse(param);
					return parsed;
				} catch {
					// If not JSON, check if it's a base64-encoded buffer
					// Base64 strings are used for bytea parameters
					if (
						typeof param === 'string' &&
						/^[A-Za-z0-9+/]+=*$/.test(param) &&
						param.length > 20
					) {
						// Likely base64, decode to Buffer for PostgreSQL bytea
						return Buffer.from(param, 'base64');
					}
					return param; // Use as-is
				}
			});

			// Debug logging
			logger.info(`Executing query: ${query}`);
			logger.info(
				`Parsed params (${parsedParams.length}): ${JSON.stringify(parsedParams.map((p) => (Buffer.isBuffer(p) ? `<Buffer ${p.length} bytes>` : p)))}`
			);

			// Get client from pool and execute query
			client = await getPool().connect();
			const result: QueryResult = await client.query(query, parsedParams);

			// Create response with type safety
			const response: StoredProcResponse = {
				result: JSON.stringify(result.rows),
				rowCount: result.rowCount || 0,
				command: result.command || '',
			};

			callback(null, response);
		} catch (error: unknown) {
			logger.error('Query execution error', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Internal server error';
			callback({
				code: grpc.status.INTERNAL,
				details: errorMessage,
			});
		} finally {
			// Always release the client back to pool
			if (client) {
				client.release();
			}
		}
	},

	/**
	 * Listens to a PostgreSQL NOTIFY channel and streams notifications
	 */
	listenToChannel: async (
		call: grpc.ServerWritableStream<ChannelRequest, ChannelResponse>
	): Promise<void> => {
		let client: PoolClient | null = null;
		const request = call.request;
		const channelName = request.channelName;
		let listenerId: string | null = null;

		try {
			// Validate input
			if (!channelName || typeof channelName !== 'string') {
				call.emit('error', {
					code: grpc.status.INVALID_ARGUMENT,
					details: 'Channel name must be a non-empty string',
				});
				return;
			}

			// Validate channel name to prevent SQL injection
			if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(channelName)) {
				call.emit('error', {
					code: grpc.status.INVALID_ARGUMENT,
					details: 'Invalid channel name format',
				});
				return;
			}

			// Get dedicated client for listening
			client = await getPool().connect();

			// Register for tracking
			listenerId = registerListener(channelName, client);

			const channelListener = (notification: {
				payload?: string;
				channel?: string;
			}) => {
				try {
					// Create response with type safety
					const response: ChannelResponse = {
						channelName: channelName,
						data: JSON.stringify(notification.payload || notification),
						timestamp: new Date().toISOString(),
					};

					call.write(response);
				} catch (writeError) {
					logger.error('Error writing to stream', writeError);
				}
			};

			await client.query(`LISTEN ${channelName}`);
			client.on('notification', channelListener);

			// Handle client disconnect
			call.on('cancelled', async () => {
				logger.info(`Client disconnected from channel: ${channelName}`);
				await cleanup();
			});

			call.on('error', async (error) => {
				logger.error('Stream error', error);
				await cleanup();
			});

			const cleanup = async () => {
				try {
					if (client) {
						await client.query(`UNLISTEN ${channelName}`);
						client.removeAllListeners('notification');
						client.release();
						if (listenerId) {
							unregisterListener(listenerId);
						}
					}
				} catch (cleanupError) {
					logger.error('Cleanup error', cleanupError);
				}
			};
		} catch (error: unknown) {
			logger.error('Channel listen error', error);
			if (client) {
				client.release();
				if (listenerId) {
					unregisterListener(listenerId);
				}
			}
			const errorMessage =
				error instanceof Error ? error.message : 'Internal server error';
			call.emit('error', {
				code: grpc.status.INTERNAL,
				details: errorMessage,
			});
		}
	},
};
