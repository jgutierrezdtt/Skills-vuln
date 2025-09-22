'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JSONInjectionPage() {
  const [protection, setProtection] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [customJson, setCustomJson] = useState<string>('{\n  "name": "Test User",\n  "email": "test@example.com",\n  "metadata": {\n    "note": "This is a test"\n  }\n}');
  const [submitResponse, setSubmitResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'search' | 'submit'>('search');

  // Función para buscar usuarios
  const searchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/lab/json-injection?secure=${protection}&query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUserResults(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al buscar usuarios');
      setUserResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar JSON personalizado
  const submitCustomJson = async () => {
    setLoading(true);
    setError('');
    setSubmitResponse(null);
    
    try {
      // Validar que el JSON sea válido
      const jsonData = JSON.parse(customJson);
      
      const response = await fetch(`/api/lab/json-injection?secure=${protection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: customJson
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubmitResponse(data);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Error de sintaxis JSON: ' + err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al enviar JSON');
      }
    } finally {
      setLoading(false);
    }
  };

  // Ejemplos de payload maliciosos
  const maliciousExamples = [
    {
      name: 'Inyección de __proto__',
      payload: `{
  "name": "Hacker",
  "__proto__": {
    "isAdmin": true
  }
}`,
      description: 'Intenta modificar el prototipo de objetos JavaScript para añadir propiedades maliciosas'
    },
    {
      name: 'Modificación de constructor',
      payload: `{
  "name": "Hacker",
  "constructor": {
    "prototype": {
      "hasAccess": true
    }
  }
}`,
      description: 'Intenta manipular el constructor para modificar prototipos'
    },
    {
      name: 'Inyección de role',
      payload: `{
  "name": "Regular User",
  "role": "admin"
}`,
      description: 'Intenta elevar privilegios cambiando el rol a admin'
    },
    {
      name: 'Script en JSON',
      payload: `{
  "name": "<script>alert('XSS desde JSON')</script>",
  "email": "hacker@example.com"
}`,
      description: 'Intenta inyectar código JavaScript en valores que podrían ser renderizados en HTML'
    }
  ];

  // Función para aplicar un ejemplo malicioso
  const applyMaliciousExample = (payload: string) => {
    setCustomJson(payload);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: JSON Injection</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Protección JSON</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Sanitización JSON activada - Los datos se filtran antes de procesarse" 
                : "❌ Sanitización JSON desactivada - Los datos se procesan sin filtrar (vulnerable)"}
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-gray-900">Inseguro</span>
            <div className="relative">
              <input 
                type="checkbox" 
                checked={protection}
                onChange={(e) => setProtection(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-900">Seguro</span>
          </label>
        </div>
      </div>
      
      {/* Tabs para las diferentes demostraciones */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Búsqueda de Usuarios
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'submit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Envío de JSON Personalizado
            </button>
          </nav>
        </div>
      </div>
      
      {/* Contenido de la tab de búsqueda */}
      {activeTab === 'search' && (
        <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">Búsqueda de Usuarios</h2>
          
          <div className="mb-4">
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar usuarios (por nombre o email):
            </label>
            <div className="flex">
              <input
                id="search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-l-md"
                placeholder="Ejemplo: admin"
              />
              <button
                onClick={searchUsers}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-r-md disabled:bg-blue-300"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {userResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Resultados ({userResults.length})</h3>
              <div className="space-y-4">
                {userResults.map((user, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md">
                    <div className="mb-1"><strong>ID:</strong> {user.id}</div>
                    <div className="mb-1"><strong>Nombre:</strong> {user.name}</div>
                    <div className="mb-1"><strong>Email:</strong> {user.email}</div>
                    {user.role && <div className="mb-1"><strong>Rol:</strong> {user.role}</div>}
                    
                    {user.preferences && (
                      <div className="mt-2">
                        <strong>Preferencias:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                          {JSON.stringify(user.preferences, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {userResults.length === 0 && !loading && !error && (
            <p className="text-gray-500">No hay resultados para mostrar. Intenta buscar "admin" o "user".</p>
          )}
        </div>
      )}
      
      {/* Contenido de la tab de envío JSON */}
      {activeTab === 'submit' && (
        <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">Envío de JSON Personalizado</h2>
          
          <div className="mb-4">
            <label htmlFor="custom-json" className="block text-sm font-medium text-gray-700 mb-2">
              Ingresa JSON personalizado:
            </label>
            <textarea
              id="custom-json"
              value={customJson}
              onChange={(e) => setCustomJson(e.target.value)}
              rows={8}
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <button
              onClick={submitCustomJson}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-300"
            >
              {loading ? 'Enviando...' : 'Enviar JSON'}
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {submitResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Respuesta del servidor:</h3>
              <pre className="p-3 bg-gray-100 border border-gray-200 rounded text-sm overflow-x-auto">
                {JSON.stringify(submitResponse, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Ejemplos de payloads maliciosos */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-lg font-semibold mb-3">Ejemplos de Payloads Maliciosos</h3>
            <p className="text-sm text-gray-600 mb-4">
              Haz clic en uno de los siguientes ejemplos para probar diferentes tipos de ataques de inyección JSON:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maliciousExamples.map((example, index) => (
                <div key={index} className="p-3 border border-yellow-300 rounded-md bg-yellow-100">
                  <h4 className="font-medium mb-1">{example.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{example.description}</p>
                  <button
                    onClick={() => applyMaliciousExample(example.payload)}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    Aplicar este ejemplo
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica: JSON Injection</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es JSON Injection?</strong> JSON Injection es una vulnerabilidad que ocurre cuando una aplicación procesa datos JSON sin sanitización adecuada, permitiendo a un atacante manipular la estructura o contenido del JSON para lograr comportamientos no deseados.</p>
          
          <p><strong>Tipos de ataques:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Prototype Pollution:</strong> Manipulación del objeto <code>__proto__</code> para modificar el comportamiento de todos los objetos.</li>
            <li><strong>Constructor Poisoning:</strong> Modificar propiedades del constructor para afectar a instancias futuras.</li>
            <li><strong>Cross-Site Scripting (XSS):</strong> Incluir código JavaScript malicioso en valores JSON que luego se renderizan en HTML.</li>
            <li><strong>Escalada de privilegios:</strong> Manipular propiedades sensibles como 'role' para obtener acceso no autorizado.</li>
          </ul>
          
          <p><strong>Impacto:</strong> Estos ataques pueden llevar a ejecución de código no autorizado, bypass de autenticación, escalada de privilegios y filtración de datos sensibles.</p>
          
          <p><strong>Mitigaciones:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Validar la estructura del JSON contra un esquema predefinido</li>
            <li>Sanitizar propiedades peligrosas como <code>__proto__</code>, <code>constructor</code>, etc.</li>
            <li>Utilizar Object.freeze() para prevenir modificaciones de objetos sensibles</li>
            <li>Implementar una política de Content Security Policy (CSP) estricta</li>
            <li>Evitar eval() o new Function() con datos JSON no confiables</li>
            <li>Sanitizar valores antes de renderizarlos en HTML para prevenir XSS</li>
          </ul>
          
          <p><strong>Código seguro vs. vulnerable:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium mb-2 text-red-600">❌ Vulnerable</h4>
              <pre className="p-2 bg-red-50 border border-red-200 rounded text-sm overflow-x-auto">
{`// Procesar JSON sin sanitización
const userData = JSON.parse(userInput);

// Usar directamente el objeto
if (userData.role === 'admin') {
  grantAdminAccess();
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ Seguro</h4>
              <pre className="p-2 bg-green-50 border border-green-200 rounded text-sm overflow-x-auto">
{`// Sanitizar JSON antes de usar
function sanitize(obj) {
  // Eliminar propiedades peligrosas
  const safe = {...obj};
  delete safe.__proto__;
  delete safe.constructor;
  // Validar role contra valores permitidos
  if (safe.role && !['user','editor'].includes(safe.role)) {
    safe.role = 'user';
  }
  return safe;
}

const userData = sanitize(JSON.parse(userInput));`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}