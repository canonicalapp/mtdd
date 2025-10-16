// package: DB
// file: db.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class StoredProcRequest extends jspb.Message { 
    getQuery(): string;
    setQuery(value: string): StoredProcRequest;
    clearParamsList(): void;
    getParamsList(): Array<string>;
    setParamsList(value: Array<string>): StoredProcRequest;
    addParams(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StoredProcRequest.AsObject;
    static toObject(includeInstance: boolean, msg: StoredProcRequest): StoredProcRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StoredProcRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StoredProcRequest;
    static deserializeBinaryFromReader(message: StoredProcRequest, reader: jspb.BinaryReader): StoredProcRequest;
}

export namespace StoredProcRequest {
    export type AsObject = {
        query: string,
        paramsList: Array<string>,
    }
}

export class StoredProcResponse extends jspb.Message { 
    getResult(): string;
    setResult(value: string): StoredProcResponse;
    getRowcount(): number;
    setRowcount(value: number): StoredProcResponse;
    getCommand(): string;
    setCommand(value: string): StoredProcResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StoredProcResponse.AsObject;
    static toObject(includeInstance: boolean, msg: StoredProcResponse): StoredProcResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StoredProcResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StoredProcResponse;
    static deserializeBinaryFromReader(message: StoredProcResponse, reader: jspb.BinaryReader): StoredProcResponse;
}

export namespace StoredProcResponse {
    export type AsObject = {
        result: string,
        rowcount: number,
        command: string,
    }
}

export class ChannelRequest extends jspb.Message { 
    getChannelname(): string;
    setChannelname(value: string): ChannelRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ChannelRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ChannelRequest): ChannelRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ChannelRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ChannelRequest;
    static deserializeBinaryFromReader(message: ChannelRequest, reader: jspb.BinaryReader): ChannelRequest;
}

export namespace ChannelRequest {
    export type AsObject = {
        channelname: string,
    }
}

export class ChannelResponse extends jspb.Message { 
    getChannelname(): string;
    setChannelname(value: string): ChannelResponse;
    getData(): string;
    setData(value: string): ChannelResponse;
    getTimestamp(): string;
    setTimestamp(value: string): ChannelResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ChannelResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ChannelResponse): ChannelResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ChannelResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ChannelResponse;
    static deserializeBinaryFromReader(message: ChannelResponse, reader: jspb.BinaryReader): ChannelResponse;
}

export namespace ChannelResponse {
    export type AsObject = {
        channelname: string,
        data: string,
        timestamp: string,
    }
}
