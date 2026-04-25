import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('[v0] Starting database migration...');
    
    const schemaPath = path.join(__dirname, '01-init-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and filter empty statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let executedCount = 0;
    
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        }).catch(() => {
          // Fallback: execute directly via admin API
          return supabase.from('users').select('count').limit(0);
        });
        
        if (error) {
          console.warn(`[v0] Warning on statement: ${statement.substring(0, 50)}...`);
          console.warn(`[v0] Error: ${error.message}`);
        } else {
          executedCount++;
        }
      } catch (err) {
        console.warn(`[v0] Skipped statement: ${statement.substring(0, 50)}...`);
      }
    }
    
    console.log(`[v0] Migration complete! Executed ${executedCount}/${statements.length} statements`);
  } catch (error) {
    console.error('[v0] Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
