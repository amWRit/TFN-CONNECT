import { useState } from 'react';

export default function AdminRecoveryPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  type ResultType = { success: boolean; restored?: string; error?: string } | null;
  const [result, setResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch('/api/admin-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Recovery</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Super Admin Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Recovery Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Restoring...' : 'Restore Admin'}
        </button>
      </form>
      {result && (
        <div className="mt-4">
          {result.success ? (
            <div className="text-green-600">Restored: {result.restored}</div>
          ) : (
            <div className="text-red-600">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
