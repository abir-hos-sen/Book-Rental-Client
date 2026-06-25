'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '../lib/apiUrl';
import { authStorage, requestJson } from '../lib/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const router = useRouter();

  const API_URL = getApiUrl();

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const logout = async () => {
    try {
      await requestJson(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.log('Logout API failed, cleaning client cache anyway.');
    }
    authStorage.clear();
    setTimeout(() => {
      setToken(null);
      setUser(null);
    }, 0);
    showToast('Logged out successfully!');
    router.push('/login');
  };

  const fetchUserProfile = async (authToken) => {
    if (!authToken || authToken.startsWith('mock_jwt_')) {
      authStorage.clear();
      setTimeout(() => setLoading(false), 0);
      return;
    }
    try {
      const data = await requestJson(`${API_URL}/auth/me`, { token: authToken });
      if (data.user) {
        setUser(data.user);
      } else {
        authStorage.clear();
        setTimeout(() => setLoading(false), 0);
        return;
      }
    } catch (error) {
      console.error('Could not reach auth server:', error.message);
      const mockUser = authStorage.getMockUser();
      if (mockUser) {
        setUser(mockUser);
      }
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const callbackToken = url.searchParams.get('token');

    if (callbackToken) {
      authStorage.setToken(callbackToken);
      setTimeout(() => {
        setToken(callbackToken);
        fetchUserProfile(callbackToken);
      }, 0);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', `${url.pathname}${url.search ? `?${url.searchParams.toString()}` : ''}`);
      return;
    }

    const storedToken = authStorage.getToken();
    if (storedToken) {
      setTimeout(() => {
        setToken(storedToken);
        fetchUserProfile(storedToken);
      }, 0);
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  const login = async (email, password) => {
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
  };

  const verifyOtp = async (email, otp) => {
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
  };

  const register = async (name, email, password, photo, role) => {
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
  };

  const verifyRegisterOtp = async (email, otp) => {
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
  };

  const loginWithGoogle = async () => {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Google login is only available in the browser.' };
    }

    window.location.href = `${API_URL}/auth/google`;
    return { success: true };
  };



  const updateProfile = async (name, photo, email) => {
    try {
      const data = await requestJson(`${API_URL}/auth/me`, { method: 'PUT', token, json: { name, photo, email } });
      if (data.user) {
        const updatedUser = { ...user, name: data.user.name, photo: data.user.photo, email: data.user.email };
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
      if (user) {
        const updated = { ...user, name: name || user.name, photo: photo || user.photo, email: email || user.email };
        setUser(updated);
        authStorage.setMockUser(updated);
        showToast('Profile updated (local)!');
        return { success: true };
      }
      return { success: false, error: error.message };
    }
  };

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
