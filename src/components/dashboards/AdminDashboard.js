'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Building, Calendar, DollarSign, CheckCircle2, XCircle, 
  Trash2, ShieldAlert, X, User, ImageIcon, Camera, 
  TrendingUp, Activity, BarChart3, Search, Filter, MoreVertical,
  ChevronRight, ChevronLeft, Edit3, Star, Clock, Zap, Mail
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { user: authUser, token, showToast, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalProperties: 0, totalBookings: 0, totalRevenue: 0, pendingProperties: 0 });

  // Profile
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [rejectingPropertyId, setRejectingPropertyId] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [rejectionSubmitting, setRejectionSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getMockUsers = () => [
    { _id: 'u_1', name: 'Al-Amin Birk', email: 'admin@rental.com', role: 'Admin', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { _id: 'u_2', name: 'Robert Davis', email: 'owner@rental.com', role: 'Owner', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    { _id: 'u_3', name: 'Emma Watson', email: 'tenant@rental.com', role: 'Tenant', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
  ];

  const getMockProperties = () => [
    { _id: 'p1', title: 'Cozy Alpine Cabin near Ski Slopes', location: 'Sylhet, Sylhet Division', propertyType: 'Cabin', rent: 350, rentType: 'Daily', ownerName: 'Robert Davis', ownerEmail: 'owner@rental.com', status: 'Pending' },
    { _id: 'p2', title: 'Luxury Beachfront Villa', location: 'Chattogram, Chattogram Division', propertyType: 'Villa', rent: 12000, rentType: 'Monthly', ownerName: 'Sarah Johnson', ownerEmail: 'sarah@example.com', status: 'Pending' },
    { _id: 'p3', title: 'Downtown Modern Loft', location: 'Mymensingh, Mymensingh Division', propertyType: 'Apartment', rent: 2800, rentType: 'Monthly', ownerName: 'Mike Chen', ownerEmail: 'mike@example.com', status: 'Pending' }
  ];

  const getMockBookings = () => [
    { _id: 'bk_1', propertyName: 'Luxury Penthouse with Skyline Views', amount: 4200, moveInDate: new Date().toISOString(), tenantName: 'Emma Watson', tenantEmail: 'tenant@rental.com', ownerName: 'Robert Davis', paymentStatus: 'Paid', status: 'Approved' },
    { _id: 'bk_2', propertyName: 'Cozy Alpine Cabin', amount: 350, moveInDate: new Date(Date.now() + 86400000*3).toISOString(), tenantName: 'John Smith', tenantEmail: 'john@example.com', ownerName: 'Robert Davis', paymentStatus: 'Paid', status: 'Pending' }
  ];

  const getMockPayments = () => [
    { _id: 'p_1', bookingId: 'bk_1', amount: 4200, paymentStatus: 'Succeeded', transactionId: 'ch_stripe_mock_98765', payerName: 'Emma Watson', payerEmail: 'tenant@rental.com', createdAt: new Date().toISOString() },
    { _id: 'p_2', bookingId: 'bk_2', amount: 350, paymentStatus: 'Succeeded', transactionId: 'ch_stripe_mock_12345', payerName: 'John Smith', payerEmail: 'john@example.com', createdAt: new Date().toISOString() }
  ];

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/admin-overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch { /* keep defaults */ }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUsers(res.ok && Array.isArray(data) ? data : getMockUsers());
      } else if (activeTab === 'properties') {
        const res = await fetch(`${API_URL}/properties/admin/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setProperties(res.ok && Array.isArray(data) ? data : getMockProperties());
      } else if (activeTab === 'bookings') {
        const res = await fetch(`${API_URL}/bookings/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBookings(res.ok && Array.isArray(data) ? data : getMockBookings());
      } else if (activeTab === 'payments') {
        const res = await fetch(`${API_URL}/payments/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setPayments(res.ok && Array.isArray(data) ? data : getMockPayments());
      }
    } catch {
      if (activeTab === 'users') setUsers(getMockUsers());
      if (activeTab === 'properties') setProperties(getMockProperties());
      if (activeTab === 'bookings') setBookings(getMockBookings());
      if (activeTab === 'payments') setPayments(getMockPayments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      setTimeout(() => {
        setProfileName(prev => prev || authUser.name || '');
        setProfileEmail(prev => prev || authUser.email || '');
        setProfilePhoto(prev => prev || authUser.photo || '');
        setProfilePreview(prev => prev || authUser.photo || '');
      }, 0);
    }
  }, [authUser]);

  useEffect(() => {
    if (activeTab !== 'profile' && token) {
      fetchAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  // Fetch global stats once on load (independent of tab)
  useEffect(() => {
    if (token) {
      setTimeout(() => fetchAdminStats(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        showToast('User role updated successfully.');
      } else throw new Error();
    } catch {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showToast('Role updated (offline).');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        showToast('User deleted.');
      } else throw new Error();
    } catch {
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast('Removed (offline).');
    }
  };

  const handleApproveProperty = async (propId) => {
    try {
      const res = await fetch(`${API_URL}/properties/admin/verify/${propId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p._id !== propId));
        showToast('Property approved!');
        fetchAdminStats();
      } else {
        const err = await res.json();
        showToast(err.message || 'Approval failed. Try again.', 'error');
      }
    } catch {
      showToast('Network error. Approval may not have been saved.', 'error');
    }
  };

  const handleRejectPropertySubmit = async (e) => {
    e.preventDefault();
    if (!rejectionFeedback) { showToast('Please provide reason.', 'error'); return; }
    setRejectionSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/properties/admin/verify/${rejectingPropertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Rejected', rejectionFeedback })
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p._id !== rejectingPropertyId));
        showToast('Property rejected.');
      } else throw new Error();
    } catch {
      setProperties(prev => prev.filter(p => p._id !== rejectingPropertyId));
      showToast('Rejected (offline).');
    } finally {
      setRejectingPropertyId(null);
      setRejectionFeedback('');
      setRejectionSubmitting(false);
    }
  };

  const stats = {
    totalUsers: adminStats.totalUsers || 0,
    totalProperties: adminStats.totalProperties || 0,
    pendingProperties: adminStats.pendingProperties || 0,
    totalBookings: adminStats.totalBookings || 0,
    totalRevenue: adminStats.totalRevenue || 0
  };

  const filteredUsers = users.filter(u => (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const tabs = [
    { key: 'users', label: 'Users', icon: Users, color: '#0d9488' },
    { key: 'properties', label: 'Properties', icon: Building, color: '#f59e0b' },
    { key: 'bookings', label: 'Bookings', icon: Calendar, color: '#3b82f6' },
    { key: 'payments', label: 'Payments', icon: DollarSign, color: '#10b981' },
    { key: 'profile', label: 'Profile', icon: User, color: '#8b5cf6' },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* Stats Overview */}
      {activeTab !== 'profile' && (
        <div className={styles.statsGrid}>
          {[
            { icon: Users, label: 'Total Users', value: stats.totalUsers, color: '#0d9488', bg: 'rgba(13,148,136,0.1)' },
            { icon: Building, label: 'Total Properties', value: stats.totalProperties, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: Calendar, label: 'Total Bookings', value: stats.totalBookings, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
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
        {/* Sidebar */}
        <aside className={`${styles.sidebar} glass-card ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatarWrap}>
              <img
                src={authUser?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt=""
                className={styles.sidebarAvatar}
              />
              <div className={styles.sidebarStatus} />
            </div>
            {!sidebarCollapsed && (
              <>
                <h4>{authUser?.name}</h4>
                <span className="badge badge-rejected">Admin</span>
              </>
            )}
          </div>
          <div className={styles.sidebarDivider} />
          <nav className={styles.sidebarNav}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`${styles.sidebarBtn} ${styles.liquidBtn} ${activeTab === tab.key ? styles.sidebarBtnActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
                title={tab.label}
                style={{
                  '--liquid-bg': activeTab === tab.key ? 'rgba(13, 148, 136, 0.25)' : 'rgba(13, 148, 136, 0.12)',
                  '--liquid-hover-color': 'var(--text-primary)'
                }}
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

        {/* Content */}
        <main className={styles.contentArea}>

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>👥 User Management</h2>
                  <p className={styles.contentSub}>Manage all registered users and their roles</p>
                </div>
                <div className={styles.searchBox}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}>
                  <div className={styles.spinner} />
                  <span>Loading users...</span>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Change Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className={styles.userCell}>
                              <img src={u.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" />
                              <span>{u.name || 'Unknown User'}</span>
                            </div>
                          </td>
                          <td><span className={styles.emailText}>{u.email || 'No email provided'}</span></td>
                          <td>
                            <span className={`${styles.roleBadge} ${
                              u.role === 'Admin' ? styles.roleAdmin
                              : u.role === 'Owner' ? styles.roleOwner
                              : u.role === 'Tenant' ? styles.roleTenant
                              : styles.roleUser
                            }`}>{u.role || 'User'}</span>
                          </td>
                          <td>
                            <select
                              className={styles.roleSelect}
                              value={u.role || 'User'}
                              onChange={e => handleUpdateRole(u._id, e.target.value)}
                            >
                              <option value="User">User</option>
                              <option value="Tenant">Tenant</option>
                              <option value="Owner">Owner</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className={`${styles.deleteBtn} ${styles.liquidBtn}`}
                              title="Delete user"
                              style={{
                                '--liquid-bg': '#ef4444',
                                '--liquid-hover-color': '#ffffff',
                                '--liquid-shadow': 'rgba(239, 68, 68, 0.25)'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>🏠 Property Verification</h2>
                  <p className={styles.contentSub}>Review and moderate pending property listings</p>
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}><div className={styles.spinner} /><span>Loading properties...</span></div>
              ) : properties.length === 0 ? (
                <div className={styles.emptyState}>
                  <Building size={56} strokeWidth={1} />
                  <h3>All Clear!</h3>
                  <p>No pending property listings to review.</p>
                </div>
              ) : (
                <div className={styles.propertyGrid}>
                  {properties.map(prop => (
                    <div key={prop._id} className={styles.propertyCard}>
                      <div className={styles.propertyCardHeader}>
                        <span className={`${styles.statusBadge} ${prop.status === 'Pending' ? styles.statusPending : ''}`}>
                          {prop.status}
                        </span>
                        <span className={styles.propertyType}>{prop.propertyType}</span>
                      </div>
                      <h4>{prop.title}</h4>
                      <p className={styles.propertyLocation}>{prop.location}</p>
                      <div className={styles.propertyPrice}>
                        ${prop.rent}<span>/{prop.rentType === 'Daily' ? 'day' : 'mo'}</span>
                      </div>
                      <div className={styles.propertyOwner}>
                        <User size={14} />
                        <span>{prop.ownerName || 'Unknown Owner'}</span>
                      </div>
                      <div className={styles.propertyActions}>
                        <button
                          onClick={() => handleApproveProperty(prop._id)}
                          className={`${styles.approveBtn} ${styles.liquidBtn}`}
                          style={{
                            '--liquid-bg': 'var(--success-color)',
                            '--liquid-hover-color': '#ffffff',
                            '--liquid-shadow': 'rgba(16, 185, 129, 0.25)'
                          }}
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingPropertyId(prop._id)}
                          className={`${styles.rejectBtn} ${styles.liquidBtn}`}
                          style={{
                            '--liquid-bg': 'var(--danger-color)',
                            '--liquid-hover-color': '#ffffff',
                            '--liquid-shadow': 'rgba(239, 68, 68, 0.25)'
                          }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>📅 All Bookings</h2>
                  <p className={styles.contentSub}>Global booking transactions overview</p>
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}><div className={styles.spinner} /><span>Loading bookings...</span></div>
              ) : bookings.length === 0 ? (
                <div className={styles.emptyState}><Calendar size={56} strokeWidth={1} /><h3>No Bookings</h3><p>No bookings have been made yet.</p></div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Tenant</th>
                        <th>Owner</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b._id}>
                          <td><strong>{b.propertyName}</strong></td>
                          <td>
                            <div className={styles.userCell}>
                              <span>{b.tenantName || 'Unknown Tenant'}</span>
                              <span className={styles.subText}>{b.tenantEmail || 'No email provided'}</span>
                            </div>
                          </td>
                          <td>{b.ownerName || 'Unknown Owner'}</td>
                          <td><strong>${b.amount}</strong></td>
                          <td>{new Date(b.moveInDate || b.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td><span className={`${styles.badgeSmall} ${b.paymentStatus === 'Paid' ? styles.badgeSuccess : styles.badgeDanger}`}>{b.paymentStatus}</span></td>
                          <td><span className={`${styles.badgeSmall} ${b.status === 'Approved' ? styles.badgeSuccess : b.status === 'Cancelled' ? styles.badgeDanger : styles.badgeWarn}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>💰 Payment Transactions</h2>
                  <p className={styles.contentSub}>All payment logs and transaction history</p>
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}><div className={styles.spinner} /><span>Loading payments...</span></div>
              ) : payments.length === 0 ? (
                <div className={styles.emptyState}><DollarSign size={56} strokeWidth={1} /><h3>No Payments</h3><p>Transactions appear here once bookings are confirmed.</p></div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Payer</th>
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p._id}>
                          <td>
                            <div className={styles.userCell}>
                              <span>{p.payerName || 'Unknown Payer'}</span>
                              <span className={styles.subText}>{p.payerEmail || 'No email provided'}</span>
                            </div>
                          </td>
                          <td><code className={styles.txId}>{p.transactionId || 'N/A'}</code></td>
                          <td><strong>${p.amount}</strong></td>
                          <td>{new Date(p.createdAt || Date.now()).toLocaleString()}</td>
                          <td><span className={`${styles.badgeSmall} ${styles.badgeSuccess}`}>{p.paymentStatus || 'Succeeded'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
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
                    <img
                      src={profilePreview || authUser?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                      alt=""
                      className={styles.profilePhoto}
                    />
                    <div className={styles.profilePhotoOverlay} onClick={() => document.getElementById('admin-photo-input')?.click()}>
                      <Camera size={24} />
                    </div>
                    <input
                      id="admin-photo-input"
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
                  <h3>{authUser?.name}</h3>
                  <p className={styles.profileEmail}>{authUser?.email}</p>
                  <span className="badge badge-rejected" style={{ fontSize: '0.85rem', padding: '0.35rem 1rem' }}>{authUser?.role}</span>
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
                      <label className="form-label">Gmail / Email Address</label>
                      <div className={styles.inputGroup}>
                        <Mail size={18} className={styles.inputGroupIcon} />
                        <input type="email" className="form-input" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Profile Photo URL</label>
                      <div className={styles.inputGroup}>
                        <ImageIcon size={18} className={styles.inputGroupIcon} />
                        <input type="url" className="form-input" value={profilePhoto} onChange={e => { setProfilePhoto(e.target.value); setProfilePreview(e.target.value); }} placeholder="https://example.com/photo.jpg" />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={`${styles.saveBtn} ${styles.liquidBtn}`}
                      disabled={profileSubmitting}
                      style={{
                        '--liquid-bg': 'var(--accent-hover)',
                        '--liquid-hover-color': '#ffffff',
                        '--liquid-shadow': 'rgba(13, 148, 136, 0.3)'
                      }}
                    >
                      {profileSubmitting ? 'Saving...' : 'Save Changes'} <Zap size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Rejection Modal */}
      {rejectingPropertyId && (
        <div className={styles.modalOverlay} onClick={() => setRejectingPropertyId(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Reject Listing</h3>
              <button onClick={() => setRejectingPropertyId(null)} className={styles.modalClose}><X size={20} /></button>
            </div>
            <form onSubmit={handleRejectPropertySubmit}>
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea rows={4} className="form-input" placeholder="Explain why this listing is being rejected..." value={rejectionFeedback} onChange={e => setRejectionFeedback(e.target.value)} required />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setRejectingPropertyId(null)}
                  className={`btn btn-secondary ${styles.liquidBtn}`}
                  style={{
                    '--liquid-bg': 'var(--bg-tertiary)',
                    '--liquid-hover-color': 'var(--text-primary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-danger ${styles.liquidBtn}`}
                  disabled={rejectionSubmitting}
                  style={{
                    '--liquid-bg': 'var(--danger-color)',
                    '--liquid-hover-color': '#ffffff',
                    '--liquid-shadow': 'rgba(239, 68, 68, 0.25)'
                  }}
                >
                  {rejectionSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}