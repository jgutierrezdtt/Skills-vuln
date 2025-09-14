import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración básica para evitar errores de Turbopack
  
  // Headers de seguridad débiles para vulnerabilidades educativas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ❌ VULNERABILIDAD: CSP muy permisiva para permitir ataques XSS
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; style-src 'self' 'unsafe-inline' *;"
          },
          // ❌ VULNERABILIDAD: Permitir embebido en frames (clickjacking)
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          // Warning educativo
          {
            key: 'X-Educational-Warning',
            value: 'VULNERABLE-BY-DESIGN-FOR-EDUCATIONAL-PURPOSES-ONLY'
          },
          // ❌ VULNERABILIDAD: Información sensible en headers
          {
            key: 'X-Debug-Info',
            value: 'version=vulnerable-1.0,environment=lab'
          },
          // ❌ VULNERABILIDAD: Deshabilitar protecciones del navegador
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
    ]
  },

  // Configuración webpack para evitar problemas de build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // ❌ VULNERABILIDAD: CORS muy permisivo
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  }
};

export default nextConfig;
