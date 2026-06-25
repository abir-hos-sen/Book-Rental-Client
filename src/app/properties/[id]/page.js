'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Heart, Share2, Phone, Star, Send, ShieldCheck, Info, User, Check, X, CreditCard } from 'lucide-react';
import styles from './details.module.css';

const MOCK_FALLBACK_PROPERTIES = [
  { _id: '1', title: 'Luxury Penthouse with Skyline Views', description: 'Stunning luxury penthouse in the heart of downtown. Features floor-to-ceiling windows, modern kitchen appliances, private terrace, and 24/7 concierge services. Ideal for urban professionals seeking an upscale lifestyle.', location: 'Dhaka, Dhaka Division', propertyType: 'Apartment', rent: 4200, rentType: 'Monthly', bedrooms: 3, bathrooms: 2.5, propertySize: 1850, amenities: ['Private Terrace', 'Gym', 'Concierge', 'High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning'], images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'], extraFeatures: ['Walk-in Closets', 'Wine Cooler', 'Heated Floors'], ownerEmail: 'owner@rental.com', ownerName: 'Robert Davis', status: 'Approved' },
  { _id: '2', title: 'Modern Minimalist Villa with Infinity Pool', description: 'Escape to this architectural masterpiece. Nestled in the hills, this villa offers absolute privacy, a magnificent infinity pool overlooking the ocean, open-plan living, and state-of-the-art automation systems.', location: 'Chattogram, Chattogram Division', propertyType: 'Villa', rent: 8500, rentType: 'Monthly', bedrooms: 4, bathrooms: 4, propertySize: 3200, amenities: ['Infinity Pool', 'Home Theater', 'Garage', 'Garden', 'Security System', 'Solar Power'], images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=600'], extraFeatures: ['Ocean Front', 'Private Chef Available', 'Smart Home System'], ownerEmail: 'owner@rental.com', ownerName: 'Robert Davis', status: 'Approved' },
  { _id: '3', title: 'Cozy Alpine Cabin near Ski Slopes', description: 'A charming wooden cabin perfect for winter getaways or summer hiking trips. Enjoy a warm fireplace, outdoor hot tub, rustic design elements, and easy ski-in/ski-out access to the main resort routes.', location: 'Sylhet, Sylhet Division', propertyType: 'Cabin', rent: 350, rentType: 'Daily', bedrooms: 2, bathrooms: 1.5, propertySize: 1100, amenities: ['Hot Tub', 'Fireplace', 'Ski Access', 'Pet Friendly', 'Fire Pit', 'Barbecue Grill'], images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&q=80&w=600'], extraFeatures: ['Mountain Views', 'Firewood Provided', 'Heated Mudroom'], ownerEmail: 'owner@rental.com', ownerName: 'Robert Davis', status: 'Approved' }
];

const MOCK_REVIEWS = [
  { _id: 'r1', tenantName: 'Emma Watson', tenantEmail: 'emma@tenant.com', tenantPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', rating: 5, comment: 'Absolutely breathtaking! The penthouse views are even better in person. The booking and key transfer process was seamless, and Robert was a wonderful owner to deal with. Worth every single penny!', date: new Date().toISOString() }
];

export default function PropertyDetailsPage({ params }) {
  // `params` may be a server Promise when this is a Client Component.
  // Unwrap it safely using React.use() per Next.js sync dynamic APIs.
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const { user, token, showToast } = useAuth();
  const router = useRouter();

  // Core Data States
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction States
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  // Booking Form States
  const [moveInDate, setMoveInDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchPropertyDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch property details
      const propRes = await fetch(`${API_URL}/properties/${id}`);
      const propData = await propRes.json();
      
      if (propRes.ok && propData) {
        setProperty(propData);
        setActiveImage(propData.images[0] || '');
      } else {
        throw new Error('Failed to load property');
      }

      // Fetch reviews
      const revRes = await fetch(`${API_URL}/reviews/property/${id}`);
      const revData = await revRes.json();
      if (revRes.ok && Array.isArray(revData)) {
        setReviews(revData);
      }

      // Check if in favorites
      if (token) {
        const favRes = await fetch(`${API_URL}/favorites/tenant`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const favData = await favRes.json();
        if (favRes.ok && Array.isArray(favData)) {
          const found = favData.some(fav => fav.propertyId?._id === id || fav.propertyId === id);
          setIsFavorite(found);
        }
      }

    } catch (error) {
      console.log('Error fetching details, loading local fallback.', error);
      // Fallback details
      const fallback = MOCK_FALLBACK_PROPERTIES.find(p => p._id === id) || MOCK_FALLBACK_PROPERTIES[0];
      setProperty(fallback);
      setActiveImage(fallback.images[0] || '');
      setReviews(MOCK_REVIEWS);
    } finally {
      setLoading(false);
    }
  }, [id, token, API_URL]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPropertyDetails();

    // Re-fetch when user returns to this tab (e.g. after payment gateway)
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchPropertyDetails();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [id, user, fetchPropertyDetails, router]);

  // Guard: if user is not loaded yet, show nothing
  if (!user) return null;

  // Toggle Favorite Action
  const handleFavoriteToggle = async () => {
    if (!['Tenant', 'User'].includes(user.role)) {
      showToast('Please login as a Tenant or User to save favorites!', 'warning');
      return;
    }

    try {
      if (isFavorite) {
        const res = await fetch(`${API_URL}/favorites/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setIsFavorite(false);
          showToast('Removed from Favorites');
        }
      } else {
        const res = await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ propertyId: id })
        });
        if (res.ok) {
          setIsFavorite(true);
          showToast('Added to Favorites!');
        }
      }
    } catch (error) {
      setIsFavorite(!isFavorite);
      showToast('Action saved locally (demo fallback).');
    }
  };

  // Copy/Share Link Action
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Listing link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!['Tenant', 'User'].includes(user.role)) {
      showToast('Please login as a Tenant or User to book properties!', 'warning');
      return;
    }

    if (!moveInDate || !contactNumber) {
      showToast('Please provide Move-in Date and Contact Number.', 'error');
      return;
    }

    setBookingSubmitting(true);

    if (paymentMethod !== 'card') {
      try {
        const res = await fetch(`${API_URL}/payments/local-payment/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ propertyId: id, moveInDate, tenantPhone: contactNumber, additionalNotes, paymentMethod })
        });
        const data = await res.json();
        if (res.ok && data.paymentId) {
          const params = new URLSearchParams({
            paymentId: data.paymentId,
            bookingId: data.bookingId,
            amount: data.amount,
            method: paymentMethod,
            propertyName: property.title,
            sessionToken: data.sessionToken,
          });
          router.push(`/checkout/local-gateway?${params.toString()}`);
        } else {
          showToast(data.message || 'Payment initiation failed.', 'error');
          setBookingSubmitting(false);
        }
      } catch {
        showToast('Network error. Please try again.', 'error');
        setBookingSubmitting(false);
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/payments/card-payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ propertyId: id, moveInDate, tenantPhone: contactNumber, additionalNotes, propertyTitle: property?.title, propertyRent: property?.rent })
      });
      const data = await res.json();
      if (res.ok && data.paymentId) {
        const params = new URLSearchParams({
          paymentId: data.paymentId,
          bookingId: data.bookingId,
          amount: data.amount,
          propertyName: property.title,
          sessionToken: data.sessionToken,
        });
        showToast('Initiating secure card gateway...', 'success');
        router.push(`/checkout/card-gateway?${params.toString()}`);
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      showToast(error.message || 'Card payment not available. Opening fallback simulation.', 'warning');
      setTimeout(() => {
        router.push(`/checkout/success?session_id=mock_card_session_${Date.now()}&property_id=${id}&date=${moveInDate}&phone=${contactNumber}`);
      }, 1500);
    } finally {
      setBookingSubmitting(false);
    }
  };


  // Submit Review Action
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!['Tenant', 'User'].includes(user.role)) {
      showToast('Please login as a Tenant or User to write reviews!', 'warning');
      return;
    }

    if (!reviewComment) {
      showToast('Please type a review comment.', 'error');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await res.json();

      if (res.ok && data.review) {
        setReviews(prev => [data.review, ...prev]);
        setReviewComment('');
        showToast('Review submitted successfully!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      // Local fallback
      const mockNewReview = {
        _id: `r_new_${Date.now()}`,
        tenantName: user.name,
        tenantEmail: user.email,
        tenantPhoto: user.photo,
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString()
      };
      setReviews(prev => [mockNewReview, ...prev]);
      setReviewComment('');
      showToast('Review submitted (local fallback)!');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.detailsLoader}>
        <div className={styles.spinner}></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={`${styles.errorState} container`}>
        <h2>Property not found</h2>
        <button onClick={() => router.push('/properties')} className="btn btn-secondary">
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.detailsPage} container`}>
      {/* Top action row */}
      <div className={styles.topActionsRow}>
        <button onClick={() => router.push('/properties')} className={`${styles.backBtn} btn btn-secondary`}>
          &larr; Back to Listings
        </button>
        <div className={styles.socialButtons}>
          <button 
            onClick={handleFavoriteToggle} 
            className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''} btn btn-secondary`}
          >
            <Heart size={18} fill={isFavorite ? 'var(--danger-color)' : 'transparent'} />
            {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
          </button>
          <button onClick={handleShare} className="btn btn-secondary">
            {copied ? <Check size={18} className={styles.checkIcon} /> : <Share2 size={18} />}
            {copied ? 'Link Copied!' : 'Share Listing'}
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className={styles.galleryContainer}>
        <div className={styles.mainImageWrapper}>
          <img src={activeImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} alt={property.title} className={styles.mainImage} />
        </div>
        {property.images && property.images.length > 1 && (
          <div className={styles.thumbnails}>
            {property.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Thumbnail ${idx + 1}`} 
                onClick={() => setActiveImage(img)}
                className={`${styles.thumbnail} ${activeImage === img ? styles.activeThumbnail : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main content grid */}
      <div className={styles.detailsGrid}>
        
        {/* Left Column: Descriptions, features, reviews */}
        <div className={styles.leftColumn}>
          <div className={styles.listingHeader}>
            <div className={styles.typeTag}>{property.propertyType}</div>
            <h1>{property.title}</h1>
            <div className={styles.locationTag}>
              <MapPin size={16} />
              <span>{property.location}</span>
            </div>
          </div>

          <div className={styles.specsBox}>
            <div className={styles.spec}>
              <span className={styles.specValue}>{property.bedrooms}</span>
              <span className={styles.specLabel}>Bedrooms</span>
            </div>
            <div className={styles.spec}>
              <span className={styles.specValue}>{property.bathrooms}</span>
              <span className={styles.specLabel}>Bathrooms</span>
            </div>
            <div className={styles.spec}>
              <span className={styles.specValue}>{property.propertySize}</span>
              <span className={styles.specLabel}>Square Feet</span>
            </div>
            <div className={styles.spec}>
              <span className={styles.specValue}>${property.rent}</span>
              <span className={styles.specLabel}>Rent ({property.rentType})</span>
            </div>
          </div>

          <div className={styles.sectionDivider}></div>

          <div className={styles.descriptionSection}>
            <h2>About this Property</h2>
            <p>{property.description}</p>
          </div>

          <div className={styles.sectionDivider}></div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className={styles.amenitiesSection}>
              <h2>Amenities Offered</h2>
              <div className={styles.amenitiesGrid}>
                {property.amenities.map((amenity, index) => (
                  <div key={index} className={styles.amenityItem}>
                    <ShieldCheck size={18} className={styles.amenityIcon} />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra features */}
          {property.extraFeatures && property.extraFeatures.length > 0 && (
            <>
              <div className={styles.sectionDivider}></div>
              <div className={styles.amenitiesSection}>
                <h2>Premium Highlights</h2>
                <div className={styles.amenitiesGrid}>
                  {property.extraFeatures.map((feat, index) => (
                    <div key={index} className={styles.amenityItem}>
                      <Star size={16} fill="var(--warning-color)" className={styles.starIcon} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className={styles.sectionDivider}></div>

          {/* Reviews List */}
          <div className={styles.reviewsSection}>
            <h2>Tenant Reviews ({reviews.length})</h2>
            
            {/* Review writer form */}
            {['Tenant', 'User'].includes(user.role) && (
              <form onSubmit={handleReviewSubmit} className={`${styles.reviewForm} glass-card`}>
                <h3>Submit a Review</h3>
                <div className={styles.ratingSelectorRow}>
                  <label className="form-label">Your Rating:</label>
                  <div className={styles.starsSelect}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button 
                        key={num} 
                        type="button"
                        onClick={() => setReviewRating(num)}
                        className={styles.starSelectBtn}
                      >
                        <Star size={24} fill={num <= reviewRating ? 'var(--warning-color)' : 'transparent'} stroke="var(--warning-color)" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Comment</label>
                  <textarea 
                    rows="4" 
                    placeholder="Describe your renting experience here..." 
                    className="form-input"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                  <Send size={16} />
                  {reviewSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews display list */}
            {reviews.length === 0 ? (
              <p className={styles.noReviews}>No reviews submitted yet for this property.</p>
            ) : (
              <div className={styles.reviewsList}>
                {reviews.map((rev) => (
                  <div key={rev._id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <img src={rev.tenantPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt={rev.tenantName} className={styles.revAvatar} />
                      <div>
                        <h4>{rev.tenantName}</h4>
                        <span className={styles.revEmail}>{rev.tenantEmail}</span>
                        <div className={styles.revDate}>{new Date(rev.date || rev.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className={styles.revStars}>
                        {Array(rev.rating).fill().map((_, i) => (
                          <Star key={i} size={14} fill="var(--warning-color)" stroke="var(--warning-color)" />
                        ))}
                      </div>
                    </div>
                    <p className={styles.revComment}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing card, booking triggering */}
        <div className={styles.rightColumn}>
          <div className={`${styles.pricingCard} glass-card`}>
            <div className={styles.priceHeading}>
              <span className={styles.priceAmount}>${property.rent}</span>
              <span className={styles.pricePeriod}>/{property.rentType === 'Daily' ? 'day' : 'month'}</span>
            </div>

            <div className={styles.specsShort}>
              <div><span>Type:</span> <strong>{property.propertyType}</strong></div>
              <div><span>Size:</span> <strong>{property.propertySize} sqft</strong></div>
              <div><span>Host:</span> <strong>{property.ownerName}</strong></div>
            </div>

            <button 
              onClick={() => setBookingModalOpen(true)}
              className={`btn ${property.isBooked ? 'btn-secondary' : 'btn-primary'} w-full mt-4`}
              disabled={property.status !== 'Approved' || property.isBooked}
            >
              {property.isBooked ? (
                <>
                  <ShieldCheck size={18} />
                  Booked / Sold Out
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  Book Property Now
                </>
              )}
            </button>

            <div className={styles.guaranteeBox}>
              <ShieldCheck size={16} className={styles.guaranteeIcon} />
              <span>100% Secure Transaction via SSLCommerz</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOOKING FORM MODAL OVERLAY */}
      {bookingModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glass-card`}>
            <div className={styles.modalHeader}>
              <h3>Reserve {property.title}</h3>
              <button onClick={() => setBookingModalOpen(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className={styles.modalForm}>
              
              {/* User Info (Readonly) */}
              <div className="form-group">
                <label className="form-label">Renter Name</label>
                <div className={styles.readOnlyField}>
                  <User size={16} />
                  <span>{user.name}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Renter Email</label>
                <div className={styles.readOnlyField}>
                  <span>{user.email}</span>
                </div>
              </div>

              {/* Move-in Date */}
              <div className="form-group">
                <label className="form-label">Move-in Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Contact number */}
              <div className="form-group">
                <label className="form-label">Contact Phone Number *</label>
                <div className={styles.inputWrapper}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    className="form-input styles.phoneInput"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Additional notes */}
              <div className="form-group">
                <label className="form-label">Special Requests / Notes (Optional)</label>
                <textarea 
                  rows="3" 
                  placeholder="Tell the owner anything else about your stay..." 
                  className="form-input"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Payment Method Selection */}
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                  {[
                    { value: 'card', label: '💳 Credit/Debit Card', sub: 'Visa, Mastercard' },
                    { value: 'bkash', label: '🔴 bKash', sub: 'Mobile Banking' },
                    { value: 'nagad', label: '🟠 Nagad', sub: 'Mobile Banking' },
                    { value: 'rocket', label: '🚀 Rocket', sub: 'DBBL Mobile' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value)}
                      style={{
                        padding: '10px 12px',
                        border: paymentMethod === opt.value ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                        borderRadius: '10px',
                        background: paymentMethod === opt.value ? 'var(--primary-light, rgba(99,102,241,0.08))' : 'var(--surface-color)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-color)' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className={styles.paymentSummary}>
                <div className={styles.summaryRow}>
                  <span>Reservation Fee ({property.rentType === 'Daily' ? '1 Day' : '1 Month'})</span>
                  <span>${property.rent}.00</span>
                </div>
                {paymentMethod !== 'card' && (
                  <div className={styles.summaryRow}>
                    <span>Equivalent (BDT ~120x)</span>
                    <span>৳{(property.rent * 120).toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Service Fee</span>
                  <span>$0.00</span>
                </div>
                <div className={styles.totalDivider}></div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total Amount Due</span>
                  <span>
                    {paymentMethod === 'card'
                      ? `$${property.rent}.00`
                      : `৳${(property.rent * 120).toLocaleString()}`
                    }
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={bookingSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingSubmitting}
                >
                  <CreditCard size={18} />
                  {bookingSubmitting ? 'Processing...' : `Pay via ${paymentMethod === 'card' ? 'Card' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
