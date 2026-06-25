'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, DollarSign, Star, ShieldCheck, HeartHandshake, Compass, Users2, Landmark, ChevronRight, Sparkles, Building2, Flame } from 'lucide-react';
import styles from './page.module.css';

// Extracted constants - Available property types for dropdown filter
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Cabin', 'House'];

// Popular location cards shown on homepage with count and images
// Improves code readability by moving static data outside component
const TRENDING_LOCATIONS = [
  { name: 'Dhaka', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=400', count: '12 properties' },
  { name: 'Chattogram', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400', count: '8 properties' },
  { name: 'Sylhet', image: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&q=80&w=400', count: '5 properties' },
  { name: 'Khulna', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=400', count: '10 properties' }
];

// Platform statistics section - Shows key metrics with icon and label
// Each stat includes an icon component, value, and descriptive label
const HOME_STATS = [
  { icon: Users2, value: '12K+', label: 'Happy Tenants' },
  { icon: Landmark, value: '450+', label: 'Verified Properties' },
  { icon: Building2, value: '80+', label: 'Trusted Owners' },
  { icon: Star, value: '4.9', label: 'Average Renter Rating' }
];

// API base URL - Extracted to module level to avoid dependency warnings in useEffect
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to build property search query string with all filters
// Accepts search object with multiple filter parameters
// Returns URL query string (e.g., "?search=penthouse&propertyType=Villa")
// Centralizes query building logic for easier maintenance and updates
function buildPropertySearchQuery({ search, propertyType, minPrice, maxPrice }) {
  const queryParams = [];

  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (propertyType !== 'All') queryParams.push(`propertyType=${propertyType}`);
  if (minPrice) queryParams.push(`minPrice=${minPrice}`);
  if (maxPrice) queryParams.push(`maxPrice=${maxPrice}`);

  return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
}

const FALLBACK_PROPERTIES = [
  {
    _id: '1',
    title: 'Luxury Penthouse with Skyline Views',
    description: 'Stunning luxury penthouse in the heart of downtown. Features floor-to-ceiling windows, modern kitchen appliances, private terrace, and 24/7 concierge.',
    location: 'Dhaka, Dhaka Division',
    propertyType: 'Apartment',
    rent: 4200,
    rentType: 'Monthly',
    bedrooms: 3,
    bathrooms: 2.5,
    propertySize: 1850,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'],
    status: 'Approved'
  },
  {
    _id: '2',
    title: 'Modern Minimalist Villa with Infinity Pool',
    description: 'Escape to this architectural masterpiece. Nestled in the hills, this villa offers absolute privacy, a magnificent infinity pool overlooking the ocean, open-plan living.',
    location: 'Chattogram, Chattogram Division',
    propertyType: 'Villa',
    rent: 8500,
    rentType: 'Monthly',
    bedrooms: 4,
    bathrooms: 4,
    propertySize: 3200,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600'],
    status: 'Approved'
  },
  {
    _id: '3',
    title: 'Cozy Alpine Cabin near Ski Slopes',
    description: 'A charming wooden cabin perfect for winter getaways. Enjoy a warm fireplace, outdoor hot tub, rustic design elements, and easy ski-in/ski-out access.',
    location: 'Sylhet, Sylhet Division',
    propertyType: 'Cabin',
    rent: 350,
    rentType: 'Daily',
    bedrooms: 2,
    bathrooms: 1.5,
    images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=600'],
    status: 'Approved'
  },
  {
    _id: '4',
    title: 'Mid-Century Modern Suburban House',
    description: 'Beautifully restored mid-century modern home. Offers a spacious green backyard, newly renovated kitchen, high-beamed ceilings, and is located in a family-friendly area.',
    location: 'Rajshahi, Rajshahi Division',
    propertyType: 'House',
    rent: 3600,
    rentType: 'Monthly',
    bedrooms: 3,
    bathrooms: 2,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'],
    status: 'Approved'
  },
  {
    _id: '5',
    title: 'Sleek Waterfront Studio Apartment',
    description: 'Chic waterfront studio apartment with breathtaking harbor views. Includes floor heating, stylish minimalist furniture, rooftop terrace access, and secure access.',
    location: 'Khulna, Khulna Division',
    propertyType: 'Apartment',
    rent: 2100,
    rentType: 'Monthly',
    bedrooms: 1,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'],
    status: 'Approved'
  },
  {
    _id: '6',
    title: 'Elegant Historic Townhouse',
    description: 'Exquisite historic townhouse featuring original brick walls, multiple fireplaces, library space, and a private courtyard. Lovingly maintained.',
    location: 'Barishal, Barishal Division',
    propertyType: 'House',
    rent: 4800,
    rentType: 'Monthly',
    bedrooms: 4,
    bathrooms: 3.5,
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600'],
    status: 'Approved'
  }
];

const FALLBACK_REVIEWS = [
  {
    _id: 'r1',
    tenantName: 'Emma Watson',
    tenantPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Absolutely breathtaking! The penthouse views are even better in person. The booking and key transfer process was seamless, and the owner was a wonderful person to deal with. Worth every single penny!'
  },
  {
    _id: 'r2',
    tenantName: 'Michael Chang',
    tenantPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Stunning villa. The infinity pool and outdoor terrace are perfect for relaxing. High-tech home amenities, extremely clean, and a stellar location. We will definitely book this place again.'
  },
  {
    _id: 'r3',
    tenantName: 'Jessica Taylor',
    tenantPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Super cozy cabin near the ski runs. The hot tub under the stars was the highlight of our trip. Perfect sizing for our small family, with very rustic and warm finishes.'
  },
  {
    _id: 'r4',
    tenantName: 'David Miller',
    tenantPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Perfect waterfront studio! Waking up to the harbor view was pure bliss. Clean layout, excellent smart amenities, and close to everything in Khulna. Strongly recommend!'
  }
];

export default function HomePage() {
  const { user, showToast } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [featuredProperties, setFeaturedProperties] = useState(FALLBACK_PROPERTIES);
  const [reviews, setReviews] = useState([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/properties/featured`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedProperties(data);
        } else {
          setFeaturedProperties(FALLBACK_PROPERTIES);
        }
      })
      .catch(() => setFeaturedProperties(FALLBACK_PROPERTIES));

    fetch(`${API_URL}/reviews/recent`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(FALLBACK_REVIEWS);
        }
      })
      .catch(() => setReviews(FALLBACK_REVIEWS));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(`/properties${buildPropertySearchQuery({ search, propertyType, minPrice, maxPrice })}`);
  };

  const handleViewDetails = (id) => {
    if (!user) {
      showToast('Please login to view property details!', 'warning');
      router.push('/login');
    } else {
      router.push(`/properties/${id}`);
    }
  };

  const nextReview = () => {
    setActiveReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setActiveReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className={styles.homeContainer}>
      
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={`${styles.heroContent} container`}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroText}
          >
            <div className={styles.heroBadge}>
              <Sparkles size={16} />
              <span>Discover Premium Living Space</span>
            </div>
            <h1>Unlock Your Dream <br /><span className={styles.gradientText}>Rental Property</span></h1>
            <p>
              Connect directly with verified owners, schedule viewings, and lock in reservations securely. Find luxury apartments, mountain cabins, and ocean villas today.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={styles.searchBarContainer}
          >
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchGroup}>
                <div className={styles.searchInputs}>
                  <label>Location</label>
                  <input 
                    type="text" 
                    placeholder="Where are you looking?" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.searchGroup}>
                <Building size={20} className={styles.inputIcon} />
                <div className={styles.searchInputs}>
                  <label>Property Type</label>
                  <select 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.searchGroup}>
                <DollarSign size={20} className={styles.inputIcon} />
                <div className={styles.searchInputs}>
                  <label>Price Range</label>
                  <div className={styles.searchPriceRow}>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span>-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className={`${styles.searchSubmitBtn} btn btn-primary`}>
                <Search size={18} />
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className={`${styles.featuredSection} container`}>
        <div className="section-title">
          <div className={styles.featuredBadge}>
            <Flame size={16} />
            <span>Featured Selection</span>
          </div>
          <h2>Explore Top Rated Properties</h2>
        </div>

        <motion.div 
          className={styles.propertyGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
        >
          {featuredProperties.map((property) => (
            <motion.div 
              key={property._id}
              className={styles.propertyCard}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className={styles.propertyImageContainer}>
                <img 
                  src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600'} 
                  alt={property.title}
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${property._id}home/600/400`; }}
                />
              </div>
              <div className={styles.propertyDetails}>
                <div className={styles.locationRow}>
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
                <h3>{property.title}</h3>
                <div className={styles.priceRow}>
                  <span className={styles.rentAmount}>${property.rent.toLocaleString()}</span>
                  <span className={styles.rentPeriod}>/{property.rentType === 'Daily' ? 'day' : 'month'}</span>
                </div>
                <button 
                  onClick={() => handleViewDetails(property._id)}
                  className={styles.detailsBtn}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className={styles.exploreAllRow}>
          <Link href="/properties" className="btn btn-secondary">
            Explore All Properties
          </Link>
        </div>
      </section>

      <section className={styles.whySection}>
        <div className={`${styles.whyContainer} container`}>
          <div className={styles.whyText}>
            <h2>Why Choose <br />Property Rentals?</h2>
            <p>
              We completely eliminate the middleman, ensuring high trust, transparent communication, and fast digital bookings between renters and owners.
            </p>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><ShieldCheck size={24} /></div>
              <div>
                <h4>Verified Listings & Owners</h4>
                <p>Every single listing goes through rigorous administrative moderation and owner background verification.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><HeartHandshake size={24} /></div>
              <div>
                <h4>Secure Digital Booking</h4>
                <p>Book directly online and make payments instantly through Stripe payment gateway.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Compass size={24} /></div>
              <div>
                <h4>Transparent Review System</h4>
                <p>Read authentic, verified user ratings left by actual tenants who rented the listing.</p>
              </div>
            </div>
          </div>
          <div className={styles.whyImageContainer}>
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200"
              alt="Modern interior"
              className={styles.whyImage}
            />
          </div>
        </div>
      </section>

      <section className={`${styles.locationsSection} container`}>
        <div className="section-title">
          <h2>Trending Locations</h2>
          <p>Explore hot rental locations with the highest ratings and occupancy.</p>
        </div>
        <div className={styles.locationsGrid}>
          {TRENDING_LOCATIONS.map((loc, idx) => (
            <div key={idx} className={styles.locationCard} onClick={() => router.push(`/properties?search=${encodeURIComponent(loc.name)}`)}>
              <img src={loc.image} alt={loc.name} />
              <div className={styles.locationCardOverlay}>
                <h3>{loc.name}</h3>
                <span>{loc.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={`${styles.statsContainer} container`}>
          {HOME_STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className={styles.statBox}>
              <Icon size={40} className={styles.statIcon} />
              <h2>{value}</h2>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className={`${styles.reviewSection} container`}>
          <div className="section-title">
            <h2>Tenant Reviews</h2>
            <p>Real experiences from people who found their home through us.</p>
          </div>

          <div className={styles.testimonialWrapper}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeReviewIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={`${styles.testimonialCard} glass-card`}
              >
                <div className={styles.starsRow}>
                  {Array(reviews[activeReviewIndex].rating).fill().map((_, i) => (
                    <Star key={i} size={18} fill="var(--warning-color)" stroke="var(--warning-color)" />
                  ))}
                </div>
                <p className={styles.testimonialComment}>&quot;{reviews[activeReviewIndex].comment}&quot;</p>
                <div className={styles.testimonialAuthor}>
                  <img src={reviews[activeReviewIndex].tenantPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} alt={reviews[activeReviewIndex].tenantName} />
                  <div>
                    <h4>{reviews[activeReviewIndex].tenantName}</h4>
                    <span>Verified Renter</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className={styles.sliderControls}>
              <button onClick={prevReview} className={styles.sliderBtn}>&larr;</button>
              <span className={styles.sliderDots}>
                {reviews.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveReviewIndex(idx)}
                    className={`${styles.sliderDot} ${idx === activeReviewIndex ? styles.activeDot : ''}`}
                  ></button>
                ))}
              </span>
              <button onClick={nextReview} className={styles.sliderBtn}>&rarr;</button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
