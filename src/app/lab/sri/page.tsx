'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Extender la interfaz Window para incluir jQuery
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

// Tipos para los recursos externos
interface ExternalResource {
  type: 'script' | 'stylesheet';
  url: string;
  integrity?: string;
  description: string;
  purpose: string;
}

export default function SRIVulnerabilityPage() {
  const [protection, setProtection] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<string>('jquery');
  const [loadStatus, setLoadStatus] = useState<{[key: string]: string}>({});
  const [triggerReload, setTriggerReload] = useState<number>(0);
  const resourceContainerRef = useRef<HTMLDivElement>(null);
  
  // Definición de recursos externos con sus hashes SRI
  const externalResources: {[key: string]: ExternalResource} = {
    jquery: {
      type: 'script',
      url: 'https://code.jquery.com/jquery-3.7.1.min.js',
      integrity: 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=',
      description: 'jQuery 3.7.1 - Biblioteca JavaScript popular',
      purpose: 'Proporciona funcionalidades DOM y AJAX'
    },
    bootstrap: {
      type: 'stylesheet',
      url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
      integrity: 'sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN',
      description: 'Bootstrap 5.3.2 CSS - Framework de CSS',
      purpose: 'Proporciona estilos y componentes predefinidos'
    },
    fontawesome: {
      type: 'stylesheet',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
      integrity: 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==',
      description: 'Font Awesome 6.5.1 - Iconos web',
      purpose: 'Proporciona iconos vectoriales'
    },
    malicious: {
      type: 'script',
      url: 'https://example.com/potentially-malicious.js',
      integrity: 'sha256-INVALID-HASH-THAT-WONT-MATCH-CONTENT',
      description: 'Script Potencialmente Malicioso (simulado)',
      purpose: 'Demuestra cómo SRI bloquea recursos comprometidos'
    }
  };

  // Efecto para cargar/recargar recursos cuando cambian las opciones
  useEffect(() => {
    if (!resourceContainerRef.current) return;
    
    // Limpiar recursos anteriores
    const container = resourceContainerRef.current;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    setLoadStatus({});
    
    // Obtener el recurso seleccionado
    const resource = externalResources[selectedResource];
    if (!resource) return;
    
    // Crear y añadir el elemento apropiado (script o stylesheet)
    if (resource.type === 'script') {
      const script = document.createElement('script');
      script.src = resource.url;
      script.async = true;
      
      // Añadir atributos integrity y crossorigin solo si la protección está activada
      if (protection && resource.integrity) {
        script.integrity = resource.integrity;
        script.crossOrigin = 'anonymous';
      }
      
      // Manejar eventos de carga y error
      script.onload = () => {
        setLoadStatus(prev => ({
          ...prev,
          [resource.url]: 'success'
        }));
        
        // Si es jQuery, intentar usarlo para verificar que se cargó correctamente
        if (resource.url.includes('jquery')) {
          setTimeout(() => {
            try {
              if (window.$ && window.jQuery) {
                console.log('jQuery loaded successfully:', window.jQuery.fn.jquery);
                // Añadir un elemento para demostrar que jQuery funciona
                const jqueryTest = document.createElement('div');
                jqueryTest.id = 'jquery-test';
                jqueryTest.style.padding = '15px';
                jqueryTest.style.margin = '10px 0';
                jqueryTest.style.backgroundColor = '#e8f5e9';
                jqueryTest.style.border = '1px solid #a5d6a7';
                jqueryTest.style.borderRadius = '4px';
                
                jqueryTest.innerHTML = `<p>jQuery ${window.jQuery.fn.jquery} se cargó correctamente y está funcionando.</p>`;
                document.getElementById('resource-status')?.appendChild(jqueryTest);
              }
            } catch (e) {
              console.error('Error verificando jQuery:', e);
            }
          }, 500);
        }
      };
      
      script.onerror = () => {
        setLoadStatus(prev => ({
          ...prev,
          [resource.url]: 'error'
        }));
        console.error(`Error loading script: ${resource.url}`);
      };
      
      container.appendChild(script);
    } else if (resource.type === 'stylesheet') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = resource.url;
      
      // Añadir atributos integrity y crossorigin solo si la protección está activada
      if (protection && resource.integrity) {
        link.integrity = resource.integrity;
        link.crossOrigin = 'anonymous';
      }
      
      // Manejar eventos de carga y error
      link.onload = () => {
        setLoadStatus(prev => ({
          ...prev,
          [resource.url]: 'success'
        }));
        
        // Para Bootstrap, añadir un elemento para demostrar que se cargó
        if (resource.url.includes('bootstrap')) {
          setTimeout(() => {
            const bootstrapTest = document.createElement('div');
            bootstrapTest.className = 'card';
            bootstrapTest.style.maxWidth = '300px';
            bootstrapTest.style.margin = '10px 0';
            
            bootstrapTest.innerHTML = `
              <div class="card-body">
                <h5 class="card-title">Bootstrap está funcionando</h5>
                <p class="card-text">Esta tarjeta está utilizando estilos de Bootstrap.</p>
                <button class="btn btn-primary">Botón Bootstrap</button>
              </div>
            `;
            document.getElementById('resource-status')?.appendChild(bootstrapTest);
          }, 500);
        }
        
        // Para Font Awesome, añadir iconos para demostrar que se cargó
        if (resource.url.includes('font-awesome')) {
          setTimeout(() => {
            const faTest = document.createElement('div');
            faTest.style.padding = '15px';
            faTest.style.margin = '10px 0';
            faTest.style.backgroundColor = '#e3f2fd';
            faTest.style.border = '1px solid #90caf9';
            faTest.style.borderRadius = '4px';
            faTest.style.display = 'flex';
            faTest.style.gap = '15px';
            
            faTest.innerHTML = `
              <div>
                <p>Font Awesome está funcionando:</p>
                <div style="font-size: 24px; color: #1976d2; margin-top: 10px;">
                  <i class="fas fa-check-circle"></i>
                  <i class="fas fa-user"></i>
                  <i class="fas fa-shield-alt"></i>
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
              </div>
            `;
            document.getElementById('resource-status')?.appendChild(faTest);
          }, 500);
        }
      };
      
      link.onerror = () => {
        setLoadStatus(prev => ({
          ...prev,
          [resource.url]: 'error'
        }));
        console.error(`Error loading stylesheet: ${resource.url}`);
      };
      
      container.appendChild(link);
    }
  }, [selectedResource, protection, triggerReload]);

  // Función para recargar el recurso actual
  const reloadResource = () => {
    setTriggerReload(prev => prev + 1);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: Subresource Integrity (SRI)</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Protección SRI</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Verificación de integridad activada - Los recursos se cargan solo si el hash coincide" 
                : "❌ Verificación de integridad desactivada - Los recursos se cargan sin verificación"}
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
      
      {/* Selector de recursos */}
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Cargar Recursos Externos</h2>
        
        <div className="mb-4">
          <label htmlFor="resource-select" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar recurso para cargar:
          </label>
          <select
            id="resource-select"
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="jquery">jQuery (Script)</option>
            <option value="bootstrap">Bootstrap CSS (Stylesheet)</option>
            <option value="fontawesome">Font Awesome (Stylesheet)</option>
            <option value="malicious">Script Potencialmente Malicioso (Simulado)</option>
          </select>
        </div>
        
        {/* Detalles del recurso seleccionado */}
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">Detalles del recurso:</h3>
          <p><strong>URL:</strong> <code className="text-sm break-all">{externalResources[selectedResource]?.url}</code></p>
          <p><strong>Tipo:</strong> {externalResources[selectedResource]?.type}</p>
          <p><strong>Descripción:</strong> {externalResources[selectedResource]?.description}</p>
          <p><strong>Propósito:</strong> {externalResources[selectedResource]?.purpose}</p>
          {protection && (
            <p><strong>Hash Integrity:</strong> <code className="text-sm">{externalResources[selectedResource]?.integrity || 'No definido'}</code></p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {protection 
                ? 'El recurso se cargará con verificación de integridad SRI'
                : 'El recurso se cargará SIN verificación de integridad SRI (vulnerable)'}
            </p>
          </div>
          <button
            onClick={reloadResource}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Cargar Recurso
          </button>
        </div>
      </div>
      
      {/* Contenedor oculto para los recursos cargados */}
      <div ref={resourceContainerRef} style={{ display: 'none' }}></div>
      
      {/* Estado de carga del recurso */}
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Estado del Recurso</h2>
        
        {Object.keys(loadStatus).length > 0 ? (
          <div>
            {Object.entries(loadStatus).map(([url, status]) => (
              <div key={url} className={`p-3 mb-4 rounded ${
                status === 'success' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
              }`}>
                <p className="font-medium">
                  {status === 'success' 
                    ? '✅ Recurso cargado correctamente'
                    : '❌ Error al cargar el recurso'}
                </p>
                <p className="text-sm mt-1 break-all">
                  <code>{url}</code>
                </p>
                {status === 'error' && protection && (
                  <p className="text-sm mt-2 text-red-700">
                    El recurso fue bloqueado porque el hash integrity no coincide o no es válido.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Selecciona un recurso y haz clic en "Cargar Recurso".</p>
        )}
        
        {/* Contenedor para mostrar pruebas de recursos cargados */}
        <div id="resource-status" className="mt-4"></div>
      </div>
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es Subresource Integrity (SRI)?</strong> SRI es una característica de seguridad que permite a los navegadores verificar que los recursos cargados desde un CDN u origen externo no han sido manipulados.</p>
          
          <p><strong>¿Cómo funciona?</strong> El navegador verifica que el contenido del archivo coincida con un hash criptográfico proporcionado en el atributo <code>integrity</code>. Si no coincide, el recurso es bloqueado.</p>
          
          <p><strong>¿Por qué es importante?</strong> Si un CDN es comprometido o modificado maliciosamente, SRI puede prevenir la ejecución de código malicioso en tu sitio web.</p>
          
          <p><strong>Implementación:</strong></p>
          <pre className="p-3 bg-gray-100 rounded overflow-x-auto">
{`// Para scripts:
<script 
  src="https://example.com/script.js" 
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" 
  crossorigin="anonymous">
</script>

// Para hojas de estilo:
<link 
  rel="stylesheet" 
  href="https://example.com/styles.css" 
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" 
  crossorigin="anonymous">
</link>`}
          </pre>
          
          <p><strong>Generación de hashes:</strong> Los hashes SRI se pueden generar usando herramientas como:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Línea de comandos: <code>cat FILENAME.js | openssl dgst -sha384 -binary | openssl base64 -A</code></li>
            <li>Sitios web como <a href="https://www.srihash.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">srihash.org</a></li>
          </ul>
          
          <p><strong>Limitaciones:</strong> SRI solo funciona para recursos externos (<code>&lt;script&gt;</code> y <code>&lt;link&gt;</code>) y requiere que el recurso se sirva a través de CORS (<code>crossorigin="anonymous"</code>).</p>
        </div>
      </div>
    </div>
  );
}