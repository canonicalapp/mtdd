/**
 * gRPC service definitions using generated Protocol Buffers
 * Provides type-safe access to service definitions
 */

import { DBServiceService } from '../generated/db_grpc_pb';

/**
 * Get the type-safe DBService definition from generated protobuf
 * @returns Service definition with full type safety
 */
export function getDBServiceDefinition() {
  return DBServiceService;
}
