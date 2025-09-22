'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';

export default function DOMXSSPage() {
  const searchParams = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [protection, setProtection] = useState<boolean>(false);
  const [hashContent, setHashContent] = useState<string>('');
  
  // DOM XSS #1: Procesar parámetros de URL y actualizar el DOM
  useEffect(() => {
    const name = searchParams.get('name') || '';
    
    if (contentRef.current) {
      if (name) {
        if (protection) {
          // Versión segura - con sanitización
          contentRef.current.innerHTML = `<h2>Bienvenido, ${DOMPurify.sanitize(name)}!</h2>`;
        } else {
          // Versión vulnerable - sin sanitización
          contentRef.current.innerHTML = `<h2>Bienvenido, ${name}!</h2>`;
        }
      } else {
        contentRef.current.innerHTML = '<h2>Ingresa tu nombre en la URL</h2>';
      }
    }
  }, [searchParams, protection]);

  // DOM XSS #2: Responder a cambios en el hash de la URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      
      if (hash) {
        setHashContent(hash);
        
        // Versión insegura en otro elemento para demostrar la vulnerabilidad
        const hashDisplay = document.getElementById('hash-display');
        if (hashDisplay) {
          if (protection) {
            // Versión segura - con sanitización
            hashDisplay.innerHTML = `<div>Sección seleccionada: ${DOMPurify.sanitize(decodeURIComponent(hash))}</div>`;
          } else {
            // Versión vulnerable - sin sanitización
            hashDisplay.innerHTML = `<div>Sección seleccionada: ${decodeURIComponent(hash)}</div>`;
          }
        }
      }
    };
    
    // Inicializar en la carga y configurar el listener para cambios futuros
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [protection]);
  
  // Función para actualizar el hash manualmente desde un input
  const updateHash = () => {
    if (nameRef.current && nameRef.current.value) {
      window.location.hash = nameRef.current.value;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: DOM-based XSS</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Protección</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Sanitización activada - La entrada del usuario se limpia antes de insertarla en el DOM" 
                : "❌ Sanitización desactivada - La entrada del usuario se inserta directamente en el DOM"}
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
      
      {/* Sección 1: Vulnerabilidad en parámetros de URL */}
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">1. Vulnerabilidad en Parámetros de URL</h2>
        
        <div className="mb-4">
          <p className="mb-2">Esta sección demuestra cómo los parámetros de URL pueden causar XSS basado en DOM:</p>
          <code className="block p-3 bg-gray-100 rounded">
            ?name=&lt;script&gt;alert('XSS')&lt;/script&gt;
          </code>
        </div>
        
        <div className="mb-4">
          <Link 
            href={`?name=<script>alert('XSS en Parámetro URL')</script>`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded inline-block"
          >
            Probar Vulnerabilidad de URL
          </Link>
        </div>
        
        <div className="p-4 border rounded-md mb-4">
          <p className="font-semibold mb-2">Resultado:</p>
          <div ref={contentRef} className="min-h-12 p-3 bg-gray-50 rounded"></div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>¿Cómo funciona?</strong> El parámetro <code>name</code> de la URL se inserta directamente en el DOM usando <code>innerHTML</code> sin sanitización cuando la protección está desactivada.</p>
        </div>
      </div>
      
      {/* Sección 2: Vulnerabilidad en fragmentos de hash */}
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">2. Vulnerabilidad en Fragmentos de Hash (#)</h2>
        
        <div className="mb-4">
          <p className="mb-2">Esta sección demuestra cómo los fragmentos de hash pueden causar XSS basado en DOM:</p>
          <code className="block p-3 bg-gray-100 rounded">
            #&lt;img src=x onerror=alert('XSS en Hash')&gt;
          </code>
        </div>
        
        <div className="mb-4 flex gap-2">
          <input
            ref={nameRef}
            type="text"
            placeholder="Prueba con: <img src=x onerror=alert('XSS')>"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={updateHash}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded"
          >
            Actualizar Hash
          </button>
        </div>
        
        <div className="p-4 border rounded-md mb-4">
          <p className="font-semibold mb-2">Fragmento de hash:</p>
          <code className="block p-2 bg-gray-100 rounded overflow-x-auto">
            {hashContent || 'No hay fragmento de hash'}
          </code>
        </div>
        
        <div className="p-4 border rounded-md mb-4">
          <p className="font-semibold mb-2">Resultado DOM:</p>
          <div id="hash-display" className="min-h-12 p-3 bg-gray-50 rounded">
            Esperando cambio en el hash...
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>¿Cómo funciona?</strong> El fragmento de hash se captura de <code>window.location.hash</code> y se inserta directamente en el DOM usando <code>innerHTML</code> sin sanitización cuando la protección está desactivada.</p>
        </div>
      </div>
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica</h2>
        
        <div className="space-y-4">
          <p><strong>DOM-Based XSS vs. XSS Reflejado:</strong> A diferencia del XSS reflejado (que ocurre en el servidor), el DOM-based XSS ocurre completamente en el navegador cuando JavaScript manipula el DOM inseguramente.</p>
          
          <p><strong>Por qué es peligroso:</strong> Muchas protecciones del lado del servidor no detectan estos ataques, ya que ocurren después de que la página se carga completamente.</p>
          
          <p><strong>Mitigación:</strong> Utilizar siempre funciones seguras como <code>textContent</code> en lugar de <code>innerHTML</code>, o bibliotecas de sanitización como DOMPurify cuando se necesita procesar HTML.</p>
          
          <p><strong>Ejemplo de código seguro:</strong></p>
          <pre className="p-3 bg-gray-100 rounded overflow-x-auto">
{`// Inseguro:
element.innerHTML = userControlledValue;

// Seguro (solo texto):
element.textContent = userControlledValue;

// Seguro (permite HTML sanitizado):
element.innerHTML = DOMPurify.sanitize(userControlledValue);`}
          </pre>
        </div>
      </div>
    </div>
  );
}