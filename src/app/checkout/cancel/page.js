'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import styles from './cancel.module.css';

export default function CheckoutCancelPage() {
  return (
    <div className={styles.cancelPage}>
      <div className={`${styles.cancelCard} glass-card`}>
        <div className={styles.iconCircle}>
          <AlertTriangle size={48} className={styles.iconPrimary} />
        </div>
        
        <h1>Payment Cancelled</h1>
        <p className={styles.subtitle}>
          The checkout transaction was cancelled and no charges were made.
        </p>

        <p className={styles.description}>
          If you experienced issues or wish to change your rental details, feel free to try again. The property will remain available for booking unless reserved by another tenant.
        </p>

        <div className={styles.actions}>
          <Link href="/properties" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Properties
          </Link>
          <Link href="/" className="btn btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
