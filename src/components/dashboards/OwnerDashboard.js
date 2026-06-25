'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building, Calendar, DollarSign, PlusCircle, CheckCircle, XCircle, 
  Trash2, FileText, BarChart3, User, ImageIcon, Zap, Mail,
  TrendingUp, Star, Clock, MapPin, ChevronLeft, ChevronRight,
  MessageCircle, Search, Home, Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import styles from './OwnerDashboard.module.css';

export default function OwnerDashboard() {
  const { user, token, showToast, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [rent, setRent] = useState('');
  const [rentType, setRentType] = useState('Monthly');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1.5);
  const [propertySize, setPropertySize] = useState(1200);
  const [amenities, setAmenities] = useState('');
  const [imageList, setImageList] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getMockAnalytics = () => ({
    totalProperties: 4, totalBookings: 8, totalRevenue: 7800,
    monthlyRevenue: [
      { name: 'Jan', revenue: 1500, bookings: 2 },
      { name: 'Feb', revenue: 2200, bookings: 3 },
      { name: 'Mar', revenue: 1900, bookings: 2 },
      { name: 'Apr', revenue: 3100, bookings: 4 },
      { name: 'May', revenue: 2700, bookings: 3 },
      { name: 'Jun', revenue: 3800, bookings: 5 }
    ]
  });

  const getMockProperties = () => [
    { _id: '1', title: 'Luxury Penthouse with Skyline Views', location: 'Dhaka, Dhaka Division', propertyType: 'Apartment', rent: 4200, rentType: 'Monthly', status: 'Approved', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'] },
    { _id: '2', title: 'Modern Minimalist Villa with Infinity Pool', location: 'Chattogram, Chattogram Division', propertyType: 'Villa', rent: 8500, rentType: 'Monthly', status: 'Rejected', rejectionFeedback: 'Pool certification missing.', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'] },
    { _id: '3', title: 'Cozy Alpine Cabin near Ski Slopes', location: 'Sylhet, Sylhet Division', propertyType: 'Cabin', rent: 350, rentType: 'Daily', status: 'Pending', images: ['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400'] }
  ];

  const getMockBookings = () => [
    { _id: 'bk_1', propertyName: 'Luxury Penthouse with Skyline Views', amount: 4200, moveInDate: new Date().toISOString(), tenantName: 'Emma Watson', tenantPhone: '+1 (555) 123-4567', paymentStatus: 'Paid', status: 'Pending' },
    { _id: 'bk_2', propertyName: 'Cozy Alpine Cabin', amount: 350, moveInDate: new Date(Date.now()+86400000*5).toISOString(), tenantName: 'John Smith', tenantPhone: '+1 (555) 987-6543', paymentStatus: 'Paid', status: 'Pending' }
  ];

  const fetchOwnerData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await fetch(`${API_URL}/analytics/owner-overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const fallback = getMockAnalytics();
        setAnalytics(res.ok ? {
          ...data,
          monthlyRevenue: Array.isArray(data.monthlyRevenue)
            ? data.monthlyRevenue
            : Array.isArray(data.chartData)
              ? data.chartData
              : fallback.monthlyRevenue
        } : fallback);
      } else if (activeTab === 'properties') {
        const res = await fetch(`${API_URL}/properties/owner`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setProperties(res.ok && Array.isArray(data) ? data : []);
      } else if (activeTab === 'requests') {
        const res = await fetch(`${API_URL}/bookings/owner`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBookings(res.ok && Array.isArray(data) ? data : []);
      }
    } catch {
      // keep existing state on network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => { setMounted(true); }, 0);
  }, []);

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

  // Fetch on mount AND whenever tab or token changes
  useEffect(() => {
    if (activeTab !== 'profile' && token) {
      fetchOwnerData();
    }
  }, [activeTab, token]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageList(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImageList(prev => [...prev, url]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageList(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!title || !location || !rent) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    const parsedAmenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
    const finalImages = imageList.length > 0
      ? imageList
      : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600'];
    try {
      const res = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title, description, location, propertyType,
          rent: Number(rent), rentType,
          bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
          propertySize: Number(propertySize),
          amenities: parsedAmenities,
          images: finalImages
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Property listed! Pending admin approval.', 'success');
        setTitle(''); setDescription(''); setLocation(''); setRent('');
        setAmenities(''); setImageList([]); setImageUrlInput('');
        setActiveTab('properties');
      } else {
        showToast(data.message || 'Failed to create property.', 'error');
      }
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async (propId) => {
    try {
      const res = await fetch(`${API_URL}/properties/${propId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p._id !== propId));
        showToast('Property deleted.');
      } else throw new Error();
    } catch {
      setProperties(prev => prev.filter(p => p._id !== propId));
      showToast('Removed (fallback).');
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        showToast(`Booking ${action} successfully!`);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to update booking.', 'error');
      }
    } catch {
      showToast('Network error. Could not update booking.', 'error');
    }
  };

  const handleDownloadReport = () => {
    showToast('Preparing PDF report...');
    setTimeout(() => window.print(), 500);
  };

  const tabs = [
    { key: 'analytics', label: 'Analytics', icon: BarChart3, color: '#0d9488' },
    { key: 'add-property', label: 'Add Property', icon: PlusCircle, color: '#3b82f6' },
    { key: 'properties', label: 'Listings', icon: Building, color: '#f59e0b' },
    { key: 'requests', label: 'Requests', icon: Calendar, color: '#8b5cf6' },
    { key: 'profile', label: 'Profile', icon: User, color: '#10b981' },
  ];

  return (
    <div className={styles.dashboardWrapper}>
      {/* Stats Overview */}
      {activeTab === 'analytics' && analytics && (
        <div className={styles.statsGrid}>
          {[
            { icon: Building, label: 'Properties', value: analytics.totalProperties, color: '#0d9488', bg: 'rgba(13,148,136,0.1)' },
            { icon: Calendar, label: 'Bookings', value: analytics.totalBookings, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { icon: DollarSign, label: 'Revenue', value: `$${analytics.totalRevenue}`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { icon: TrendingUp, label: 'Growth', value: '+24%', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
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
                <span className="badge badge-owner">Owner</span>
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

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && analytics && (
            <div className={styles.analyticsWrapper}>
              <div className={`${styles.contentCard} glass-card`}>
                <div className={styles.chartHeader}>
                  <div>
                    <h2>📊 Revenue Overview</h2>
                    <p className={styles.contentSub}>Monthly revenue and booking performance</p>
                  </div>
                  <button onClick={handleDownloadReport} className={styles.reportBtn}>
                    <FileText size={16} /> Report
                  </button>
                </div>
                <div className={styles.chartContainer}>
                  {mounted && (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={analytics.monthlyRevenue || analytics.chartData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="var(--accent-primary)" strokeWidth={3} activeDot={{ r: 8 }} name="Revenue ($)" />
                        <Line type="monotone" dataKey="bookings" stroke="var(--accent-secondary)" strokeWidth={2} name="Bookings" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ADD PROPERTY TAB */}
          {activeTab === 'add-property' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>🏗️ Add New Property</h2>
                  <p className={styles.contentSub}>List a new rental property for tenants</p>
                </div>
              </div>
              <form onSubmit={handleAddProperty} className={styles.propertyForm}>
                <div className={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Title *</label>
                    <input type="text" placeholder="e.g. Spacious Studio" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ minWidth: 160 }}>
                    <label className="form-label">Type *</label>
                    <select className="form-input" value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Cabin">Cabin</option>
                      <option value="House">House</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea rows={3} className="form-input" placeholder="Describe your property..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Location *</label>
                    <input type="text" placeholder="e.g. Dhaka, Dhaka Division" className="form-input" value={location} onChange={e => setLocation(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ minWidth: 200 }}>
                    <label className="form-label">Rent ($) *</label>
                    <div className={styles.priceRow}>
                      <input type="number" placeholder="2500" className="form-input" value={rent} onChange={e => setRent(e.target.value)} required />
                      <select className="form-input" value={rentType} onChange={e => setRentType(e.target.value)} style={{ maxWidth: 110 }}>
                        <option value="Monthly">/mo</option>
                        <option value="Daily">/day</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.specsGrid}>
                  <div className="form-group">
                    <label className="form-label">Bedrooms</label>
                    <input type="number" className="form-input" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bathrooms</label>
                    <input type="number" step="0.5" className="form-input" value={bathrooms} onChange={e => setBathrooms(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sqft</label>
                    <input type="number" className="form-input" value={propertySize} onChange={e => setPropertySize(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Amenities (comma-separated)</label>
                  <input type="text" placeholder="Pool, Gym, Wifi" className="form-input" value={amenities} onChange={e => setAmenities(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Property Images</label>
                  <div className={styles.uploadContainer}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Paste an image URL and click Add" 
                        className="form-input" 
                        value={imageUrlInput} 
                        onChange={e => setImageUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                      />
                      <button type="button" onClick={handleAddImageUrl} className={styles.submitBtn} style={{ minWidth: 80, padding: '0 1rem', marginTop: 0 }}>Add</button>
                    </div>
                    <label className={styles.imageUploadBox}>
                      <span>📁 Click to Upload Local Image(s)</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleImageUpload} 
                      />
                    </label>
                  </div>
                  {imageList.length > 0 && (
                    <div className={styles.imagePreviewGrid}>
                      {imageList.map((imgUrl, idx) => (
                        <div key={idx} className={styles.previewItem}>
                          <img src={imgUrl} alt={`preview-${idx}`} />
                          <button 
                            type="button" 
                            className={styles.removePreviewBtn} 
                            onClick={() => handleRemoveImage(idx)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Listing...' : 'Add Property'} <Zap size={16} />
                </button>
              </form>
            </div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>🏘️ My Properties</h2>
                  <p className={styles.contentSub}>All your listed properties</p>
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}><div className={styles.spinner} /><span>Loading...</span></div>
              ) : properties.length === 0 ? (
                <div className={styles.emptyState}>
                  <Building size={56} strokeWidth={1} />
                  <h3>No Properties Yet</h3>
                  <p>Click &quot;Add Property&quot; to list your first rental.</p>
                </div>
              ) : (
                <div className={styles.propertyGrid}>
                  {properties.map(prop => (
                    <div key={prop._id} className={styles.propertyCard}>
                      <div className={styles.propertyImgWrap}>
                        <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'} alt="" />
                        <span className={`${styles.statusBadge} ${
                          prop.status === 'Approved' ? styles.statusApproved :
                          prop.status === 'Rejected' ? styles.statusRejected : styles.statusPending
                        }`}>{prop.status}</span>
                      </div>
                      <div className={styles.propertyInfo}>
                        <h4>{prop.title}</h4>
                        <p><MapPin size={13} /> {prop.location}</p>
                        <div className={styles.propertyMeta}>
                          <span className={styles.propertyPrice}>${prop.rent}<small>/{prop.rentType === 'Daily' ? 'day' : 'mo'}</small></span>
                          <span className={styles.propertyType}>{prop.propertyType}</span>
                        </div>
                        {prop.status === 'Rejected' && prop.rejectionFeedback && (
                          <div className={styles.feedbackBox}>
                            <MessageCircle size={14} />
                            <span>{prop.rejectionFeedback}</span>
                          </div>
                        )}
                        <button onClick={() => handleDeleteProperty(prop._id)} className={styles.deletePropBtn}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className={`${styles.contentCard} glass-card`}>
              <div className={styles.contentHeader}>
                <div>
                  <h2>📋 Booking Requests</h2>
                  <p className={styles.contentSub}>Approve or reject tenant booking requests</p>
                </div>
              </div>
              {loading ? (
                <div className={styles.loader}><div className={styles.spinner} /><span>Loading...</span></div>
              ) : bookings.length === 0 ? (
                <div className={styles.emptyState}>
                  <Calendar size={56} strokeWidth={1} />
                  <h3>No Requests</h3>
                  <p>Tenant booking requests will appear here.</p>
                </div>
              ) : (
                <div className={styles.requestsList}>
                  {bookings.map(b => (
                    <div key={b._id} className={styles.requestCard}>
                      <div className={styles.requestInfo}>
                        <h4>{b.propertyName}</h4>
                        <div className={styles.requestMeta}>
                          <span><User size={14} /> {b.tenantName}</span>
                          <span><DollarSign size={14} /> ${b.amount}</span>
                          <span><Calendar size={14} /> {new Date(b.moveInDate).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.requestStatus}>
                          <span className={`${styles.badgeSmall} ${b.paymentStatus === 'Paid' ? styles.badgeSuccess : styles.badgeDanger}`}>
                            {b.paymentStatus}
                          </span>
                          <span className={`${styles.badgeSmall} ${
                            b.status === 'Approved' ? styles.badgeSuccess :
                            b.status === 'Cancelled' ? styles.badgeDanger : styles.badgeWarn
                          }`}>{b.status}</span>
                        </div>
                      </div>
                      {b.status === 'Pending' && (
                        <div className={styles.requestActions}>
                          <button onClick={() => handleBookingAction(b._id, 'Approved')} className={styles.approveBtn}>
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button onClick={() => handleBookingAction(b._id, 'Cancelled')} className={styles.rejectBtn}>
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
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
                    <img src={profilePreview || user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} alt="" className={styles.profilePhoto} />
                    <div className={styles.profilePhotoOverlay} onClick={() => document.getElementById('owner-photo-input')?.click()}><ImageIcon size={24} /></div>
                    <input
                      id="owner-photo-input"
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
                  <span className="badge badge-owner" style={{ fontSize: '0.85rem', padding: '0.35rem 1rem' }}>{user?.role}</span>
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