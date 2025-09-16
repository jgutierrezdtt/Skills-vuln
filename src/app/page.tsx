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
      name: "XML External Entity (XXE)",
      icon: "📄",
      endpoint: "/api/lab/xxe",
      severity: "high",
      description: "Vulnerabilidades de procesamiento XML inseguro"
    },
    {
      name: "LDAP Injection",
      icon: "🗂️",
      endpoint: "/api/lab/ldap?filter=admin",
      severity: "high",
      description: "Inyección en consultas LDAP para bypass de autenticación"
    },
    {
      name: "Server-Side Template Injection",
      icon: "🔧",
      endpoint: "/api/lab/ssti?template={{7*7}}",
      severity: "critical",
      description: "Ejecución de código a través de plantillas del servidor"
    },
    {
      name: "Command Injection",
      icon: "⚡",
      endpoint: "/api/lab/command-injection?cmd=ls",
      severity: "critical",
      description: "Ejecución de comandos del sistema operativo"
    },
    {
      name: "Session Fixation",
      icon: "🔐",
      endpoint: "/api/lab/session-fixation",
      severity: "medium",
      description: "Vulnerabilidades de fijación de sesión"
    },
    {
      name: "Content Security Policy Bypass",
      icon: "🛡️",
      endpoint: "/api/lab/csp",
      severity: "medium",
      description: "Bypass de políticas de seguridad de contenido"
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
      description: "Acceso directo a objetos sin validación"
    },
    { 
      name: "File Upload Vulnerabilities", 
      icon: "📁", 
      endpoint: "/api/upload", 
      severity: "high",
      description: "Subida de archivos sin validación adecuada"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/85 to-indigo-900/90 z-10"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="VulnLab Logo" 
              className="w-12 h-12 rounded-xl object-cover drop-shadow-lg"
            />
            <span className="text-white font-bold text-2xl">VulnLab</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6 leading-tight">
            Laboratorio de Seguridad
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Plataforma educativa para aprender ciberseguridad a través de vulnerabilidades controladas
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/api/openapi"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-2xl px-8 py-4 text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              📚 API Documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Vulnerabilities Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vulnerabilities.map((vuln, index) => (
            <Link key={index} href={vuln.endpoint}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{vuln.icon}</span>
                  <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                    vuln.severity === 'critical' ? 'text-red-400 bg-red-400/20' :
                    vuln.severity === 'high' ? 'text-orange-400 bg-orange-400/20' :
                    'text-yellow-400 bg-yellow-400/20'
                  }`}>
                    {vuln.severity.toUpperCase()}
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{vuln.name}</h3>
                <p className="text-gray-400 text-sm">{vuln.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
