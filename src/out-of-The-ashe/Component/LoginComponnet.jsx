import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes, faCheck, faEye, faEyeSlash,
  faSpinner, faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { LoginUser } from '../Redux/auth';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────
   Full-screen redirect overlay component
───────────────────────────────────────── */
const RedirectOverlay = ({ onDone }) => {
  const [progress, setProgress]   = useState(0);
  const [popped,   setPopped]     = useState(false);
  const [swept,    setSwept]      = useState(false);
  const [visible,  setVisible]    = useState(false);
  const [barWidth, setBarWidth]   = useState(0);

  useEffect(() => {
    // 1 — top loading bar shoots to 60 %
    setBarWidth(60);

    const t1 = setTimeout(() => {
      // 2 — bar nudges to 85 %, green sweep slides in
      setBarWidth(85);
      setSwept(true);

      const t2 = setTimeout(() => {
        // 3 — bar completes, overlay fades in
        setBarWidth(100);
        setVisible(true);

        const t3 = setTimeout(() => {
          // 4 — check mark pops, text fades
          setPopped(true);

          // 5 — progress counter 0→100 over 2 200 ms then navigate
          const dur   = 2200;
          const start = performance.now();
          const tick  = (now) => {
            const pct = Math.min(Math.round(((now - start) / dur) * 100), 100);
            setProgress(pct);
            if (pct < 100) requestAnimationFrame(tick);
            else onDone();
          };
          requestAnimationFrame(tick);
        }, 300);

        return () => clearTimeout(t3);
      }, 420);

      return () => clearTimeout(t2);
    }, 600);

    return () => clearTimeout(t1);
  }, [onDone]);

  return (
    <>
      {/* Top loading bar */}
      <div
        style={{
          position:   'fixed',
          top:        0,
          left:       0,
          height:     '3px',
          width:      `${barWidth}%`,
          background: '#9325ae',
          zIndex:     9999,
          transition: barWidth === 60
            ? 'width 0.6s ease'
            : barWidth === 85
            ? 'width 0.2s ease'
            : 'width 0.15s ease',
        }}
      />

      {/* Green sweep */}
      <div
        style={{
          position:        'fixed',
          inset:           0,
          background:      '#EAF3DE',
          zIndex:          9997,
          transform:       swept ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition:      'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
        }}
      />

      {/* Main overlay */}
      <div
        style={{
          position:       'fixed',
          inset:          0,
          background:     'white',
          zIndex:         9998,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          opacity:        visible ? 1 : 0,
          transition:     'opacity 0.35s ease',
        }}
      >
        {/* Check circle */}
        <div
          style={{
            width:          80,
            height:         80,
            borderRadius:   '50%',
            background:     '#EAF3DE',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            marginBottom:   '1.5rem',
            transform:      popped ? 'scale(1)' : 'scale(0)',
            transition:     'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <FontAwesomeIcon
            icon={faCheck}
            style={{ fontSize: '2rem', color: '#921c80' }}
          />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize:   '1.25rem',
            fontWeight: 600,
            color:      '#111827',
            marginBottom: '0.5rem',
            opacity:    popped ? 1 : 0,
            transform:  popped ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s',
          }}
        >
          Login successful
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize:     '0.875rem',
            color:        '#c209aa',
            marginBottom: '2rem',
            opacity:      popped ? 1 : 0,
            transition:   'opacity 0.3s ease 0.35s',
          }}
        >
          Taking you to your dashboard...
        </p>

        {/* Progress bar track */}
        <div
          style={{
            width:        240,
            height:       3,
            background:   '#E5E7EB',
            borderRadius: 4,
            overflow:     'hidden',
            opacity:      popped ? 1 : 0,
            transition:   'opacity 0.2s ease 0.45s',
          }}
        >
          <div
            style={{
              height:     '100%',
              width:      `${progress}%`,
              background: '#811646',
              borderRadius: 4,
              transition: 'none',
            }}
          />
        </div>

        {/* Percentage */}
        <p
          style={{
            fontSize:   '0.75rem',
            color:      '#9CA3AF',
            marginTop:  '0.6rem',
            opacity:    popped ? 1 : 0,
            transition: 'opacity 0.2s ease 0.45s',
          }}
        >
          {progress}%
        </p>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────
   Main login component — untouched logic
───────────────────────────────────────── */
const LoginComponent = () => {
  const [formData, setFormData]           = useState({ email: '', password: '' });
  const [showPassword, setShowPassword]   = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showRedirect, setShowRedirect]   = useState(false);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isAuthenticate, isloading, error, token } = useSelector((state) => state.auth);

  useEffect(() => { console.log(error) }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError('');
  };

  const onLogin = (e) => {
    e.preventDefault();
    if (!formData.email)    return setValidationError('Please enter your email');
    if (!formData.password) return setValidationError('Please enter your password');
    dispatch(LoginUser(formData));
  };

  useEffect(() => {
    if (isAuthenticate && token) {
      localStorage.setItem('authToken', token);
      setShowRedirect(true); // triggers the overlay; overlay calls onDone → navigate
    }
  }, [isAuthenticate, token]);

  const handleRedirectDone = () => navigate('/DashboardPage');

  return (
    <>
      {/* Full-screen redirect overlay — mounts only on success */}
      {showRedirect && <RedirectOverlay onDone={handleRedirectDone} />}

      <div className="flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primBtn">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
          </div>

          {/* Dynamic Feedback UI */}
          <div className="mb-6 h-12">
            {isloading && (
              <div className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-xl animate-pulse">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                <span className="font-medium">Authenticating...</span>
              </div>
            )}

            {(validationError || error) && !isloading && (
              <div className="flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-xl border border-red-100">
                <FontAwesomeIcon icon={faCircleExclamation} />
                <span id="error" className="text-sm font-semibold">
                  {validationError || (Array.isArray(error) ? error[0].msg : error)}
                </span>
              </div>
            )}

            {isAuthenticate && (
              <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-xl border border-green-100 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 h-1 bg-green-500 animate-progress" />
                <FontAwesomeIcon icon={faCheck} />
                <span className="font-bold">Login Successful! Redirecting...</span>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={onLogin} className="space-y-5">
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-sm ml-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primBtn focus:bg-white transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-slate-700 font-bold mb-1 text-sm ml-1">Password</label>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primBtn focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <button
              type="submit"
              disabled={isloading}
              className="w-full py-3.5 bg-primBtn text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-Hover hover:-translate-y-0.5 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0"
            >
              {isloading ? 'Checking...' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </>
  );
};

export default LoginComponent;