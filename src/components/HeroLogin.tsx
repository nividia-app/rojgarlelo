import React, { useState } from 'react';
import { Shield, Mail, Lock, User, CheckCircle2, ChevronRight, AlertCircle, Building2, UserCheck, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

export default function HeroLogin({ onLoginSuccess, setError, setSuccess }: HeroLoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'super_admin' | 'recruiter' | 'hr' | 'candidate'>('candidate');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [otpDebugCode, setOtpDebugCode] = useState('');

  // One-Click Demo loggers
  const demoLogins = [
    {
      title: "Super Admin Workspace",
      email: "admin@example.com",
      password: "admin123",
      tag: "Platform Controller",
      desc: "Comprehensive multi-company management, audit analytics & full administrative bypass.",
      icon: Shield,
      color: "border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
    },
    {
      title: "Corporate Recruiter",
      email: "recruiter@example.com",
      password: "recruiter123",
      tag: "Apex Tech Labs",
      desc: "Manages vacancy rosters, uploads screenshots/flyers for Gemini AI extractions and processes candidates.",
      icon: UserCheck,
      color: "border-sky-500/30 text-sky-500 hover:bg-sky-500/10"
    },
    {
      title: "HR Workspace",
      email: "hr@company.com",
      password: "hr123",
      tag: "Nebula Systems",
      desc: "Maintains organization profiles, team allocations, schedules interview assessments and handles hires.",
      icon: Building2,
      color: "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
    },
    {
      title: "Jobseeker Candidate",
      email: "candidate@example.com",
      password: "candidate123",
      tag: "Rohan Patel",
      desc: "Applies online, manages profile documents (Aadhaar/PAN), tracks evaluation stages and meets interviewers.",
      icon: User,
      color: "border-violet-500/30 text-violet-500 hover:bg-violet-500/10"
    }
  ];

  const handleDemoSignIn = async (demo: typeof demoLogins[0]) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demo.email, password: demo.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setSuccess(`Signed into ${demo.title} as ${data.user.name}`);
      onLoginSuccess(data.user, data.token);
    } catch (e: any) {
      setError(e.message || 'Authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in check credentials.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login credentials incorrect.');
      
      setSuccess(`Authenticated as ${data.user.name}`);
      onLoginSuccess(data.user, data.token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please populate all registering credentials.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setSuccess(`Account registered! Verification code dispatched.`);
      setOtpSentEmail(email);
      if (data.otpDebug) {
        setOtpDebugCode(data.otpDebug);
      }
      
      // Store session, then show Verify tab
      localStorage.setItem('rec_jwt_token', data.token);
      setActiveTab('verify');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please provide the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('rec_jwt_token');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failure');
      
      setSuccess('Account verified successfully!');
      
      // Reload session
      const sessRes = await fetch('/api/auth/session', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sessData = await sessRes.json();
      if (sessRes.ok) {
        onLoginSuccess(sessData.user, token || '');
      } else {
        setActiveTab('login');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Specify registered email.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification search failed');
      
      setSuccess('Password security verification OTP dispatched.');
      setOtpSentEmail(email);
      if (data.otpDebug) {
        setOtpDebugCode(data.otpDebug);
      }
      setActiveTab('verify');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) {
      setError('Fill reset fields including OTP security passcode.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      
      setSuccess(data.message || 'Credentials re-secured. Please Login.');
      setActiveTab('login');
      setPassword('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="hero_auth_container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[calc(100vh-10rem)]">
      
      {/* Intro branding & Demo panel */}
      <div id="hero_brand_panel" className="lg:col-span-7 flex flex-col justify-between pr-0 lg:pr-4">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            Empowered with Gemini 3.5 AI Extraction System
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 leading-[1.1]">
            Automated Talent Pipeline <span className="text-zinc-500 font-medium font-serif leading-none italic block mt-1">Multi-Company Scale</span>
          </h1>
          
          <p className="text-zinc-600 leading-relaxed max-w-xl text-sm sm:text-base">
            Upload PDF flyer documents, printed flyers, hand-written job posters or candidate resumes. Our deep AI parsing models instantly OCR and structure metadata tags, creating seamless live profiles instantly.
          </p>
        </div>

        {/* Dynamic Role Demo Portals */}
        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              One-Click Professional Evaluator Demo Logins
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Instant Access</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoLogins.map((demo) => {
              const IconComp = demo.icon;
              return (
                <button
                  key={demo.title}
                  id={`demo_btn_${demo.email.split('@')[0]}`}
                  type="button"
                  onClick={() => handleDemoSignIn(demo)}
                  disabled={loading}
                  className={`flex flex-col items-start gap-1 p-3 text-left border rounded-xl transition duration-200 cursor-pointer w-full bg-white hover:shadow-sm ${demo.color}`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-tight text-zinc-900">
                    <IconComp className="w-4 h-4 text-inherit" />
                    <span>{demo.title}</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1 py-0.5 rounded">
                    {demo.tag} • {demo.email}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal line-clamp-2 mt-1">
                    {demo.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form authentication panel */}
      <div id="auth_interactive_frame" className="lg:col-span-5 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          {/* Subtle design header */}
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                {activeTab === 'login' && 'Sign In'}
                {activeTab === 'register' && 'Register Workspace'}
                {activeTab === 'forgot' && 'Reset Credential Setup'}
                {activeTab === 'verify' && 'Verification Central'}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {activeTab === 'login' && 'Access candidate rosters and AI extractors.'}
                {activeTab === 'register' && 'Create your company or candidate profile.'}
                {activeTab === 'forgot' && 'An entry OTP will be sent code-panel.'}
                {activeTab === 'verify' && 'Input the verification authorization OTP.'}
              </p>
            </div>
          </div>

          {/* Form Content */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} id="login_form" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Email Coordinates</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="login_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="pl-10 pr-4 py-2.5 w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">Access PIN Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-xs text-zinc-500 hover:text-zinc-950 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="login_password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="🔑 Input Code"
                    className="pl-10 pr-4 py-2.5 w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                  />
                </div>
              </div>

              <button
                id="login_submit_btn"
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Validating Registry...' : 'Sign In To Workspace'}
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-zinc-400">New seeker or HR client? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs text-zinc-900 hover:underline font-bold"
                >
                  Create An Account
                </button>
              </div>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} id="register_form" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="register_name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Varun Patel"
                    className="pl-10 pr-4 py-2.5 w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Professional Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="register_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="talent@apextech.com"
                    className="pl-10 pr-4 py-2.5 w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Workspace Authorization Role</label>
                <select
                  id="register_role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="px-3 py-2.5 w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 transition font-medium text-zinc-800"
                >
                  <option value="candidate">💼 Candidate Seeker (Apply & Track)</option>
                  <option value="recruiter">⚡ Recruiter Specialist (AI Postings & Sourcing)</option>
                  <option value="hr">🏢 HR Manager (Corporate Teams & Interviews)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Set Account Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="register_password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="🎨 Secure Keyphrase"
                    className="pl-10 pr-4 py-2.5 w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                  />
                </div>
              </div>

              <button
                id="register_submit_btn"
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Creating workspace...' : 'Establish Secure Profile'}
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-zinc-400">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs text-zinc-900 hover:underline font-bold"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {activeTab === 'forgot' && (
            <form onSubmit={handleRequestForgot} id="forgot_form" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">Account Coordinates</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="forgot_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enter-registered@email.com"
                    className="pl-10 pr-4 py-2.5 w-full bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                  />
                </div>
              </div>

              <button
                id="forgot_submit_btn"
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Generating Verification...' : 'Dispatch Verification Code'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-zinc-600 hover:text-zinc-900 underline font-semibold"
                >
                  Return to Login
                </button>
              </div>
            </form>
          )}

          {activeTab === 'verify' && (
            <div className="space-y-6">
              
              {otpDebugCode && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    Preview Environment OTP Bypass code:
                  </div>
                  <p className="font-mono text-sm bg-white px-2 py-1 border border-amber-100 rounded inline-block">
                    {otpDebugCode}
                  </p>
                  <p className="text-[10px] text-amber-600 leading-normal">
                    This simulator code represents the verification code sent in normal OTP notifications. You can also utilize <b>111222</b> as universal bypass code.
                  </p>
                </div>
              )}

              {/* Form to submit OTP key OR change password */}
              <form onSubmit={newPassword ? handleResetPassword : handleVerifyOtp} id="otp_submission_form" className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    Enter Verification OTP
                  </label>
                  <input
                    id="otp_input"
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit key (e.g. 111222)"
                    className="px-4 py-3 text-center tracking-[0.5em] font-mono text-xl w-full bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 leading-normal text-center">
                    Enter OTP generated dynamically. (Demo simulation code: <b className="text-zinc-700">111222</b> is authorized for fast testing)
                  </p>
                </div>

                {otpSentEmail && (
                  <div className="text-xs text-center text-zinc-500">
                    Dispatched to: <b className="text-zinc-700">{otpSentEmail}</b>
                  </div>
                )}

                {/* Password reset input check */}
                {activeTab === 'verify' && (email || otpSentEmail) && (
                  <div className="pt-2 border-t border-zinc-100">
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                      Set New Password (if resetting)
                    </label>
                    <input
                      id="reset_new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Optional new password parameter"
                      className="px-4 py-2 w-full bg-zinc-50 border border-zinc-200 text-amber-950 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-800 transition"
                    />
                  </div>
                )}

                <button
                  id="otp_submit_btn"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Processing Validation...' : newPassword ? 'Apply New Password' : 'Verify Registry'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setNewPassword('');
                      setOtp('');
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Go Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
