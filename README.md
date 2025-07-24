# gRPC PostgreSQL Application

This project is a gRPC server that interacts with a PostgreSQL database to retrieve country IP information using a stored procedure. It utilizes the `dbfacade` library for database operations and exposes a gRPC method named `getCountryIP`.

## Project Structure

```
grpc-postgres-app
├── src
│   ├── server.ts               # Entry point of the application
│   ├── db
│   │   └── index.ts            # Database connection and stored procedure execution
│   ├── services
│   │   └── countryService.ts    # gRPC service implementation for country-related methods
│   ├── proto
│   │   └── country.proto        # gRPC service and message definitions
│   └── types
│       └── index.ts            # TypeScript interfaces for data structures
├── package.json                 # npm dependencies and scripts
├── tsconfig.json                # TypeScript compiler configuration
└── README.md                    # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd grpc-postgres-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure PostgreSQL:**
   Ensure you have a PostgreSQL database set up and update the connection details in `src/db/index.ts`.

4. **Create the stored procedure:**
   Create a stored procedure in your PostgreSQL database that retrieves country IP information.

5. **Run the application:**
   ```
   npm start
   ```

## Usage

Once the server is running, you can call the `getCountryIP` method via a gRPC client. The method expects a request with the necessary parameters and returns the corresponding country IP information.

## Example Request

```protobuf
// Example of a request to getCountryIP
message CountryIPRequest {
  string countryCode = 1;
}

message CountryIPResponse {
  string ip = 1;
}
```

## License

This project is licensed under the MIT License.