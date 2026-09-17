import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Analytics, getAnalytics, isSupported as isAnalyticsSupported, logEvent } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBVff67QrHHLQcsmEkO3Ds9hjlJ_OAKK20',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'best-canteen.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'best-canteen',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'best-canteen.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '965582375662',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:965582375662:web:e5cdbdad8573e9aecd01ff',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-35KJQDHBGH',
};

// Initialize Firebase App safely (singleton)
export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
};
export type { FirebaseUser };

let analyticsInstance: Analytics | null = null;

// Initialize Analytics lazily (client-only)
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;

  try {
    const supported = await isAnalyticsSupported();
    if (supported) {
      analyticsInstance = getAnalytics(firebaseApp);
      return analyticsInstance;
    }
  } catch (err) {
    console.warn('Firebase Analytics not supported in this environment:', err);
  }
  return null;
}

// Log custom Canteen analytics event
export async function logCanteenEvent(eventName: string, eventParams?: Record<string, any>) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch {
    // Non-blocking analytics logging
  }
}

// Request Notification Permission and FCM registration
export async function requestFirebaseNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    // Check Service Worker support
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const { getMessaging, getToken } = await import('firebase/messaging');
        const messaging = getMessaging(firebaseApp);
        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
        }).catch(() => null);

        if (token) {
          localStorage.setItem('bc_fcm_token', token);
          return token;
        }
      } catch (swErr) {
        console.log('Firebase messaging service worker registration optional notice:', swErr);
      }
    }

    return 'permission_granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return null;
  }
}
