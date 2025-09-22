# DOM-based XSS

## Descripción

El Cross-Site Scripting basado en DOM (DOM-based XSS) es un tipo de vulnerabilidad de seguridad que ocurre cuando JavaScript en el navegador modifica el DOM (Document Object Model) inseguramente con datos controlados por el usuario, sin sanitización adecuada.

A diferencia del XSS reflejado o almacenado (que involucran al servidor), el DOM-based XSS ocurre completamente en el lado del cliente y no requiere una solicitud al servidor para ser explotado.

## Ejemplo Vulnerable

```javascript
// Vulnerabilidad: tomar un parámetro de URL y insertarlo en el DOM
const urlParams = new URLSearchParams(window.location.search);
const userInput = urlParams.get('name');

// Inseguro: Inserta HTML sin sanitización
document.getElementById('greeting').innerHTML = 'Hola, ' + userInput;
```

## Vectores de Ataque Comunes

1. **Parámetros de URL**: `?name=<script>alert('XSS')</script>`
2. **Fragmentos de Hash**: `#<img src=x onerror=alert('XSS')>`
3. **Datos de localStorage/sessionStorage**: Si se almacena contenido no confiable y luego se inserta en el DOM
4. **postMessage**: Cuando se reciben mensajes entre ventanas o iframes sin validación

## Impacto

- Robo de cookies y tokens de sesión
- Keylogging (captura de pulsaciones de teclado)
- Phishing
- Defacement (modificación visual de la página)
- Ejecución de código malicioso en el contexto del sitio

## Prevención

1. **Usar métodos seguros**:
   - Preferir `textContent` en lugar de `innerHTML` cuando solo se necesite texto
   - Usar `setAttribute()` en lugar de asignación directa de propiedades HTML

2. **Sanitización de HTML**:
   - Usar bibliotecas como DOMPurify antes de insertar HTML en el DOM:
     ```javascript
     // Seguro: Sanitiza el HTML antes de insertarlo
     import DOMPurify from 'dompurify';
     element.innerHTML = DOMPurify.sanitize(userInput);
     ```

3. **Validación de entrada**:
   - Validar que los datos cumplen con el formato esperado (números, fechas, etc.)
   - Implementar listas blancas de caracteres permitidos

4. **Content Security Policy (CSP)**:
   - Implementar una política estricta que bloquee la ejecución de scripts inline

## Diferencia con otras variantes de XSS

| Tipo | Origen | Almacenamiento | Punto de inyección |
|------|--------|----------------|-------------------|
| **Reflected XSS** | Parámetros HTTP | No almacenado | Servidor (respuesta HTTP) |
| **Stored XSS** | Base de datos | Almacenado | Servidor (base de datos) |
| **DOM-based XSS** | Navegador | No almacenado* | Cliente (DOM) |

\* Puede combinarse con almacenamiento (localStorage, IndexedDB) en ataques híbridos.

## Herramientas de Detección

- Escáneres de seguridad estáticos (SAST)
- Análisis de código del lado del cliente
- Pruebas de penetración manuales

## Referencias

1. [OWASP DOM Based XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
2. [Portswigger Web Security Academy - DOM XSS](https://portswigger.net/web-security/cross-site-scripting/dom-based)
3. [MDN Web Docs - Cross-site scripting](https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#cross-site_scripting_xss)