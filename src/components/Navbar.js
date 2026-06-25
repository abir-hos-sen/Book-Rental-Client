'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, Menu, X, Home, Building2, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const isActive = (path) => pathname === path;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`${styles.navContainer} container`}>

        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <Building2 className={styles.iconPrimary} size={26} />
          </div>
          <span className={styles.brandName}>
            Property<span className={styles.brandDot}>Rental</span>
          </span>
        </Link>

        <nav className={styles.desktopNav}>
          <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
            <Home size={15} />
            Home
          </Link>
          <Link href="/properties" className={`${styles.navLink} ${isActive('/properties') ? styles.active : ''}`}>
            <Building2 size={15} />
            Properties
          </Link>
          {user && (
            <Link href="/dashboard" className={`${styles.navLink} ${pathname.startsWith('/dashboard') ? styles.active : ''}`}>
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
          )}
        </nav>

        <div className={styles.actions}>

          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle Theme">
            {theme === 'dark'
              ? <Sun size={18} className={styles.sunIcon} />
              : <Moon size={18} className={styles.moonIcon} />}
          </button>

          {user ? (
            <div className={styles.userSection} ref={dropdownRef}>
              <button
                className={styles.avatarBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <img
                  src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                  alt={user.name}
                  className={styles.avatar}
                />
                <span className={styles.avatarName}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <img
                      src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                      alt={user.name}
                      className={styles.dropdownAvatar}
                    />
                    <div>
                      <p className={styles.dropdownName}>{user.name}</p>
                      <p className={styles.dropdownEmail}>{user.email}</p>
                      <span className={`badge ${
                        user.role === 'Admin' ? 'badge-rejected' :
                        user.role === 'Owner' ? 'badge-pending' : 'badge-approved'
                      }`}>{user.role}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <Link
                    href="/dashboard"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    My Dashboard
                  </Link>
                  <div className={styles.dropdownDivider}></div>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.loginBtn}>
                Sign In
              </Link>
              <Link href="/register" className={styles.registerBtn}>
                Get Started
              </Link>
            </div>
          )}

          <button onClick={toggleMenu} className={styles.mobileToggle} aria-label="Toggle Menu">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.mobileMenu}>
          <Link
            href="/"
            className={`${styles.mobileLink} ${isActive('/') ? styles.activeMobile : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <Home size={16} /> Home
          </Link>
          <Link
            href="/properties"
            className={`${styles.mobileLink} ${isActive('/properties') ? styles.activeMobile : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <Building2 size={16} /> Properties
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`${styles.mobileLink} ${pathname.startsWith('/dashboard') ? styles.activeMobile : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}

          <div className={styles.mobileAuthDivider}></div>

          {user ? (
            <div className={styles.mobileUserSection}>
              <div className={styles.mobileUserInfo}>
                <img
                  src={user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                  alt={user.name}
                  className={styles.avatarLarge}
                />
                <div>
                  <div className={styles.mobileUserName}>{user.name}</div>
                  <div className={styles.mobileUserEmail}>{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className={`${styles.mobileLogoutBtn} btn btn-danger`}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <Link href="/login" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
