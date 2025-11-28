/**
 * gRPC service definitions using ts-proto generated types
 * Provides type-safe service definitions from generated protobuf code
 */

import type * as grpc from '@grpc/grpc-js';
import { type DBServiceServer, DBServiceService } from '../generated/db';
import { dbServiceImplementation } from '../services/dbService';

/**
 * Get the DBService definition from generated protobuf code
 * @returns Service definition for DBService with full type safety
 */
export function getDBServiceDefinition(): grpc.ServiceDefinition<DBServiceServer> {
	return DBServiceService as grpc.ServiceDefinition<DBServiceServer>;
}

export type { DBServiceServer };
