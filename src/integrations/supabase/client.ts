
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bwujvdkvplxsfcakzupj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dWp2ZGt2cGx4c2ZjYWt6dXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjY2MTYsImV4cCI6MjA1ODMwMjYxNn0.LFD5HLMlKSfNdQId3QCcYTBmdD-vHyjczv7mG5FDgvo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
