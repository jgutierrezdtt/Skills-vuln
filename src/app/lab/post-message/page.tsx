'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function PostMessageVulnerabilityPage() {
  const [protection, setProtection] = useState<boolean>(false);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState<number>(1000);
  const [secretKey, setSecretKey] = useState<string>('sk_test_example_key_not_real_12345');
  const [accountInfo, setAccountInfo] = useState({
    name: 'Usuario Demo',
    id: 'USR12345',
    role: 'customer'
  });
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const secureIframeRef = useRef<HTMLIFrameElement>(null);
  
  // Manejar mensajes recibidos
  useEffect(() => {
    // Función que procesa los mensajes recibidos
    const handleReceivedMessage = (event: MessageEvent) => {
      // Registrar todos los mensajes para mostrarlos en la interfaz
      const newMessage = {
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toLocaleTimeString(),
        secure: protection
      };
      
      setReceivedMessages(prev => [newMessage, ...prev].slice(0, 10));
      
      // Si la protección está activada, verificar el origen
      if (protection) {
        // Lista de orígenes permitidos
        const allowedOrigins = [
          window.location.origin,
          'http://localhost:3000'
        ];
        
        // Verificar si el origen del mensaje está en la lista de permitidos
        if (!allowedOrigins.includes(event.origin)) {
          console.warn(`Mensaje bloqueado de origen no permitido: ${event.origin}`);
          return; // No procesar el mensaje
        }
      }
      
      // Procesar el mensaje basado en su tipo
      if (typeof event.data === 'object' && event.data !== null) {
        // Manejar diferentes tipos de comandos
        switch(event.data.action) {
          case 'updateBalance':
            if (typeof event.data.amount === 'number') {
              setUserBalance(event.data.amount);
              console.log(`Balance actualizado a: ${event.data.amount}`);
            }
            break;
            
          case 'getSecretKey':
            // Esta acción expone información sensible al emisor
            if (iframeRef.current) {
              iframeRef.current.contentWindow?.postMessage({
                action: 'secretKeyResponse',
                key: secretKey
              }, '*');
            }
            break;
            
          case 'executeCommand':
            // Simulación de ejecución de comandos (podría ser peligroso)
            if (typeof event.data.command === 'string') {
              console.log(`Simulando ejecución de: ${event.data.command}`);
              // En una app real, esto podría ejecutar código arbitrario
            }
            break;
            
          case 'updateAccount':
            // Actualizar información de la cuenta
            if (event.data.accountInfo) {
              setAccountInfo({
                ...accountInfo,
                ...event.data.accountInfo
              });
            }
            break;
            
          default:
            console.log('Recibido mensaje con acción desconocida:', event.data);
        }
      }
    };
    
    // Añadir el event listener
    window.addEventListener('message', handleReceivedMessage);
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('message', handleReceivedMessage);
    };
  }, [protection, secretKey]);
  
  // Función para enviar un mensaje al iframe
  const sendMessageToIframe = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        action: 'pingFromParent',
        message: 'Hola desde la página principal',
        timestamp: new Date().toISOString()
      }, '*'); // El '*' es parte del problema - envía a cualquier origen
    }
    
    if (secureIframeRef.current && secureIframeRef.current.contentWindow) {
      // Enviar al iframe "seguro" con origen específico
      secureIframeRef.current.contentWindow.postMessage({
        action: 'pingFromParent',
        message: 'Hola desde la página principal (mensaje seguro)',
        timestamp: new Date().toISOString()
      }, window.location.origin);
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: HTML5 postMessage</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Protección postMessage</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Verificación de origen activada - Solo se procesan mensajes de orígenes confiables" 
                : "❌ Verificación de origen desactivada - Se procesan mensajes de cualquier origen (vulnerable)"}
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
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de información y mensajes */}
        <div className="space-y-6">
          {/* Información del usuario */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Información de la Cuenta</h2>
            
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded">
                <span className="font-semibold">Nombre:</span> {accountInfo.name}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <span className="font-semibold">ID de Usuario:</span> {accountInfo.id}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <span className="font-semibold">Rol:</span> {accountInfo.role}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <span className="font-semibold">Balance:</span> ${userBalance.toFixed(2)}
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <span className="font-semibold">Clave API:</span> 
                <span className="font-mono text-sm">{secretKey.substring(0, 8)}•••••••••••••••</span>
              </div>
            </div>
          </div>
          
          {/* Historial de mensajes recibidos */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Mensajes Recibidos</h2>
            
            {receivedMessages.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {receivedMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded border ${
                      msg.secure 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Origen: {msg.origin}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <pre className="text-sm font-mono bg-white p-2 rounded overflow-x-auto">
                      {JSON.stringify(msg.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No se han recibido mensajes aún.</p>
            )}
          </div>
          
          {/* Acciones */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Acciones</h2>
            
            <button
              onClick={sendMessageToIframe}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            >
              Enviar Mensaje a los iFrames
            </button>
          </div>
        </div>
        
        {/* Panel de iframes */}
        <div className="space-y-6">
          {/* iFrame vulnerable */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">iFrame de Terceros (Simulado)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Este iframe simula contenido de terceros que podría intentar explotar la vulnerabilidad de postMessage.
            </p>
            
            <div className="border-2 border-red-300 rounded-lg p-2 bg-red-50">
              <iframe
                ref={iframeRef}
                src="/lab/post-message/attacker-frame"
                className="w-full h-64 border-0"
                title="Contenido de terceros"
              ></iframe>
            </div>
          </div>
          
          {/* iFrame seguro */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">iFrame Seguro (Mismo Origen)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Este iframe es del mismo origen y representa una comunicación legítima.
            </p>
            
            <div className="border-2 border-green-300 rounded-lg p-2 bg-green-50">
              <iframe
                ref={secureIframeRef}
                src="/lab/post-message/secure-frame"
                className="w-full h-64 border-0"
                title="Contenido seguro"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica: HTML5 postMessage</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es postMessage?</strong> La API postMessage es un mecanismo de HTML5 que permite la comunicación segura entre ventanas/iframes de diferentes orígenes, rompiendo la restricción del Same-Origin Policy.</p>
          
          <p><strong>El problema:</strong> Cuando los mensajes se procesan sin verificar su origen, un atacante puede enviar mensajes maliciosos desde un iframe o ventana bajo su control.</p>
          
          <p><strong>Impacto:</strong> Las vulnerabilidades de postMessage pueden conducir a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Robo de información sensible</li>
            <li>Manipulación del DOM</li>
            <li>Ejecución de comandos no autorizados</li>
            <li>Inyección de scripts maliciosos (XSS)</li>
          </ul>
          
          <p><strong>Implementación segura vs. vulnerable:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium mb-2 text-red-600">❌ Vulnerable</h4>
              <pre className="p-2 bg-red-50 border border-red-200 rounded text-sm overflow-x-auto">
{`// Envío de mensaje sin especificar origen
window.postMessage(data, '*');

// Recepción sin verificar origen
window.addEventListener('message', (event) => {
  // Procesar event.data sin verificaciones
});`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ Seguro</h4>
              <pre className="p-2 bg-green-50 border border-green-200 rounded text-sm overflow-x-auto">
{`// Envío de mensaje a origen específico
window.postMessage(data, 'https://origen-confiable.com');

// Recepción con verificación de origen
window.addEventListener('message', (event) => {
  // Verificar origen antes de procesar
  if (event.origin !== 'https://origen-confiable.com') {
    return;
  }
  // Procesar event.data de forma segura
});`}
              </pre>
            </div>
          </div>
          
          <p><strong>Buenas prácticas:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Siempre verificar el origen (<code>event.origin</code>) de los mensajes recibidos</li>
            <li>Usar una lista blanca de orígenes permitidos</li>
            <li>Especificar el origen exacto al enviar mensajes, evitando <code>'*'</code></li>
            <li>Implementar validación estricta del formato y contenido de los mensajes</li>
            <li>Evitar ejecutar o evaluar contenido de los mensajes directamente</li>
            <li>Utilizar mecanismos de autenticación adicionales en los mensajes críticos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}