import Link from "next/link";

export default function Home() {
  const vulnerabilities = [
    { 
      name: "SQL Injection", 
      icon: "💉", 
      endpoint: "/api/lab/sqli?search=admin", 
      severity: "critical",
      description: "Explora vulnerabilidades de inyección SQL en consultas de base de datos"
    },
    { 
      name: "Cross-Site Scripting (XSS)", 
      icon: "🕸️", 
      endpoint: "/api/lab/xss?input=<script>alert('XSS')</script>&reflect=true", 
      severity: "high",
      description: "Demuestra ataques XSS y ejecución de scripts maliciosos"
    },
    { 
      name: "Broken Authentication", 
      icon: "🔓", 
      endpoint: "/api/auth/login", 
      severity: "critical",
      description: "Sistemas de autenticación débiles y vulnerables"
    },
    { 
      name: "Sensitive Data Exposure", 
      icon: "📊", 
      endpoint: "/api/users", 
      severity: "high",
      description: "Exposición inadecuada de información sensible"
    },
    { 
      name: "Broken Access Control", 
      icon: "🚪", 
      endpoint: "/api/notes", 
      severity: "critical",
      description: "Fallos en controles de acceso y autorización"
    },
    { 
      name: "Security Misconfiguration", 
      icon: "⚙️", 
      endpoint: "/api/system-info", 
      severity: "medium",
      description: "Configuraciones de seguridad incorrectas"
    },
    { 
      name: "Insecure Direct Object References", 
      icon: "🎯", 
      endpoint: "/api/users/1", 
      severity: "high",
      description: "Referencias directas a objetos sin validación"
    },
    { 
      name: "Cross-Site Request Forgery (CSRF)", 
      icon: "🔄", 
      endpoint: "/api/notes", 
      severity: "medium",
      description: "Ataques CSRF en formularios y acciones"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200';
      case 'high': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-200';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-200';
      default: return 'bg-gray-500 text-white shadow-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-300 text-sm font-medium">EDUCATIONAL PURPOSES ONLY</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-4 leading-tight">
              🛡️ Vulnerable Web Lab
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Plataforma educativa avanzada para aprender ciberseguridad a través de 
              <span className="text-blue-400 font-semibold"> vulnerabilidades controladas</span> y 
              <span className="text-indigo-400 font-semibold"> demostraciones interactivas</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/api/openapi"
                className="group flex items-center gap-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
              >
                <span className="text-xl">📚</span>
                <span className="text-white font-semibold">API Documentation</span>
              </Link>
              
              <a 
                href="https://petstore.swagger.io/?url=http://localhost:3000/api/openapi"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <span className="text-xl">🚀</span>
                <span className="text-white font-semibold">Open Swagger UI</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{vulnerabilities.length}</div>
                <div className="text-gray-500 text-sm font-medium">Vulnerabilidades</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {vulnerabilities.filter(v => v.severity === 'critical').length}
                </div>
                <div className="text-gray-500 text-sm font-medium">Críticas</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">20+</div>
                <div className="text-gray-500 text-sm font-medium">APIs</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-gray-500 text-sm font-medium">Educativo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerabilities Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Vulnerabilidades Interactivas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora cada vulnerabilidad haciendo clic en las tarjetas. Cada enlace te llevará a una demostración práctica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vulnerabilities.map((vuln, index) => (
              <Link key={index} href={vuln.endpoint}>
                <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-105 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">{vuln.icon}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity.toUpperCase()}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {vuln.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {vuln.description}
                  </p>

                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Probar ahora</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Access Labs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🧪 Laboratorios de Demostración</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/api/lab/sqli?search=admin" className="group block">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-white text-xl">💉</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">SQL Injection Demo</h4>
                <p className="text-gray-600 text-sm">Ejemplos interactivos de inyección SQL</p>
              </div>
            </Link>
            
            <Link href="/api/lab/xss?input=<script>alert('XSS')</script>&reflect=true" className="group block">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-white text-xl">🕸️</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">XSS Demo</h4>
                <p className="text-gray-600 text-sm">Ejemplos de cross-site scripting</p>
              </div>
            </Link>
            
            <Link href="/api/lab/csp?mode=weak" className="group block">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-white text-xl">🛡️</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">CSP Demo</h4>
                <p className="text-gray-600 text-sm">Pruebas de Content Security Policy</p>
              </div>
            </Link>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-lg border border-blue-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📚 Documentación Completa</h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              La API vulnerable está completamente documentada con especificación OpenAPI 3.0 para facilitar el aprendizaje
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/api/openapi"
              className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span className="text-xl">📄</span>
              View OpenAPI JSON
            </Link>
            <a 
              href="https://petstore.swagger.io/?url=http://localhost:3000/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span className="text-xl">🚀</span>
              Open in Swagger UI
            </a>
          </div>
        </div>

        {/* Warning Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-yellow-800 mb-1">Advertencia Educativa</p>
              <p className="text-yellow-700 text-sm">
                Esta aplicación contiene vulnerabilidades intencionales para fines educativos únicamente. 
                <strong> ¡Nunca uses esto en producción!</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}