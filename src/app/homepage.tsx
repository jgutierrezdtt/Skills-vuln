import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold">⚠️ VULNERABLE NOTES APP - FOR EDUCATIONAL PURPOSES ONLY</h1>
          <p className="text-sm">This application contains intentional security vulnerabilities. DO NOT USE IN PRODUCTION!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Vulnerable Web Application
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Learn about web security by exploring common vulnerabilities
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Security Vulnerabilities Included:</h3>
            <div className="grid grid-cols-2 gap-4 text-left text-yellow-700">
              <ul className="space-y-1">
                <li>• SQL Injection</li>
                <li>• Cross-Site Scripting (XSS)</li>
                <li>• Broken Authentication</li>
                <li>• Sensitive Data Exposure</li>
              </ul>
              <ul className="space-y-1">
                <li>• Broken Access Control</li>
                <li>• Security Misconfiguration</li>
                <li>• Insecure Direct Object References</li>
                <li>• Cross-Site Request Forgery (CSRF)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
            <h3 className="text-xl font-semibold mb-2">🔐 Authentication System</h3>
            <p className="text-gray-600">Vulnerable login with SQL injection and weak validation</p>
            <div className="mt-4 text-sm text-red-600">
              Try: admin@vulnerable-app.com / admin123
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
            <h3 className="text-xl font-semibold mb-2">📝 Notes API</h3>
            <p className="text-gray-600">Create, search, and manage notes with multiple vulnerabilities</p>
            <div className="mt-4 text-sm text-red-600">
              XSS and SQL injection vulnerable
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
            <h3 className="text-xl font-semibold mb-2">👥 Users Directory</h3>
            <p className="text-gray-600">View all users and their data without authentication</p>
            <div className="mt-4 text-sm text-red-600">
              No authorization checks
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-orange-800 mb-4">🧪 Security Lab (Educational Demonstrations)</h3>
          <p className="text-orange-700 mb-4">
            These endpoints demonstrate specific vulnerabilities with explanations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/api/lab/sqli?search=admin" className="block bg-white p-4 rounded border border-orange-300 hover:bg-orange-50">
              <h4 className="font-semibold">SQL Injection Demo</h4>
              <p className="text-sm text-gray-600">Interactive SQL injection examples</p>
            </a>
            
            <a href="/api/lab/xss?input=<script>alert('XSS')</script>&reflect=true" className="block bg-white p-4 rounded border border-orange-300 hover:bg-orange-50">
              <h4 className="font-semibold">XSS Demo</h4>
              <p className="text-sm text-gray-600">Cross-site scripting examples</p>
            </a>
            
            <a href="/api/lab/csp?mode=weak" className="block bg-white p-4 rounded border border-orange-300 hover:bg-orange-50">
              <h4 className="font-semibold">CSP Demo</h4>
              <p className="text-sm text-gray-600">Content Security Policy testing</p>
            </a>
            
            <Link href="/lab/websocket" className="block bg-white p-4 rounded border border-orange-300 hover:bg-orange-50">
              <h4 className="font-semibold">WebSocket Inseguro</h4>
              <p className="text-sm text-gray-600">Vulnerabilidades en comunicación en tiempo real</p>
            </Link>
            
            <Link href="/lab/clickjacking" className="block bg-white p-4 rounded border border-orange-300 hover:bg-orange-50">
              <h4 className="font-semibold">Clickjacking</h4>
              <p className="text-sm text-gray-600">Ataques de redirección de UI y superposición de frames</p>
            </Link>
            
            <Link href="/lab/client-storage" className="block bg-white p-4 rounded border border-orange-300 hover:bg-orange-50">
              <h4 className="font-semibold">Client-Side Storage Leakage</h4>
              <p className="text-sm text-gray-600">Exposición de datos sensibles en almacenamiento del cliente</p>
            </Link>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">📚 API Documentation</h3>
          <p className="text-blue-700 mb-4">
            The vulnerable API is fully documented with OpenAPI 3.0 specification:
          </p>
          <div className="flex gap-4">
            <a 
              href="/api/openapi" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View OpenAPI JSON
            </a>
            <a 
              href="https://petstore.swagger.io/?url=http://localhost:3000/api/openapi"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Open in Swagger UI
            </a>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p className="mb-2">Built with Next.js, Prisma, and intentional security flaws</p>
          <p className="text-sm">
            ⚠️ This application is designed to be vulnerable for educational purposes. 
            Never deploy this to production!
          </p>
        </div>
      </div>
    </div>
  );
}
