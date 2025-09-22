'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConfigOptions {
  theme: string;
  showAdmin: boolean;
  debug: boolean;
  [key: string]: any;
}

interface UserProfile {
  name: string;
  role: string;
  permissions: string[];
  [key: string]: any;
}

export default function PrototypePollutionPage() {
  const [protection, setProtection] = useState<boolean>(false);
  const [configObject, setConfigObject] = useState<ConfigOptions>({
    theme: 'light',
    showAdmin: false,
    debug: false
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Regular User',
    role: 'user',
    permissions: ['read']
  });
  
  const [inputKey, setInputKey] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [inputPath, setInputPath] = useState<string>('');
  const [pollutionTarget, setPollutionTarget] = useState<'config' | 'user'>('config');
  
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  
  // Efecto para comprobar si el usuario "tiene acceso" al panel de administración
  // basado en los valores actuales del perfil y la configuración
  useEffect(() => {
    const newConsoleOutput = [...consoleOutput];
    
    // Comprobar configuración
    newConsoleOutput.push(`[${new Date().toLocaleTimeString()}] Comprobando acceso...`);
    newConsoleOutput.push(`[${new Date().toLocaleTimeString()}] config.showAdmin = ${configObject.showAdmin}`);
    newConsoleOutput.push(`[${new Date().toLocaleTimeString()}] user.role = ${userProfile.role}`);
    
    // Esta condición vulnerable verifica si el usuario tiene acceso al panel de admin
    if (configObject.showAdmin === true || userProfile.role === 'admin' || userProfile.isAdmin === true) {
      newConsoleOutput.push(`[${new Date().toLocaleTimeString()}] ✅ Acceso concedido al panel de administración`);
      setShowAdminPanel(true);
    } else {
      newConsoleOutput.push(`[${new Date().toLocaleTimeString()}] ❌ Acceso denegado al panel de administración`);
      setShowAdminPanel(false);
    }
    
    // Mantener solo los últimos 20 mensajes
    if (newConsoleOutput.length > 20) {
      newConsoleOutput.splice(0, newConsoleOutput.length - 20);
    }
    
    setConsoleOutput(newConsoleOutput);
  }, [configObject, userProfile]);
  
  // Función segura para establecer propiedades anidadas
  const safeSetNestedProperty = (obj: any, path: string, value: any): any => {
    // Clonar objeto para evitar mutaciones directas
    const result = { ...obj };
    
    // Si la protección está activada, verificamos la ruta
    if (protection) {
      // Rechazar propiedades peligrosas
      if (
        path === '__proto__' || 
        path === 'constructor' || 
        path === 'prototype' ||
        path.includes('__proto__') ||
        path.includes('constructor.') ||
        path.includes('prototype.')
      ) {
        console.log('Intento de pollution detectado y bloqueado:', path);
        return result;
      }
    }
    
    // Dividir la ruta en partes
    const pathParts = path.split('.');
    let current = result;
    
    // Recorrer la ruta hasta la penúltima parte
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      // Si estamos en modo seguro, rechazar propiedades peligrosas
      if (protection && (part === '__proto__' || part === 'constructor' || part === 'prototype')) {
        console.log('Intento de pollution en subcamino detectado y bloqueado:', part);
        return result;
      }
      
      // Si la propiedad no existe, crear un objeto vacío
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Establecer el valor en la última parte de la ruta
    const lastPart = pathParts[pathParts.length - 1];
    
    // En modo seguro, rechazar propiedades peligrosas en la última parte
    if (protection && (lastPart === '__proto__' || lastPart === 'constructor' || lastPart === 'prototype')) {
      console.log('Intento de pollution en propiedad final detectado y bloqueado:', lastPart);
      return result;
    }
    
    current[lastPart] = value;
    return result;
  };
  
  // Función vulnerable para establecer propiedades anidadas
  const vulnerableSetNestedProperty = (obj: any, path: string, value: any): any => {
    // Clonar objeto para evitar mutaciones directas
    const result = { ...obj };
    
    // Dividir la ruta en partes
    const pathParts = path.split('.');
    let current = result;
    
    // Recorrer la ruta hasta la penúltima parte
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      
      // Si la propiedad no existe, crear un objeto vacío
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Establecer el valor en la última parte de la ruta
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;
    
    return result;
  };
  
  // Función para manejar la configuración de una propiedad simple
  const handleSetProperty = () => {
    try {
      // Validar entrada
      if (!inputKey.trim()) {
        alert('Por favor, ingresa una clave válida');
        return;
      }
      
      // Convertir el valor a su tipo apropiado si es posible
      let parsedValue: any = inputValue;
      if (inputValue.toLowerCase() === 'true') {
        parsedValue = true;
      } else if (inputValue.toLowerCase() === 'false') {
        parsedValue = false;
      } else if (!isNaN(Number(inputValue))) {
        parsedValue = Number(inputValue);
      }
      
      // Actualizar el objeto según el objetivo seleccionado
      if (pollutionTarget === 'config') {
        const newConfig = { ...configObject, [inputKey]: parsedValue };
        setConfigObject(newConfig);
        
        setConsoleOutput(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Propiedad config.${inputKey} establecida a ${JSON.stringify(parsedValue)}`
        ]);
      } else {
        const newProfile = { ...userProfile, [inputKey]: parsedValue };
        setUserProfile(newProfile);
        
        setConsoleOutput(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Propiedad user.${inputKey} establecida a ${JSON.stringify(parsedValue)}`
        ]);
      }
      
      // Limpiar campos
      setInputKey('');
      setInputValue('');
    } catch (error) {
      console.error('Error al establecer propiedad:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };
  
  // Función para manejar la configuración de una propiedad anidada
  const handleSetNestedProperty = () => {
    try {
      // Validar entrada
      if (!inputPath.trim()) {
        alert('Por favor, ingresa una ruta válida');
        return;
      }
      
      // Convertir el valor a su tipo apropiado si es posible
      let parsedValue: any = inputValue;
      if (inputValue.toLowerCase() === 'true') {
        parsedValue = true;
      } else if (inputValue.toLowerCase() === 'false') {
        parsedValue = false;
      } else if (!isNaN(Number(inputValue))) {
        parsedValue = Number(inputValue);
      }
      
      // Actualizar el objeto según el objetivo seleccionado
      if (pollutionTarget === 'config') {
        // Usar la función segura o vulnerable según la configuración
        const newConfig = protection 
          ? safeSetNestedProperty(configObject, inputPath, parsedValue)
          : vulnerableSetNestedProperty(configObject, inputPath, parsedValue);
        
        setConfigObject(newConfig);
        
        setConsoleOutput(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Propiedad config.${inputPath} establecida a ${JSON.stringify(parsedValue)}`
        ]);
      } else {
        // Usar la función segura o vulnerable según la configuración
        const newProfile = protection 
          ? safeSetNestedProperty(userProfile, inputPath, parsedValue)
          : vulnerableSetNestedProperty(userProfile, inputPath, parsedValue);
        
        setUserProfile(newProfile);
        
        setConsoleOutput(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Propiedad user.${inputPath} establecida a ${JSON.stringify(parsedValue)}`
        ]);
      }
      
      // Limpiar campos
      setInputPath('');
      setInputValue('');
    } catch (error) {
      console.error('Error al establecer propiedad anidada:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };
  
  // Ejemplos de payloads maliciosos
  const maliciousExamples = [
    {
      name: 'Pollution de __proto__.isAdmin',
      path: '__proto__.isAdmin',
      value: 'true',
      description: 'Modifica el prototipo de Object para añadir isAdmin=true a todos los objetos'
    },
    {
      name: 'Pollution con constructor',
      path: 'constructor.prototype.hasAccess',
      value: 'true',
      description: 'Modifica el prototipo usando la propiedad constructor'
    },
    {
      name: 'Elevation a admin',
      path: 'role',
      value: 'admin',
      description: 'Intento simple de cambiar el rol a admin'
    },
    {
      name: 'Pollution anidada',
      path: 'metadata.__proto__.isAdmin',
      value: 'true',
      description: 'Intenta modificar el prototipo a través de una propiedad anidada'
    }
  ];
  
  // Función para aplicar un ejemplo malicioso
  const applyMaliciousExample = (path: string, value: string) => {
    setInputPath(path);
    setInputValue(value);
  };
  
  // Función para reiniciar los objetos
  const resetObjects = () => {
    setConfigObject({
      theme: 'light',
      showAdmin: false,
      debug: false
    });
    
    setUserProfile({
      name: 'Regular User',
      role: 'user',
      permissions: ['read']
    });
    
    setConsoleOutput(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 🔄 Objetos reiniciados a valores predeterminados`
    ]);
    
    setShowAdminPanel(false);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: Prototype Pollution</h1>
      
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
                ? "✅ Protección activada - Se rechazarán intentos de pollution" 
                : "❌ Protección desactivada - Los objetos son vulnerables a prototype pollution"}
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
      
      {/* Panel principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de manipulación de objetos */}
        <div className="space-y-6">
          {/* Panel de configuración de propiedades simples */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Establecer Propiedad Simple</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objeto objetivo:
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="pollutionTarget"
                    value="config"
                    checked={pollutionTarget === 'config'}
                    onChange={() => setPollutionTarget('config')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Configuración</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="pollutionTarget"
                    value="user"
                    checked={pollutionTarget === 'user'}
                    onChange={() => setPollutionTarget('user')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Perfil de usuario</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="property-key" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la propiedad:
              </label>
              <input
                id="property-key"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ej: role, isAdmin, etc."
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="property-value" className="block text-sm font-medium text-gray-700 mb-2">
                Valor:
              </label>
              <input
                id="property-value"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ej: true, admin, etc."
              />
            </div>
            
            <button
              onClick={handleSetProperty}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            >
              Establecer Propiedad
            </button>
          </div>
          
          {/* Panel de configuración de propiedades anidadas */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Establecer Propiedad Anidada</h2>
            
            <div className="mb-4">
              <label htmlFor="property-path" className="block text-sm font-medium text-gray-700 mb-2">
                Ruta de la propiedad:
              </label>
              <input
                id="property-path"
                type="text"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ej: metadata.access, __proto__.isAdmin"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="nested-property-value" className="block text-sm font-medium text-gray-700 mb-2">
                Valor:
              </label>
              <input
                id="nested-property-value"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ej: true, admin, etc."
              />
            </div>
            
            <button
              onClick={handleSetNestedProperty}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            >
              Establecer Propiedad Anidada
            </button>
          </div>
          
          {/* Ejemplos de payloads maliciosos */}
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-bold mb-3">Ejemplos de Payloads Maliciosos</h2>
            
            <div className="space-y-3">
              {maliciousExamples.map((example, index) => (
                <div key={index} className="p-3 border border-yellow-300 rounded-md bg-yellow-100">
                  <h3 className="font-medium mb-1">{example.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{example.description}</p>
                  <div className="text-xs font-mono bg-white p-2 rounded mb-2">
                    <span className="font-semibold">Ruta:</span> {example.path}<br />
                    <span className="font-semibold">Valor:</span> {example.value}
                  </div>
                  <button
                    onClick={() => applyMaliciousExample(example.path, example.value)}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    Aplicar este payload
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={resetObjects}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md"
          >
            Reiniciar Objetos
          </button>
        </div>
        
        {/* Panel de visualización */}
        <div className="space-y-6">
          {/* Estado actual de objetos */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Estado Actual</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Objeto de Configuración:</h3>
              <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-40">
                {JSON.stringify(configObject, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Perfil de Usuario:</h3>
              <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-40">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          </div>
          
          {/* Panel de administración (condicional) */}
          <div className={`p-6 ${showAdminPanel ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'} border rounded-lg`}>
            <h2 className="text-xl font-bold mb-4">
              {showAdminPanel ? '✅ Panel de Administración' : '🔒 Panel de Administración (Bloqueado)'}
            </h2>
            
            {showAdminPanel ? (
              <div className="space-y-3">
                <p className="text-green-700">¡Has obtenido acceso al panel de administración!</p>
                <p className="text-green-700">Este es un ejemplo de cómo el prototype pollution puede permitir el acceso a funcionalidades restringidas.</p>
                <div className="p-3 bg-white rounded border border-green-300">
                  <h3 className="font-semibold mb-2">Acciones Administrativas:</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Ver todos los usuarios (simulado)</li>
                    <li>Modificar permisos del sistema (simulado)</li>
                    <li>Acceder a configuración avanzada (simulado)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">No tienes acceso a este panel. Solo los administradores pueden verlo.</p>
                <p className="text-gray-600 mt-2">Intenta utilizar prototype pollution para obtener acceso.</p>
              </div>
            )}
          </div>
          
          {/* Consola de eventos */}
          <div className="p-6 bg-black rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-white">Consola</h2>
            
            <div className="bg-gray-900 p-3 rounded font-mono text-xs text-green-400 h-60 overflow-y-auto">
              {consoleOutput.map((line, index) => (
                <div key={index} className="mb-1">{line}</div>
              ))}
              {consoleOutput.length === 0 && (
                <div className="text-gray-500">// La consola está vacía. Las acciones se registrarán aquí.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica: Prototype Pollution</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es Prototype Pollution?</strong> Prototype Pollution es una vulnerabilidad de JavaScript que permite a un atacante modificar el prototipo de objetos globales como <code>Object.prototype</code>, afectando a todos los objetos que heredan de él.</p>
          
          <p><strong>¿Cómo funciona?</strong> En JavaScript, los objetos heredan propiedades de su prototipo. Si un atacante puede modificar este prototipo añadiendo propiedades maliciosas, puede afectar a todos los objetos de la aplicación.</p>
          
          <p><strong>Vectores comunes:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Acceso directo a <code>__proto__</code></li>
            <li>Manipulación a través de <code>constructor.prototype</code></li>
            <li>Operaciones recursivas de merge/extend que no validan las claves</li>
            <li>Frameworks con funciones de asignación de propiedades vulnerables</li>
          </ul>
          
          <p><strong>Impacto:</strong> Esta vulnerabilidad puede causar:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bypass de autenticación</li>
            <li>Inyección de propiedades que alteren la lógica de la aplicación</li>
            <li>Escalada de privilegios</li>
            <li>En casos extremos, ejecución remota de código</li>
          </ul>
          
          <p><strong>Mitigaciones:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium mb-2 text-red-600">❌ Vulnerable</h4>
              <pre className="p-2 bg-red-50 border border-red-200 rounded text-sm overflow-x-auto">
{`// Asignación recursiva insegura
function merge(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'object') {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ Seguro</h4>
              <pre className="p-2 bg-green-50 border border-green-200 rounded text-sm overflow-x-auto">
{`// Asignación recursiva segura
function safeMerge(target, source) {
  for (let key in source) {
    // Verificar claves peligrosas
    if (key === '__proto__' || 
        key === 'constructor' || 
        key === 'prototype') continue;
    
    if (typeof source[key] === 'object') {
      if (!target[key]) target[key] = {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}`}
              </pre>
            </div>
          </div>
          
          <p><strong>Otras estrategias de protección:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usar <code>Object.create(null)</code> para crear objetos sin prototipo</li>
            <li>Congelar el prototipo con <code>Object.freeze(Object.prototype)</code></li>
            <li>Utilizar Map/Set en lugar de objetos para almacenar datos dinámicos</li>
            <li>Validar las entradas contra esquemas predefinidos</li>
            <li>Implementar listas de permitidos para propiedades en lugar de listas de bloqueados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}