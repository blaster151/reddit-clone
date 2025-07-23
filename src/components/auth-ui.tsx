import { useState } from 'react';

interface AuthUIProps {
  onLogin?: (username: string, password: string) => void;
  onRegister?: (username: string, email: string, password: string) => void;
}

export function AuthUI({ onLogin, onRegister }: AuthUIProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username || !password || (mode === 'register' && !email)) {
      setError('All fields are required');
      return;
    }
    if (mode === 'login') {
      onLogin?.(username, password);
    } else {
      onRegister?.(username, email, password);
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white border border-gray-200 rounded-lg p-6 mt-8">
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 rounded-l ${mode === 'login' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={`px-4 py-2 rounded-r ${mode === 'register' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            type="password"
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
          type="submit"
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
} 