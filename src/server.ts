import * as grpc from '@grpc/grpc-js';
//import { DatabaseFacade } from '@advcomm/dbfacade';
import { Pool, PoolClient, Query, QueryResult } from 'pg';


var config= JSON.parse(process.env.DB_CONFIG  as string);

var sql = new Pool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port || 5432,
            max: config.max || 100,
            idleTimeoutMillis: config.idleTimeoutMillis || 1000,
            min: config.min || 0
        });

// Connection pool event handlers
sql.on('connect', (client: PoolClient) => {
    console.log('New client connected to database');
});

sql.on('error', (err: Error) => {
    console.error('Database pool error:', err);
    // Don't exit process, just log the error
});

sql.on('remove', () => {
    console.log('Client removed from pool');
});

const activeListeners = new Map<string, PoolClient>();

export class DBService {
    static async executeQuery(call: grpc.ServerUnaryCall<StoredProcRequest, QueryResult<any>>, callback: grpc.sendUnaryData<QueryResult<any>>) {
        let client: PoolClient | null = null;
        
        try {
            const { query, params } = call.request;
            
            // Get client from pool
            client = await sql.connect();
            const result : QueryResult<any>= await client.query(query, params);
            
            callback(null, result );
        } catch (error: any) {
            console.error('Query execution error:', error);
            callback({
                code: grpc.status.INTERNAL,
                details: error.message,
            });
        } finally {
            // Always release the client back to pool
            if (client) {
                client.release();
            }
        }
    }

    static async listenToChannel(call: grpc.ServerWritableStream<ChannelRequest, ChannelResponse>) {
        let client: PoolClient | null = null;
        const { channelName } = call.request;
        
        try {
            // Get dedicated client for listening
            client = await sql.connect();
            
            // Store for cleanup
            const listenerId = `${channelName}_${Date.now()}`;
            activeListeners.set(listenerId, client);
            
            const channelListener = (notification: any) => {
                try {
                    call.write({
                        channelName: channelName,
                        data: JSON.stringify(notification.payload || notification),
                        timestamp: new Date().toISOString()
                    });
                } catch (writeError) {
                    console.error('Error writing to stream:', writeError);
                }
            };

            await client.query(`LISTEN ${channelName}`);
            client.on("notification", channelListener);

            // Handle client disconnect
            call.on('cancelled', async () => {
                console.log(`Client disconnected from channel: ${channelName}`);
                await cleanup();
            });

            call.on('error', async (error) => {
                console.error('Stream error:', error);
                await cleanup();
            });

            const cleanup = async () => {
                try {
                    if (client) {
                        await client.query(`UNLISTEN ${channelName}`);
                        client.removeAllListeners('notification');
                        client.release();
                        activeListeners.delete(listenerId);
                    }
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
            };

        } catch (error: any) {
            console.error('Channel listen error:', error);
            if (client) {
                client.release();
            }
            call.emit('error', {
                code: grpc.status.INTERNAL,
                details: error.message,
            });
        }
    }
}


export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        const result = await sql.query('SELECT 1');
        return result.rows.length > 0;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
    console.log(`Received ${signal}, starting graceful shutdown...`);
    
    try {
        // Close all active listeners
        for (const [listenerId, client] of activeListeners.entries()) {
            try {
                await client.query('UNLISTEN *');
                client.release();
                activeListeners.delete(listenerId);
            } catch (error) {
                console.error(`Error cleaning up listener ${listenerId}:`, error);
            }
        }
        
        // Close the pool
        await sql.end();
        console.log('Database pool closed successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
}

export interface ChannelRequest {
  channelName: string;
}

export interface ChannelResponse {
  channelName: string;
  data: string;
  timestamp: string;
}
export interface StoredProcRequest {
  query: string;
  params: any[];  // array of parameters as strings
  // isFunction: boolean;
}

export interface StoredProcResponse {
  result: QueryResult<any>;  // array of JSON strings
}


//process.loadEnvFile('./.env');

const dbServiceDefinition = {
  executeQuery: {
    path: '/DB.DBService/executeQuery',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
    responseSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
  },
  listenToChannel: {
    path: '/DB.DBService/listenToChannel',
    requestStream: false,
    responseStream: true, // This enables streaming responses
    requestSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
    responseSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
  }
};



process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


async function main() {
try{
    // Test database connection
    const healthCheck = await checkDatabaseHealth();
    if (!healthCheck) {
        console.error('Database health check failed on startup');
        process.exit(1);
    }
    console.log('Database connection successful');

  const server = new grpc.Server();


  // Add the service to the server
  server.addService(dbServiceDefinition, {
    // getCountryIP: CountryService.getCountryIP.bind(countryService),
    // getProductTenant: CountryService.getProductTenant.bind(countryService),
    executeQuery: DBService.executeQuery,
     listenToChannel: DBService.listenToChannel,
  });

  const port = '0.0.0.0:' + (process.env.PORT ? process.env.PORT : '50051');
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Server is running on port: ${port}`);
    //server.start();
  });
  } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
}

main();