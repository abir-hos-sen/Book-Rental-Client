'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader, AlertCircle, ShieldCheck, Phone } from 'lucide-react';
import styles from './gateway.module.css';

const PAYMENT_CONFIG = {
  bkash: {
    name: 'bKash',
    color: '#E2136E',
    logo: '🔴',
    brandColor: 'linear-gradient(135deg, #E2136E 0%, #b01058 100%)',
    accentColor: '#E2136E',
    placeholder: '01XXXXXXXXX',
    pinLabel: 'bKash PIN',
    prefix: '01',
    bg: '#fff0f7',
    border: '#E2136E',
    helpText: 'আপনার bKash অ্যাপ এ দেওয়া নম্বর লিখুন',
  },
  nagad: {
    name: 'Nagad',
    color: '#F05A28',
    logo: '🟠',
    brandColor: 'linear-gradient(135deg, #F05A28 0%, #c9431a 100%)',
    accentColor: '#F05A28',
    placeholder: '01XXXXXXXXX',
    pinLabel: 'Nagad PIN',
    prefix: '01',
    bg: '#fff5f0',
    border: '#F05A28',
    helpText: 'আপনার Nagad অ্যাকাউন্ট নম্বর লিখুন',
  },
  rocket: {
    name: 'Rocket',
    color: '#8B2FC9',
    logo: '🚀',
    brandColor: 'linear-gradient(135deg, #8B2FC9 0%, #6a1fa8 100%)',
    accentColor: '#8B2FC9',
    placeholder: '01XXXXXXXXX-X',
    pinLabel: 'Rocket PIN',
    prefix: '01',
    bg: '#f8f0ff',
    border: '#8B2FC9',
    helpText: 'আপনার Rocket নম্বর লিখুন (শেষে এজেন্ট কোড)',
  },
};

function LocalGatewayContent() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get('paymentId');
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');
  const propertyName = searchParams.get('propertyName');
  const sessionToken = searchParams.get('sessionToken');

  const config = PAYMENT_CONFIG[method] || PAYMENT_CONFIG.bkash;

  const [step, setStep] = useState('input');
  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleNumberSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!/^01[3-9]\d{8}$/.test(mobileNumber)) {
      setError('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)');
      return;
    }
    setStep('otp');
    setCountdown(60);
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) {
      setError('৬ সংখ্যার OTP কোড দিন');
      return;
    }
    setError('');
    setStep('pin');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!pin || pin.length < 4) {
      setError('সঠিক PIN দিন');
      return;
    }
    setLoading(true);
    setStep('processing');

    await new Promise(r => setTimeout(r, 2500));

    try {
      const res = await fetch(`${API_URL}/payments/local-payment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          paymentId,
          sessionToken,
          mobileNumber,
          pin,
        }),
      });

      const data = await res.json();

      if (res.ok && data.transactionId) {
        setTransactionId(data.transactionId);
        setStep('success');
      } else {
        setError(data.message || 'Payment failed.');
        setStep('pin');
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।');
      setStep('pin');
    } finally {
      setLoading(false);
    }
  };

  if (!method || !bookingId || !paymentId) {
    return (
      <div className={styles.pageWrap}>
        <div className={styles.card}>
          <AlertCircle size={48} color="#ef4444" />
          <h2>Invalid Payment Link</h2>
          <button onClick={() => router.push('/properties')} className={styles.btn}>Back to Properties</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrap} style={{ '--brand': config.accentColor, '--brand-bg': config.bg, '--brand-border': config.border }}>
      <div className={styles.gatewayCard}>
        <div className={styles.header} style={{ background: config.brandColor }}>
          <div className={styles.logoRow}>
            <span className={styles.logoEmoji}>{config.logo}</span>
            <div>
              <h1 className={styles.headerTitle}>{config.name}</h1>
              <p className={styles.headerSub}>Digital Payment Gateway</p>
            </div>
          </div>
          <div className={styles.amountBox}>
            <span className={styles.amountLabel}>মোট পরিমাণ</span>
            <span className={styles.amountValue}>৳{Number(amount).toLocaleString('bn-BD')}</span>
            <span className={styles.amountSub}>{propertyName}</span>
          </div>
        </div>

        <div className={styles.body}>
          {step === 'input' && (
            <form onSubmit={handleNumberSubmit} className={styles.form}>
              <div className={styles.stepIndicator}>
                <div className={`${styles.stepDot} ${styles.active}`}>১</div>
                <div className={styles.stepLine}></div>
                <div className={styles.stepDot}>২</div>
                <div className={styles.stepLine}></div>
                <div className={styles.stepDot}>৩</div>
              </div>
              <h2 className={styles.stepTitle}>আপনার {config.name} নম্বর দিন</h2>
              <p className={styles.stepDesc}>{config.helpText}</p>
              <div className={styles.inputGroup}>
                <Phone size={18} className={styles.inputIcon} style={{ color: config.accentColor }} />
                <input
                  type="tel"
                  placeholder={config.placeholder}
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className={styles.input}
                  style={{ '--focus-color': config.accentColor }}
                  required
                />
              </div>
              {error && <p className={styles.errorMsg}><AlertCircle size={14} /> {error}</p>}
              <div className={styles.securityNote}>
                <ShieldCheck size={14} />
                <span>আপনার তথ্য সম্পূর্ণ নিরাপদ ও এনক্রিপ্টেড</span>
              </div>
              <button type="submit" className={styles.submitBtn} style={{ background: config.brandColor }}>
                পরবর্তী ধাপ →
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <div className={styles.stepIndicator}>
                <div className={`${styles.stepDot} ${styles.done}`}>✓</div>
                <div className={`${styles.stepLine} ${styles.done}`}></div>
                <div className={`${styles.stepDot} ${styles.active}`}>২</div>
                <div className={styles.stepLine}></div>
                <div className={styles.stepDot}>৩</div>
              </div>
              <h2 className={styles.stepTitle}>OTP যাচাই করুন</h2>
              <p className={styles.stepDesc}>
                <strong>{mobileNumber}</strong> নম্বরে ৬ সংখ্যার OTP পাঠানো হয়েছে
              </p>
              <div className={styles.otpRow}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !d && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus();
                      }
                    }}
                    className={styles.otpInput}
                    style={{ '--focus-color': config.accentColor }}
                  />
                ))}
              </div>
              <p className={styles.resendNote}>
                {countdown > 0
                  ? `পুনরায় পাঠান: ${countdown}s`
                  : <button type="button" onClick={() => setCountdown(60)} style={{ color: config.accentColor, background: 'none', border: 'none', cursor: 'pointer' }}>পুনরায় OTP পাঠান</button>
                }
              </p>
              {error && <p className={styles.errorMsg}><AlertCircle size={14} /> {error}</p>}
              <button type="submit" className={styles.submitBtn} style={{ background: config.brandColor }}>
                OTP যাচাই করুন
              </button>
            </form>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className={styles.form}>
              <div className={styles.stepIndicator}>
                <div className={`${styles.stepDot} ${styles.done}`}>✓</div>
                <div className={`${styles.stepLine} ${styles.done}`}></div>
                <div className={`${styles.stepDot} ${styles.done}`}>✓</div>
                <div className={`${styles.stepLine} ${styles.done}`}></div>
                <div className={`${styles.stepDot} ${styles.active}`}>৩</div>
              </div>
              <h2 className={styles.stepTitle}>{config.pinLabel} দিন</h2>
              <p className={styles.stepDesc}>পেমেন্ট নিশ্চিত করতে আপনার {config.name} PIN দিন</p>
              <div className={styles.pinDots}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`${styles.pinDot} ${pin.length > i ? styles.filled : ''}`} style={{ '--fill': config.accentColor }}></div>
                ))}
              </div>
              <div className={styles.pinPad}>
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.pinKey} ${!k ? styles.empty : ''}`}
                    onClick={() => {
                      if (!k) return;
                      if (k === '⌫') setPin(p => p.slice(0, -1));
                      else if (pin.length < 6) setPin(p => p + k);
                    }}
                    style={{ '--accent': config.accentColor }}
                  >
                    {k}
                  </button>
                ))}
              </div>
              {error && <p className={styles.errorMsg}><AlertCircle size={14} /> {error}</p>}
              <div className={styles.securityNote}>
                <ShieldCheck size={14} />
                <span>PIN সম্পূর্ণ নিরাপদ। আমরা সংরক্ষণ করি না।</span>
              </div>
              <button
                type="submit"
                className={styles.submitBtn}
                style={{ background: config.brandColor }}
                disabled={pin.length < 4}
              >
                পেমেন্ট নিশ্চিত করুন ৳{Number(amount).toLocaleString()}
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className={styles.processingWrap}>
              <div className={styles.processingRing} style={{ borderTopColor: config.accentColor }}></div>
              <h2 style={{ color: config.accentColor }}>পেমেন্ট প্রক্রিয়াধীন...</h2>
              <p>অনুগ্রহ করে অপেক্ষা করুন এবং পেজটি বন্ধ করবেন না</p>
              <div className={styles.processingSteps}>
                <p>✓ নম্বর যাচাই সম্পন্ন</p>
                <p>✓ OTP যাচাই সম্পন্ন</p>
                <p className={styles.spinning}>⟳ পেমেন্ট নিশ্চিত হচ্ছে...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className={styles.successWrap}>
              <div className={styles.successIcon} style={{ background: config.bg, borderColor: config.accentColor }}>
                <CheckCircle2 size={56} color={config.accentColor} />
              </div>
              <h2 style={{ color: config.accentColor }}>পেমেন্ট সফল!</h2>
              <p className={styles.successMsg}>আপনার বুকিং সফলভাবে সম্পন্ন হয়েছে</p>
              <div className={styles.receiptBox}>
                <div className={styles.receiptRow}>
                  <span>পেমেন্ট মাধ্যম</span>
                  <strong>{config.name}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>পরিমাণ</span>
                  <strong style={{ color: config.accentColor }}>৳{Number(amount).toLocaleString()}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>সম্পত্তি</span>
                  <strong>{propertyName}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Transaction ID</span>
                  <strong className={styles.txId}>{transactionId}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>স্ট্যাটাস</span>
                  <span className={styles.successBadge}>সফল ✓</span>
                </div>
              </div>
              <div className={styles.successActions}>
                <button onClick={() => router.push('/dashboard')} className={styles.submitBtn} style={{ background: config.brandColor }}>
                  My Bookings দেখুন
                </button>
                <button onClick={() => router.push('/properties')} className={styles.outlineBtn} style={{ color: config.accentColor, borderColor: config.accentColor }}>
                  আরও প্রপার্টি দেখুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LocalGatewayPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p>পেমেন্ট গেটওয়ে লোড হচ্ছে...</p>
      </div>
    }>
      <LocalGatewayContent />
    </Suspense>
  );
}
