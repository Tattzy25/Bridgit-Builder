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

  // Create bridgit_sessions table if it doesn't exist
  static async initializeDatabase() {
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS bridgit_sessions (
        session_id UUID PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        plan_id VARCHAR(255),
        source_language VARCHAR(10) NOT NULL,
        target_language VARCHAR(10) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- FSM State Timestamps
        recording_start TIMESTAMP WITH TIME ZONE,
        recording_end TIMESTAMP WITH TIME ZONE,
        transcription_start TIMESTAMP WITH TIME ZONE,
        transcription_end TIMESTAMP WITH TIME ZONE,
        translation_start TIMESTAMP WITH TIME ZONE,
        translation_end TIMESTAMP WITH TIME ZONE,
        speaking_start TIMESTAMP WITH TIME ZONE,
        speaking_end TIMESTAMP WITH TIME ZONE,
        
        -- Content
        final_text TEXT,
        translated_text TEXT,
        
        -- API Providers
        stt_provider VARCHAR(50),
        translation_provider VARCHAR(50),
        tts_provider VARCHAR(50),
        tts_voice VARCHAR(100),
        
        -- Usage Tracking
        stt_tokens_used INTEGER DEFAULT 0,
        stt_duration_seconds DECIMAL(10,3) DEFAULT 0,
        tts_characters_used INTEGER DEFAULT 0,
        total_tokens_billed INTEGER DEFAULT 0,
        usage_billed BOOLEAN DEFAULT FALSE,
        
        -- Fallback Tracking
        stt_fallback_used BOOLEAN DEFAULT FALSE,
        translate_fallback_used BOOLEAN DEFAULT FALSE,
        tts_fallback_used BOOLEAN DEFAULT FALSE,
        
        -- Meta
        client_ip INET,
        user_agent TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'complete', 'error')),
        error_message TEXT,
        
        -- Indexes for performance
        CONSTRAINT fk_user_sessions FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      -- Create indexes for common queries
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_user_id ON bridgit_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_created_at ON bridgit_sessions(created_at);
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_status ON bridgit_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_bridgit_sessions_usage_billed ON bridgit_sessions(usage_billed);
      
      -- Create updated_at trigger
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_bridgit_sessions_updated_at ON bridgit_sessions;
      CREATE TRIGGER update_bridgit_sessions_updated_at
        BEFORE UPDATE ON bridgit_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY, -- Clerk user ID
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        plan_id VARCHAR(100) DEFAULT 'basic',
        default_source_language VARCHAR(10) DEFAULT 'EN',
        default_target_language VARCHAR(10) DEFAULT 'FR',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
      
      -- Create updated_at trigger for users
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
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
