#!/bin/sh

# Set default values if not provided
USER_UID=${USER_UID:-10001}
USER_NAME=${USER_NAME:-appuser}

# Create user with provided UID if it doesn't exist
if ! id "$USER_NAME" >/dev/null 2>&1; then
    adduser -D -u "$USER_UID" "$USER_NAME"
    echo "Created user $USER_NAME with UID $USER_UID"
else
    echo "User $USER_NAME already exists"
fi

# Change ownership of the app directory to the user
chown -R "$USER_NAME:$USER_NAME" /app /tmp/grpc

# Copy .env file if it exists in the environment
if [ -n "$ENV_FILE_CONTENT" ]; then
    echo "$ENV_FILE_CONTENT" > /app/.env
    chown "$USER_NAME:$USER_NAME" /app/.env
    echo "Created .env file from environment variable"
elif [ -f "/app/.env" ]; then
    chown "$USER_NAME:$USER_NAME" /app/.env
    echo "Using existing .env file"
fi

# Switch to the created user and run the application
exec su-exec "$USER_NAME" "$@"
