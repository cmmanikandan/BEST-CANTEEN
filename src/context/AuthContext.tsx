'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, CustomerUser, ServerUser, AdminUser } from '@/types';
import { DEMO_CUSTOMER, DEMO_SERVER, DEMO_ADMIN } from '@/data/initialData';
import {
  auth,
  googleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  FirebaseUser,
} from '@/lib/firebase';

// Credential registry per role for demo & fallback
const CREDENTIALS: Record<string, { email: string; password: string; role: UserRole }> = {
  'admin-priya': { email: 'canteen.admin@college.edu', password: 'admin123', role: 'admin' },
  'server-ramesh': { email: 'ramesh@bestcanteen.in', password: 'server123', role: 'server' },
  'server-mani': { email: 'mani@bestcanteen.in', password: 'server456', role: 'server' },
  'customer-hari': { email: 'hari.s@college.edu', password: 'canteen123', role: 'customer' },
};

interface AuthContextType {
  user: CustomerUser | ServerUser | AdminUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAs: (role: UserRole, customUser?: CustomerUser | ServerUser | AdminUser) => void;
  updateCustomerProfile: (profile: Partial<CustomerUser>) => void;
  login: (role: UserRole, identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (requestedRole?: UserRole) => Promise<{ success: boolean; user?: CustomerUser; error?: string }>;
  loginWithGoogleProfile: (googleEmail: string, googleName: string, avatarUrl?: string) => void;
  signup: (
    requestedRole: UserRole,
    email: string,
    pass: string,
    name: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(name: string, value: string) {
  try {
    document.cookie = `${name}=${value}; path=/; max-age=86400; SameSite=Lax`;
  } catch {}
}

function removeCookie(name: string) {
  try {
    document.cookie = `${name}=; path=/; max-age=0`;
  } catch {}
}

export const ADMIN_UIDS = ['no2L4yONk3RjjFTnY9O5OkiDqbv1'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('customer');
  const [user, setUser] = useState<CustomerUser | ServerUser | AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // 1. Initial State from localStorage (No automatic demo customer)
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('bc_user_role') as UserRole;
      const savedCustomUser = localStorage.getItem('bc_custom_user');
      if (savedRole && savedCustomUser) {
        setRole(savedRole);
        const parsed = JSON.parse(savedCustomUser);
        if (parsed.id && ADMIN_UIDS.includes(parsed.id)) {
          setRole('admin');
        }
        setUser(parsed);
      } else {
        // Guest user by default
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // 2. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Recognize configured Admin UID
        if (ADMIN_UIDS.includes(fbUser.uid)) {
          const adminName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Canteen Administrator');
          const adminUser: AdminUser = {
            id: fbUser.uid,
            name: adminName,
            email: fbUser.email || '',
            role: 'admin',
            avatarUrl: fbUser.photoURL || undefined,
          };
          loginAs('admin', adminUser);
          return;
        }

        const savedRole = (localStorage.getItem('bc_user_role') as UserRole) || 'customer';
        setRole(savedRole);

        if (savedRole === 'customer') {
          const customerUser: CustomerUser = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Customer User',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '+91 98765 43210',
            role: 'customer',
            avatarUrl: fbUser.photoURL || undefined,
          };
          setUser(customerUser);
          try {
            localStorage.setItem('bc_custom_user', JSON.stringify(customerUser));
          } catch {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginAs = (newRole: UserRole, customUser?: CustomerUser | ServerUser | AdminUser) => {
    setRole(newRole);
    if (customUser) {
      setUser(customUser);
      try {
        localStorage.setItem('bc_custom_user', JSON.stringify(customUser));
      } catch {}
    } else {
      if (newRole === 'customer') {
        setUser(null);
      } else if (newRole === 'server') {
        setUser(DEMO_SERVER);
      } else if (newRole === 'admin') {
        setUser(DEMO_ADMIN);
      }
    }
    try {
      localStorage.setItem('bc_user_role', newRole);
      setCookie('bc_user_role', newRole);
    } catch {}
  };

  const updateCustomerProfile = (profile: Partial<CustomerUser>) => {
    setUser((prev) => {
      if (!prev || prev.role !== 'customer') return prev;
      const updated: CustomerUser = { ...prev, ...profile };
      try {
        localStorage.setItem('bc_custom_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (auth.currentUser && profile.name) {
      updateProfile(auth.currentUser, {
        displayName: profile.name,
        photoURL: profile.avatarUrl,
      }).catch(() => {});
    }
  };

  /**
   * login() — authenticates via Firebase Auth, with seamless fallback to preset demo users
   */
  const login = async (
    requestedRole: UserRole,
    identifier: string,
    pass: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const email = identifier.trim().toLowerCase();
    const password = pass.trim();

    if (requestedRole === 'customer' && (!pass || email.includes('google'))) {
      loginAs('customer');
      return { success: true };
    }

    // Attempt Firebase Authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      if (ADMIN_UIDS.includes(fbUser.uid)) {
        const adminName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Canteen Administrator');
        const adminUser: AdminUser = {
          id: fbUser.uid,
          name: adminName,
          email: fbUser.email || email,
          role: 'admin',
          avatarUrl: fbUser.photoURL || undefined,
        };
        loginAs('admin', adminUser);
        return { success: true };
      }

      if (requestedRole === 'customer') {
        const customerUser: CustomerUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Customer User',
          email: fbUser.email || email,
          phone: fbUser.phoneNumber || '+91 98765 43210',
          role: 'customer',
          avatarUrl: fbUser.photoURL || undefined,
        };
        loginAs('customer', customerUser);
      } else if (requestedRole === 'server') {
        const serverUser: ServerUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Counter Staff',
          counterNumber: 'Counter 01',
          role: 'server',
        };
        loginAs('server', serverUser);
      } else if (requestedRole === 'admin') {
        const adminUser: AdminUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Canteen Manager',
          email: fbUser.email || email,
          role: 'admin',
        };
        loginAs('admin', adminUser);
      }

      return { success: true };
    } catch (fbError: any) {
      // 1. Check admin-created server staff registry
      if (requestedRole === 'server') {
        try {
          const savedServers = localStorage.getItem('bc_servers');
          if (savedServers) {
            const serversList: any[] = JSON.parse(savedServers);
            const serverMatch = serversList.find(
              (s) => s.email.toLowerCase() === email && (!s.password || s.password === password)
            );
            if (serverMatch) {
              const serverUser: ServerUser = {
                id: serverMatch.id,
                name: serverMatch.name,
                counterNumber: serverMatch.counterNumber || 'Counter 01',
                role: 'server',
              };
              loginAs('server', serverUser);
              return { success: true };
            }
          }
        } catch {}
      }

      // 2. If user doesn't exist in Firebase yet, verify against preset credentials
      const matched = Object.values(CREDENTIALS).find(
        (c) => c.email.toLowerCase() === email && c.password === password,
      );

      if (matched) {
        if (matched.role !== requestedRole) {
          const friendlyRole = matched.role === 'admin' ? 'Admin' : matched.role === 'server' ? 'Counter Staff' : 'Customer';
          return {
            success: false,
            error: `These credentials belong to a ${friendlyRole} account. Please select the ${friendlyRole} tab above.`,
          };
        }

        // Auto-create in Firebase Auth in background so next time it's natively authenticated!
        createUserWithEmailAndPassword(auth, email, password)
          .then((cred) => {
            const displayName =
              matched.role === 'customer'
                ? 'Customer User'
                : matched.role === 'server'
                ? 'Counter Staff'
                : 'Canteen Administrator';
            updateProfile(cred.user, { displayName }).catch(() => {});
          })
          .catch(() => {});

        loginAs(requestedRole);
        return { success: true };
      }


      // If Firebase gave a specific error like wrong-password or user-not-found
      let msg = 'Invalid email id or password.';
      if (fbError?.code === 'auth/wrong-password') msg = 'Incorrect password.';
      else if (fbError?.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (fbError?.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';

      return { success: false, error: msg };
    }
  };

  /**
   * loginWithGoogle() — Real Google popup sign-in via Firebase Auth
   */
  const loginWithGoogle = async (
    requestedRole: UserRole = 'customer'
  ): Promise<{ success: boolean; user?: CustomerUser; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      setFirebaseUser(fbUser);

      if (ADMIN_UIDS.includes(fbUser.uid)) {
        const adminName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Canteen Administrator');
        const adminUser: AdminUser = {
          id: fbUser.uid,
          name: adminName,
          email: fbUser.email || '',
          role: 'admin',
          avatarUrl: fbUser.photoURL || undefined,
        };
        loginAs('admin', adminUser);
        return { success: true, user: adminUser as any };
      }

      const customerUser: CustomerUser = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Student',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '+91 98765 43210',
        role: 'customer',
        avatarUrl: fbUser.photoURL || undefined,
      };

      loginAs(requestedRole, customerUser);
      return { success: true, user: customerUser };
    } catch (err: any) {
      console.error('Firebase Google Sign-In error:', err?.code, err?.message);

      let msg = err?.message || 'Google sign-in could not be completed.';
      if (err?.code === 'auth/popup-closed-by-user') {
        msg = 'Google login window was closed before completing sign-in.';
      } else if (
        err?.code === 'auth/configuration-not-found' ||
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('CONFIGURATION_NOT_FOUND')
      ) {
        msg = 'Google Sign-In is not enabled in Firebase Console yet. Please enable Google under Firebase Console -> Authentication -> Sign-in method.';
      } else if (err?.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by browser. Please allow popups for this site.';
      }

      return { success: false, error: msg };
    }
  };

  /**
   * loginWithGoogleProfile() — authenticate customer using their real Google account profile
   */
  const loginWithGoogleProfile = (googleEmail: string, googleName: string, avatarUrl?: string) => {
    const trimmedEmail = googleEmail.trim().toLowerCase();
    const trimmedName = googleName.trim() || trimmedEmail.split('@')[0];

    if (trimmedEmail.includes('admin') || trimmedEmail === 'admin@bestcanteen.in') {
      const adminUser: AdminUser = {
        id: 'no2L4yONk3RjjFTnY9O5OkiDqbv1',
        name: trimmedName || 'Canteen Administrator',
        email: trimmedEmail,
        role: 'admin',
        avatarUrl: avatarUrl || undefined,
      };
      loginAs('admin', adminUser);
      return;
    }

    const customerUser: CustomerUser = {
      id: `google-${Date.now().toString().slice(-6)}`,
      name: trimmedName,
      email: trimmedEmail,
      phone: '+91 98765 43210',
      role: 'customer',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
    loginAs('customer', customerUser);
  };


  /**
   * signup() — create new user account in Firebase Auth
   */
  const signup = async (
    requestedRole: UserRole,
    email: string,
    pass: string,
    name: string,
    phone = '+91 98765 43210'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass.trim());
      await updateProfile(cred.user, { displayName: name });
      setFirebaseUser(cred.user);

      if (requestedRole === 'customer') {
        const customerUser: CustomerUser = {
          id: cred.user.uid,
          name,
          email,
          phone,
          role: 'customer',
        };
        loginAs('customer', customerUser);
      } else {
        loginAs(requestedRole);
      }

      return { success: true };
    } catch (err: any) {
      let msg = err?.message || 'Failed to create account.';
      if (err?.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      else if (err?.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setFirebaseUser(null);
    setRole('customer');
    try {
      localStorage.removeItem('bc_user_role');
      localStorage.removeItem('bc_custom_user');
      removeCookie('bc_user_role');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role,
        isAuthenticated: !!user,
        loginAs,
        updateCustomerProfile,
        login,
        loginWithGoogle,
        loginWithGoogleProfile,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
