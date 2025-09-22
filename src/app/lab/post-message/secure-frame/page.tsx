'use client';

import { useState, useEffect } from 'react';

export default function SecureFrame() {
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  
  // Escuchar mensajes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar origen (buena práctica aunque no sea necesario para esta demo)
      if (event.origin !== window.location.origin) {
        console.warn('Mensaje recibido de origen desconocido:', event.origin);
        return;
      }
      
      // Registrar mensaje
      const newMessage = {
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setReceivedMessages(prev => [newMessage, ...prev].slice(0, 5));
      
      // Responder al mensaje si es necesario
      if (event.data && event.data.action === 'pingFromParent') {
        // Enviar respuesta a la ventana padre
        window.parent.postMessage({
          action: 'pongFromSecure',
          message: 'Respuesta desde iframe seguro',
          receivedTimestamp: event.data.timestamp,
          respondedAt: new Date().toISOString()
        }, window.location.origin); // Especificar origen exacto (buena práctica)
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Función para enviar mensaje legítimo a la ventana padre
  const sendLegitimateMessage = () => {
    window.parent.postMessage({
      action: 'updateAccount',
      accountInfo: {
        name: 'Usuario Actualizado'
      },
      timestamp: new Date().toISOString()
    }, window.location.origin); // Comunicación segura con origen específico
  };
  
  return (
    <div className="p-4 bg-green-50 h-full">
      <h2 className="text-lg font-bold text-green-700 mb-3">Frame Seguro (Mismo Origen)</h2>
      
      <div className="mb-4">
        <button
          onClick={sendLegitimateMessage}
          className="p-2 bg-green-200 hover:bg-green-300 text-green-800 rounded"
        >
          Enviar mensaje legítimo
        </button>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium text-green-600 mb-2">Mensajes recibidos:</h3>
        {receivedMessages.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {receivedMessages.map((msg, index) => (
              <div key={index} className="p-2 bg-white rounded border border-green-200 text-xs">
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
        <p>Este iframe representa un contenido legítimo del mismo origen que utiliza postMessage de forma segura.</p>
        <p>Observe cómo siempre se verifica el origen y se especifica el origen exacto al enviar mensajes.</p>
      </div>
    </div>
  );
}