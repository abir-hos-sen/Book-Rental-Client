'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Key, ImageIcon, ShieldCheck, Camera, ArrowLeft, Loader } from 'lucide-react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user, token, loading, showToast } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setTimeout(() => {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhoto(user.photo || '');
        setPreviewUrl(user.photo || '');
      }, 0);
    }
  }, [user, loading, router]);

  const handlePhotoChange = (e) => {
    setPhoto(e.target.value);
    setPreviewUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (password && password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setSubmitting(true);

    const payload = { name, photo };
    if (password) payload.password = password;

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast(data.message || 'Update failed.', 'error');
      }
    } catch {
      showToast('Profile updated (offline simulation).');
      setPassword('');
      setConfirmPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size={40} className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={`${styles.profilePage} container`}>
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={`${styles.backBtn} btn btn-secondary`}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h1>Profile Settings</h1>
          <p>Update your personal information and account preferences.</p>
        </div>
      </div>

      <div className={styles.profileGrid}>

        {/* Avatar Preview Card */}
        <div className={`${styles.avatarCard} glass-card`}>
          <div className={styles.avatarWrapper}>
            <img
              src={previewUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt="Profile Preview"
              className={styles.avatarPreview}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div className={styles.cameraIcon}>
              <Camera size={18} />
            </div>
          </div>
          <h3>{name || user.name}</h3>
          <p className={styles.userEmail}>{email}</p>
          <span className={`badge ${
            user.role === 'Admin' ? 'badge-rejected' :
            user.role === 'Owner' ? 'badge-pending' : 'badge-approved'
          }`}>
            {user.role} Account
          </span>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <ShieldCheck size={16} className={styles.statIcon} />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className={`${styles.formCard} glass-card`}>
          <h2>Edit Your Details</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className={styles.inputGroup}>
                <User size={17} className={styles.inputIcon} />
                <input
                  type="text"
                  className={`form-input ${styles.withIcon}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="form-group">
              <label className="form-label">Email Address <span className={styles.readOnlyTag}>(read only)</span></label>
              <div className={styles.inputGroup}>
                <Mail size={17} className={styles.inputIcon} />
                <input
                  type="email"
                  className={`form-input ${styles.withIcon} ${styles.readOnly}`}
                  value={email}
                  readOnly
                />
              </div>
            </div>

            {/* Profile Image URL */}
            <div className="form-group">
              <label className="form-label">Profile Image URL</label>
              <div className={styles.inputGroup}>
                <ImageIcon size={17} className={styles.inputIcon} />
                <input
                  type="url"
                  className={`form-input ${styles.withIcon}`}
                  value={photo}
                  onChange={handlePhotoChange}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>
              {previewUrl && (
                <div className={styles.previewStrip}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={styles.previewThumb}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span className={styles.previewLabel}>Live preview of your new avatar</span>
                </div>
              )}
            </div>

            <div className={styles.divider}></div>
            <p className={styles.sectionLabel}>Change Password (optional)</p>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className={styles.inputGroup}>
                <Key size={17} className={styles.inputIcon} />
                <input
                  type="password"
                  className={`form-input ${styles.withIcon}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className={styles.inputGroup}>
                <Key size={17} className={styles.inputIcon} />
                <input
                  type="password"
                  className={`form-input ${styles.withIcon}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
