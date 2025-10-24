/**
 * gRPC server entry point
 * Initializes database connection, starts gRPC server, and handles graceful shutdown
 */

// Load environment variables from .env file (Node.js 21+)
if (process.loadEnvFile) {
	process.loadEnvFile('.env');
}

import * as grpc from '@grpc/grpc-js';
import { getConfig } from './config';
import {
	checkDatabaseHealth,
	closePool,
	initializePool,
} from './db/connection';
import { dbServiceImplementation } from './services/dbService';
import { getDBServiceDefinition } from './utils/grpc';
import { createLogger } from './utils/logger';

const logger = createLogger('Server');

/**
 * Graceful shutdown handler
 * Closes database connections and exits cleanly
 */
async function gracefulShutdown(signal: string): Promise<void> {
	logger.info(`Received ${signal}, starting graceful shutdown...`);

	try {
		await closePool();
		process.exit(0);
	} catch (error) {
		logger.error('Error during graceful shutdown', error);
		process.exit(1);
	}
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Main application entry point
 */
async function main(): Promise<void> {
	try {
		// Load and validate configuration
		const config = getConfig();
		logger.info('Configuration loaded successfully');

		// Initialize database connection pool
		initializePool(config.db);
		logger.info('Database pool initialized');

		// Test database connection
		const healthCheck = await checkDatabaseHealth();

		if (!healthCheck) {
			logger.error('Database health check failed on startup');
			process.exit(1);
		}

		logger.info('Database connection successful');

		// Create and configure gRPC server
		const server = new grpc.Server();

		// Add type-safe service implementation from generated protobuf
		server.addService(getDBServiceDefinition(), dbServiceImplementation);

		const bindAddress = `0.0.0.0:${config.port}`;

		server.bindAsync(
			bindAddress,
			grpc.ServerCredentials.createInsecure(),
			(err, port) => {
				if (err) {
					logger.error('Failed to bind server', err);
					process.exit(1);
				}
				logger.info(`gRPC server is running on port: ${port}`);
			}
		);
	} catch (error) {
		logger.error('Server startup error', error);
		process.exit(1);
	}
}

main();
