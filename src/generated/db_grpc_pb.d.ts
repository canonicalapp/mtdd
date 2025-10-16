// package: DB
// file: db.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as db_pb from "./db_pb";

interface IDBServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    executeQuery: IDBServiceService_IexecuteQuery;
    listenToChannel: IDBServiceService_IlistenToChannel;
}

interface IDBServiceService_IexecuteQuery extends grpc.MethodDefinition<db_pb.StoredProcRequest, db_pb.StoredProcResponse> {
    path: "/DB.DBService/executeQuery";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<db_pb.StoredProcRequest>;
    requestDeserialize: grpc.deserialize<db_pb.StoredProcRequest>;
    responseSerialize: grpc.serialize<db_pb.StoredProcResponse>;
    responseDeserialize: grpc.deserialize<db_pb.StoredProcResponse>;
}
interface IDBServiceService_IlistenToChannel extends grpc.MethodDefinition<db_pb.ChannelRequest, db_pb.ChannelResponse> {
    path: "/DB.DBService/listenToChannel";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<db_pb.ChannelRequest>;
    requestDeserialize: grpc.deserialize<db_pb.ChannelRequest>;
    responseSerialize: grpc.serialize<db_pb.ChannelResponse>;
    responseDeserialize: grpc.deserialize<db_pb.ChannelResponse>;
}

export const DBServiceService: IDBServiceService;

export interface IDBServiceServer extends grpc.UntypedServiceImplementation {
    executeQuery: grpc.handleUnaryCall<db_pb.StoredProcRequest, db_pb.StoredProcResponse>;
    listenToChannel: grpc.handleServerStreamingCall<db_pb.ChannelRequest, db_pb.ChannelResponse>;
}

export interface IDBServiceClient {
    executeQuery(request: db_pb.StoredProcRequest, callback: (error: grpc.ServiceError | null, response: db_pb.StoredProcResponse) => void): grpc.ClientUnaryCall;
    executeQuery(request: db_pb.StoredProcRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: db_pb.StoredProcResponse) => void): grpc.ClientUnaryCall;
    executeQuery(request: db_pb.StoredProcRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: db_pb.StoredProcResponse) => void): grpc.ClientUnaryCall;
    listenToChannel(request: db_pb.ChannelRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<db_pb.ChannelResponse>;
    listenToChannel(request: db_pb.ChannelRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<db_pb.ChannelResponse>;
}

export class DBServiceClient extends grpc.Client implements IDBServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public executeQuery(request: db_pb.StoredProcRequest, callback: (error: grpc.ServiceError | null, response: db_pb.StoredProcResponse) => void): grpc.ClientUnaryCall;
    public executeQuery(request: db_pb.StoredProcRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: db_pb.StoredProcResponse) => void): grpc.ClientUnaryCall;
    public executeQuery(request: db_pb.StoredProcRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: db_pb.StoredProcResponse) => void): grpc.ClientUnaryCall;
    public listenToChannel(request: db_pb.ChannelRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<db_pb.ChannelResponse>;
    public listenToChannel(request: db_pb.ChannelRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<db_pb.ChannelResponse>;
}
