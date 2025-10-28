// supabase storage
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Supabase client
export const supabase = createClient(
    env.supabase.url,
    env.supabase.serviceRoleKey,
);

// Export buckets
export const buckets = {
    posts: env.supabase.buckets.postsImage, // Bucket for posts images
    research: env.supabase.buckets.researchImage, // Bucket for research images
    attachments: env.supabase.buckets.researchAttachments, // Bucket for research attachments
};
