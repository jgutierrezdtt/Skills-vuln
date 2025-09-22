# Cross-Site Request Forgery (CSRF)

## Descripción

Cross-Site Request Forgery (CSRF) es un tipo de ataque que fuerza a un usuario autenticado a ejecutar acciones no deseadas en una aplicación web en la que está autenticado actualmente. El ataque ocurre cuando un sitio malicioso, correo electrónico, blog, mensaje instantáneo, o programa hace que el navegador del usuario realice una acción no deseada en un sitio donde el usuario está autenticado.

## Ejemplo Vulnerable

```javascript
// Endpoint sin protección CSRF
app.post('/api/change-email', (req, res) => {
  // No hay verificación de token CSRF
  const { newEmail } = req.body;
  
  // Actualiza el email del usuario actual
  updateUserEmail(req.user.id, newEmail);
  
  res.json({ success: true });
});
```

## Vectores de Ataque Comunes

1. **Enlaces maliciosos**: `<a href="https://bank.example/transfer?to=attacker&amount=1000">Ver fotos</a>`
2. **Formularios ocultos**: Formularios que se envían automáticamente usando JavaScript
3. **Etiquetas de imagen**: `<img src="https://bank.example/transfer?to=attacker&amount=1000" width="0" height="0" />`
4. **AJAX/Fetch requests**: Solicitudes desde dominios maliciosos

## Impacto

- Cambios no autorizados en la cuenta del usuario
- Transferencias financieras
- Cambios de contraseña o email
- Creación, modificación o eliminación de datos
- Acciones administrativas no autorizadas

## Prevención

1. **Tokens CSRF**:
   - Generar un token único por sesión o por solicitud
   - Incluir el token en formularios y solicitudes AJAX
   - Validar el token en el servidor

2. **SameSite Cookies**:
   - Configurar cookies con el atributo `SameSite=Strict` o `SameSite=Lax`

3. **Verificación de cabeceras personalizadas**:
   - Solicitudes AJAX con cabeceras personalizadas (ej. `X-Requested-With: XMLHttpRequest`)

4. **Verificación de Referer/Origin**:
   - Comprobar que la solicitud proviene del mismo origen

5. **Doble envío de cookie (Double Submit Cookie)**:
   - Enviar el mismo token como cookie y como parámetro

## Implementación de Protección

```javascript
// Servidor: Generar token CSRF
app.get('/form', (req, res) => {
  const csrfToken = generateRandomToken();
  req.session.csrfToken = csrfToken;
  res.render('form', { csrfToken });
});

// Servidor: Verificar token CSRF
app.post('/api/action', (req, res) => {
  const token = req.body._csrf || req.headers['x-csrf-token'];
  
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).send('CSRF token invalid');
  }
  
  // Procesar la solicitud...
});

// Cliente: Incluir token en formulario
<form action="/api/action" method="post">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  <!-- Campos del formulario -->
  <button type="submit">Enviar</button>
</form>

// Cliente: Incluir token en solicitud AJAX
fetch('/api/action', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

## Diferencia con XSS

| Aspecto | CSRF | XSS |
|---------|------|-----|
| **Origen del ataque** | Sitio externo | Sitio vulnerable mismo |
| **Mecanismo** | Solicitudes no autorizadas | Inyección y ejecución de scripts |
| **Aprovecha** | Confianza del sitio en el navegador del usuario | Confianza del usuario en el sitio |
| **Protección** | Tokens CSRF, SameSite cookies | Escape de output, CSP |

## Herramientas de Detección

- Escáneres de vulnerabilidades web (OWASP ZAP, Burp Suite)
- Revisiones de código estático
- Pruebas de penetración manuales

## Referencias

1. [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
2. [MDN - SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
3. [Portswigger Web Security Academy - CSRF](https://portswigger.net/web-security/csrf)