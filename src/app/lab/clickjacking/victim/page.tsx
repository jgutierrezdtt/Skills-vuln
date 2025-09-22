'use client';

import { useState, useEffect } from 'react';

type SearchParams = {
  protected?: string;
};

export default function VictimPage({ searchParams }: { searchParams: SearchParams }) {
  const [isProtected, setIsProtected] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Leer el parámetro de protección
  useEffect(() => {
    setIsProtected(searchParams.protected === 'true');
    
    // Si está protegido, aplicar protecciones con JavaScript
    if (searchParams.protected === 'true') {
      // Frame-busting script
      if (window.self !== window.top && window.top) {
        window.top.location.href = window.self.location.href;
      }
    }
  }, [searchParams.protected]);
  
  // Función que simula una acción sensible (como eliminar una cuenta o hacer una compra)
  const handleImportantAction = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 3000);
  };
  
  return (
    <div className="p-6 bg-white">
      <div className="max-w-lg mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800">MiBanco - Panel de Usuario</h1>
          <p className="text-gray-600">Bienvenido de nuevo, usuario.</p>
        </header>
        
        <div className="mb-8 bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Resumen de Cuenta</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Cuenta Corriente:</span>
              <span className="font-medium">****4328</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Disponible:</span>
              <span className="font-medium">5,230.42 €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Puntos de Recompensa:</span>
              <span className="font-medium">2,450 pts</span>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Ver Transacciones
            </button>
            <button
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Realizar Transferencia
            </button>
            <button
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Pagar Factura
            </button>
            <button
              onClick={handleImportantAction}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Canjear Premio Especial
            </button>
          </div>
        </div>
        
        {clicked && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">¡Acción Completada!</h3>
              <p className="mb-4">Se ha canjeado tu premio especial.</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setClicked(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Meta tag o script para aplicar protecciones contra clickjacking */}
        {isProtected && (
          <div className="mt-8 p-4 bg-green-100 border border-green-300 rounded-lg">
            <h3 className="font-medium text-green-800">✅ Protección contra Clickjacking Activada</h3>
            <p className="text-sm text-green-700">
              Esta página está protegida mediante encabezados HTTP X-Frame-Options y/o Content-Security-Policy.
            </p>
            <pre className="mt-2 p-2 bg-white text-xs overflow-x-auto rounded">
              X-Frame-Options: DENY<br/>
              Content-Security-Policy: frame-ancestors 'none'
            </pre>
          </div>
        )}
        
        {!isProtected && (
          <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="font-medium text-red-800">❌ Sin Protección contra Clickjacking</h3>
            <p className="text-sm text-red-700">
              Esta página no tiene habilitadas protecciones contra clickjacking y puede ser embebida en iframes de cualquier origen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}