import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h1 className="text-xl font-bold">VULNERABLE WEB LAB - EDUCATIONAL PURPOSES ONLY</h1>
              <p className="text-sm opacity-90">This application contains intentional security vulnerabilities. DO NOT USE IN PRODUCTION!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🛡️ Vulnerable Web Application
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Aprende ciberseguridad explorando vulnerabilidades web comunes en un entorno controlado y educativo
          </p>
        </div>

        {/* Interactive Vulnerabilities */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 mb-12 shadow-lg">
          <h3 className="text-2xl font-bold text-yellow-800 mb-6 text-center flex items-center justify-center gap-3">
            <span className="text-3xl">🎯</span>
            Vulnerabilidades Interactivas
          </h3>
          <p className="text-center text-yellow-700 mb-6">Haz clic en cualquier vulnerabilidad para explorarla:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <a href="/api/lab/sqli?search=admin" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">💉</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">SQL Injection</span>
                  <div className="text-sm text-gray-600">Inyección en consultas SQL</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              
              <a href="/api/lab/xss?input=<script>alert('XSS')</script>&reflect=true" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">🕸️</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">Cross-Site Scripting (XSS)</span>
                  <div className="text-sm text-gray-600">Ejecución de scripts maliciosos</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              
              <a href="/api/auth/login" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">🔓</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">Broken Authentication</span>
                  <div className="text-sm text-gray-600">Autenticación vulnerable</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              
              <a href="/api/users" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">📊</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">Sensitive Data Exposure</span>
                  <div className="text-sm text-gray-600">Exposición de datos sensibles</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
            
            <div className="space-y-3">
              <a href="/api/notes" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">🚪</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">Broken Access Control</span>
                  <div className="text-sm text-gray-600">Control de acceso deficiente</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              
              <a href="/api/system-info" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">⚙️</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">Security Misconfiguration</span>
                  <div className="text-sm text-gray-600">Configuración insegura</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              
              <a href="/api/users/1" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">🎯</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">Insecure Direct Object References</span>
                  <div className="text-sm text-gray-600">Referencias directas inseguras</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              
              <a href="/api/notes" className="flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-yellow-50 hover:shadow-md transition-all duration-300 group border border-yellow-200">
                <span className="text-2xl">🔄</span>
                <div>
                  <span className="font-semibold text-gray-900 group-hover:text-yellow-800">Cross-Site Request Forgery</span>
                  <div className="text-sm text-gray-600">Falsificación de peticiones</div>
                </div>
                <span className="ml-auto text-yellow-600 group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="text-3xl">🔐</span>
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Sistema de Autenticación</h3>
            <p className="text-gray-600 text-center mb-4">Login vulnerable con inyección SQL y validación débil</p>
            <div className="text-center">
              <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                Prueba: admin@vulnerable-app.com / admin123
              </span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-bold text-center mb-4">API de Notas</h3>
            <p className="text-gray-600 text-center mb-4">Crear, buscar y gestionar notas con múltiples vulnerabilidades</p>
            <div className="text-center">
              <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                Vulnerable a XSS e inyección SQL
              </span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Directorio de Usuarios</h3>
            <p className="text-gray-600 text-center mb-4">Ver todos los usuarios y sus datos sin autenticación</p>
            <div className="text-center">
              <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                Sin verificaciones de autorización
              </span>
            </div>
          </div>
        </div>

        {/* Labs Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 mb-12 shadow-lg">
          <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center flex items-center justify-center gap-3">
            <span className="text-3xl">🧪</span>
            Laboratorio de Demostraciones
          </h3>
          <p className="text-blue-700 mb-8 text-center max-w-2xl mx-auto">
            Estos endpoints demuestran vulnerabilidades específicas con explicaciones detalladas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/api/lab/sqli?search=admin" className="block bg-white p-6 rounded-xl border border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">💉</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Demo de SQL Injection</h4>
              <p className="text-gray-600 text-sm">Ejemplos interactivos de inyección SQL</p>
            </a>
            
            <a href="/api/lab/xss?input=<script>alert('XSS')</script>&reflect=true" className="block bg-white p-6 rounded-xl border border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">🕸️</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Demo de XSS</h4>
              <p className="text-gray-600 text-sm">Ejemplos de cross-site scripting</p>
            </a>
            
            <a href="/api/lab/csp?mode=weak" className="block bg-white p-6 rounded-xl border border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Demo de CSP</h4>
              <p className="text-gray-600 text-sm">Pruebas de Content Security Policy</p>
            </a>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-green-800 mb-6 text-center flex items-center justify-center gap-3">
            <span className="text-3xl">📚</span>
            Documentación de API
          </h3>
          <p className="text-green-700 mb-8 text-center max-w-2xl mx-auto">
            La API vulnerable está completamente documentada con especificación OpenAPI 3.0
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/api/openapi" 
              className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span className="text-xl">📄</span>
              Ver Especificación OpenAPI
            </a>
            <a 
              href="https://petstore.swagger.io/?url=http://localhost:3000/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span className="text-xl">🚀</span>
              Abrir en Swagger UI
            </a>
          </div>
        </div>

        {/* Footer Warning */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-yellow-800 mb-1">Advertencia Educativa</p>
              <p className="text-yellow-700">
                Esta aplicación contiene vulnerabilidades intencionales para fines educativos únicamente. 
                <strong className="text-red-700"> ¡Nunca uses esto en producción!</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
