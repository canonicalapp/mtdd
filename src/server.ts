import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
//import { DatabaseFacade } from '@advcomm/dbfacade';
import { Pool } from 'pg';

//process.loadEnvFile('.env');

var config= JSON.parse(process.env.DB_CONFIG  as string);

var sql = new Pool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port || 5432
        });



export class DBService {
  

static async executeQuery(call: grpc.ServerUnaryCall<StoredProcRequest, StoredProcResponse>, callback: grpc.sendUnaryData<StoredProcResponse>) {

  try {
    const { query, params } = call.request;

    const result = await sql.query(query, params);
    // if(result.rowCount === 0) {
    //   return callback({
    //     code: grpc.status.NOT_FOUND,
    //     details: 'No data found for the given query.'
    //   });
    // }
    callback(null,  {result: result.rows} );
  } catch (error: any) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}
static async listenToChannel(call: grpc.ServerWritableStream<ChannelRequest, ChannelResponse>) {
    try {
      const { channelName } = call.request;
      
      // Create a channel listener that sends data to the gRPC client
      const channelListener = (data: any) => {
        // Send the notification to the gRPC client
        call.write({
          channelName: channelName,
          data: JSON.stringify(data),
          timestamp: new Date().toISOString()
        });
      };

      const client = await sql.connect();
        await client.query(`LISTEN ${channelName}`);
        client.on("notification", async (message: any) => {
            channelListener(message);
        });

      // Start listening to the database channel
      //DatabaseFacade.ListenToChannel(channelName, channelListener);

      // Handle client disconnect
      call.on('cancelled', () => {
        console.log('Client disconnected, stopping channel listener');
        // You might want to add a method to stop listening
        // DatabaseFacade.StopListening(channelName, channelListener);
      });

      call.on('error', (error) => {
        console.error('Stream error:', error);
      });

    } catch (error: any) {
      call.emit('error', {
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
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
  result: any[];  // array of JSON strings
}


//process.loadEnvFile('./.env');

// Load proto definition
const PROTO_PATH = __dirname + '/db.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const dbService = protoDescriptor.DB.DBService;

// Keep the original service definition for backward compatibility
const dbServiceDefinition = {
  executeQuery: {
    path: '/DB.DBService/executeQuery',
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
    responseSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
    requestType: Object, // For reflection compatibility
    responseType: Object, // For reflection compatibility
    options: {} // For reflection compatibility
  },
  listenToChannel: {
    path: '/DB.DBService/listenToChannel',
    requestStream: false,
    responseStream: true, // This enables streaming responses
    requestSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
    responseSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (buffer: Buffer) => JSON.parse(buffer.toString()),
    requestType: Object, // For reflection compatibility
    responseType: Object, // For reflection compatibility
    options: {} // For reflection compatibility
  }
};



function main() {


   sql.query(`select 1+1 As Result`).then((res: any) => {
    console.log('Database connection successful:', res.rows)    
  }).catch((err: any) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
 
  
  const server = new grpc.Server();

  // Enable reflection using the proto file
  try {
    const { ReflectionService } = require('@grpc/reflection');
    const reflection = new ReflectionService(packageDefinition);
    reflection.addToServer(server);
    console.log('gRPC reflection enabled');
  } catch (error) {
    console.log('Reflection service not available, grpcurl may not work without proto files');
  }

  // Add the service to the server - use proto-based service definition for reflection
  server.addService(dbService.service, {
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
}

main();