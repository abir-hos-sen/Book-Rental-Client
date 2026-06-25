'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, Heart, User, MapPin, CreditCard, ShieldCheck, 
  CheckCircle, Trash2, ImageIcon, Zap, Mail,
  ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import styles from './TenantDashboard.module.css';

function getPaymentSessionUrl(rentAmount) {
  return `/checkout/success?session_id=mock_stripe_session_${Date.now()}&amount=${rentAmount}&propertyName=Cozy Alpine Cabin`;
}

export default function TenantDashboard() {
  const { user, token, showToast, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.photo || '');
  const [profilePreview, setProfilePreview] = useState(user?.photo || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getMockBookings = () => [
    {
      _id: 'bk_1',
      propertyId: { _id: '1', title: 'Luxury Penthouse with Skyline Views', location: 'Dhaka, Dhaka Division' },
      propertyName: 'Luxury Penthouse with Skyline Views',
      amount: 4200,
      moveInDate: new Date().toISOString(),
      tenantPhone: '+1 (555) 123-4567',
      paymentStatus: 'Paid',
      status: 'Approved',
      transactionId: 'ch_stripe_mock_98765'
    },
    {
      _id: 'bk_2',
      propertyId: { _id: '3', title: 'Cozy Alpine Cabin near Ski Slopes', location: 'Sylhet, Sylhet Division' },
      propertyName: 'Cozy Alpine Cabin near Ski Slopes',
      amount: 350,
      moveInDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      tenantPhone: '+1 (555) 123-4567',
      paymentStatus: 'Unpaid',
      status: 'Pending'
    }
  ];

  const getMockFavorites = () => [
    {
      _id: 'fav_1',
      propertyId: {
        _id: '1',
        title: 'Luxury Penthouse with Skyline Views',
        location: 'Dhaka, Dhaka Division',
        rent: 4200,
        rentType: 'Monthly',
        propertyType: 'Apartment',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400']
      }
    },
    {
      _id: 'fav_2',
      propertyId: {
        _id: '2',
        title: 'Modern Minimalist Villa',
        location: 'Chattogram, Chattogram Division',
        rent: 8500,
        rentType: 'Monthly',
        propertyType: 'Villa',
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400']
      }
    }
  ];

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const res = await fetch(`${API_URL}/bookings/tenant`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Only use real data — don't replace empty results with mock data
        setBookings(res.ok && Array.isArray(data) ? data : []);
      } else if (activeTab === 'favorites') {
        const res = await fetch(`${API_URL}/favorites/tenant`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setFavorites(res.ok && Array.isArray(data) ? data : []);
      }
    } catch {
      // Network error — keep existing data, don't wipe it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setProfileName(prev => prev || user.name || '');
        setProfileEmail(prev => prev || user.email || '');
        setProfilePhoto(prev => prev || user.photo || '');
        setProfilePreview(prev => prev || user.photo || '');
      }, 0);
    }
  }, [user]);

  // Fetch on mount AND whenever the active tab changes
  useEffect(() => {
    if (activeTab !== 'profile' && token) {
      fetchDashboardData();
    }
  }, [activeTab, token]);

  const handlePayNow = async (bookingId, rentAmount, propertyId) => {
    try {
      const res = await fetch(`${API_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          propertyId,
          moveInDate: new Date().toISOString(),
          tenantPhone: user.phone || '+1 (555) 000-0000',
          additionalNotes: 'Paying pending checkout booking'
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        showToast('Redirecting to Stripe...');
        window.location.assign(data.url);
      } else throw new Error(data.message);
    } catch {
      showToast('Stripe offline simulation. Redirecting...', 'warning');
      window.location.assign(getPaymentSessionUrl(rentAmount));
    }
  };

  const handleRemoveFavorite = async (favId) => {
    try {
      const res = await fetch(`${API_URL}/favorites/item/${favId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f._id !== favId));
        showToast('Removed from favorites.');
      } else throw new Error();
    } catch {
      setFavorites(prev => prev.filter(f => f._id !== favId));
      showToast('Removed (offline).');
    }
  };

  const tabs = [
    { key: 'bookings', label: 'Bookings', icon: Calendar, color: '#0d9488' },
    { key: 'favorites', label: 'Favorites', icon: Heart, color: '#ef4444' },
    { key: 'profile', label: 'Profile', icon: User, color: '#8b5cf6' },
  ];

  return (
    <div className={styles.dashboardWrapper}>

      {activeTab === 'bookings' && (
        <div className={styles.statsGrid}>
          {[
            { icon: Calendar, label: 'Total Bookings', value: bookings.length, color: '#0d9488', bg: 'rgba(13,148,136,0.1)' },
            { icon: CheckCircle, label: 'Approved', value: bookings.filter(b => b.status === 'Approved').length, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { icon: Clock, label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: Heart, label: 'Favorites', value: favorites.length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          ].map((stat, i) => (
            <div key={i} className={`${styles.statCard} glass-card`}>
              <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.mainLayout}>
        <aside className={`${styles.sidebar} glass-card ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatarWrap}>
              <img src={user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" className={styles.sidebarAvatar} />
              <div className={styles.sidebarStatus} />
            </div>
            {!sidebarCollapsed && (
              <>
                <h4>{user?.name}</h4>
                <span className="badge badge-approved">{user?.role || 'Tenant'}</span>
              </>
            )}
          </div>
          <div className={styles.sidebarDivider} />
          <nav className={styles.sidebarNav}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`${styles.sidebarBtn} ${activeTab === tab.key ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
                title={tab.label}
              >
                <tab.icon size={20} style={{ color: activeTab === tab.key ? tab.color : undefined }} />
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>
          <button className={styles.sidebarCollapseBtn} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </aside>

        <main className={styles.contentArea}>

          {activeTab === 'bookings' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>📋 My Bookings</h2>
                  <p className={styles.contentSub}>View all your reservation bookings</p>
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}><div className={styles.spinner} /><span>Loading...</span></div>
              ) : bookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <Calendar size={56} strokeWidth={1} />
                  <h3>No Bookings Yet</h3>
                  <p>Browse properties and book your next stay!</p>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Property Name</th>
                        <th>Booking Date</th>
                        <th>Amount Paid</th>
                        <th>Booking Status</th>
                        <th>Payment Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b._id}>
                          <td>
                            <div className={styles.tablePropertyCell}>
                              <span className={styles.tableTitle}>{b.propertyName || b.propertyId?.title || 'Untitled Property'}</span>
                              <span className={styles.tableSubText}><MapPin size={13} /> {b.propertyId?.location || 'Location TBD'}</span>
                            </div>
                          </td>
                          <td>{new Date(b.moveInDate || Date.now()).toLocaleDateString()}</td>
                          <td><strong>${b.amount}</strong></td>
                          <td>
                            <span className={`${styles.badgeSmall} ${
                              b.status === 'Approved' ? styles.badgeSuccess :
                              b.status === 'Rejected' ? styles.badgeDanger : styles.badgeWarn
                            }`}>{b.status || 'Pending'}</span>
                          </td>
                          <td>
                            <span className={`${styles.badgeSmall} ${b.paymentStatus === 'Paid' ? styles.badgeSuccess : styles.badgeDanger}`}>
                              {b.paymentStatus || 'Unpaid'}
                            </span>
                          </td>
                          <td>
                            {b.paymentStatus === 'Unpaid' ? (
                              <button onClick={() => handlePayNow(b._id, b.amount, b.propertyId?._id || b.propertyId)} className={styles.payBtn}>
                                <CreditCard size={16} /> Pay Now
                              </button>
                            ) : (
                              <span className={styles.paidTag}><ShieldCheck size={16} /> Paid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>❤️ Saved Properties</h2>
                  <p className={styles.contentSub}>Your favorite property listings</p>
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}><div className={styles.spinner} /><span>Loading...</span></div>
              ) : favorites.length === 0 ? (
                <div className={styles.emptyState}>
                  <Heart size={56} strokeWidth={1} />
                  <h3>No Favorites Yet</h3>
                  <p>Click the heart icon on properties to save them here.</p>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {favorites.map(fav => {
                        const prop = fav.propertyId;
                        if (!prop) return null;
                        return (
                          <tr key={fav._id}>
                            <td>
                              <div className={styles.tablePropertyCell}>
                                <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'} alt="" className={styles.tableThumb} />
                                <div>
                                  <span className={styles.tableTitle}>{prop.title}</span>
                                  <span className={styles.tableSubText}>{prop.propertyType}</span>
                                </div>
                              </div>
                            </td>
                            <td>{prop.location}</td>
                            <td><strong>${prop.rent}</strong></td>
                            <td>
                              <div className={styles.tableActionRow}>
                                <a href={`/properties/${prop._id}`} className={styles.viewBtn}>View Details</a>
                                <button onClick={() => handleRemoveFavorite(fav._id)} className={styles.removeBtn} title="Remove">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>👤 My Profile</h2>
                  <p className={styles.contentSub}>Update your personal information</p>
                </div>
              </div>
              <div className={styles.profileLayout}>
                <div className={styles.profilePhotoSection}>
                  <div className={styles.profilePhotoWrap}>
                    <img src={profilePreview || user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} alt="" className={styles.profilePhoto} />
                    <div className={styles.profilePhotoOverlay} onClick={() => document.getElementById('tenant-photo-input')?.click()}><ImageIcon size={24} /></div>
                    <input
                      id="tenant-photo-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const dataUrl = reader.result;
                            setProfilePreview(dataUrl);
                            setProfilePhoto(dataUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <h3>{user?.name}</h3>
                  <p className={styles.profileEmail}>{user?.email}</p>
                  <span className="badge badge-approved" style={{ fontSize: '0.85rem', padding: '0.35rem 1rem' }}>{user?.role}</span>
                </div>
                <div className={styles.profileFormSection}>
                  <form onSubmit={async e => {
                    e.preventDefault();
                    setProfileSubmitting(true);
                    await updateProfile(profileName, profilePhoto, profileEmail);
                    setProfileSubmitting(false);
                  }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div className={styles.inputGroup}>
                        <User size={18} className={styles.inputGroupIcon} />
                        <input type="text" className="form-input" value={profileName} onChange={e => setProfileName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className={styles.inputGroup}>
                        <Mail size={18} className={styles.inputGroupIcon} />
                        <input type="email" className="form-input" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Photo URL</label>
                      <div className={styles.inputGroup}>
                        <ImageIcon size={18} className={styles.inputGroupIcon} />
                        <input type="url" className="form-input" value={profilePhoto} onChange={e => { setProfilePhoto(e.target.value); setProfilePreview(e.target.value); }} placeholder="https://example.com/photo.jpg" />
                      </div>
                    </div>
                    <button type="submit" className={styles.saveBtn} disabled={profileSubmitting}>
                      {profileSubmitting ? 'Saving...' : 'Save Changes'} <Zap size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}