/**
 * Configuration management for the application
 * Validates and provides type-safe access to environment variables
 */

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  max: number;
  idleTimeoutMillis: number;
  min: number;
}

export interface AppConfig {
  db: DatabaseConfig;
  port: number;
}

/**
 * Validates and parses database configuration from individual environment variables
 * @throws Error if required variables are missing
 */
function parseDatabaseConfig(): DatabaseConfig {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  
  // Validate required fields
  if (!host) {
    throw new Error('DB_HOST environment variable is required');
  }
  if (!user) {
    throw new Error('DB_USER environment variable is required');
  }
  if (!database) {
    throw new Error('DB_NAME environment variable is required');
  }

  return {
    host,
    user,
    password: password || '',
    database,
    port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : 5432,
    max: process.env.DB_POOL_MAX ? Number.parseInt(process.env.DB_POOL_MAX, 10) : 100,
    idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT 
      ? Number.parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) 
      : 30000,
    min: process.env.DB_POOL_MIN ? Number.parseInt(process.env.DB_POOL_MIN, 10) : 2,
  };
}

/**
 * Gets the application configuration
 * @returns Application configuration object
 */
export function getConfig(): AppConfig {
  return {
    db: parseDatabaseConfig(),
    port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 50051,
  };
}

