'use client';

import { useState, useEffect } from 'react';

export default function AttackerPage() {
  const [victimUrl, setVictimUrl] = useState('');
  const [clicked, setClicked] = useState(false);
  
  useEffect(() => {
    // URL de la página víctima (sin protección)
    setVictimUrl('/lab/clickjacking/victim?protected=false');
  }, []);
  
  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 3000);
  };
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      {/* Página del atacante visible para el usuario */}
      <div className="max-w-lg mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-green-800">¡Gana un Premio Ahora!</h1>
          <p className="text-gray-600">Haz clic en el botón para reclamar tu premio gratuito.</p>
        </header>
        
        <div className="bg-white p-6 rounded-lg shadow-md relative">
          <h2 className="text-xl font-semibold mb-4 text-center">¡Felicidades!</h2>
          <p className="text-center mb-8">Has sido seleccionado para recibir un premio especial.</p>
          
          <div className="flex justify-center mb-8">
            <button
              onClick={handleClick}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-lg"
            >
              RECLAMAR PREMIO AHORA
            </button>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            ¡No esperes! Esta oferta expira pronto.
          </p>
        </div>
        
        {/* Mensaje de explicación */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Demostración de Clickjacking</h3>
          <p className="text-sm text-yellow-700">
            Esta página superpone un iframe invisible con la página víctima sobre el botón "RECLAMAR PREMIO". 
            Cuando haces clic en el botón verde, en realidad estás haciendo clic en el botón "Canjear Premio Especial" 
            de la página víctima sin saberlo.
          </p>
        </div>
      </div>
      
      {/* Iframe de la página víctima (superpuesto con opacidad baja para demostración) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="relative h-full">
          {/* En un ataque real, este iframe tendría opacity:0 para ser completamente invisible */}
          <iframe 
            src={victimUrl} 
            className="absolute opacity-10 w-full h-full" 
            title="Página víctima oculta"
          ></iframe>
          
          {/* Para la demostración, mostramos dónde está el botón malicioso */}
          <div 
            className="absolute pointer-events-auto" 
            style={{ 
              // Posicionamos el área clickeable sobre el botón "Canjear Premio Especial"
              // de la página víctima, pero alineado con nuestro botón "RECLAMAR PREMIO"
              top: 'calc(50% - 70px)',
              left: 'calc(50% - 100px)',
              width: '200px',
              height: '40px',
              border: '2px dashed rgba(255,0,0,0.5)',
              borderRadius: '4px',
              zIndex: 10
            }}
            onClick={handleClick}
          ></div>
        </div>
      </div>
      
      {clicked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">¡Ataque de Clickjacking Exitoso!</h3>
            <p className="mb-4">
              En un escenario real, acabarías de hacer clic en un botón de la página víctima sin ser consciente.
              Este ataque podría haberte hecho:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700">
              <li>Realizar una acción no deseada (transferencia, compra, eliminar datos)</li>
              <li>Activar permisos de micrófono/cámara</li>
              <li>Hacer clic en botones de "Me gusta" o "Compartir"</li>
              <li>Descargar malware</li>
            </ul>
            <div className="flex justify-end">
              <button
                onClick={() => setClicked(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}