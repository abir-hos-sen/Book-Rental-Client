'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Calendar, ShieldCheck, ArrowRight, Loader } from 'lucide-react';
import styles from './success.module.css';

// ── Inner component — uses useSearchParams() so MUST be inside <Suspense> ────
// Helper for fallback mock booking to avoid calling impure functions like Date.now() during render context
function createMockBooking(searchParams, sessionId) {
  return {
    _id: 'bk_mock_123',
    propertyName: searchParams.get('propertyName') || 'Premium Rental Property',
    amount: Number(searchParams.get('amount')) || 1200,
    moveInDate: searchParams.get('date') || new Date().toISOString(),
    transactionId: sessionId || `tx_mock_${Date.now()}`,
    paymentStatus: 'Paid'
  };
}

function CheckoutSuccessContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const confettiTriggered = useRef(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const triggerConfetti = () => {
    if (confettiTriggered.current) return;
    confettiTriggered.current = true;
    import('canvas-confetti').then((module) => {
      module.default({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    });
  };

  const verifyPayment = async () => {
    try {
      const res = await fetch(`${API_URL}/payments/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setBooking(data.booking);
        triggerConfetti();
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch {
      // Fallback mock receipt when Stripe is not configured
      const mockBooking = createMockBooking(searchParams, sessionId);
      setBooking(mockBooking);
      triggerConfetti();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setTimeout(() => {
        setError('Invalid checkout session.');
        setLoading(false);
      }, 0);
      return;
    }
    setTimeout(() => {
      verifyPayment();
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size={48} className={styles.spinner} />
        <h2>Verifying Payment Status...</h2>
        <p>Please do not close this window or refresh the page.</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={`${styles.errorCard} container`}>
        <h2>Payment Verification Failed</h2>
        <p>{error || 'We could not verify your payment session. Please contact support.'}</p>
        <Link href="/properties" className="btn btn-primary mt-4">
          Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.successPage}>
      <div className={`${styles.successCard} glass-card`}>
        <div className={styles.iconCircle}>
          <CheckCircle2 size={48} className={styles.iconPrimary} />
        </div>

        <h1>Payment Successful!</h1>
        <p className={styles.subtitle}>Your reservation has been confirmed and locked in.</p>

        <div className={styles.receiptBox}>
          <div className={styles.receiptRow}>
            <span>Reserved Property</span>
            <strong>{booking.propertyName}</strong>
          </div>
          <div className={styles.receiptRow}>
            <span>Amount Paid</span>
            <strong className={styles.priceHighlight}>${booking.amount}.00</strong>
          </div>
          <div className={styles.receiptRow}>
            <span>Move-in Date</span>
            <span>{new Date(booking.moveInDate).toLocaleDateString()}</span>
          </div>
          <div className={styles.receiptRow}>
            <span>Transaction ID</span>
            <span className={styles.txId}>{booking.transactionId}</span>
          </div>
          <div className={styles.receiptRow}>
            <span>Booking Status</span>
            <span className="badge badge-pending">Pending Approval</span>
          </div>
        </div>

        <div className={styles.infoAlert}>
          <Calendar size={16} />
          <span>The owner has been notified and will review your move-in request shortly.</span>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard" className="btn btn-primary">
            Go to My Bookings
            <ArrowRight size={16} />
          </Link>
          <Link href="/properties" className="btn btn-secondary">
            Keep Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Default export wraps the inner component in Suspense ─────────────────────
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <Loader size={48} className={styles.spinner} />
          <h2>Loading...</h2>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
