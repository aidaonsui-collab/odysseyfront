import { create } from 'zustand';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'auth_data';
const COOKIE_EXPIRY = 1; 

// Helper to get initial state from cookie or localStorage
const getInitialState = () => {
  // Try cookie first (backward compatibility)
  const cookieData = Cookies.get(COOKIE_NAME);
  if (cookieData) {
    try {
      return JSON.parse(cookieData);
    } catch (e) {
      // Try localStorage
    }
  }
  
  // Try localStorage
  try {
    const localData = localStorage.getItem('auth_data');
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (e) {
    // Ignore
  }
  
  return { user: null, isAuthenticated: false };
};

const useAuthStore = create((set) => ({
  ...getInitialState(),
  login: (user) => {
    const newState = { user, isAuthenticated: true };
    
    // Save to localStorage (more secure than cookies - not sent with every request)
    try {
      localStorage.setItem('auth_data', JSON.stringify(newState));
    } catch (e) {
      console.warn('localStorage not available');
    }
    
    // Also save to cookie for backward compatibility
    // Note: Add secure: true when HTTPS is enabled in production
    Cookies.set(COOKIE_NAME, JSON.stringify(newState), { 
      expires: COOKIE_EXPIRY,
      sameSite: 'strict',
      secure: window.location.protocol === 'https:' // Only set secure flag on HTTPS
    });
    
    set(newState);
  },
  logout: () => {
    // Remove from localStorage
    try {
      localStorage.removeItem('auth_data');
    } catch (e) {
      // Ignore
    }
    
    // Remove cookie
    Cookies.remove(COOKIE_NAME);
    set({ user: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
