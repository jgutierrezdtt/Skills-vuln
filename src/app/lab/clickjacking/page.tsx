'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClickjackingPage() {
  const [protection, setProtection] = useState<boolean>(false);
  const [attackFrame, setAttackFrame] = useState<string>('');
  const [victimFrame, setVictimFrame] = useState<string>('');
  
  // URLs de las páginas de demostración
  const victimUrl = '/lab/clickjacking/victim';
  const attackUrl = '/lab/clickjacking/attacker';
  
  // Generar URLs con o sin protección
  useEffect(() => {
    const victimWithParam = `${victimUrl}?protected=${protection ? 'true' : 'false'}`;
    setVictimFrame(victimWithParam);
    setAttackFrame(attackUrl);
  }, [protection]);
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: Clickjacking (UI Redress Attack)</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Protección contra Clickjacking</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Protección activada - Se establecen encabezados X-Frame-Options y/o directivas CSP frame-ancestors" 
                : "❌ Protección desactivada - La página puede ser incluida en iframes (vulnerable)"}
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
      
      {/* Demostración de Clickjacking */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Demostración en Vivo</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">Página Víctima</h3>
            <p className="text-sm text-gray-500 mb-4">Esta es la página legítima que un usuario normalmente visitaría.</p>
            
            <div className="border border-gray-200 rounded h-96 overflow-hidden">
              <iframe 
                src={victimFrame} 
                className="w-full h-full border-0" 
                title="Página víctima"
              ></iframe>
            </div>
          </div>
          
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">Ataque de Clickjacking</h3>
            <p className="text-sm text-gray-500 mb-4">Esta demuestra cómo un atacante podría superponer un iframe invisible sobre su contenido.</p>
            
            <div className="border border-gray-200 rounded h-96 overflow-hidden">
              <iframe 
                src={attackFrame} 
                className="w-full h-full border-0" 
                title="Página atacante"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      
      {/* Explicación técnica */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica: Clickjacking</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es el Clickjacking?</strong> El clickjacking (también conocido como "ataque de redireccionamiento de UI") es una técnica maliciosa donde un atacante utiliza múltiples capas transparentes o semitransparentes para engañar a un usuario para que haga clic en un botón o enlace en otra página cuando tenía la intención de hacer clic en la página de nivel superior.</p>
          
          <p><strong>¿Cómo funciona?</strong> El atacante carga la página víctima en un iframe invisible y lo superpone estratégicamente sobre otro contenido atractivo. Cuando el usuario interactúa con lo que cree que es el contenido visible, en realidad está haciendo clic en elementos de la página vulnerable oculta.</p>
          
          <p><strong>Ejemplos de ataques:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Hacer que un usuario haga clic sin saberlo en botones de "Me gusta" o "Compartir" en redes sociales</li>
            <li>Engañar a los usuarios para que autoricen transacciones financieras</li>
            <li>Provocar descargas de malware a través de clics no intencionados</li>
            <li>Capturar información de formularios a través de superposiciones transparentes</li>
          </ul>
          
          <p><strong>Implementación segura vs. vulnerable:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium mb-2 text-red-600">❌ Vulnerable</h4>
              <pre className="p-2 bg-red-50 border border-red-200 rounded text-sm overflow-x-auto">
{`// Página sin protección contra clickjacking
// No establece X-Frame-Options ni 
// Content-Security-Policy: frame-ancestors

// La página puede ser incluida en cualquier iframe
// desde cualquier origen, permitiendo ataques
// de clickjacking.`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ Seguro</h4>
              <pre className="p-2 bg-green-50 border border-green-200 rounded text-sm overflow-x-auto">
{`// Página con protecciones adecuadas
// Establece encabezados de seguridad:

// X-Frame-Options: DENY
// (Impide que la página sea incluida en iframes)

// O alternativamente:
// Content-Security-Policy: frame-ancestors 'none'
// (Política más moderna y flexible)`}
              </pre>
            </div>
          </div>
          
          <p><strong>Mitigaciones:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>X-Frame-Options</strong>: Establece este encabezado HTTP como 'DENY' o 'SAMEORIGIN' para controlar si un navegador puede mostrar tu página en un iframe</li>
            <li><strong>Content Security Policy (CSP)</strong>: Usa la directiva 'frame-ancestors' para especificar qué dominios pueden incluir tu página en iframes</li>
            <li><strong>Frame-busting JavaScript</strong>: Código que intenta evitar que tu página sea cargada en un iframe</li>
            <li><strong>SameSite cookies</strong>: Configura cookies como SameSite=Strict para evitar que se envíen en contextos de terceros</li>
            <li><strong>Autenticación con interacción del usuario</strong>: Requiere interacciones adicionales del usuario para acciones importantes</li>
          </ul>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <h4 className="font-medium text-yellow-800">⚠️ Importante</h4>
            <p className="text-yellow-700 text-sm">El encabezado X-Frame-Options es ampliamente compatible pero está siendo reemplazado gradualmente por la directiva frame-ancestors de Content Security Policy, que ofrece un control más granular sobre qué dominios pueden incluir tu página en iframes.</p>
          </div>
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