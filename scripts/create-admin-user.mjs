import { createClient } from '@supabase/supabase-js';

// Read Supabase config from env or fallback to default dev project
const defaultUrl = 'https://byeolalksmsutxrohvqa.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA';

const supabaseUrl = process.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read email/password from CLI args
const [emailArg, passwordArg] = process.argv.slice(2);

if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/create-admin-user.mjs <email> <password>');
  process.exit(1);
}

const email = emailArg.trim();
const password = passwordArg.trim();

async function ensureAdminUser() {
  try {
    console.log('Creating admin user:', email);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'admin', is_main_admin: true }
      }
    });

    if (signUpError) {
      console.warn('SignUp warning:', signUpError.message);
    } else {
      console.log('SignUp OK:', signUpData?.user?.id);
    }

    // Try to sign in to obtain a session (needed for inserting user_profiles under RLS)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.warn('SignIn warning:', signInError.message);
      console.warn('If email confirmation is required, confirm the email or disable it in Supabase Auth settings.');
      console.log('Admin user may be created but without profile row due to lack of session.');
      return;
    }

    const userId = signInData?.user?.id;
    if (!userId) {
      console.warn('No user ID after sign in; skipping profile creation.');
      return;
    }

    // Upsert user profile
    const username = email.split('@')[0];
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email,
        username,
        role: 'admin',
        permissions: ['all'],
        is_main_admin: true
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.warn('Profile upsert warning:', profileError.message);
    } else {
      console.log('Profile upsert OK for user:', userId);
    }

    console.log('Admin setup completed for:', email);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

ensureAdminUser();