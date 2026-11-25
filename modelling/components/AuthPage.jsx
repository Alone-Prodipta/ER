import { useState } from 'react';

export default function AuthPage({ onAuthenticate, error, onRetry }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isRegistering = mode === 'register';

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (isRegistering && password.length !== 5) {
      setFormError('Password must be exactly 5 characters.');
      return;
    }
    if (isRegistering && password !== confirmPassword) {
      setFormError('The passwords do not match.');
      return;
    }
    setSubmitting(true);
    const result = await onAuthenticate(mode, { email, password });
    if (!result?.success) setFormError(result?.error || 'Could not sign in. Please try again.');
    setSubmitting(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl md:grid-cols-2">
        <section className="flex flex-col justify-between bg-linear-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 md:p-12">
          <div>
            <div className="mb-12 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl text-indigo-300">◇</span>
              <span className="text-lg font-semibold tracking-wide">ER Modeller</span>
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Design with clarity</p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight md:text-5xl">Plan your data before you build it.</h1>
            <p className="mt-5 max-w-md leading-7 text-slate-300">Create, connect, and revisit database schemas in a visual workspace. Your diagrams are private to your account.</p>
          </div>
          <p className="mt-12 text-xs text-slate-500">Your work is saved to your account and separated from other users.</p>
        </section>

        <section className="p-8 md:p-12">
          <div className="mb-8">
            <p className="text-sm font-medium text-indigo-300">Welcome</p>
            <h2 className="mt-2 text-3xl font-bold">{isRegistering ? 'Create your account' : 'Sign in to continue'}</h2>
            <p className="mt-2 text-sm text-slate-400">{isRegistering ? 'Create an account to keep your diagrams private.' : 'Your diagrams will be waiting where you left them.'}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-800 p-1">
            <button type="button" onClick={() => { setMode('login'); setFormError(''); }} className={`rounded-md py-2 text-sm font-semibold transition ${!isRegistering ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Log in</button>
            <button type="button" onClick={() => { setMode('register'); setFormError(''); }} className={`rounded-md py-2 text-sm font-semibold transition ${isRegistering ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Create account</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-200">
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Password
              <input
                required
                type="password"
                minLength={isRegistering ? 5 : 1}
                maxLength={5}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                placeholder={isRegistering ? 'At least 5 characters' : 'Enter your password'}
              />
            </label>
            {isRegistering && (
              <label className="block text-sm font-medium text-slate-200">
                Confirm password
                <input
                  required
                  type="password"
                  minLength={5}
                  maxLength={5}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                  placeholder="Enter the password again"
                />
              </label>
            )}

            {(formError || error) && <p role="alert" className="rounded-lg border border-red-900/70 bg-red-950/40 px-3 py-2 text-sm text-red-300">{formError || error}</p>}
            <button disabled={submitting} type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60">
              {submitting ? 'Please wait…' : isRegistering ? 'Create account' : 'Log in'}
            </button>
          </form>
          {onRetry && <button type="button" onClick={onRetry} className="mt-5 text-sm text-indigo-300 underline-offset-4 hover:underline">Retry connection</button>}
          <p className="mt-6 text-xs leading-5 text-slate-500">Passwords are stored as salted hashes. Your diagrams are accessible only to the account that owns them.</p>
        </section>
      </div>
    </main>
  );
}
