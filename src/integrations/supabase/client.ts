
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ijrwvlxqxcqqoynsgnxg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqcnd2bHhxeGNxcW95bnNnbnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzAzNjQsImV4cCI6MjA2MjE0NjM2NH0.pVwEKPTBo3CABbceTJt9G-JBOMKrpF4vZqG_JKkcaxs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
