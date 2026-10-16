import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center dark:bg-slate-950">
    <h1 className="text-6xl font-bold text-brand-600">404</h1>
    <p className="text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
  </div>
);

export default NotFound;
