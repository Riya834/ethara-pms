import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'team_leader', label: 'Team Leader' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'team_member', label: 'Team Member' },
  { value: 'hr', label: 'HR' },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'team_member' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const strengthLevel = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length >= 4 ? 1 : 0;
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-400'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        const errs = {};
        err.response.data.errors.forEach(e => { errs[e.field] = e.message; });
        setErrors(errs);
      } else {
        toast.error(err.response?.data?.message || 'Registration failed');
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
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black mb-6">
            <span className="text-white font-black text-xl">TM</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-black leading-tight">
            Create your<br />account
          </h1>
          <p className="mt-3 text-base text-neutral-500">
            Join and start managing projects
          </p>
        </div>

        {/* Form — no card wrapper */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Full Name */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Alex Morgan"
              className={inputClass('name')}
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="alex@company.com"
              className={inputClass('email')}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
              Role
            </label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full h-13 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 text-base text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 focus:bg-white transition-all duration-200"
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
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
            {form.password && (
              <div className="mt-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-neutral-200'}`}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-neutral-500">{strengthLabels[strengthLevel]} password</p>
              </div>
            )}
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
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <p className="text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;