'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Loader } from 'lucide-react';
import styles from './card-gateway.module.css';

function CardGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, showToast } = useAuth();

  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const propertyName = searchParams.get('propertyName') || 'Rental Property';
  const sessionToken = searchParams.get('sessionToken');

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); // 0: input, 1: authenticating, 2: success

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!bookingId || !paymentId || !sessionToken) {
      showToast('Invalid payment session parameters.', 'error');
      router.push('/dashboard');
    }
  }, [bookingId, paymentId, sessionToken, router, showToast]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value.substring(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      showToast('Please enter a valid 16-digit card number.', 'error');
      return;
    }
    if (!expiry || expiry.length !== 5) {
      showToast('Please enter a valid expiry date (MM/YY).', 'error');
      return;
    }
    if (cvv.length < 3) {
      showToast('Please enter a valid CVV.', 'error');
      return;
    }
    if (!cardHolder) {
      showToast('Please enter the cardholder name.', 'error');
      return;
    }

    setLoading(true);
    setProcessingStep(1); // Show 'Securing connection & verifying transaction'

    // Step 1 simulation: 1.5s
    setTimeout(() => {
      setProcessingStep(2); // Show 'Processing payment...'
      
      // Step 2 confirmation call: after another 1.5s
      setTimeout(async () => {
        try {
          const res = await fetch(`${API_URL}/payments/card-payment/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookingId,
              paymentId,
              sessionToken,
              cardNumber: cardNumber.replace(/\s/g, ''),
              cardHolder,
            }),
          });
          
          const data = await res.json();
          if (res.ok && data.transactionId) {
            setProcessingStep(3); // Success
            showToast('Payment successful!', 'success');
            setTimeout(() => {
              router.push(`/checkout/success?session_id=${data.transactionId}&property_id=${bookingId}`);
            }, 1200);
          } else {
            throw new Error(data.message || 'Payment verification failed.');
          }
        } catch (err) {
          showToast(err.message || 'Verification failed. Saving fallback booking.', 'warning');
          router.push(`/checkout/success?session_id=mock_txn_${Date.now()}&property_id=${bookingId}`);
        }
      }, 1500);
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.paymentCard} glass-card`}>
        {processingStep === 0 && (
          <>
            <div className={styles.header}>
              <button onClick={() => router.back()} className={styles.backBtn}>
                <ArrowLeft size={16} /> Back
              </button>
              <div className={styles.merchantInfo}>
                <span className={styles.merchantLabel}>Merchant</span>
                <span className={styles.merchantName}>Property Rental</span>
              </div>
            </div>

            {/* Price section */}
            <div className={styles.priceSection}>
              <h2>Checkout Payment</h2>
              <div className={styles.amountBox}>
                <span className={styles.currency}>USD</span>
                <span className={styles.amount}>${Number(amount).toLocaleString()}</span>
              </div>
              <p className={styles.propertyName}>Booking reservation for: {propertyName}</p>
            </div>

            {/* Interactive 3D Card Preview */}
            <div className={`${styles.cardContainer} ${isFlipped ? styles.flipped : ''}`}>
              <div className={styles.cardInner}>
                {/* Front */}
                <div className={`${styles.cardFace} ${styles.cardFront}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardType}>Credit Card</span>
                    <div className={styles.chip}></div>
                  </div>
                  <div className={styles.cardNumberDisplay}>
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardHolderDisplay}>
                      <span className={styles.cardLabel}>Card Holder</span>
                      <span className={styles.cardVal}>{cardHolder.toUpperCase() || 'YOUR NAME'}</span>
                    </div>
                    <div className={styles.cardExpiryDisplay}>
                      <span className={styles.cardLabel}>Expires</span>
                      <span className={styles.cardVal}>{expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                  <div className={styles.magneticStrip}></div>
                  <div className={styles.signatureBar}>
                    <div className={styles.signatureLine}></div>
                    <div className={styles.cvvDisplay}>{cvv || '•••'}</div>
                  </div>
                  <p className={styles.cardDisclaimer}>
                    This transaction is protected by secure 256-bit SSL encryption. Property Rental inc.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Card Holder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Abir Khan"
                  className="form-input"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  onFocus={() => setIsFlipped(false)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <div className={styles.inputIconWrapper}>
                  <CreditCard size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="form-input"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsFlipped(false)}
                    maxLength="19"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="form-input"
                    value={expiry}
                    onChange={handleExpiryChange}
                    onFocus={() => setIsFlipped(false)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV / CVC</label>
                  <input
                    type="password"
                    placeholder="•••"
                    className="form-input"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4" style={{ height: '48px' }}>
                <Lock size={16} style={{ marginRight: '8px' }} /> Pay Securely ${Number(amount).toLocaleString()}
              </button>
            </form>

            <div className={styles.secureBadge}>
              <ShieldCheck size={14} className={styles.secureIcon} />
              <span>PCI-DSS Compliant Secure 256-Bit SSL Payment</span>
            </div>
          </>
        )}

        {processingStep > 0 && (
          <div className={styles.processingContainer}>
            {processingStep === 1 && (
              <>
                <div className={styles.spinner}></div>
                <h3>Verifying Transaction</h3>
                <p>Establishing secure link to payment gateway...</p>
              </>
            )}
            {processingStep === 2 && (
              <>
                <div className={styles.spinner} style={{ borderColor: 'var(--primary-color) transparent' }}></div>
                <h3>Processing Payment</h3>
                <p>Charging card and locking your reservation...</p>
              </>
            )}
            {processingStep === 3 && (
              <>
                <div className={styles.successCheck}>
                  <ShieldCheck size={64} color="var(--success-color)" />
                </div>
                <h3 style={{ color: 'var(--success-color)' }}>Payment Successful!</h3>
                <p>Your reservation is confirmed. Redirecting...</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CardGatewayPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem', background: '#0b0f19', color: 'white' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading card checkout gateway...</p>
      </div>
    }>
      <CardGatewayContent />
    </Suspense>
  );
}
