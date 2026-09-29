import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('lead@inspectron.io');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('senior_qa');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      if (onLoginSuccess) onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Inspectron</h2>
          <p className="text-xs text-slate-400">Autonomous AI QA & Quality Engineering Platform</p>
        </div>

        {/* Demo Quick Logins */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            One-Click Demo Personas
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('lead@inspectron.io')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-brand-600/30 hover:border-brand-500 border border-slate-700 text-left transition-colors"
            >
              <div className="font-bold text-white leading-tight">Sarah Jenkins</div>
              <div className="text-[10px] text-brand-300">QA Lead / Architect</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('qa@inspectron.io')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-brand-600/30 hover:border-brand-500 border border-slate-700 text-left transition-colors"
            >
              <div className="font-bold text-white leading-tight">David Chen</div>
              <div className="text-[10px] text-emerald-300">Senior SDET</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@domain.com"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">QA Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 font-semibold"
              >
                <option value="qa_lead">QA Lead (Full Access)</option>
                <option value="senior_qa">Senior QA / SDET</option>
                <option value="qa_engineer">QA Engineer</option>
                <option value="viewer">Viewer (Read Only)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create QA Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            {isRegister ? 'Already registered? Sign in here' : "Need an account? Register new QA user"}
          </button>
        </div>
      </div>
    </div>
  );
}
