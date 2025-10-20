# Stage 1: Build
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy proto files for protobuf generation
COPY proto/ ./proto/

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build the application (generates protobuf files and compiles TypeScript)
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

# Install shadow package for user management
RUN apk add --no-cache shadow

# Set the working directory
WORKDIR /app

RUN mkdir -p /tmp/grpc

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies (no dev dependencies)
RUN npm ci --omit=dev && npm cache clean --force

# Copy only the built files from the builder stage
COPY --from=builder /app/dist ./dist

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

# Install su-exec for better user switching
RUN apk add --no-cache su-exec

# Expose the port (if applicable)
EXPOSE 50051

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Command to run the application
CMD ["node", "dist/server.js"]