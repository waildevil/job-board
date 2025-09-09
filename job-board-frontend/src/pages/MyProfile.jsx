import React, { useEffect, useMemo, useState } from 'react';
import AddressInput from './AddressInput';
import { API_URL } from '../services/config';

export default function MyProfile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [temp, setTemp] = useState({ name: '', phoneNumber: '', address: '' });
  const [msg, setMsg] = useState(null);
  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user profile');
        const data = await res.json();
        setMe(data);
        setTemp({
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const notify = (t) => {
    setMsg(t);
    setTimeout(() => setMsg(null), 2000);
  };

  const saveField = async (field) => {
    if (!me) return;
    let url = '';
    let body = {};
    if (field === 'name') {
      url = '/users/me/name';
      body = { name: temp.name.trim() };
    }
    if (field === 'phone') {
      url = '/users/me/phone';
      body = { phoneNumber: temp.phoneNumber.trim() };
    }
    if (field === 'address') {
      url = '/users/me/address';
      body = { address: temp.address.trim() };
    }

    try {
      const res = await fetch(`${API_URL}${url}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await extractErr(res);
      const updated = await res.json();
      setMe(updated);
      setEditing(null);
      notify('Saved');
    } catch (e) {
      alert(e.message || 'Update failed');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!me) return <p className="p-6 text-red-500">Failed to load profile.</p>;


  const isLocalUser = me.provider?.toUpperCase() === 'LOCAL';

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 py-16 px-4 flex justify-center">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-3xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">👤 My Profile</h2>
        {msg && <div className="rounded-md border p-3 text-sm">{msg}</div>}

        <DisplayRow label="Email" value={me.email} />
        <DisplayRow label="Role" value={me.role} />

        <EditableRow
          label="Full Name"
          value={me.name || '—'}
          isEditing={editing === 'name'}
          onEdit={() => {
            setEditing('name');
            setTemp((t) => ({ ...t, name: me.name || '' }));
          }}
          onCancel={() => setEditing(null)}
          onSave={() => saveField('name')}
        >
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={temp.name}
            onChange={(e) => setTemp((t) => ({ ...t, name: e.target.value }))}
            placeholder="Your full name"
          />
        </EditableRow>

        <EditableRow
          label="Phone"
          value={me.phoneNumber || 'Not provided'}
          isEditing={editing === 'phone'}
          onEdit={() => {
            setEditing('phone');
            setTemp((t) => ({ ...t, phoneNumber: me.phoneNumber || '' }));
          }}
          onCancel={() => setEditing(null)}
          onSave={() => saveField('phone')}
        >
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={temp.phoneNumber}
            onChange={(e) => setTemp((t) => ({ ...t, phoneNumber: e.target.value }))}
            placeholder="+49 15123456789"
          />
        </EditableRow>

        <EditableRow
          label="Address"
          value={me.address || 'Not provided'}
          isEditing={editing === 'address'}
          onEdit={() => {
            setEditing('address');
            setTemp((t) => ({ ...t, address: me.address || '' }));
          }}
          onCancel={() => setEditing(null)}
          onSave={() => saveField('address')}
        >
          <AddressInput
            initialValue={temp.address}
            onSelect={(addr) => setTemp((t) => ({ ...t, address: addr }))}
          />
        </EditableRow>


        {isLocalUser ? (
          <PasswordBlock token={token} notify={notify} />
        ) : (
          <div className="text-sm text-gray-500 border-t pt-4">
            🔒 Password change is disabled for Google sign-in accounts.
          </div>
        )}
      </div>
    </div>
  );
}


function DisplayRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-right break-words">{value}</span>
    </div>
  );
}

function EditableRow({ label, value, isEditing, onEdit, onCancel, onSave, children }) {
  return (
    <div className="border-b pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm text-gray-600">{label}</div>
          {!isEditing ? (
            <div className="font-medium text-sm mt-0.5 break-words">{value}</div>
          ) : (
            <div className="mt-2">{children}</div>
          )}
        </div>
        {!isEditing ? (
          <button onClick={onEdit} className="p-2 rounded-lg border hover:bg-gray-50">
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={onCancel} className="p-2 rounded-lg border hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={onSave} className="p-2 rounded-lg border hover:bg-gray-50">
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function PasswordBlock({ token, notify }) {
  const [oldPassword, setOld] = useState('');
  const [nw, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const canSave = oldPassword && nw && confirm && nw === confirm && nw.length >= 8;

  const changePassword = async () => {
    if (!canSave) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/users/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword: nw }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || payload?.message || 'Failed to change password');

      setMsg('Password changed successfully');
      notify?.('Password changed');
      setOld('');
      setNew('');
      setConfirm('');
      setTimeout(() => setMsg(null), 2500);
    } catch (e) {
      setErr(e.message || 'Failed to change password');
      setTimeout(() => setErr(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-4 border-t">
      <div className="text-sm text-gray-600 mb-2">Change Password</div>
      {msg && <div className="mb-2 text-sm border border-green-200 bg-green-50 px-3 py-2">{msg}</div>}
      {err && <div className="mb-2 text-sm border border-red-200 bg-red-50 px-3 py-2">{err}</div>}

      <PasswordInput label="Current password" value={oldPassword} onChange={setOld} />
      <PasswordInput label="New password (min 8)" value={nw} onChange={setNew} />
      <PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} />

      <div className="flex justify-end mt-3">
        <button
          onClick={changePassword}
          disabled={!canSave || saving}
          className="px-4 py-2 rounded-lg border bg-blue-600 text-white disabled:opacity-50"
        >
          {saving ? 'Changing…' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}


function PasswordInput({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mt-2">
      <input
        type={visible ? 'text' : 'password'}
        placeholder={label}
        className="w-full border rounded-lg px-3 py-2 pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth="1.5" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 
      6.75-9.75 6.75S2.25 12 2.25 12z" />
      <circle cx="12" cy="12" r="2.25" strokeWidth="1.5" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth="1.5" d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.657 
      0 3 1.343 3 3 0 .523-.13 1.015-.36 1.445M6.71 
      6.71C4.512 8.01 3 12 3 12s3.75 6.75 9.75 
      6.75c1.522 0 2.927-.37 4.17-.997M12 15a3 3 
      0 01-3-3" />
    </svg>
  );
}

async function extractErr(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await res.json().catch(() => ({}));
    return new Error(data.error || data.message || res.statusText || `HTTP ${res.status}`);
  }
  const text = await res.text().catch(() => '');
  return new Error(text || res.statusText || `HTTP ${res.status}`);
}
