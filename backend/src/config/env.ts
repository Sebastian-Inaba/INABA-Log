import dotenv from 'dotenv';

dotenv.config(); // Load .env file

// List of required environment variables(for now)
const requiredEnvs = [
    'MONGODB_URI',
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_BUCKET_POSTS_IMAGE',
    'SUPABASE_BUCKET_RESEARCH_IMAGE',
    'SUPABASE_BUCKET_RESEARCH_ATTACHMENTS',
];

requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Environment variable ${key} is missing`);
    }
});

// Export type-safe env object
// Not sure if i should make buckets private or public yet, probably public
export const env = {
    mongodbUri: process.env.MONGODB_URI as string,
    nodeEnv: process.env.NODE_ENV as string,
    supabase: {
        url: process.env.SUPABASE_URL as string,
        anonKey: process.env.SUPABASE_ANON_KEY as string,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        buckets: {
            postsImage: process.env.SUPABASE_BUCKET_POSTS_IMAGE as string,
            researchImage: process.env.SUPABASE_BUCKET_RESEARCH_IMAGE as string,
            researchAttachments: process.env.SUPABASE_BUCKET_RESEARCH_ATTACHMENTS as string,
        },
    },
};
