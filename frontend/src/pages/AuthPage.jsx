import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const API = import.meta.env.VITE_API_URL

// STEP TYPES
const STEP = {
  CHOOSE:       'choose',
  SIGNIN_FORM:  'signin_form',
  SIGNUP_FORM:  'signup_form',
  OTP:          'otp',
}

const FloatingBg = () => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-black via-[#0f172a] to-black">
    {/* Subtle dark blurred circles and soft white/gray radial glows */}
    <div className="absolute left-1/3 top-[12%] w-[350px] h-[350px] rounded-full bg-white/10 blur-[120px] filter animate-float-slow hidden md:block" />
    <div className="absolute left-8 bottom-0 w-[320px] h-[210px] rounded-full bg-white/7 blur-[90px] filter animate-float2 hidden lg:block" />
    <div className="absolute right-1/5 bottom-10 w-[300px] h-[160px] rounded-full bg-gray-300/6 blur-[80px] filter animate-float hidden md:block" />
    <div className="absolute right-10 top-1/4 w-[130px] h-[130px] rounded-full bg-white/9 blur-3xl filter animate-float3 hidden md:block" />
    {/* Soft white vignette center */}
    <div
      className="absolute inset-0 pointer-events-none opacity-25"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.14) 0%, transparent 70%)"
      }}
    />
    {/* Subtle grid lines */}
    <div className="absolute inset-0 mix-blend-overlay pointer-events-none opacity-10"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
)

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 rounded-2xl bg-white/10 shadow-md backdrop-blur-md border border-white/15 text-white flex items-center justify-center text-2xl font-bold">
      C
    </div>
    <span className="font-black text-xl text-white tracking-tight drop-shadow">CivicPulse</span>
  </div>
)

const AuthTabs = ({ isLogin, setIsLogin, setStep }) => (
  <div className="flex justify-center mb-9 select-none">
    <button
      onClick={() => {
        setIsLogin(false)
        setStep(STEP.SIGNUP_FORM)
      }}
      className={`
        px-6 py-2 rounded-xl font-semibold text-base
        transition-all duration-300
        ${!isLogin
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md scale-105'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }`
      }
    >
      Register
    </button>
    <button
      onClick={() => {
        setIsLogin(true)
        setStep(STEP.SIGNIN_FORM)
      }}
      className={`
        px-6 py-2 rounded-xl font-semibold text-base ml-2
        transition-all duration-300
        ${isLogin
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md scale-105'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }`
      }
    >
      Login
    </button>
  </div>
);

const InputWrap = ({ label, icon, children }) => (
  <div className="w-full">
    <label className="block text-base font-semibold mb-1 text-gray-300 pl-1">{label}</label>
    <div className="relative flex items-center">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">{icon}</span>
      {children}
    </div>
  </div>
);

const ModernInput = ({
  icon,
  className = '',
  ...rest
}) => (
  <input
    className={`
      w-full py-3 pl-11 pr-4 bg-white/5 text-white border border-white/10 rounded-xl
      transition-all duration-300 placeholder:text-gray-500 font-medium
      focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/20 focus:bg-white/10
      shadow-[0_2px_16px_0_rgba(0,0,0,0.12)]
      ${className}
    `}
    {...rest}
  />
);

const ModernPasswordInput = ({
  value, onChange, onIconClick, show, onEnter, placeholder = '', className = ''
}) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400">
      <svg width="22" height="22" viewBox="0 0 24 24" className="inline" fill="none"><path d="M2 12C2 12 5.6 5 12 5s10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7"/></svg>
    </span>
    <input
      className={`
        w-full py-3 pl-11 pr-12 bg-white/5 text-white border border-white/10 rounded-xl
        transition-all duration-300 placeholder:text-gray-500 font-medium
        focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/20 focus:bg-white/10
        shadow-[0_2px_16px_0_rgba(0,0,0,0.12)]
        ${className}
      `}
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={e => e.key === 'Enter' && onEnter()}
      autoComplete="current-password"
    />
    <button
      type="button"
      onClick={onIconClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400 hover:text-gray-100 focus:outline-none"
      tabIndex={-1}
    >
      {show ? '🙈' : '👁️'}
    </button>
  </div>
);

export default function AuthPage() {
  const navigate        = useNavigate()
  const { login }       = useAuth()
  const toast           = useToast()

  const [step, setStep]           = useState(STEP.CHOOSE)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [devOtp, setDevOtp]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [isLogin, setIsLogin]     = useState(false)

  // OTP input refs
  const otpRefs = Array.from({ length: 6 }, () => React.createRef())

  const handleOtpChange = (val, i) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs[i + 1].current?.focus()
    if (!val && i > 0) otpRefs[i - 1].current?.focus()
  }

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      otpRefs[5].current?.focus()
    }
  }

  // SIGN UP
  const handleSignup = async () => {
    if (!name.trim())     return toast('Please enter your name', 'error')
    if (!email.trim())    return toast('Please enter your email', 'error')
    if (password.length < 6) return toast('Password must be at least 6 characters', 'error')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/auth/register`, { name, email, password })
      setDevOtp(res.data.otp)
      setIsLogin(false)
      setStep(STEP.OTP)
      toast('OTP sent! Check below for your code.', 'info')
    } catch (err) {
      toast(err.response?.data?.error || 'Registration failed', 'error')
    } finally { setLoading(false) }
  }

  // SIGN IN
  const handleSignin = async () => {
    if (!email.trim())    return toast('Please enter your email', 'error')
    if (!password.trim()) return toast('Please enter your password', 'error')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password })
      setDevOtp(res.data.otp)
      setIsLogin(true)
      setStep(STEP.OTP)
      toast('OTP sent! Check below for your code.', 'info')
    } catch (err) {
      toast(err.response?.data?.error || 'Login failed', 'error')
    } finally { setLoading(false) }
  }

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('')
    if (otpString.length !== 6) return toast('Please enter the 6-digit OTP', 'error')
    setLoading(true)
    const endpoint = isLogin ? '/api/auth/verify-login-otp' : '/api/auth/verify-otp'
    try {
      const res = await axios.post(`${API}${endpoint}`, { email, otp: otpString })
      localStorage.setItem("userToken", res.data.token)
      login(res.data.token, res.data.user)
      toast(`Welcome${res.data.user.name ? ', ' + res.data.user.name : ''}! 🎉`, 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.response?.data?.error || 'Invalid OTP', 'error')
      setOtp(['', '', '', '', '', ''])
      otpRefs[0].current?.focus()
    } finally { setLoading(false) }
  }

  // CHOOSE SCREEN with Glassmorphic Card
  if (step === STEP.CHOOSE) return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <FloatingBg />
      <div className="absolute top-0 left-0 w-full p-7 flex justify-between items-center select-none z-10">
        <Logo />
        <button onClick={() => navigate("/")} className="text-sm text-gray-400 hover:text-white font-semibold transition-opacity duration-300 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-md">
          ← Back to Home
        </button>
      </div>

      <div className="flex flex-col justify-center items-center w-full min-h-screen z-20">
        {/* Animate slide-up/fade-in */}
        <div className="w-full max-w-lg mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] px-9 pt-10 pb-8 animate-auth-fade-in border border-white/10 relative">
          <div className="flex flex-col items-center">
            <Logo />
            <h1 className="mt-6 mb-1 text-3xl font-extrabold text-white tracking-tight text-center drop-shadow">
              Welcome to CivicPulse
            </h1>
            <p className="mb-7 text-base text-gray-400 text-center font-medium drop-shadow-[0_2px_2px_rgba(16,20,90,0.07)]">
              Join thousands of citizens making their city <span className="font-bold text-white/80">accountable</span>
            </p>
          </div>
          <AuthTabs isLogin={isLogin} setIsLogin={setIsLogin} setStep={setStep}/>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => { setStep(STEP.SIGNUP_FORM); setIsLogin(false); }}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 shadow-md hover:shadow-lg transition-all duration-300 focus:ring focus:ring-white/20"
            >
              🚀 Create an Account
            </button>
            <button
              onClick={() => { setStep(STEP.SIGNIN_FORM); setIsLogin(true); }}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-white/10 to-white/5 hover:bg-white/10 shadow-md border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              🔑 Sign In
            </button>
          </div>

          <div className="mt-7 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-center">
            <p className="text-xs text-gray-400">
              By continuing, you agree to our <span className="underline hover:text-white transition-colors">terms of service</span> and <span className="underline hover:text-white transition-colors">privacy policy</span>.
            </p>
          </div>
        </div>
        <div className="hidden xl:block mt-10 text-xs text-gray-400 shadow-none select-none">{`Rockverse Hackathon 2026 · AI Domain`}</div>
      </div>
    </div>
  )

  // SIGN UP & SIGN IN SCREEN (Unified, with Tabs)
  const AuthFormCard = (
    <div className="relative flex min-h-screen justify-center items-center w-full bg-[#0a0a0a]">
      <FloatingBg />
      <div className="absolute top-0 left-0 w-full p-7 flex justify-between items-center select-none z-10">
        <Logo />
        <button onClick={() => setStep(STEP.CHOOSE)} className="text-sm text-gray-400 hover:text-white font-semibold transition-opacity duration-300 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-md">
          ← Back
        </button>
      </div>
      <form className="max-w-lg w-full mx-auto px-9 py-12 bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-white/10 animate-auth-fade-in z-20"
        autoComplete="off"
        onSubmit={e => { e.preventDefault(); isLogin ? handleSignin() : handleSignup(); }}
      >
        <div className="text-center mb-6">
          <Logo />
        </div>
        <AuthTabs isLogin={isLogin} setIsLogin={setIsLogin} setStep={setStep}/>

        <div className="space-y-5 mb-2">
          {!isLogin && (
            <InputWrap label="Full Name" icon={
              <svg width="22" height="22" className="inline" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="8" r="4.3" stroke="currentColor" strokeWidth="1.4"/><path d="M3.1 18c.4-3.2 3.6-5.1 7.9-5.1s7.5 1.9 7.9 5.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            }>
              <ModernInput
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="off"
              />
            </InputWrap>
          )}

          <InputWrap label="Email Address" icon={
            <svg width="22" height="22" className="inline" fill="none" viewBox="0 0 22 22"><rect x="3.5" y="6.5" width="15" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M19 7.3l-7.8 5.5a2 2 0 0 1-2.4 0L1.9 7.2" stroke="currentColor" strokeWidth="1.4"/></svg>
          }>
            <ModernInput
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="on"
            />
          </InputWrap>

          <InputWrap label="Password" icon={<></>}>
            <ModernPasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              onIconClick={() => setShowPass(!showPass)}
              show={showPass}
              onEnter={isLogin ? handleSignin : handleSignup}
              placeholder={isLogin ? "Your password" : "Minimum 6 characters"}
            />
          </InputWrap>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`
            mt-2 block w-full py-4 rounded-2xl font-extrabold text-lg
            bg-gradient-to-r from-gray-800 to-gray-700
            hover:from-gray-700 hover:to-gray-600
            shadow-md hover:shadow-lg
            focus:ring-2 focus:ring-white/20
            transition-all duration-300 text-white
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
          `}>
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="spinner spinner-white" />
              {isLogin ? 'Signing in...' : 'Creating account...'}
            </span>
          ) : (
            isLogin ? '🔑 Send OTP & Continue' : '✉️ Send OTP & Continue'
          )}
        </button>
        <div className="mt-7 flex flex-col gap-2">
          {!isLogin ? (
            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button type="button"
                onClick={() => { setStep(STEP.SIGNIN_FORM); setIsLogin(true); }}
                className="font-semibold text-white hover:underline hover:text-gray-200 transition">
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button type="button"
                onClick={() => { setStep(STEP.SIGNUP_FORM); setIsLogin(false); }}
                className="font-semibold text-white hover:underline hover:text-gray-200 transition">
                Sign Up
              </button>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1 text-center">{isLogin ? "Sign in to your CivicPulse account" : "Report and track civic issues in your city"}</p>
        </div>
      </form>
    </div>
  );

  if (step === STEP.SIGNUP_FORM) return AuthFormCard;
  if (step === STEP.SIGNIN_FORM) return AuthFormCard;

  // OTP SCREEN
  if (step === STEP.OTP) return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <FloatingBg />
      <div className="absolute top-0 left-0 w-full p-7 flex justify-between items-center select-none z-10">
        <Logo />
        <button onClick={()=>{
          setStep(isLogin ? STEP.SIGNIN_FORM : STEP.SIGNUP_FORM);
          setOtp(['', '', '', '', '', '']);
        }} className="text-sm text-gray-400 hover:text-white font-semibold transition-opacity duration-300 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-md">
          ← Change Email
        </button>
      </div>
      <div className="flex flex-col items-center w-full min-h-screen z-20">
        <div className="w-full max-w-lg mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] px-9 py-12 animate-auth-fade-in border border-white/10 relative">
          <div className="flex justify-center mb-7">
            <span className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-gray-600/20 via-white/10 to-gray-800/10 rounded-2xl text-4xl border border-white/10 shadow-md">
              ✉️
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white text-center mb-2 drop-shadow">Verify Your Email</h2>
          <p className="text-gray-400 text-base text-center mb-1">Enter the 6-digit code sent to</p>
          <p className="font-bold text-white/80 text-center mb-7">{email}</p>

          {/* DEV MODE OTP DISPLAY */}
          {devOtp && (
            <div className="mb-8 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
              <span className="text-white/70 text-2xl">🔧</span>
              <div>
                <p className="text-xs font-bold text-white/70">Dev Mode — Your OTP:</p>
                <p className="text-lg font-extrabold text-white font-mono tracking-widest drop-shadow">
                  {devOtp}
                </p>
              </div>
              <button
                onClick={() => setOtp(devOtp.toString().split(''))}
                className="ml-auto text-xs bg-white/10 text-white/80 px-2 py-1 rounded-md font-semibold hover:bg-white/20 transition-colors"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* OTP BOXES */}
          <div
            className="flex gap-3 justify-center mb-8"
            onPaste={handleOtpPaste}
            tabIndex={-1}
          >
            {otp.map((digit, i) => (
              <div className="relative" key={i}>
                <input
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !digit && i > 0)
                      otpRefs[i - 1].current?.focus()
                  }}
                  className={`
                    w-14 h-16 text-center text-2xl font-extrabold rounded-2xl border-2 bg-white/10 text-white
                    outline-none transition-all duration-200
                    ${digit
                      ? 'border-white/20 bg-white/15 text-white shadow-[0_2px_12px_0_rgba(255,255,255,0.04)]'
                      : 'border-white/10 text-white/70'
                    }
                    focus:border-white/30 focus:bg-white/15 focus:ring-2 focus:ring-white/20
                    glass-otp
                  `}
                  autoFocus={i === 0}
                  style={{ fontFamily: 'monospace' }}
                />
                <span className="absolute left-3 top-[52%] -translate-y-1/2 text-lg text-white/20 pointer-events-none select-none">
                  <svg width="18" height="18" className="inline" fill="none" viewBox="0 0 22 22"><rect x="3.5" y="6.5" width="15" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M19 7.3l-7.8 5.5a2 2 0 0 1-2.4 0L1.9 7.2" stroke="currentColor" strokeWidth="1.4"/></svg>
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg
              bg-gradient-to-r from-gray-800 to-gray-700
              hover:from-gray-700 hover:to-gray-600
              shadow-md hover:shadow-lg
              focus:ring-2 focus:ring-white/20
              transition-all duration-300 text-white
              disabled:opacity-75
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="spinner spinner-white" />
                {'Verifying...'}
              </span>
            ) : (
              '✅ Verify & Continue'
            )}
          </button>
          <div className="mt-7 text-sm text-gray-400 text-center">
            Check your inbox (and spam) for the code.
          </div>
        </div>
      </div>
    </div>
  )

  return null
}