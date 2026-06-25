'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Mail, Key, ImageIcon, Users, ShieldAlert, ArrowRight, Globe } from 'lucide-react';
import styles from './register.module.css';

const SIGNUP_ROLES = [
  { value: 'Tenant', label: 'Tenant (Browse & Book Properties)' },
  { value: 'Owner', label: 'Owner (List & Manage Properties)' }
];

export default function RegisterPage() {
  const { user, register, loginWithGoogle, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState('');
  const [role, setRole] = useState('Tenant');
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

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password, photo, role);
    setSubmitting(false);

    if (result.success && result.otpRequired) {
      router.push(`/verify-otp?email=${encodeURIComponent(result.email)}&type=register`);
      return;
    }

    if (!result.success) {
      setError(result.error || 'Registration failed. Try a different email.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);
    
    if (!result.success) {
      setError(result.error || 'Google registration failed.');
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <div className={`${styles.authCard} glass-card`}>
        <div className={styles.authHeader}>
          <div className={styles.iconCircle}>
            <UserPlus size={24} className={styles.iconPrimary} />
          </div>
          <h1>Create Account</h1>
          <p>Sign up to start renting properties or list your own listings</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <ShieldAlert size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input 
                type="text" 
                placeholder="John Doe" 
                className={`${styles.authInput} form-input`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" 
                placeholder="john@example.com" 
                className={`${styles.authInput} form-input`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className={styles.inputWrapper}>
              <Key size={18} className={styles.inputIcon} />
              <input 
                type="password" 
                placeholder="Minimum 6 characters" 
                className={`${styles.authInput} form-input`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Image URL (Optional)</label>
            <div className={styles.inputWrapper}>
              <ImageIcon size={18} className={styles.inputIcon} />
              <input 
                type="url" 
                placeholder="https://example.com/avatar.jpg" 
                className={`${styles.authInput} form-input`}
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role *</label>
            <div className={styles.inputWrapper}>
              <Users size={18} className={styles.inputIcon} />
              <select 
                className={`${styles.authSelect} form-input`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {SIGNUP_ROLES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className={`${styles.submitBtn} btn btn-primary`}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
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
        >
          <Globe size={18} className={styles.googleIcon} />
          Continue with Google (User)
        </button>

        <p className={styles.authFooter}>
          Already have an account? <Link href="/login" className={styles.linkAccent}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
