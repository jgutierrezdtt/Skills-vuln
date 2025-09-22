# JSON Injection

## Descripción

JSON Injection es una vulnerabilidad que ocurre cuando una aplicación web procesa datos JSON de manera insegura, permitiendo a un atacante manipular la estructura o contenido del JSON para lograr comportamientos no deseados. Esto puede llevar a diversos ataques como prototype pollution, ejecución de código no autorizado, y escalada de privilegios.

## Concepto

JSON (JavaScript Object Notation) es un formato ligero de intercambio de datos ampliamente utilizado en aplicaciones web modernas. Cuando una aplicación procesa datos JSON sin la validación o sanitización adecuada, un atacante puede manipular estos datos para:

1. Modificar el comportamiento de objetos JavaScript
2. Inyectar valores maliciosos que pueden ser ejecutados
3. Manipular propiedades sensibles para obtener acceso no autorizado

## Tipos de Ataques

### 1. Prototype Pollution

```javascript
// Payload malicioso
{
  "__proto__": {
    "isAdmin": true
  }
}
```

Este ataque modifica el prototipo de Object, afectando a todos los objetos de la aplicación. Cuando se verifica `obj.isAdmin`, el motor de JavaScript buscará esta propiedad en la cadena de prototipos y encontrará el valor inyectado.

### 2. Constructor Poisoning

```javascript
// Payload malicioso
{
  "constructor": {
    "prototype": {
      "hasAccess": true
    }
  }
}
```

Similar al prototype pollution, pero manipula el constructor para afectar a futuras instancias de objetos.

### 3. Inyección de Propiedades Sensibles

```javascript
// Payload malicioso
{
  "username": "regularUser",
  "role": "admin"
}
```

El atacante intenta elevar sus privilegios añadiendo o modificando propiedades sensibles como "role".

### 4. Cross-Site Scripting vía JSON

```javascript
// Payload malicioso
{
  "name": "<script>alert('XSS')</script>",
  "comment": "javascript:alert('XSS')"
}
```

Si estos valores se renderizan directamente en HTML sin sanitización, pueden ejecutar scripts maliciosos.

## Vectores de Ataque

1. **Envío de JSON Manipulado**: A través de solicitudes POST/PUT/PATCH
2. **Modificación de Respuestas JSON**: Mediante ataques Man-in-the-Middle
3. **Inyección en Almacenamiento**: Almacenar JSON malicioso que se procesa posteriormente
4. **Manipulación de LocalStorage/SessionStorage**: Si la aplicación almacena y procesa JSON del almacenamiento del navegador

## Impacto

- **Ejecución de Código No Autorizado**: Mediante XSS o manipulación de objetos
- **Bypass de Autenticación**: Modificando banderas de autenticación
- **Escalada de Privilegios**: Cambiando roles o permisos
- **Filtración de Información**: Accediendo a datos no autorizados
- **Denegación de Servicio**: Causando errores en el procesamiento de objetos

## Mitigaciones

### 1. Validación de Esquema

Validar la estructura del JSON contra un esquema predefinido antes de procesarlo:

```javascript
// Usando una biblioteca como Joi o Zod
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(120)
  // No permitir propiedades adicionales
}).unknown(false);

const { error, value } = schema.validate(jsonData);
if (error) throw new Error('Invalid JSON structure');
```

### 2. Sanitización de Propiedades Peligrosas

```javascript
function sanitizeJson(data) {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeJson(item));
  }
  
  if (data && typeof data === 'object') {
    const safe = {};
    for (const key in data) {
      // Excluir propiedades peligrosas
      if (
        key !== '__proto__' && 
        key !== 'constructor' && 
        key !== 'prototype' &&
        !key.startsWith('_')
      ) {
        safe[key] = sanitizeJson(data[key]);
      }
    }
    return safe;
  }
  
  return data;
}
```

### 3. Object.freeze() para Objetos Sensibles

```javascript
// Prevenir modificaciones de objetos sensibles
const config = Object.freeze({
  apiKey: 'sensitive-value',
  isAdmin: false
});
```

### 4. JSON.parse con Reviver Function

```javascript
const safeJson = JSON.parse(jsonString, (key, value) => {
  // Rechazar claves peligrosas
  if (
    key === '__proto__' || 
    key === 'constructor' || 
    key === 'prototype'
  ) {
    return undefined;
  }
  return value;
});
```

### 5. Sanitización antes de Renderizar

```javascript
// Sanitizar valores antes de renderizarlos en el DOM
import DOMPurify from 'dompurify';

const sanitizedName = DOMPurify.sanitize(user.name);
document.getElementById('user-name').textContent = sanitizedName;
```

## Diferencias entre Seguro e Inseguro

### Inseguro
```javascript
// Procesar JSON directamente sin validación
const userData = JSON.parse(userInput);

// Usar propiedades sin verificación
if (userData.role === 'admin') {
  grantAdminAccess();
}

// Renderizar directamente en HTML
document.getElementById('user-profile').innerHTML = `<h1>${userData.name}</h1>`;
```

### Seguro
```javascript
// Validar contra un esquema
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['user', 'editor', 'admin'] }
  },
  required: ['name', 'email', 'role'],
  additionalProperties: false
};

const ajv = new Ajv();
const validate = ajv.compile(schema);

if (!validate(userData)) {
  throw new Error('Invalid user data');
}

// Verificar role con lógica adicional
if (userData.role === 'admin' && !isUserAllowedAdmin(userData.id)) {
  userData.role = 'user';
}

// Sanitizar antes de renderizar
document.getElementById('user-profile').textContent = userData.name;
```

## Consideraciones Adicionales

1. **Implementar CSP (Content Security Policy)** para mitigar el impacto de posibles ataques XSS
2. **Evitar el uso de eval() o new Function()** con datos JSON no confiables
3. **Mantener bibliotecas de procesamiento JSON actualizadas**
4. **Implementar pruebas de seguridad específicas** para JSON injection
5. **Usar Object.create(null)** para crear objetos sin prototipo cuando se procesa JSON no confiable

## Referencias

1. [OWASP JSON Web Token Validation Bypass](https://owasp.org/www-community/vulnerabilities/JSON_Web_Token_Validation_Bypass)
2. [HackTricks - Prototype Pollution](https://book.hacktricks.xyz/pentesting-web/deserialization/nodejs-proto-prototype-pollution)
3. [Portswigger - Client-side prototype pollution](https://portswigger.net/web-security/prototype-pollution)
4. [NPM Security - Prototype Pollution](https://blog.npmjs.org/post/180565383195/details-about-the-event-stream-incident)