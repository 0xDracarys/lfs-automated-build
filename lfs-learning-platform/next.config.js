// @ts-check

const path = require('path');

const securityHeaders = [
  // Clickjacking: never allow framing
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME sniffing attacks
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Do not leak full URLs on cross-origin navigations
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable device features the site never uses
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  // Force HTTPS for production deployments (harmless on localhost)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** A conservative Content-Security-Policy for this app (fonts are
 * self-hosted via next/font; Google API domains are needed for Firebase). */
const allowedJsSource = [
  "'self'",
  "'unsafe-inline'", // Next.js inline bootstraps + scripts
  'https://lh3.googleusercontent.com', // Google sign-in avatar images
  'data:', // inline image placeholders used by canvas wall
  'https://firebasestorage.googleapis.com',
];
const allowedConnect = [
  "'self'",
  'https://*.googleapis.com',
  'https://*.firebaseio.com',
  'https://firebasestorage.googleapis.com',
  'wss://*.firebaseio.com',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Content-Security-Policy',
            value: [
              `default-src 'self'`,
              `script-src ${allowedJsSource.join(' ')}`,
              `style-src 'self' 'unsafe-inline'`,
              `img-src ${allowedJsSource.join(' ')}`,
              `font-src 'self' data:`,
              `connect-src ${allowedConnect.join(' ')}`,
              `frame-ancestors 'none'`,
              `base-uri 'self'`,
              `form-action 'self'`,
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
