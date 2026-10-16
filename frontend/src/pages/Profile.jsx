import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserCircle, Loader2 } from 'lucide-react';
import { updateMeApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    organization: user?.organization || '',
    designation: user?.designation || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateMeApi(form);
      updateUser(data.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-400">Manage your personal and professional information.</p>
      </div>

      <div className="card space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="badge mt-1 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 capitalize">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <div>
            <label className="label flex items-center gap-2">
              <UserCircle size={15} /> Full Name
            </label>
            <input className="input-field" name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Organization</label>
            <input className="input-field" name="organization" value={form.organization} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Designation</label>
            <input className="input-field" name="designation" value={form.designation} onChange={handleChange} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
