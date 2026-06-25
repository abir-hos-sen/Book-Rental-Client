'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Home } from 'lucide-react';
import styles from './properties.module.css';

// ✅ Module-level constants — never change reference, no re-render loops
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const LIMIT = 6;

// Extracted constants - Available property types for filter dropdown
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Cabin', 'House'];

// Sort options for properties list with clear labels for UI display
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' }
];

// Fallback mock properties used when API is unavailable (offline mode)
const MOCK_PROPERTIES = [
  { _id: '1', title: 'Luxury Penthouse with Skyline Views', location: 'Dhaka, Dhaka Division', propertyType: 'Apartment', rent: 4200, rentType: 'Monthly', bedrooms: 3, bathrooms: 2.5, propertySize: 1850, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'], status: 'Approved' },
  { _id: '2', title: 'Modern Minimalist Villa with Infinity Pool', location: 'Chattogram, Chattogram Division', propertyType: 'Villa', rent: 8500, rentType: 'Monthly', bedrooms: 4, bathrooms: 4, propertySize: 3200, images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=600'], status: 'Approved' },
  { _id: '3', title: 'Cozy Alpine Cabin near Ski Slopes', location: 'Sylhet, Sylhet Division', propertyType: 'Cabin', rent: 350, rentType: 'Daily', bedrooms: 2, bathrooms: 1.5, images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=600'], status: 'Approved' },
  { _id: '4', title: 'Mid-Century Modern Suburban House', location: 'Rajshahi, Rajshahi Division', propertyType: 'House', rent: 3600, rentType: 'Monthly', bedrooms: 3, bathrooms: 2, images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'], status: 'Approved' },
  { _id: '5', title: 'Sleek Waterfront Studio Apartment', location: 'Khulna, Khulna Division', propertyType: 'Apartment', rent: 2100, rentType: 'Monthly', bedrooms: 1, bathrooms: 1, images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'], status: 'Approved' },
  { _id: '6', title: 'Elegant Historic Townhouse', location: 'Barishal, Barishal Division', propertyType: 'House', rent: 4800, rentType: 'Monthly', bedrooms: 4, bathrooms: 3.5, images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600'], status: 'Approved' },
  { _id: '7', title: 'Beach Front Luxury Resort', location: 'Dhaka, Dhaka Division', propertyType: 'Villa', rent: 6500, rentType: 'Monthly', bedrooms: 5, bathrooms: 4, images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600'], status: 'Approved' },
  { _id: '8', title: 'Urban Loft Downtown', location: 'Chattogram, Chattogram Division', propertyType: 'Apartment', rent: 2800, rentType: 'Monthly', bedrooms: 2, bathrooms: 1.5, images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600'], status: 'Approved' }
];

// Helper: Convert filter object to URL query string
function buildQueryString(filters) {
  const queryParams = [];
  if (filters.search) queryParams.push(`search=${encodeURIComponent(filters.search)}`);
  if (filters.propertyType !== 'All') queryParams.push(`propertyType=${filters.propertyType}`);
  if (filters.minPrice) queryParams.push(`minPrice=${filters.minPrice}`);
  if (filters.maxPrice) queryParams.push(`maxPrice=${filters.maxPrice}`);
  return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
}

// Helper: Extract filter values from URL search parameters
function readFiltersFromSearchParams(searchParams) {
  return {
    search: searchParams.get('search') || '',
    propertyType: searchParams.get('propertyType') || 'All',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  };
}

// Helper: Filter and sort properties based on criteria
function filterMockProperties(filters, sortOrder) {
  const search = filters.search.toLowerCase();
  const min = Number(filters.minPrice) || 0;
  const max = Number(filters.maxPrice) || Infinity;

  const filtered = MOCK_PROPERTIES.filter((property) => {
    const matchSearch = !search || property.location.toLowerCase().includes(search) || property.title.toLowerCase().includes(search);
    const matchType = filters.propertyType === 'All' || property.propertyType === filters.propertyType;
    const matchPrice = property.rent >= min && property.rent <= max;
    return matchSearch && matchType && matchPrice;
  });

  if (sortOrder === 'price_asc') {
    filtered.sort((a, b) => a.rent - b.rent);
  } else if (sortOrder === 'price_desc') {
    filtered.sort((a, b) => b.rent - a.rent);
  }

  return filtered;
}

function PropertiesContent() {
  const { user, showToast } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL parameters for filter persistence
  const initialFilters = readFiltersFromSearchParams(searchParams);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [propertyType, setPropertyType] = useState(initialFilters.propertyType);
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Event handlers
  const applyFilters = () => {
    setLoading(true);
    router.push(`/properties${buildQueryString({ search: searchTerm, propertyType, minPrice, maxPrice })}`);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setPropertyType('All');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    router.push('/properties');
  };

  // Offline fallback using mock data
  const handleOfflineFallback = useCallback(() => {
    const filters = readFiltersFromSearchParams(searchParams);
    const filtered = filterMockProperties(filters, sortOrder);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / LIMIT) || 1);
    const startIndex = (page - 1) * LIMIT;
    setProperties(filtered.slice(startIndex, startIndex + LIMIT));
  }, [searchParams, sortOrder, page]);

  // Core fetch — stable because API_URL and LIMIT are module-level
  const fetchProperties = useCallback(() => {
    setLoading(true);
    let url = `${API_URL}/properties?page=${page}&limit=${LIMIT}`;
    const filters = readFiltersFromSearchParams(searchParams);
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.propertyType && filters.propertyType !== 'All') url += `&propertyType=${filters.propertyType}`;
    if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
    if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
    if (sortOrder !== 'newest') url += `&sort=${sortOrder}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.properties) {
          setProperties(data.properties);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalProperties || 0);
        } else {
          handleOfflineFallback();
        }
      })
      .catch(() => handleOfflineFallback())
      .finally(() => setLoading(false));
  }, [searchParams, sortOrder, page, handleOfflineFallback]);

  // ✅ Only runs when actual filter/page values change — no visibilitychange loop
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleViewDetails = (id) => {
    if (!user) {
      showToast('Please login to view details!', 'warning');
      router.push('/login');
    } else {
      router.push(`/properties/${id}`);
    }
  };

  return (
    <div className={`${styles.propertiesPage} container`}>
      <div className={styles.headerRow}>
        <div>
          <h1>Available Listings</h1>
          <p>Discover beautiful, curated properties filtered to your desires.</p>

          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Search</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="Search location, title..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>

              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Type</label>
                <select
                  className="form-input"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>Price Range</label>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    className="form-input"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="form-input"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.filterItem}>
                <button onClick={applyFilters} className={`${styles.applyBtn} btn btn-primary`}>
                  <SlidersHorizontal size={16} />
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.statsText}>
              Found <strong>{totalItems}</strong> properties
            </div>
            <div className={styles.sortContainer}>
              <ArrowUpDown size={16} className={styles.sortIcon} />
              <select
                className="form-input"
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.spinner}></div>
              <p>Finding listings...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className={styles.noResultsBox}>
              <Home size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
              <h3>No Properties Found</h3>
              <p>Try resetting filters or typing a different search term.</p>
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={styles.propertiesGrid}>
                {properties.map((property) => (
                  <div key={property._id} className={`${styles.propertyCard} glass-card`}>
                    <div className={styles.cardImage}>
                      <img
                        src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600'}
                        alt={property.title}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${property._id}property/600/400`; }}
                      />
                      <span className={styles.typeTag}>{property.propertyType}</span>
                      {property.isBooked && (
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)',
                          zIndex: 2,
                          textTransform: 'uppercase',
                        }}>
                          Sold Out
                        </span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.locationTag}>
                        <MapPin size={14} />
                        <span>{property.location}</span>
                      </div>
                      <h3>{property.title}</h3>
                      <div className={styles.featuresRow}>
                        <span>🛏️ {property.bedrooms} Beds</span>
                        <span>🚿 {property.bathrooms} Baths</span>
                      </div>
                      <div className={styles.cardDivider}></div>
                      <div className={styles.cardFooter}>
                        <div className={styles.priceContainer}>
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
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(Math.max(page - 1, 1))}
                    disabled={page === 1}
                    className={styles.pageBtn}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className={styles.pageNumber}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                    disabled={page === totalPages}
                    className={styles.pageBtn}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
          <p>Loading properties...</p>
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
