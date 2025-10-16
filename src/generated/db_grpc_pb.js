// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var db_pb = require('./db_pb.js');

function serialize_DB_ChannelRequest(arg) {
  if (!(arg instanceof db_pb.ChannelRequest)) {
    throw new Error('Expected argument of type DB.ChannelRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_DB_ChannelRequest(buffer_arg) {
  return db_pb.ChannelRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_DB_ChannelResponse(arg) {
  if (!(arg instanceof db_pb.ChannelResponse)) {
    throw new Error('Expected argument of type DB.ChannelResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_DB_ChannelResponse(buffer_arg) {
  return db_pb.ChannelResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_DB_StoredProcRequest(arg) {
  if (!(arg instanceof db_pb.StoredProcRequest)) {
    throw new Error('Expected argument of type DB.StoredProcRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_DB_StoredProcRequest(buffer_arg) {
  return db_pb.StoredProcRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_DB_StoredProcResponse(arg) {
  if (!(arg instanceof db_pb.StoredProcResponse)) {
    throw new Error('Expected argument of type DB.StoredProcResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_DB_StoredProcResponse(buffer_arg) {
  return db_pb.StoredProcResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


// Database service definition
var DBServiceService = exports.DBServiceService = {
  // Execute a database query with parameters
executeQuery: {
    path: '/DB.DBService/executeQuery',
    requestStream: false,
    responseStream: false,
    requestType: db_pb.StoredProcRequest,
    responseType: db_pb.StoredProcResponse,
    requestSerialize: serialize_DB_StoredProcRequest,
    requestDeserialize: deserialize_DB_StoredProcRequest,
    responseSerialize: serialize_DB_StoredProcResponse,
    responseDeserialize: deserialize_DB_StoredProcResponse,
  },
  // Listen to a PostgreSQL NOTIFY channel (server-side streaming)
listenToChannel: {
    path: '/DB.DBService/listenToChannel',
    requestStream: false,
    responseStream: true,
    requestType: db_pb.ChannelRequest,
    responseType: db_pb.ChannelResponse,
    requestSerialize: serialize_DB_ChannelRequest,
    requestDeserialize: deserialize_DB_ChannelRequest,
    responseSerialize: serialize_DB_ChannelResponse,
    responseDeserialize: deserialize_DB_ChannelResponse,
  },
};

exports.DBServiceClient = grpc.makeGenericClientConstructor(DBServiceService, 'DBService');
