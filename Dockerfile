# Stage 1: Build
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN tsc

# Stage 2: Production
FROM node:22-alpine

# Set the working directory
WORKDIR /app

RUN mkdir -p /tmp/grpc
# Copy only the built files and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./.env

# Copy the .proto files to the dist directory
COPY --from=builder /app/src/proto /app/dist/proto

# Expose the port (if applicable)
EXPOSE 50051

# Command to run the application
CMD ["node", "dist/server.js"]