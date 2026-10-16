import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Scale, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
            <Scale size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">TaxCode Insight</h1>
          <p className="text-sm text-slate-400">AI-Powered Audit & Compliance Orchestrator</p>
        </div>

        <div className="card">
          <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-white">Sign in</h2>
          <p className="mb-6 text-sm text-slate-400">Access your compliance dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                placeholder="you@firm.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
