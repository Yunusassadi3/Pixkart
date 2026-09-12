import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import fs from "fs";
import path from "path";

// Auto-load .env.local if not already in process.env (for background tasks/scripts)
if (typeof window === "undefined") {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...rest] = trimmed.split("=");
          const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      });
    }
  } catch {}
}

// Global singleton declaration to preserve connection pools across Next.js Turbopack fast reloads
declare global {
  var _localMysqlPool: Pool | undefined;
  var _cloudMysqlPool: Pool | undefined;
  var _mysqlPool: Pool | undefined;
}

/**
 * Local MySQL 8.0 configuration (Master database on user's PC).
 */
export function getLocalDbConfig(): PoolOptions {
  const useSsl =
    process.env.LOCAL_DB_SSL === "true" ||
    process.env.DB_SSL === "true" ||
    (process.env.DB_HOST && process.env.DB_HOST.includes("tidbcloud.com"));

  return {
    host: process.env.LOCAL_DB_HOST || process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.LOCAL_DB_PORT || process.env.DB_PORT || "3306", 10),
    user: process.env.LOCAL_DB_USER || process.env.DB_USER || "root",
    password: process.env.LOCAL_DB_PASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.LOCAL_DB_NAME || process.env.DB_NAME || "pixkart_db",
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 3500,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  };
}

/**
 * 24/7 TiDB Cloud Serverless configuration (Temporary offline buffer queue).
 */
export function getCloudDbConfig(): PoolOptions {
  return {
    host:
      process.env.CLOUD_DB_HOST ||
      (process.env.DB_HOST && process.env.DB_HOST.includes("tidbcloud.com")
        ? process.env.DB_HOST
        : "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"),
    port: parseInt(process.env.CLOUD_DB_PORT || process.env.DB_PORT || "4000", 10),
    user: process.env.CLOUD_DB_USER || (process.env.DB_USER && process.env.DB_USER.includes(".") ? process.env.DB_USER : "dyHdkY9qkRGmq57.root"),
    password: process.env.CLOUD_DB_PASSWORD || process.env.DB_PASSWORD || "A8uEcamqrqs9V8cv",
    database: process.env.CLOUD_DB_NAME || process.env.DB_NAME || "test",
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 5000,
    ssl: { rejectUnauthorized: false },
  };
}

/**
 * Primary local MySQL pool (Master store on physical PC hard drive).
 */
export function getLocalPool(): Pool {
  if (!global._localMysqlPool) {
    global._localMysqlPool = mysql.createPool(getLocalDbConfig());
  }
  return global._localMysqlPool;
}

/**
 * 24/7 Cloud TiDB pool (Buffer queue for when PC is turned off).
 */
export function getCloudPool(): Pool {
  if (!global._cloudMysqlPool) {
    global._cloudMysqlPool = mysql.createPool(getCloudDbConfig());
  }
  return global._cloudMysqlPool;
}

/**
 * Default connection pool selector.
 * Uses Local MySQL if running on PC, or Cloud TiDB if deployed on cloud serverless without localhost.
 */
export function getPool(): Pool {
  return getLocalPool();
}

export interface QueryResult<T> {
  data: T;
  isConnected: boolean;
  error: string | null;
}

/**
 * Query specifically targeting Local PC MySQL.
 */
export async function localQuery<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  const pool = getLocalPool();
  return (await pool.query(sql, params)) as [T, any];
}

/**
 * Query specifically targeting 24/7 Cloud TiDB Buffer.
 */
export async function cloudQuery<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  const pool = getCloudPool();
  return (await pool.query(sql, params)) as [T, any];
}

/**
 * Executes a parameterized SQL query with automatic zero-crash fallback protection.
 */
export async function executeSafeQuery<T>(
  sql: string,
  params: any[] = [],
  fallbackData: T
): Promise<QueryResult<T>> {
  try {
    const pool = getPool();
    const [rows] = await pool.query(sql, params);
    return {
      data: rows as T,
      isConnected: true,
      error: null,
    };
  } catch (err: any) {
    // If local query fails, try cloud buffer fallback
    try {
      const cloudP = getCloudPool();
      const [cloudRows] = await cloudP.query(sql, params);
      return {
        data: cloudRows as T,
        isConnected: true,
        error: null,
      };
    } catch {
      console.warn(`[MySQL Fallback]: ${err?.message || "Connection failure"}`);
      return {
        data: fallbackData,
        isConnected: false,
        error: err?.message || "Database connection unavailable",
      };
    }
  }
}

/**
 * Direct query execution on primary pool.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  try {
    const pool = getLocalPool();
    return (await pool.query(sql, params)) as [T, any];
  } catch (err) {
    // Fallback to cloud pool if local is unreachable
    const cloudP = getCloudPool();
    return (await cloudP.query(sql, params)) as [T, any];
  }
}

/**
 * Execute multiple database operations inside a single atomic ACID transaction on Local MySQL.
 */
export async function executeLocalTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getLocalPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Backwards-compatible alias for executeLocalTransaction.
 */
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  return executeLocalTransaction(callback);
}

/**
 * Test connectivity to Local MySQL 8.0 on PC.
 */
export async function testLocalConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  error: string | null;
  database: string;
  host: string;
}> {
  const start = Date.now();
  try {
    const pool = getLocalPool();
    await pool.query("SELECT 1 as ping, NOW() as server_time");
    return {
      connected: true,
      latencyMs: Date.now() - start,
      error: null,
      database: process.env.LOCAL_DB_NAME || "pixkart_db",
      host: process.env.LOCAL_DB_HOST || "127.0.0.1",
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: err?.message || "Failed to connect to local MySQL",
      database: process.env.LOCAL_DB_NAME || "pixkart_db",
      host: process.env.LOCAL_DB_HOST || "127.0.0.1",
    };
  }
}

/**
 * Test connectivity to 24/7 TiDB Cloud buffer.
 */
export async function testCloudConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  error: string | null;
  database: string;
  host: string;
}> {
  const start = Date.now();
  try {
    const pool = getCloudPool();
    await pool.query("SELECT 1 as ping, NOW() as server_time");
    return {
      connected: true,
      latencyMs: Date.now() - start,
      error: null,
      database: process.env.CLOUD_DB_NAME || "test",
      host: process.env.CLOUD_DB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: err?.message || "Failed to connect to TiDB Cloud",
      database: process.env.CLOUD_DB_NAME || "test",
      host: process.env.CLOUD_DB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
    };
  }
}

/**
 * Simultaneous dual health check for both Local MySQL and Cloud TiDB.
 */
export async function testDualConnections() {
  const [local, cloud] = await Promise.all([
    testLocalConnection(),
    testCloudConnection(),
  ]);
  return { local, cloud };
}

/**
 * Standard testConnection health check.
 */
export async function testConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  error: string | null;
  database: string;
  host: string;
}> {
  const local = await testLocalConnection();
  if (local.connected) return local;
  const cloud = await testCloudConnection();
  return cloud;
}
