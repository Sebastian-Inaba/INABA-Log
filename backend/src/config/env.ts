// env validator
import dotenv from 'dotenv';

dotenv.config(); // Load .env file

// List of required environment variables
const requiredEnvs = [
    'MONGODB_URI',
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_BUCKET_POSTS_IMAGE',
    'SUPABASE_BUCKET_RESEARCH_IMAGE',
    'SUPABASE_BUCKET_RESEARCH_ATTACHMENTS',
    'GOOGLE_CLIENT_ID',
    'ADMIN_EMAIL',
    'FRONTEND_URL', // for cors validation (currently default to localhost, should set domain in env)
];

requiredEnvs.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Environment variable ${key} is missing`);
    }
});

// Export type-safe env object
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
            researchAttachments: process.env
                .SUPABASE_BUCKET_RESEARCH_ATTACHMENTS as string,
        },
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        adminEmail: process.env.ADMIN_EMAIL as string,
    },
    frontendUrl: process.env.FRONTEND_URL as string,
};
