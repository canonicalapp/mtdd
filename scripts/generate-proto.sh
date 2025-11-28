#!/bin/sh
# Generate TypeScript types from .proto files using ts-proto
# Uses Docker if protoc is not available locally

set -e

PROTO_DIR="./proto"
OUT_DIR="./src/generated"

# Create output directory if it doesn't exist
mkdir -p "${OUT_DIR}"

# Check if protoc is available
if command -v protoc >/dev/null 2>&1; then
    echo "Using local protoc installation..."
    protoc \
        --plugin=./node_modules/.bin/protoc-gen-ts_proto \
        --ts_proto_out="${OUT_DIR}" \
        --proto_path="${PROTO_DIR}" \
        --ts_proto_opt=esModuleInterop=true \
        --ts_proto_opt=outputServices=grpc-js \
        --ts_proto_opt=env=node \
        "${PROTO_DIR}"/*.proto
elif command -v docker >/dev/null 2>&1; then
    echo "protoc not found locally, using Docker..."
    docker run --rm \
        -v "$(pwd):/workspace" \
        -w /workspace \
        node:22-alpine sh -c "
            apk add --no-cache protoc && \
            mkdir -p ${OUT_DIR} && \
            protoc \
                --plugin=./node_modules/.bin/protoc-gen-ts_proto \
                --ts_proto_out=${OUT_DIR} \
                --proto_path=${PROTO_DIR} \
                --ts_proto_opt=esModuleInterop=true \
                --ts_proto_opt=outputServices=grpc-js \
                --ts_proto_opt=env=node \
                ${PROTO_DIR}/*.proto
        "
else
    echo "❌ Error: Neither 'protoc' nor 'docker' is available."
    echo ""
    echo "To generate TypeScript types, you need one of the following:"
    echo ""
    echo "Option 1: Install protoc locally"
    echo "  Linux:"
    echo "    sudo apt install -y protobuf-compiler  # Debian/Ubuntu"
    echo "    sudo yum install protobuf-compiler       # RHEL/CentOS"
    echo "  macOS:"
    echo "    brew install protobuf"
    echo "  Windows:"
    echo "    Download from: https://github.com/protocolbuffers/protobuf/releases"
    echo "Verify installation by running:"
    echo "    protoc --version  # Ensure compiler version is 3+"
    echo ""
    echo "Option 2: Install Docker"
    echo "    https://docs.docker.com/get-docker/"
    echo ""
    echo "Option 3: Use pre-generated files"
    echo "    The generated files in src/generated/ are committed to git."
    echo "    If you just need to build the project, you can skip generation:"
    echo "    npm run build --ignore-scripts"
    echo ""
    echo "Option 4: Use CI/CD or remote environment"
    echo "    Generate types in CI/CD pipeline or use a remote development environment"
    echo ""
    exit 1
fi

echo "✅ TypeScript types generated successfully in ${OUT_DIR}"
