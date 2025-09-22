# Vulnerabilidad de WebSockets

## Descripción

Los WebSockets proporcionan un canal de comunicación bidireccional y persistente entre un cliente y un servidor. Sin embargo, cuando se implementan de manera incorrecta, pueden presentar varias vulnerabilidades de seguridad que comprometen la integridad, confidencialidad y disponibilidad de la aplicación.

## Vulnerabilidades Comunes

1. **Falta de Autenticación**: No verificar adecuadamente la identidad de los usuarios que se conectan.
2. **Deficiente Control de Acceso**: No implementar verificaciones de autorización para acciones sensibles.
3. **Ausencia de Validación de Origen**: No verificar el origen de las conexiones entrantes.
4. **Procesamiento Inseguro de Mensajes**: No validar o sanitizar los datos recibidos.
5. **Exposición de Información Sensible**: Enviar datos sensibles sin cifrado o a usuarios no autorizados.
6. **Vulnerabilidad a Ataques de Denegación de Servicio**: No limitar la frecuencia de conexiones o mensajes.

## Ejemplos de Código Vulnerable

### Autenticación Débil o Inexistente

```javascript
// Código vulnerable: No verifica credenciales correctamente
socket.on('authenticate', (data) => {
  // Acepta cualquier credencial en modo inseguro
  if (!data.secure) {
    socket.user = { 
      id: 1, 
      username: data.username || 'guest',
      role: 'admin' // Asigna rol privilegiado sin verificación
    };
    return socket.emit('auth_response', { 
      success: true, 
      user: socket.user 
    });
  }
  
  // Resto del código...
});
```

### Ausencia de Control de Acceso

```javascript
// Código vulnerable: No verifica permisos para acciones sensibles
socket.on('get_data', (data) => {
  // Entrega datos sensibles sin verificar permisos
  if (data.dataType === 'all_transactions') {
    socket.emit('data_response', { 
      type: data.dataType,
      data: getAllTransactions() // Datos sensibles de todos los usuarios
    });
  }
});
```

### Procesamiento Inseguro de Datos

```javascript
// Código vulnerable: Inyección en procesamiento de mensajes
socket.on('send_message', (data) => {
  const { message, recipient } = data;
  // No sanitiza el mensaje antes de procesarlo
  broadcastMessage({
    from: socket.user?.username,
    to: recipient,
    content: message, // Posible XSS o inyección de comandos
    private: !!recipient
  });
});
```

## Mitigaciones

1. **Autenticación Robusta**:
   ```javascript
   // Verificación adecuada de credenciales
   socket.on('authenticate', async (data) => {
     const user = await validateCredentials(data.username, data.password);
     if (!user) {
       return socket.emit('auth_response', { 
         success: false, 
         message: 'Credenciales inválidas' 
       });
     }
     socket.user = user;
     // Resto del código...
   });
   ```

2. **Control de Acceso Adecuado**:
   ```javascript
   // Verificación de permisos para cada acción
   socket.on('get_data', (data) => {
     if (!socket.user) {
       return socket.emit('error', { message: 'No autenticado' });
     }
     
     if (data.dataType === 'all_transactions' && socket.user.role !== 'admin') {
       return socket.emit('error', { message: 'Permiso denegado' });
     }
     
     // Procesar solicitud autorizada
   });
   ```

3. **Validación y Sanitización de Datos**:
   ```javascript
   // Sanitizar y validar todos los datos de entrada
   socket.on('send_message', (data) => {
     const sanitizedMessage = sanitizeHTML(data.message);
     if (!sanitizedMessage.trim()) {
       return socket.emit('error', { message: 'Mensaje vacío' });
     }
     
     // Procesar mensaje seguro
   });
   ```

4. **Validación de Origen**:
   ```javascript
   // Configuración del servidor WebSocket con CORS
   const io = new Server(server, {
     cors: {
       origin: ['https://dominio-permitido.com'],
       methods: ['GET', 'POST'],
       credentials: true
     }
   });
   ```

5. **Uso de WSS (WebSocket Seguro)**:
   ```javascript
   // Configuración del cliente para usar WSS
   const socket = io({
     secure: true,
     rejectUnauthorized: true
   });
   ```

6. **Limitación de Frecuencia**:
   ```javascript
   // Implementar rate limiting
   const rateLimiter = {};
   
   socket.on('message', (data) => {
     const now = Date.now();
     const userId = socket.user?.id || socket.id;
     
     if (!rateLimiter[userId]) {
       rateLimiter[userId] = { count: 0, timestamp: now };
     }
     
     // Reiniciar contador después de 1 minuto
     if (now - rateLimiter[userId].timestamp > 60000) {
       rateLimiter[userId] = { count: 0, timestamp: now };
     }
     
     rateLimiter[userId].count++;
     
     if (rateLimiter[userId].count > 50) {
       return socket.emit('error', { message: 'Demasiadas solicitudes' });
     }
     
     // Procesar mensaje
   });
   ```

## Buenas Prácticas

1. Implementar autenticación multifactor cuando sea posible
2. Usar cifrado TLS/SSL (WSS en lugar de WS)
3. Implementar políticas de CORS adecuadas
4. Validar y sanitizar todos los datos recibidos
5. Aplicar el principio de privilegio mínimo
6. Usar tokens de sesión con tiempo de expiración
7. Monitorizar y registrar actividades sospechosas
8. Limitar la información compartida en los mensajes
9. Realizar pruebas de penetración regulares
10. Mantener actualizado el software y las bibliotecas