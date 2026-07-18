import React, { useState } from 'react';
import { FiCopy, FiCheck, FiPhoneCall } from 'react-icons/fi';
import { useGetUsersQuery, useGenerateResetLinkMutation } from '../store/api/adminApiSlice';

function ResetLinkModal({ user, onClose }) {
  const [generateResetLink, { isLoading }] = useGenerateResetLinkMutation();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setError('');
    try {
      const data = await generateResetLink(user.id).unwrap();
      setResult(data);
    } catch (err) {
      setError(err?.data?.message || 'Failed to generate reset link');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 w-full max-w-lg">
        <h3 className="text-lg font-bold text-[#1a1f36]">Reset password for {user.name}</h3>
        <p className="text-sm text-slate-400 mt-1">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>

        {!result && (
          <div className="mt-5">
            <p className="text-sm text-slate-500 mb-4">
              Generate a one-hour reset link, then call the user and read it out to them.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1f36] hover:bg-[#242a45] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <FiPhoneCall size={15} />
              {isLoading ? 'Generating...' : 'Generate Reset Link'}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-5">
            <p className="text-sm text-slate-500 mb-2">
              Valid until {new Date(result.expiresAt).toLocaleTimeString()}. Read this link to the user over the phone, or copy it to share another way.
            </p>
            <div className="flex items-stretch gap-2">
              <input
                readOnly
                value={result.resetLink}
                className="flex-1 text-sm px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-4 rounded-xl bg-[#2e4ed2] hover:bg-[#2740b0] text-white flex items-center gap-1.5 text-sm font-semibold"
              >
                {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading, isError } = useGetUsersQuery();
  const [selectedUser, setSelectedUser] = useState(null);

  const users = data?.users || [];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a1f36]">Platform Users</h1>
        <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
          Log out
        </button>
      </header>

      <main className="p-6">
        {isLoading && <p className="text-slate-500">Loading users...</p>}
        {isError && <p className="text-red-600">Failed to load users.</p>}

        {!isLoading && !isError && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-[#1a1f36]">{user.name}</td>
                    <td className="px-5 py-3 text-slate-600">{user.email}</td>
                    <td className="px-5 py-3 text-slate-600">{user.phone || '—'}</td>
                    <td className="px-5 py-3 text-slate-600 capitalize">{user.plan}</td>
                    <td className="px-5 py-3">
                      {user.hasPendingReset ? (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          Reset requested
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-sm font-semibold text-[#2e4ed2] hover:underline"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedUser && (
        <ResetLinkModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

export default AdminDashboard;
