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

# Install shadow package for user management
RUN apk add --no-cache shadow

# Set the working directory
WORKDIR /app

RUN mkdir -p /tmp/grpc
# Copy only the built files and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

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