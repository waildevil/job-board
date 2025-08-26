import React, { useState } from 'react';

export default function SetPasswordCard({ onDone, className = '' }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const token = localStorage.getItem('token');
  const canSave = p1 && p2 && p1 === p2 && p1.length >= 8;

  const submit = async () => {
    if (!canSave || !token) return;
    setSaving(true); setMsg(null); setErr(null);
    try {
      const res = await fetch('http://localhost:8080/api/users/me/set-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: p1 }),
      });
      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json')
        ? await res.json().catch(() => ({}))
        : await res.text().catch(() => '');

      if (!res.ok) {
        const serverMsg =
          (typeof payload === 'string' ? payload : (payload?.error || payload?.message)) ||
          res.statusText || 'Failed to set password';
        throw new Error(serverMsg);
      }

      setMsg('Password set — you can now log in with email/password too.');
      setP1(''); setP2('');
      setTimeout(() => { setMsg(null); onDone?.(); }, 1400);
    } catch (e) {
      setErr(e.message || 'Error setting password');
      setTimeout(() => setErr(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-4 bg-white space-y-3 ${className}`}>
      <div className="text-sm text-gray-700 font-medium">Set a password (optional)</div>

      {msg && <div className="text-sm rounded-md border border-green-200 bg-green-50 px-3 py-2">{msg}</div>}
      {err && <div className="text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2">{err}</div>}

      <div className="relative">
        <input
          type={show1 ? 'text' : 'password'}
          className="w-full border rounded-lg px-3 py-2 pr-10"
          placeholder="New password (min 8)"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow1(v => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show1 ? eyeOff() : eye()}
        </button>
      </div>

      <div className="relative">
        <input
          type={show2 ? 'text' : 'password'}
          className="w-full border rounded-lg px-3 py-2 pr-10"
          placeholder="Confirm password"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow2(v => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show2 ? eyeOff() : eye()}
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={!canSave || saving}
          className="px-4 py-2 rounded-lg border disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Set Password'}
        </button>
      </div>
    </div>
  );
}


function eye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth="1.5" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
      <circle cx="12" cy="12" r="2.25" strokeWidth="1.5" />
    </svg>
  );
}
function eyeOff() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth="1.5" d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .523-.13 1.015-.36 1.445M6.71 6.71C4.512 8.01 3 12 3 12s3.75 6.75 9.75 6.75c1.522 0 2.927-.37 4.17-.997M12 15a3 3 0 01-3-3" />
    </svg>
  );
}
