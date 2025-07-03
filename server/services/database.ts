import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL_UNPOOLED = process.env.DATABASE_URL_UNPOOLED;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Neon serverless client (recommended for edge functions)
export const sql = neon(DATABASE_URL);

// Traditional PostgreSQL pool (for server-side operations)
export const pool = new Pool({
  connectionString: DATABASE_URL_UNPOOLED || DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Database helper functions
export class DatabaseService {
  // Execute raw SQL query with Neon serverless
  static async query(text: string, params?: any[]) {
    try {
      return await sql(text, params);
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  // Execute query with traditional pool (for complex transactions)
  static async queryWithPool(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } catch (error) {
      console.error("Database pool query error:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Create database tables matching exact specifications
  static async initializeDatabase() {
    // Create updated_at function first
    const createUpdateFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR UNIQUE NOT NULL,
        hashed_password TEXT,
        default_source_language VARCHAR,
        default_target_language VARCHAR,
        plan_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);

      -- Create updated_at trigger for users
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS bridgit_sessions (
        session_id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        plan_id VARCHAR,
        source_language VARCHAR,
        target_language VARCHAR,
        tts_voice VARCHAR,
        stt_provider VARCHAR,
        stt_fallback_used BOOLEAN DEFAULT FALSE,
        translate_fallback_used BOOLEAN DEFAULT FALSE,
        tts_fallback_used BOOLEAN DEFAULT FALSE,
        final_text TEXT,
        translated_text TEXT,
        translation_provider VARCHAR,
        stt_tokens_used INTEGER,
        stt_duration_seconds INTEGER,
        tts_characters_used INTEGER,
        total_tokens_billed INTEGER,
        usage_billed BOOLEAN DEFAULT FALSE,
        recording_start TIMESTAMP,
        recording_end TIMESTAMP,
        transcription_start TIMESTAMP,
        transcription_end TIMESTAMP,
        translation_start TIMESTAMP,
        translation_end TIMESTAMP,
        speaking_start TIMESTAMP,
        speaking_end TIMESTAMP,
        client_ip VARCHAR,
        user_agent TEXT,
        status VARCHAR DEFAULT 'complete',
        error_message TEXT,
        audio_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_user_id ON bridgit_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_created_at ON bridgit_sessions(created_at);
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_status ON bridgit_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_usage_billed ON bridgit_sessions(usage_billed);

      -- Create updated_at trigger
      DROP TRIGGER IF EXISTS update_bridgit_sessions_updated_at ON bridgit_sessions;
      CREATE TRIGGER update_bridgit_sessions_updated_at
        BEFORE UPDATE ON bridgit_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
      await this.query(createUpdateFunction);
      console.log("✅ Update function created/verified");

      await this.query(createUsersTable);
      console.log("✅ Users table created/verified");

      await this.query(createSessionsTable);
      console.log("✅ Sessions table created/verified");

      return true;
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  // Session CRUD operations
  static async createSession(sessionData: any) {
    const query = `
      INSERT INTO bridgit_sessions (
        session_id, user_id, plan_id, source_language, target_language,
        client_ip, user_agent, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING session_id
    `;

    const values = [
      sessionData.session_id,
      sessionData.user_id,
      sessionData.plan_id,
      sessionData.source_language,
      sessionData.target_language,
      sessionData.client_ip,
      sessionData.user_agent,
      sessionData.status || "active",
    ];

    return await this.query(query, values);
  }

  static async updateSession(sessionId: string, updates: any) {
    const updateFields = Object.keys(updates);
    const updateQuery = updateFields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    const query = `
      UPDATE bridgit_sessions
      SET ${updateQuery}
      WHERE session_id = $1
      RETURNING session_id
    `;

    const values = [sessionId, ...Object.values(updates)];

    return await this.query(query, values);
  }

  static async getSession(sessionId: string) {
    const query = "SELECT * FROM bridgit_sessions WHERE session_id = $1";
    return await this.query(query, [sessionId]);
  }

  static async getUserSessions(userId: string, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM bridgit_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    return await this.query(query, [userId, limit, offset]);
  }

  static async deleteSession(sessionId: string) {
    const query = "DELETE FROM bridgit_sessions WHERE session_id = $1";
    return await this.query(query, [sessionId]);
  }

  // User operations
  static async createOrUpdateUser(userData: any) {
    const query = `
      INSERT INTO users (id, email, first_name, last_name, plan_id, last_login)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const values = [
      userData.id,
      userData.email,
      userData.first_name,
      userData.last_name,
      userData.plan_id || "basic",
    ];

    return await this.query(query, values);
  }

  static async getUser(userId: string) {
    const query = "SELECT * FROM users WHERE id = $1";
    return await this.query(query, [userId]);
  }

  // Analytics queries
  static async getUserSessionStats(userId: string, days = 30) {
    const query = `
      SELECT
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN status = 'complete' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_sessions,
        SUM(stt_tokens_used) as total_stt_tokens,
        SUM(tts_characters_used) as total_tts_characters,
        AVG(EXTRACT(EPOCH FROM (speaking_end - recording_start))) as avg_session_duration
      FROM bridgit_sessions
      WHERE user_id = $1
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
    `;

    return await this.query(query, [userId]);
  }
}

// Initialize database on startup
DatabaseService.initializeDatabase().catch(console.error);

export default DatabaseService;
