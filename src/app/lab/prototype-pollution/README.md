# Prototype Pollution

## Descripción

Prototype Pollution es una vulnerabilidad de seguridad en JavaScript que permite a un atacante manipular las propiedades del prototipo de objetos base como `Object.prototype`. Esto puede afectar a todos los objetos que heredan de estos prototipos, potencialmente comprometiendo toda la aplicación.

## Concepto

En JavaScript, todos los objetos heredan propiedades y métodos de su prototipo. El mecanismo de herencia prototípica de JavaScript utiliza una cadena de prototipos que permite a los objetos acceder a propiedades y métodos definidos en sus prototipos.

Cuando una propiedad se busca en un objeto y no se encuentra, JavaScript continúa la búsqueda en su prototipo, y así sucesivamente a lo largo de la cadena de prototipos hasta llegar a `Object.prototype`.

La vulnerabilidad de Prototype Pollution ocurre cuando un atacante puede manipular esta cadena de prototipos, específicamente modificando el `Object.prototype` u otros prototipos, añadiendo o modificando propiedades que no deberían ser accesibles.

## Vectores de Ataque

### 1. Manipulación directa de `__proto__`

```javascript
// Payload malicioso
const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
```

Este ataque modifica directamente el prototipo de todos los objetos, añadiendo una propiedad `isAdmin` con valor `true`.

### 2. Manipulación a través de `constructor.prototype`

```javascript
// Payload malicioso
const payload = JSON.parse('{"constructor": {"prototype": {"isAdmin": true}}}');
```

Este ataque utiliza la propiedad `constructor` para acceder al prototipo y modificarlo.

### 3. Operaciones recursivas de merge/extend vulnerables

```javascript
// Función vulnerable
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
}

// Ataque
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
```

### 4. Asignación dinámica de propiedades

```javascript
// Función vulnerable
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
  return obj;
}

// Ataque
setNestedProperty({}, "__proto__.isAdmin", true);
```

## Impacto

### 1. Bypass de autenticación y autorización

Al manipular propiedades como `isAdmin`, `role`, o `hasAccess` en el prototipo, un atacante puede obtener acceso a funcionalidades restringidas.

```javascript
// Código vulnerable
if (user.isAdmin) {
  // Acceso a funciones administrativas
}

// Después de prototype pollution, cualquier objeto user tendrá isAdmin=true
```

### 2. Alteración de la lógica de la aplicación

```javascript
// Código vulnerable
if (!config.debug) {
  // Código de producción
} else {
  // Modo de depuración con información sensible
}

// Después de prototype pollution, config.debug será true para todos los objetos
```

### 3. Cross-Site Scripting (XSS)

```javascript
// Código vulnerable
function render(data) {
  if (!data.unsafeMode) {
    // Sanitizar datos
    return sanitize(data.content);
  }
  return data.content; // Renderizado sin sanitización
}

// Después de prototype pollution, unsafeMode=true para todos los objetos
```

### 4. Server-Side Request Forgery (SSRF)

```javascript
// Código vulnerable
function fetchData(options) {
  if (!options.allowExternalUrls) {
    // Validar que la URL es interna
  }
  // Hacer petición
}

// Después de prototype pollution, allowExternalUrls=true para todos los objetos
```

## Detección

### 1. Código vulnerable

Buscar patrones como:

- Asignación recursiva de propiedades sin validación
- Uso de `Object.assign` con objetos no confiables
- Implementaciones personalizadas de funciones como `deepMerge`, `extend`, etc.
- Manipulación directa de objetos usando rutas de propiedades provistas por el usuario

### 2. Pruebas dinámicas

- Intentar establecer `__proto__.newProperty` y luego verificar si un objeto recién creado tiene esa propiedad
- Probar payloads en campos de entrada que se deserializan en objetos
- Monitorear cambios inesperados en objetos globales

## Mitigaciones

### 1. Validación de claves

```javascript
function safeSetProperty(obj, key, value) {
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return obj; // Ignorar claves peligrosas
  }
  obj[key] = value;
  return obj;
}
```

### 2. Objetos sin prototipo

```javascript
// Crear objetos sin prototipo
const safeObject = Object.create(null);
```

### 3. Congelar prototipos

```javascript
// Prevenir modificaciones al prototipo de Object
Object.freeze(Object.prototype);
```

### 4. Uso de Map en lugar de objetos planos

```javascript
// Usar Map para almacenar pares clave-valor dinámicos
const safeMap = new Map();
safeMap.set(key, value); // No afectado por prototype pollution
```

### 5. Sanitización de JSON antes de parsear

```javascript
function sanitizeJson(json) {
  return json.replace(/"__proto__":|"constructor":|"prototype":/g, '"sanitized":');
}

const safeObj = JSON.parse(sanitizeJson(userInput));
```

### 6. Utilizar bibliotecas seguras

- [Lodash](https://lodash.com/) (versión >= 4.17.12)
- [object-path](https://www.npmjs.com/package/object-path) (versión segura)

## Ejemplo de código seguro vs. vulnerable

### Vulnerable

```javascript
// Función para establecer una propiedad anidada
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
  return obj;
}

// Esta función es vulnerable a ataques como:
setNestedProperty({}, "__proto__.isAdmin", true);
```

### Seguro

```javascript
// Función segura para establecer una propiedad anidada
function safeSetNestedProperty(obj, path, value) {
  // Verificar si la ruta contiene partes peligrosas
  const parts = path.split('.');
  const hasDangerousPart = parts.some(part => 
    part === '__proto__' || 
    part === 'constructor' || 
    part === 'prototype'
  );
  
  if (hasDangerousPart) {
    console.warn('Intento de prototype pollution detectado:', path);
    return obj;
  }
  
  // Clonar el objeto para evitar modificar el original
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
  return result;
}
```

## Herramientas de detección

1. [Snyk Code](https://snyk.io/product/snyk-code/) - Análisis estático para detectar vulnerabilidades de prototype pollution
2. [ESLint Plugin Security](https://github.com/nodesecurity/eslint-plugin-security) - Reglas de ESLint para detectar patrones vulnerables
3. [DOMPurify](https://github.com/cure53/DOMPurify) - Para sanitizar HTML que podría ser afectado por prototype pollution

## Referencias

1. [OWASP - Prototype Pollution](https://owasp.org/www-community/vulnerabilities/Prototype_Pollution)
2. [HackTricks - Prototype Pollution](https://book.hacktricks.xyz/pentesting-web/deserialization/nodejs-proto-prototype-pollution)
3. [Portswigger - Client-side prototype pollution](https://portswigger.net/web-security/prototype-pollution)
4. [GitHub Security Lab - Prototype Pollution in Node.js](https://securitylab.github.com/research/prototype-pollution-node/)
5. [CWE-1321: Prototype Pollution](https://cwe.mitre.org/data/definitions/1321.html)