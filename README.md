# gRPC PostgreSQL Database Facade

A lightweight, high-performance gRPC microservice that provides a database facade for PostgreSQL. This service exposes database operations over gRPC, including query execution and real-time PostgreSQL NOTIFY/LISTEN channel streaming.

## Features

- **Query Execution**: Execute arbitrary SQL queries with parameterized inputs
- **Real-time Notifications**: Subscribe to PostgreSQL NOTIFY channels and stream notifications to clients
- **Connection Pooling**: Efficient PostgreSQL connection management with configurable pool settings
- **Graceful Shutdown**: Proper cleanup of connections and listeners on shutdown signals
- **Type Safety**: Full TypeScript implementation with auto-generated protobuf types
- **Code Generation**: Automatic TypeScript type generation from `.proto` files
- **Structured Logging**: Contextual logging with timestamps and log levels
- **Input Validation**: SQL injection protection for channel names and query parameters
- **Docker Support**: Containerized deployment with multi-stage builds

## Project Structure

```
grpc-postgres-app
├── proto/                         # Protocol Buffer definitions (source of truth)
│   └── db.proto                  # Database service API contract
├── src/
│   ├── server.ts                 # Application entry point and gRPC server setup
│   ├── config
│   │   └── index.ts              # Configuration management and validation
│   ├── db
│   │   └── connection.ts         # Database connection pool and lifecycle management
│   ├── services
│   │   └── dbService.ts          # gRPC service implementation (type-safe)
│   ├── utils
│   │   ├── grpc.ts               # gRPC service definition exports
│   │   └── logger.ts             # Logging utility
│   └── generated/                 # Auto-generated protobuf code (committed)
│       ├── db_pb.d.ts            # Generated message types
│       ├── db_pb.js              # Generated message implementation
│       ├── db_grpc_pb.d.ts       # Generated service types
│       └── db_grpc_pb.js         # Generated service implementation
├── .env.example                   # Environment variables template
├── Dockerfile                     # Multi-stage Docker build configuration
├── docker-compose.yml             # Docker Compose setup
├── entrypoint.sh                  # Container entrypoint script
├── biome.json                     # Biome linter and formatter configuration
├── package.json                   # npm dependencies and scripts
├── tsconfig.json                  # TypeScript compiler configuration
└── README.md                      # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js 22+ (or use Docker)
- PostgreSQL database
- npm or Docker

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd grpc-postgres-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
   
   Or set environment variables directly:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USER=postgres
   export DB_PASSWORD=your_password
   export DB_NAME=mydb
   export PORT=50051
   ```

4. **Build the application:**
   ```bash
   npm run build
   ```

5. **Run the application:**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Using Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Using Docker directly:**
   ```bash
   docker build -t grpc-postgres-app .
   docker run -p 50051:50051 \
     -e DB_HOST=db.example.com \
     -e DB_USER=postgres \
     -e DB_PASSWORD=password \
     -e DB_NAME=mydb \
     grpc-postgres-app
   ```

## Configuration

### Environment Variables

The application is configured via environment variables. A template file `.env.example` is provided with all available options.

#### Quick Start

```bash
cp .env.example .env
# Edit .env with your configuration
```

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| **`DB_HOST`** | Database hostname or IP address | `localhost` |
| **`DB_USER`** | Database username | `postgres` |
| **`DB_NAME`** | Database name | `mydb` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| **`PORT`** | gRPC server listening port | `50051` |
| **`DB_PASSWORD`** | Database password | _(empty)_ |
| **`DB_PORT`** | Database port | `5432` |
| **`DB_POOL_MAX`** | Maximum connections in pool | `100` |
| **`DB_POOL_MIN`** | Minimum connections in pool | `2` |
| **`DB_POOL_IDLE_TIMEOUT`** | Idle timeout in milliseconds | `30000` |

#### Configuration Examples

See `.env.example` for detailed configuration examples for:
- Local development
- Production deployments
- Docker Compose
- Cloud/RDS environments
- Different load scenarios

## API Reference

### gRPC Service: DBService

#### 1. executeQuery (Unary RPC)

Executes a SQL query with parameters.

**Request:**
```protobuf
message StoredProcRequest {
  string query = 1;        // SQL query or stored procedure call
  repeated string params = 2; // Query parameters (JSON-encoded strings)
}
```

**Response:**
```protobuf
message StoredProcResponse {
  string result = 1;  // JSON-encoded query result (array of rows)
  int32 rowCount = 2; // Number of rows affected
  string command = 3; // SQL command that was executed
}
```

**Example Usage:**
```javascript
const request = {
  query: 'SELECT * FROM users WHERE id = $1 AND status = $2',
  params: [
    JSON.stringify(123),      // Integer parameter
    JSON.stringify('active')  // String parameter
  ]
};

// The response will contain:
// {
//   result: '[{"id":123,"name":"John","status":"active"}]',
//   rowCount: 1,
//   command: 'SELECT'
// }
```

#### 2. listenToChannel (Server Streaming RPC)

Subscribes to a PostgreSQL NOTIFY channel and streams notifications.

**Request:**
```protobuf
message ChannelRequest {
  string channelName = 1; // Name of the channel to listen to
}
```

**Response Stream:**
```protobuf
message ChannelResponse {
  string channelName = 1; // Name of the channel
  string data = 2;        // Notification payload (JSON string)
  string timestamp = 3;   // ISO 8601 timestamp
}
```

**Example Usage:**
```javascript
const call = client.listenToChannel({ channelName: 'user_updates' });
call.on('data', (response) => {
  console.log('Received notification:', response);
});
```

## Development

### Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Generate protobuf types and build TypeScript to JavaScript
- `npm run proto:generate` - Generate TypeScript types from `.proto` files
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Biome

### Protocol Buffer Code Generation

This project follows **gRPC best practices** for type-safe API contracts:

#### Directory Structure
- **`proto/`**: Source of truth - all `.proto` files live here (standard practice)
- **`src/generated/`**: Auto-generated TypeScript and JavaScript code

#### Why Generated Files Are Committed
Following industry standards, generated files **are committed** to version control because:
- ✅ **No build step required** - Contributors can start immediately
- ✅ **Code review** - Changes to generated code are visible in PRs
- ✅ **API contract visibility** - Easy to see how proto changes affect the implementation
- ✅ **Build reproducibility** - Ensures everyone uses the same generated code
- ✅ **CI/CD simplicity** - No generation step needed in deployment pipeline

#### Code Generation Process
1. **Define API**: Edit `proto/db.proto` with your service contract
2. **Generate types**: Run `npm run proto:generate`
3. **Implement service**: Use generated types in `src/services/dbService.ts`
4. **Commit changes**: Include both proto and generated files in git

To regenerate types after modifying `proto/db.proto`:
```bash
npm run proto:generate
```

The build process automatically regenerates types to ensure consistency.

## Security Considerations

⚠️ **Important Security Notes:**

1. **SQL Injection Risk**: This service executes arbitrary SQL queries. Only expose it to trusted internal services.
2. **Authentication**: Currently no authentication is implemented. Use network-level security (VPC, firewalls) or add authentication middleware.
3. **Channel Name Validation**: Channel names are validated to prevent SQL injection, allowing only alphanumeric characters and underscores.
4. **TLS**: The server uses insecure credentials by default. For production, implement TLS using `grpc.ServerCredentials.createSsl()`.

## Production Recommendations

Before deploying to production:

1. Implement authentication and authorization
2. Enable TLS/SSL for gRPC connections
3. Add rate limiting and request throttling
4. Implement query allowlisting or prepared statement management
5. Set up monitoring and alerting
6. Configure appropriate connection pool settings
7. Use secrets management for database credentials
8. Implement circuit breakers for database connections

## License

This project is licensed under the MIT License.
This project is licensed under the MIT License.