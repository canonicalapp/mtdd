/**
 * gRPC service definitions using @grpc/proto-loader
 * Provides runtime loading of Protocol Buffer definitions
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

const PROTO_PATH = path.join(__dirname, '../../proto/db.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

/**
 * Get the DBService definition from proto file
 * @returns Service definition for DBService
 */
export function getDBServiceDefinition() {
	return protoDescriptor.DB.DBService.service;
}

export { protoDescriptor };
