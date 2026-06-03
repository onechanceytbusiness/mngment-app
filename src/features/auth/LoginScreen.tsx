import { useState, type FormEvent } from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(humanizeAuthError(authError.message));
      }
      // Success → onAuthStateChange flips the gate in App.tsx; no manual nav needed.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (authError) {
        setError(humanizeAuthError(authError.message));
        setSubmitting(false);
      }
      // On success the browser navigates away; submitting stays true to keep
      // the buttons disabled during that brief moment.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mngmnt-paper p-6">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-card">
        <div className="flex flex-col items-center gap-2 text-center">
          <img
            src="/brand/mngmnt-burst-icon.svg"
            alt="mngmnt"
            className="h-12 w-12 rounded-xl"
          />
          <h1 className="text-xl font-bold text-stone-900">Sign in to mngmnt</h1>
          <p className="text-sm text-stone-500">Internal automation hub</p>
        </div>

        <form className="mt-6 flex flex-col gap-3" onSubmit={handlePasswordSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-700">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
              />
            </div>
          </label>

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
            disabled={submitting}
            leftIcon={<LogIn className="h-4 w-4" />}
            className="mt-1 w-full"
          >
            Sign in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          <span className="flex-1 border-t border-stone-200" />
          or
          <span className="flex-1 border-t border-stone-200" />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={submitting}
          onClick={handleGoogle}
          leftIcon={<GoogleIcon />}
          className="w-full"
        >
          Sign in with Google
        </Button>

        <p className="mt-6 text-center text-xs text-stone-400">
          Access is managed by your admin. Sign-ups are not open.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  // Inline Google "G" mark so there's no network image dependency on the login page.
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.89-1.74 2.986-4.305 2.986-7.351z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.227-2.51c-.895.6-2.04.954-3.391.954-2.605 0-4.81-1.76-5.595-4.123H3.064v2.59A9.997 9.997 0 0 0 12 22z"
        fill="#34A853"
      />
      <path
        d="M6.405 13.9A6.011 6.011 0 0 1 6.09 12c0-.659.114-1.3.314-1.9V7.51H3.064A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.341-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.977c1.468 0 2.786.504 3.823 1.495l2.868-2.868C16.96 2.99 14.695 2 12 2A9.997 9.997 0 0 0 3.064 7.51l3.341 2.59C7.19 7.736 9.395 5.977 12 5.977z"
        fill="#EA4335"
      />
    </svg>
  );
}

function humanizeAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'This account has not been confirmed yet. Ask your admin.';
  }
  if (lower.includes('signups not allowed') || lower.includes('signup is disabled')) {
    return 'Public sign-ups are disabled. Ask your admin for an invite.';
  }
  if (lower.includes('rate limit')) {
    return 'Too many attempts — try again in a minute.';
  }
  return msg;
}

export default LoginScreen;
