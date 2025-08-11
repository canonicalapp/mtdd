# Runtime User Configuration

This Docker setup allows you to create a user with a specific UID and username at runtime, rather than at build time.

## Environment Variables

- `USER_UID`: The UID for the user (default: 1000)
- `USER_NAME`: The username (default: appuser)
- `ENV_FILE_CONTENT`: Content for the .env file (optional)

## Usage Examples

### Using docker run

```bash
# Basic usage with default user (UID 1000, username 'appuser')
docker run -p 50051:50051 your-image-name

# With custom UID and username
docker run -p 50051:50051 -e USER_UID=1001 -e USER_NAME=myuser your-image-name

# With custom user and .env content
docker run -p 50051:50051 \
  -e USER_UID=1001 \
  -e USER_NAME=myuser \
  -e ENV_FILE_CONTENT='DB_CONFIG={"type":"postgres","host":"localhost","user":"postgres", "password":"P@ssw0rd","database":"testd"}' \
  your-image-name

# Mount .env file from host instead of using ENV_FILE_CONTENT
docker run -p 50051:50051 \
  -e USER_UID=1001 \
  -e USER_NAME=myuser \
  -v "$(pwd)/.env:/app/.env:ro" \
  your-image-name
```

### Using docker-compose

Update the `docker-compose.yml` file with your desired values:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "50051:50051"
    environment:
      - USER_UID=1001
      - USER_NAME=myappuser
      - ENV_FILE_CONTENT=DB_CONFIG={"type":"postgres","host":"localhost","user":"postgres", "password":"P@ssw0rd","database":"testd"}
```

Then run:

```bash
docker-compose up --build
```

## How it works

1. The `entrypoint.sh` script runs at container startup
2. It creates a user with the specified UID and username if it doesn't exist
3. It sets up the .env file either from the `ENV_FILE_CONTENT` environment variable or uses an existing mounted file
4. It changes ownership of application files to the created user
5. It switches to the created user and runs the application

## Security Benefits

- No hardcoded UID in the image
- Application runs as non-root user
- File permissions are properly set for the runtime user
- Flexible user configuration per deployment
