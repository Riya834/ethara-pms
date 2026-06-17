import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUser, updatePassword } from '../../api/user.api';
import { Loader2, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const roleLabels = {
  team_leader: 'Team Leader',
  project_manager: 'Project Manager',
  team_member: 'Team Member',
  hr: 'HR',
};

const SettingsPage = () => {
  const { user, updateUser: updateCtxUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', department: user?.department || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUser(user._id, profile);
      updateCtxUser?.({ name: res.data.data?.name, department: res.data.data?.department });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await updatePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password updated!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'password', label: 'Password' },
    { key: 'notifications', label: 'Notifications' },
  ];

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors';
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-black tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your profile and account security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab list */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 p-1 bg-white border border-gray-200 rounded-xl">
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-1 lg:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === key ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-base font-bold text-black mb-6">Personal Information</h2>

              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center text-white text-2xl font-black">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-bold text-black">{user?.name}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                      {roleLabels[user?.role]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="text" value={user?.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Department</label>
                  <input type="text" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })}
                    placeholder="e.g. Engineering" className={inputClass} />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-base font-bold text-black mb-6">Change Password</h2>
              <form onSubmit={handlePasswordSave} className="space-y-5 max-w-sm">
                {[
                  { key: 'currentPassword', label: 'Current Password' },
                  { key: 'newPassword', label: 'New Password' },
                  { key: 'confirmPassword', label: 'Confirm New Password' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <input type="password" value={passwords[key]}
                      onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                      placeholder="••••••••" className={inputClass} />
                  </div>
                ))}
                <div className="pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-base font-bold text-black mb-6">Notification Preferences</h2>
              <div className="space-y-1">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive project updates via email' },
                  { key: 'inapp', label: 'In-App Notifications', desc: 'Real-time alerts within the dashboard' },
                  { key: 'tasks', label: 'Task Assignments', desc: 'Notify when new tasks are assigned to you' },
                  { key: 'overdue', label: 'Overdue Reminders', desc: 'Alerts for tasks past their deadline' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-4 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-black">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <div className="w-10 h-5 bg-black rounded-full relative cursor-pointer flex-shrink-0">
                      <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 right-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;