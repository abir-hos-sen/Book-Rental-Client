'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage, requestJson } from '../lib/apiClient';

// ✅ Module-level constant — never changes reference, prevents infinite re-render loops
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const router = useRouter();
  // Use a ref so fetchUserProfile can access the latest token without being a dependency
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const fetchUserProfile = useCallback(async (authToken) => {
    if (!authToken || authToken.startsWith('mock_jwt_')) {
      authStorage.clear();
      setLoading(false);
      return;
    }
    try {
      const data = await requestJson(`${API_URL}/auth/me`, { token: authToken });
      if (data.user) {
        setUser(data.user);
      } else {
        authStorage.clear();
      }
    } catch (error) {
      console.error('Could not reach auth server:', error.message);
      const mockUser = authStorage.getMockUser();
      if (mockUser) {
        setUser(mockUser);
      }
    } finally {
      setLoading(false);
    }
  }, []); // ✅ No changing dependencies

  // ✅ Runs only once on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const callbackToken = url.searchParams.get('token');

    if (callbackToken) {
      authStorage.setToken(callbackToken);
      setToken(callbackToken);
      fetchUserProfile(callbackToken);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', `${url.pathname}${url.search ? `?${url.searchParams.toString()}` : ''}`);
      return;
    }

    const storedToken = authStorage.getToken();
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    try {
      await requestJson(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch {
      console.log('Logout API failed, cleaning client cache anyway.');
    }
    authStorage.clear();
    setToken(null);
    setUser(null);
    showToast('Logged out successfully!');
    router.push('/login');
  }, [router, showToast]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const data = await requestJson(`${API_URL}/auth/login`, { json: { email, password } });
      authStorage.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      showToast('Logged in successfully!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      showToast(error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  const verifyOtp = useCallback(async (email, otp) => {
    try {
      setLoading(true);
      const data = await requestJson(`${API_URL}/auth/verify-otp`, { json: { email, otp } });
      authStorage.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      showToast('Logged in successfully!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      showToast(error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  const register = useCallback(async (name, email, password, photo, role) => {
    try {
      setLoading(true);
      const data = await requestJson(`${API_URL}/auth/register`, { json: { name, email, password, photo, role } });
      if (data.status === 'OTP_REQUIRED') {
        showToast(data.message || 'Verification code sent to your email!');
        return { success: true, otpRequired: true, email: data.email };
      }
      authStorage.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      showToast('Registered successfully!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      showToast(error.message || 'Server connection failed.', 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  const verifyRegisterOtp = useCallback(async (email, otp) => {
    try {
      setLoading(true);
      const data = await requestJson(`${API_URL}/auth/verify-register-otp`, { json: { email, otp } });
      authStorage.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      showToast('Account created! Welcome!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      showToast(error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  const loginWithGoogle = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.location.href = `${API_URL}/auth/google`;
  }, []);

  const updateProfile = useCallback(async (name, photo, email) => {
    try {
      const currentToken = tokenRef.current;
      const data = await requestJson(`${API_URL}/auth/me`, { method: 'PUT', token: currentToken, json: { name, photo, email } });
      if (data.user) {
        const updatedUser = { ...data.user };
        setUser(updatedUser);
        authStorage.setMockUser(updatedUser);
        if (data.token) {
          authStorage.setToken(data.token);
          setToken(data.token);
        }
        showToast('Profile updated!');
        return { success: true };
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (error) {
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, name: name || prev.name, photo: photo || prev.photo, email: email || prev.email };
        authStorage.setMockUser(updated);
        return updated;
      });
      showToast('Profile updated (local)!');
      return { success: true };
    }
  }, [showToast]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, verifyOtp, verifyRegisterOtp, register, loginWithGoogle, logout, updateProfile,
      showToast, toasts
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
