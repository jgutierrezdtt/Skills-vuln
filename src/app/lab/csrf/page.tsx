'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { randomBytes } from 'crypto';

// Tipo para el token CSRF
interface CSRFTokenStore {
  token: string;
  created: number;
}

export default function CSRFVulnerablePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [protection, setProtection] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [attackUrl, setAttackUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  
  // Generar URL para la página de ataque
  useEffect(() => {
    if (user && user.id) {
      setUserId(user.id);
      setEmail(user.email || '');
      setRole(user.role || 'user');
      
      // Crear URL para la página de ataque CSRF
      const baseUrl = window.location.origin;
      setAttackUrl(`${baseUrl}/lab/csrf/attack-page?userId=${user.id}`);
    }
  }, [user]);
  
  // Generar token CSRF si la protección está habilitada
  useEffect(() => {
    if (protection) {
      // En un escenario real, este token vendría del servidor
      const newToken = randomBytes(16).toString('hex');
      setCsrfToken(newToken);
      
      // Almacenar el token en sessionStorage (esto es simplificado para el ejemplo)
      const tokenData: CSRFTokenStore = {
        token: newToken,
        created: Date.now()
      };
      sessionStorage.setItem('csrf_token', JSON.stringify(tokenData));
    } else {
      setCsrfToken('');
      sessionStorage.removeItem('csrf_token');
    }
  }, [protection]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage('');
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Añadir el token CSRF al header si la protección está activada
      if (protection && csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          role,
          userId
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResultMessage('✅ Perfil actualizado correctamente');
      } else {
        setResultMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResultMessage(`❌ Error: ${error instanceof Error ? error.message : 'Desconocido'}`);
    }
  };
  
  if (!user) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">Por favor inicia sesión para ver esta página.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: Vulnerabilidad CSRF</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Protección CSRF</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Protección CSRF activada - Se requiere token para todas las operaciones" 
                : "❌ Protección CSRF desactivada - Vulnerable a ataques de falsificación"}
            </p>
            {protection && (
              <p className="text-xs mt-1 text-blue-500">Token CSRF: {csrfToken}</p>
            )}
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
      
      {/* Formulario de actualización de perfil */}
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Actualización de Perfil</h2>
        
        {resultMessage && (
          <div className={`p-3 mb-4 rounded ${resultMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {resultMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <input type="hidden" name="userId" value={userId} />
          
          {/* Token CSRF (visible solo para demostración) */}
          {protection && (
            <div className="p-3 bg-gray-100 rounded text-sm">
              <p className="font-medium">Token CSRF incluido en la solicitud</p>
              <p className="font-mono text-xs mt-1 break-all">{csrfToken}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
          >
            Actualizar Perfil
          </button>
        </form>
      </div>
      
      {/* Demostración de ataque CSRF */}
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-yellow-800">Demostración de Ataque CSRF</h2>
        
        <p className="mb-4">
          Un atacante podría crear una página maliciosa que realice automáticamente solicitudes a este formulario
          sin tu consentimiento cuando la protección CSRF está desactivada.
        </p>
        
        <div className="p-3 bg-white rounded mb-4">
          <p className="font-medium mb-2">URL de la página de ataque:</p>
          <a 
            href={attackUrl}
            target="_blank"
            className="text-blue-600 hover:text-blue-800 break-all"
          >
            {attackUrl}
          </a>
        </div>
        
        <div className="text-sm text-yellow-700">
          <p><strong>Instrucciones:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Asegúrate de que la protección CSRF esté <strong>desactivada</strong> (modo inseguro)</li>
            <li>Abre el enlace de la "página de ataque" en una nueva ventana o pestaña</li>
            <li>Observa cómo la solicitud se completa sin tu interacción</li>
            <li>Activa la protección CSRF y vuelve a intentarlo para ver la diferencia</li>
          </ol>
        </div>
      </div>
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es CSRF?</strong> Cross-Site Request Forgery es un ataque que fuerza a un usuario autenticado a ejecutar acciones no deseadas en una aplicación web en la que está autenticado actualmente.</p>
          
          <p><strong>Por qué es peligroso:</strong> Un atacante puede hacer que un usuario realice cambios en su cuenta, transferencias financieras u otras operaciones sensibles sin su conocimiento o consentimiento.</p>
          
          <p><strong>Mitigación:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tokens CSRF en formularios y solicitudes AJAX</li>
            <li>Comprobación del encabezado Referer</li>
            <li>Cookies SameSite</li>
            <li>Headers personalizados para solicitudes AJAX</li>
            <li>Doble envío de cookies</li>
          </ul>
          
          <p><strong>Ejemplo de implementación segura:</strong></p>
          <pre className="p-3 bg-gray-100 rounded overflow-x-auto">
{`// Servidor: Generar y almacenar token
app.get('/form', (req, res) => {
  const csrfToken = generateToken();
  req.session.csrfToken = csrfToken;
  res.render('form', { csrfToken });
});

// Servidor: Verificar token en solicitudes POST
app.post('/api/action', (req, res) => {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).send('Token CSRF inválido');
  }
  // Procesar solicitud...
});

// Cliente: Incluir token en formularios
<form action="/api/action" method="post">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  <!-- Otros campos -->
</form>

// Cliente: Incluir token en solicitudes AJAX
fetch('/api/action', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}