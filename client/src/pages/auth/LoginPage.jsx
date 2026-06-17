import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.errors) {
        const errs = {};
        err.response.data.errors.forEach(e => { errs[e.field] = e.message; });
        setErrors(errs);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const baseInput =
    'w-full h-13 rounded-2xl border bg-neutral-50 px-5 text-base text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 focus:bg-white transition-all duration-200';
  const inputClass = (field) => `${baseInput} ${errors[field] ? 'border-red-400' : 'border-neutral-200'}`;

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* Logo + Title */}
        <div className="mb-20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black mb-6">
            <span className="text-white font-black text-xl">TM</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-black leading-tight">
            Welcome<br />back
          </h1>
          <p className="mt-3 mb-9 text-base text-neutral-500">
            Sign in to continue managing your projects
          </p>
        </div>

        {/* Form — no card wrapper */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-xs mb-7 font-bold tracking-[0.15em] uppercase text-neutral-500">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              className={inputClass('email')}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between gap-6 mb-8">
              <label className="text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-neutral-400 hover:text-black transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className={`${inputClass('password')} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-black text-white font-semibold text-base hover:bg-neutral-900 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : 'Sign In'}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <p className="text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-black hover:underline">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;