'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Key, Mail, ShieldAlert, ArrowRight, Globe } from 'lucide-react';
import styles from './login.module.css';
import { getApiUrl } from '../../lib/apiUrl';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Login failed. Please check credentials.');
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    const API_URL = getApiUrl();
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <div className={`${styles.authCard} glass-card`}>
        <div className={styles.authHeader}>
          <div className={styles.iconCircle}>
            <LogIn size={24} className={styles.iconPrimary} />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to discover properties and manage reservations</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <ShieldAlert size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                className={`${styles.authInput} form-input`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrapper}>
              <Key size={18} className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`${styles.authInput} form-input`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`${styles.submitBtn} btn btn-primary`}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.dividerContainer}>
          <div className={styles.line}></div>
          <span className={styles.dividerText}>or continue with</span>
          <div className={styles.line}></div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className={`${styles.googleBtn} btn btn-secondary`}
          disabled={submitting}
          type="button"
        >
          <Globe size={18} className={styles.googleIcon} />
          Sign in with Google
        </button>

        <p className={styles.authFooter}>
          Don&apos;t have an account? <Link href="/register" className={styles.linkAccent}>Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
