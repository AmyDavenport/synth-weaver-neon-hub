/**
 * Converts technical error messages to user-friendly messages.
 * Logs detailed errors for debugging while showing safe messages to users.
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
  // Log the full error for debugging (server-side in edge functions, console in browser)
  console.error(`[${context || 'Error'}]:`, error);

  // Handle null/undefined
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  const err = error as { code?: string; message?: string; status?: number };
  const code = err.code || '';
  const message = err.message || '';
  const status = err.status;

  // Supabase PostgreSQL error codes
  if (code === '23505') return 'This item already exists.';
  if (code === '23503') return 'This operation cannot be completed due to related data.';
  if (code === '23502') return 'Required information is missing.';
  if (code === '42501') return 'You do not have permission to perform this action.';
  if (code === '42P01') return 'The requested resource was not found.';
  
  // Supabase PostgREST errors (start with PGRST)
  if (code.startsWith('PGRST')) return 'Database operation failed. Please try again.';
  
  // Supabase Auth errors
  if (message.includes('Invalid login credentials')) return 'Invalid email or password.';
  if (message.includes('Email not confirmed')) return 'Please verify your email before logging in.';
  if (message.includes('already registered')) return 'This email is already registered.';
  if (message.includes('Password should be')) return 'Password must be at least 6 characters.';
  if (message.includes('JWT')) return 'Your session has expired. Please log in again.';
  if (message.includes('Token')) return 'Authentication error. Please log in again.';
  
  // Network/connection errors
  if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
    return 'Connection error. Please check your internet and try again.';
  }
  
  // Rate limiting
  if (status === 429 || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Server errors
  if (status && status >= 500) {
    return 'Server error. Please try again later.';
  }

  // Generic fallback - never expose raw error messages
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Specific error handler for authentication operations
 */
export function getAuthErrorMessage(error: unknown): string {
  const err = error as { message?: string; code?: string };
  const message = err.message || '';
  
  // More specific auth error handling
  if (message.includes('Invalid login credentials')) return 'Invalid email or password.';
  if (message.includes('User not found')) return 'No account found with this email.';
  if (message.includes('Email not confirmed')) return 'Please check your email to verify your account.';
  if (message.includes('already registered')) return 'This email is already registered. Try logging in.';
  if (message.includes('Password should be')) return 'Password must be at least 6 characters.';
  if (message.includes('Email rate limit')) return 'Too many attempts. Please wait before trying again.';
  if (message.includes('invalid')) return 'Please check your email and password.';
  
  // Log and return generic message for unknown auth errors
  console.error('[Auth Error]:', error);
  return 'Authentication failed. Please try again.';
}
