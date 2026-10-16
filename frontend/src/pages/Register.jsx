import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Scale, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
            <Scale size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">TaxCode Insight</h1>
          <p className="text-sm text-slate-400">AI-Powered Audit & Compliance Orchestrator</p>
        </div>

        <div className="card">
          <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-white">Create your account</h2>
          <p className="mb-6 text-sm text-slate-400">Start automating regulatory research & audits</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" name="name" required className="input-field" placeholder="Jane Doe" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" name="email" required className="input-field" placeholder="you@firm.com" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Organization (optional)</label>
              <input type="text" name="organization" className="input-field" placeholder="Doe & Associates" value={form.organization} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" required minLength={6} className="input-field" placeholder="At least 6 characters" value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
