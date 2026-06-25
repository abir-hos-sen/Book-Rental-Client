'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from './verify-otp.module.css';

function VerifyOtpContent() {
  const { verifyRegisterOtp, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'register'; // 'register' is only supported type now

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    const result = await verifyRegisterOtp(email, code);
    if (!result.success) {
      setError(result.error || 'Verification failed. Please try again.');
    }
  };

  const handleResend = () => {
    setResendTimer(60);
    setError('');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    // Redirect back to register so they can re-submit the form
    router.push('/register');
  };

  const isRegister = type === 'register';

  return (
    <div className={styles.otpWrapper}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <div className={`${styles.otpCard} glass-card`}>
        <div className={styles.otpHeader}>
          <div className={styles.iconCircle}>
            {isRegister
              ? <UserPlus size={28} className={styles.iconPrimary} />
              : <ShieldCheck size={28} className={styles.iconPrimary} />
            }
          </div>
          <h1>{isRegister ? 'Verify Your Email' : 'Security Verification'}</h1>
          <p>
            {isRegister
              ? 'Enter the code sent to activate your new account'
              : 'We sent a 6-digit verification code to'
            }
          </p>
          <span className={styles.emailHighlight}>{email}</span>
        </div>

        {error && <div className={`${styles.errorAlert} alert alert-danger`}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.otpForm}>
          <div className={styles.otpInputsContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={styles.otpInput}
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button type="submit" className={`${styles.submitBtn} btn btn-primary`} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} /> Verifying...
              </>
            ) : (
              isRegister ? 'Verify & Create Account' : 'Verify & Login'
            )}
          </button>
        </form>

        <div className={styles.otpFooter}>
          <p>
            Didn&apos;t receive the code?{' '}
            {resendTimer > 0 ? (
              <span className={styles.timerText}>Resend in {resendTimer}s</span>
            ) : (
              <button onClick={handleResend} className={styles.resendBtn}>
                {isRegister ? 'Back to Register' : 'Resend Code'}
              </button>
            )}
          </p>
          <Link href={isRegister ? '/register' : '/login'} className={styles.backLink}>
            <ArrowLeft size={14} /> {isRegister ? 'Back to Register' : 'Back to Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
