import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://lcmybxnvbxhoxdxwshdn.lovable.app',
  'https://lcmybxnvbxhoxdxwshdn.supabase.co',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  
  // Check if origin is in allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Credentials': 'true',
    };
  }
  
  // For non-browser requests or disallowed origins, use first allowed origin
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// In-memory rate limiting (per-instance, resets on cold start)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; resetIn?: number } {
  const now = Date.now();
  const limit = rateLimits.get(userId);
  const maxRequests = 30; // 30 requests per minute for GitHub API
  const windowMs = 60000; // 1 minute

  if (!limit || now > limit.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (limit.count >= maxRequests) {
    return { allowed: false, resetIn: Math.ceil((limit.resetAt - now) / 1000) };
  }

  limit.count++;
  return { allowed: true };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Try again in ${rateCheck.resetIn} seconds.` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, token, repoData } = await req.json();

    // Validate action
    const validActions = ['verify', 'fetch_repos', 'save_token', 'sync_repos'];
    if (!action || !validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`GitHub proxy action: ${action} for user: ${user.id}`);

    // Get stored token from profile (server-side only)
    const getStoredToken = async (): Promise<string | null> => {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { data } = await serviceClient
        .from('profiles')
        .select('github_access_token')
        .eq('user_id', user.id)
        .single();
      
      return data?.github_access_token || null;
    };

    switch (action) {
      case 'verify': {
        // Verify a new token (user provides token for first-time connection)
        if (!token || typeof token !== 'string' || !token.startsWith('ghp_')) {
          return new Response(
            JSON.stringify({ error: 'Invalid token format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          console.error('GitHub token verification failed');
          return new Response(
            JSON.stringify({ error: 'Invalid GitHub token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userData = await response.json();
        
        // Store token server-side using service role
        const serviceClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await serviceClient
          .from('profiles')
          .update({
            github_access_token: token,
            github_username: userData.login,
          })
          .eq('user_id', user.id);

        console.log(`GitHub connected for user ${user.id}: ${userData.login}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            username: userData.login,
            // Never return the token to the client
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch_repos': {
        const storedToken = await getStoredToken();
        if (!storedToken) {
          return new Response(
            JSON.stringify({ error: 'GitHub not connected', connected: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch GitHub repos:', response.status);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch repositories' }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const repos = await response.json();
        
        return new Response(
          JSON.stringify({ repos, connected: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_repos': {
        const storedToken = await getStoredToken();
        if (!storedToken) {
          return new Response(
            JSON.stringify({ error: 'GitHub not connected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!repoData || !Array.isArray(repoData)) {
          return new Response(
            JSON.stringify({ error: 'Invalid repository data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate and limit repos to sync (max 50 at a time)
        const reposToSync = repoData.slice(0, 50);
        
        const serviceClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        let syncedCount = 0;
        for (const repo of reposToSync) {
          if (!repo.id || !repo.name) continue;
          
          const githubRepoId = String(repo.id);
          
          // Check if this github_repo_id is already owned by another user
          const { data: existing } = await serviceClient
            .from('repositories')
            .select('user_id')
            .eq('github_repo_id', githubRepoId)
            .single();
          
          // If repo exists and belongs to another user, skip it (don't hijack)
          if (existing && existing.user_id !== user.id) {
            console.log(`Skipping repo ${githubRepoId} - belongs to another user`);
            continue;
          }
          
          // Safe to upsert - either new repo or owned by this user
          await serviceClient.from('repositories').upsert({
            user_id: user.id,
            name: String(repo.name).slice(0, 255),
            description: repo.description ? String(repo.description).slice(0, 1000) : null,
            visibility: repo.private ? 'private' : 'public',
            language: repo.language ? String(repo.language).slice(0, 50) : null,
            stars_count: Number(repo.stargazers_count) || 0,
            forks_count: Number(repo.forks_count) || 0,
            github_repo_id: githubRepoId,
            github_full_name: repo.full_name ? String(repo.full_name).slice(0, 255) : null,
            clone_url: repo.clone_url ? String(repo.clone_url).slice(0, 500) : null,
            is_synced: true,
            last_synced_at: new Date().toISOString(),
          }, {
            // Use composite constraint: user_id + github_repo_id
            onConflict: 'user_id,github_repo_id',
          });
          
          syncedCount++;
        }

        console.log(`Synced ${syncedCount} repos for user ${user.id}`);

        return new Response(
          JSON.stringify({ success: true, syncedCount }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'save_token': {
        // This is now handled by 'verify' action
        return new Response(
          JSON.stringify({ error: 'Use verify action instead' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Error in github-proxy function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
