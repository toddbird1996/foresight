// ============================================
// FORESIGHT - PWA CONFIGURATION
// ============================================

// ============================================
// 1. WEB APP MANIFEST (public/manifest.json)
// ============================================

export const manifest = {
  "name": "Foresight - Custody Guide",
  "short_name": "Foresight",
  "description": "Navigate custody battles with confidence. Filing guides, AI assistance, and community support.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#f97316",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard"
    },
    {
      "src": "/screenshots/mobile-dashboard.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile Dashboard"
    }
  ],
  "shortcuts": [
    {
      "name": "Ask AI",
      "short_name": "AI",
      "description": "Ask the AI assistant a question",
      "url": "/ai",
      "icons": [{ "src": "/icons/ai-shortcut.png", "sizes": "96x96" }]
    },
    {
      "name": "Filing Guide",
      "short_name": "Guide",
      "description": "View your filing guide",
      "url": "/filing",
      "icons": [{ "src": "/icons/guide-shortcut.png", "sizes": "96x96" }]
    },
    {
      "name": "Community",
      "short_name": "Chat",
      "description": "Open community chat",
      "url": "/community",
      "icons": [{ "src": "/icons/chat-shortcut.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["lifestyle", "utilities"],
  "lang": "en-CA",
  "dir": "ltr",
  "prefer_related_applications": false
};

// ============================================
// 2. SERVICE WORKER (public/sw.js)
// ============================================

export const serviceWorkerCode = `
const CACHE_NAME = 'foresight-v1';
const STATIC_CACHE = 'foresight-static-v1';
const DYNAMIC_CACHE = 'foresight-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/ai',
  '/filing',
  '/community',
  '/calendar',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests (let them go to network)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // For navigation requests, try network first
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // For static assets, try cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // For everything else, try network first
  event.respondWith(networkFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try to return cached version
    const cached = await caches.match(request);
    if (cached) return cached;
    
    throw error;
  }
}

// Check if request is for static asset
function isStaticAsset(pathname) {
  return /\\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/.test(pathname);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = { title: 'Foresight', body: 'You have a new notification' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
      dateOfArrival: Date.now()
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncMessages() {
  // Get pending messages from IndexedDB and send them
  console.log('[SW] Syncing messages...');
}

async function syncProgress() {
  // Sync progress updates
  console.log('[SW] Syncing progress...');
}
`;

// ============================================
// 3. OFFLINE PAGE (public/offline.html)
// ============================================

export const offlinePageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Foresight</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: rgba(249, 115, 22, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
    }
    p {
      color: #94a3b8;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .retry-btn {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%);
      color: #fff;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    .retry-btn:hover {
      opacity: 0.9;
    }
    .tips {
      margin-top: 32px;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      text-align: left;
    }
    .tips h3 {
      font-size: 14px;
      color: #f97316;
      margin-bottom: 8px;
    }
    .tips li {
      color: #94a3b8;
      font-size: 14px;
      margin-left: 20px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Some features may be unavailable.</p>
    <button class="retry-btn" onclick="window.location.reload()">
      Try Again
    </button>
    <div class="tips">
      <h3>While offline, you can still:</h3>
      <ul>
        <li>View cached pages</li>
        <li>Review your filing guide</li>
        <li>Check saved deadlines</li>
      </ul>
    </div>
  </div>
</body>
</html>
`;

// ============================================
// 4. SERVICE WORKER REGISTRATION
// ============================================

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('SW registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('SW update found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              dispatchEvent(new CustomEvent('swUpdate', { detail: registration }));
            }
          });
        });
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    });
  }
}

// ============================================
// 5. INSTALL PROMPT HOOK
// ============================================

import { useState, useEffect } from 'react';

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      return true;
    }
    
    return false;
  };

  return {
    canInstall: !!installPrompt,
    isInstalled,
    isIOS,
    promptInstall
  };
}

// ============================================
// 6. UPDATE PROMPT HOOK
// ============================================

export function useUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const handleUpdate = (e) => {
      setUpdateAvailable(true);
      setRegistration(e.detail);
    };

    window.addEventListener('swUpdate', handleUpdate);
    return () => window.removeEventListener('swUpdate', handleUpdate);
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return { updateAvailable, applyUpdate };
}

// ============================================
// 7. PUSH NOTIFICATIONS HOOK
// ============================================

export function usePushNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    }
  };

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const subscribe = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        )
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      setSubscription(null);
    }
  };

  return {
    permission,
    isSubscribed: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe
  };
}

// Helper function
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================
// 8. REACT COMPONENTS
// ============================================

import React from 'react';

/**
 * Install App Banner
 */
export function InstallBanner({ onDismiss }) {
  const { canInstall, isIOS, promptInstall, isInstalled } = useInstallPrompt();

  if (isInstalled) return null;

  // iOS instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 z-50">
        <div className="max-w-lg mx-auto flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl flex-shrink-0">
            👁️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Install Foresight</h3>
            <p className="text-sm text-slate-400 mb-2">
              Tap <span className="inline-flex items-center px-1 bg-slate-700 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                </svg>
              </span> then "Add to Home Screen"
            </p>
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Android/Desktop prompt
  if (!canInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 z-50">
      <div className="max-w-lg mx-auto flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl flex-shrink-0">
          👁️
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">Install Foresight</h3>
          <p className="text-sm text-slate-400">Add to home screen for quick access</p>
        </div>
        <button
          onClick={promptInstall}
          className="px-4 py-2 bg-orange-500 rounded-lg font-medium text-white hover:bg-orange-600"
        >
          Install
        </button>
        <button onClick={onDismiss} className="text-slate-400 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Update Available Banner
 */
export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useUpdatePrompt();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 p-3 bg-orange-500 text-white z-50">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <span className="text-sm font-medium">
          A new version is available!
        </span>
        <button
          onClick={applyUpdate}
          className="px-3 py-1 bg-white text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}

/**
 * Notification Permission Request
 */
export function NotificationPrompt({ onComplete }) {
  const { permission, subscribe } = usePushNotifications();

  if (permission === 'granted') {
    onComplete?.();
    return null;
  }

  if (permission === 'denied') {
    return null;
  }

  const handleEnable = async () => {
    await subscribe();
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full">
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center text-3xl mb-4">
          🔔
        </div>
        <h3 className="text-xl font-bold text-center mb-2">
          Stay Updated
        </h3>
        <p className="text-slate-400 text-center mb-6">
          Get reminders for upcoming deadlines and important updates about your case.
        </p>
        <button
          onClick={handleEnable}
          className="w-full py-3 bg-orange-500 rounded-xl font-semibold text-white hover:bg-orange-600 mb-3"
        >
          Enable Notifications
        </button>
        <button
          onClick={onComplete}
          className="w-full py-3 text-slate-400 hover:text-white"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

/**
 * Offline Indicator
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 p-2 bg-yellow-500 text-yellow-900 text-center text-sm font-medium z-50">
      📡 You're offline. Some features may be unavailable.
    </div>
  );
}

// ============================================
// 9. META TAGS FOR HEAD (Next.js)
// ============================================

export const pwaMetaTags = `
<!-- PWA Meta Tags -->
<meta name="application-name" content="Foresight" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Foresight" />
<meta name="format-detection" content="telephone=no" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="msapplication-TileColor" content="#f97316" />
<meta name="msapplication-tap-highlight" content="no" />
<meta name="theme-color" content="#0a0a0f" />

<!-- Viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

<!-- Icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icons/icon-180x180.png" />

<!-- Splash Screens (iOS) -->
<link rel="apple-touch-startup-image" href="/splash/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px)" />
<link rel="apple-touch-startup-image" href="/splash/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px)" />
<link rel="apple-touch-startup-image" href="/splash/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px)" />
<link rel="apple-touch-startup-image" href="/splash/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px)" />
<link rel="apple-touch-startup-image" href="/splash/splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px)" />
`;

// ============================================
// 10. NEXT.JS CONFIG ADDITION
// ============================================

export const nextConfigAddition = `
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // your existing config
});
`;

// ============================================
// 11. SETUP INSTRUCTIONS
// ============================================

export const PWA_SETUP_GUIDE = `
# PWA Setup Guide

## 1. Install Dependencies
\`\`\`bash
npm install next-pwa
\`\`\`

## 2. Create Files

### public/manifest.json
Copy the manifest object from this file.

### public/sw.js
Copy the serviceWorkerCode string content.

### public/offline.html
Copy the offlinePageHtml string content.

### public/icons/
Generate icons at: https://realfavicongenerator.net
Required sizes: 72, 96, 128, 144, 152, 192, 384, 512

## 3. Update next.config.js
Add the withPWA wrapper.

## 4. Update _document.js or layout.tsx
Add the pwaMetaTags to your <head>.

## 5. Initialize in _app.js or layout.tsx
\`\`\`jsx
import { registerServiceWorker } from '@/lib/pwa';

useEffect(() => {
  registerServiceWorker();
}, []);
\`\`\`

## 6. Add Components to Layout
\`\`\`jsx
import { OfflineIndicator, UpdateBanner, InstallBanner } from '@/lib/pwa';

function Layout({ children }) {
  return (
    <>
      <OfflineIndicator />
      <UpdateBanner />
      {children}
      <InstallBanner />
    </>
  );
}
\`\`\`

## 7. Generate VAPID Keys (for push notifications)
\`\`\`bash
npx web-push generate-vapid-keys
\`\`\`
Add to .env:
- NEXT_PUBLIC_VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY

## 8. Test PWA
- Run production build: npm run build && npm start
- Open Chrome DevTools > Application > Manifest
- Check "Install" button appears
- Test offline mode in Network tab

## 9. Lighthouse Audit
Run Lighthouse PWA audit to verify all requirements met.
`;

// ============================================
// EXPORTS
// ============================================

export default {
  manifest,
  serviceWorkerCode,
  offlinePageHtml,
  registerServiceWorker,
  useInstallPrompt,
  useUpdatePrompt,
  usePushNotifications,
  InstallBanner,
  UpdateBanner,
  NotificationPrompt,
  OfflineIndicator,
  pwaMetaTags,
  PWA_SETUP_GUIDE
};
