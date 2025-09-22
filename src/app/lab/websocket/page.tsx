'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';

export default function WebSocketVulnerabilityPage() {
  const [protection, setProtection] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferTo, setTransferTo] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [receivedData, setReceivedData] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'data' | 'transfer'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Inicializar conexión WebSocket
  useEffect(() => {
    // Función para inicializar Socket.IO
    const initializeSocket = async () => {
      try {
        // Primero, inicializar el endpoint del WebSocket
        await fetch('/api/websocket');
        
        // Luego, conectar al WebSocket
        const socketIo = io({
          path: '/api/websocket',
        });
        
        setSocket(socketIo);
        
        // Configurar eventos del WebSocket
        socketIo.on('connect', () => {
          setConnected(true);
          addNotification({
            type: 'success',
            message: 'Conectado al servidor WebSocket',
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        socketIo.on('disconnect', () => {
          setConnected(false);
          setAuthenticated(false);
          setUserData(null);
          addNotification({
            type: 'error',
            message: 'Desconectado del servidor WebSocket',
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        socketIo.on('welcome', (data) => {
          addNotification({
            type: 'info',
            message: data.message,
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        socketIo.on('auth_response', (data) => {
          if (data.success) {
            setAuthenticated(true);
            setUserData(data.user);
            addNotification({
              type: 'success',
              message: `Autenticado como ${data.user.username} (${data.user.role})`,
              timestamp: new Date().toLocaleTimeString()
            });
          } else {
            addError(data.message);
          }
        });
        
        socketIo.on('new_message', (data) => {
          addMessage(data);
        });
        
        socketIo.on('data_response', (data) => {
          setReceivedData(data);
          addNotification({
            type: 'success',
            message: `Datos recibidos: ${data.type}`,
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        socketIo.on('transfer_response', (data) => {
          if (data.success) {
            addNotification({
              type: 'success',
              message: `Transferencia exitosa de $${data.transaction.amount}`,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        });
        
        socketIo.on('incoming_transfer', (data) => {
          addNotification({
            type: 'success',
            message: `Transferencia recibida de ${data.from}: $${data.amount}`,
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        socketIo.on('user_connected', (data) => {
          addNotification({
            type: 'info',
            message: `Usuario conectado: ${data.username}`,
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        socketIo.on('user_disconnected', (data) => {
          addNotification({
            type: 'info',
            message: `Usuario desconectado: ${data.username}`,
            timestamp: new Date().toLocaleTimeString()
          });
        });
        
        socketIo.on('error', (data) => {
          addError(data.message);
        });
        
        // Retornar función de limpieza
        return () => {
          socketIo.disconnect();
        };
      } catch (error) {
        addError('Error al conectar con el WebSocket');
        console.error('Error al inicializar WebSocket:', error);
      }
    };
    
    initializeSocket();
    
    // Función de limpieza
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  
  // Función para autenticarse
  const handleAuthenticate = () => {
    if (!socket || !connected) {
      addError('No hay conexión con el servidor');
      return;
    }
    
    // Enviar credenciales al servidor
    socket.emit('authenticate', {
      username,
      password,
      secure: protection
    });
  };
  
  // Función para enviar mensaje
  const handleSendMessage = () => {
    if (!socket || !connected) {
      addError('No hay conexión con el servidor');
      return;
    }
    
    if (!message.trim()) {
      addError('El mensaje no puede estar vacío');
      return;
    }
    
    // Enviar mensaje al servidor
    socket.emit('send_message', {
      message,
      recipient: recipient.trim() || null,
      secure: protection
    });
    
    // Limpiar campo de mensaje
    setMessage('');
  };
  
  // Función para solicitar datos
  const handleRequestData = (dataType: string, additionalParams = {}) => {
    if (!socket || !connected) {
      addError('No hay conexión con el servidor');
      return;
    }
    
    // Solicitar datos al servidor
    socket.emit('get_data', {
      dataType,
      secure: protection,
      ...additionalParams
    });
  };
  
  // Función para realizar transferencia
  const handleTransfer = () => {
    if (!socket || !connected) {
      addError('No hay conexión con el servidor');
      return;
    }
    
    const amount = parseFloat(transferAmount);
    const toUserId = parseInt(transferTo);
    
    if (isNaN(amount) || amount <= 0) {
      addError('Ingrese una cantidad válida');
      return;
    }
    
    if (isNaN(toUserId) || toUserId <= 0) {
      addError('Ingrese un ID de usuario válido');
      return;
    }
    
    // Enviar solicitud de transferencia
    socket.emit('transfer', {
      amount,
      toUserId,
      secure: protection
    });
    
    // Limpiar campos
    setTransferAmount('');
    setTransferTo('');
  };
  
  // Función para desconectarse
  const handleDisconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };
  
  // Función para reconectarse
  const handleReconnect = () => {
    if (socket) {
      socket.connect();
    }
  };
  
  // Utilidades
  const addMessage = (message: any) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: message.timestamp || new Date().toLocaleTimeString()
    }]);
  };
  
  const addError = (error: string) => {
    setErrors(prev => [...prev, {
      message: error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };
  
  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };
  
  // Solicitar lista de usuarios al autenticarse
  useEffect(() => {
    if (authenticated && socket) {
      handleRequestData('users');
    }
  }, [authenticated]);
  
  // Auto-scroll para mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Actualizar usuarios cuando se reciben datos
  useEffect(() => {
    if (receivedData && receivedData.type === 'users') {
      setUsers(receivedData.data);
    }
  }, [receivedData]);
  
  // Función para renderizar JSON
  const renderJson = (data: any) => {
    return (
      <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto max-h-80">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };
  
  // Credenciales predefinidas para demostración
  const predefinedCredentials = [
    { username: 'admin', password: 'admin123', description: 'Administrador' },
    { username: 'user1', password: 'user123', description: 'Usuario regular' },
    { username: 'user2', password: 'user456', description: 'Usuario regular' },
    { username: 'hacker', password: 'anything', description: 'En modo inseguro, cualquier valor funciona' }
  ];
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorio: WebSocket Inseguro</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8">
        <h2 className="text-red-700 font-bold">⚠️ Advertencia de Seguridad</h2>
        <p className="text-red-700">Esta página es intencionalmente vulnerable para propósitos educativos.</p>
      </div>
      
      {/* Control para activar/desactivar protección */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-800">Estado de Protección WebSocket</h2>
            <p className="text-blue-600">
              {protection 
                ? "✅ Autenticación y validación activadas - Se verifican credenciales y permisos" 
                : "❌ Autenticación y validación desactivadas - No se verifican credenciales (vulnerable)"}
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
      
      {/* Estado de conexión */}
      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Estado de Conexión</h2>
            <p className={`mt-1 ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? '✅ Conectado al servidor WebSocket' : '❌ Desconectado'}
            </p>
            {authenticated && userData && (
              <p className="mt-1 text-blue-600">
                Autenticado como: <span className="font-semibold">{userData.username}</span> (Rol: {userData.role})
              </p>
            )}
          </div>
          <div>
            {connected ? (
              <button
                onClick={handleDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Desconectar
              </button>
            ) : (
              <button
                onClick={handleReconnect}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Reconectar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Grid de paneles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Autenticación y Controles */}
        <div className="lg:col-span-1 space-y-6">
          {/* Panel de autenticación */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Autenticación</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario:
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ej: admin"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña:
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Ej: admin123"
                />
              </div>
              
              <button
                onClick={handleAuthenticate}
                disabled={!connected}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:bg-blue-300"
              >
                {authenticated ? 'Cambiar Usuario' : 'Iniciar Sesión'}
              </button>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Credenciales de prueba:</p>
                <div className="space-y-1">
                  {predefinedCredentials.map((cred, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setUsername(cred.username);
                        setPassword(cred.password);
                      }}
                      className="text-xs p-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                    >
                      <span className="font-medium">{cred.username}</span> / {cred.password} - {cred.description}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel de notificaciones */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Notificaciones</h2>
            
            <div className="max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm ${
                        notification.type === 'success' ? 'bg-green-100 border border-green-300' :
                        notification.type === 'error' ? 'bg-red-100 border border-red-300' :
                        'bg-blue-100 border border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{notification.message}</span>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay notificaciones.</p>
              )}
            </div>
          </div>
          
          {/* Panel de errores */}
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Errores</h2>
            
            <div className="max-h-40 overflow-y-auto">
              {errors.length > 0 ? (
                <div className="space-y-2">
                  {errors.map((error, idx) => (
                    <div key={idx} className="p-2 bg-red-100 border border-red-300 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-700">{error.message}</span>
                        <span className="text-xs text-gray-500">{error.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay errores.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Panel central y derecho - Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs de navegación */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'data'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Solicitar Datos
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'transfer'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transferencias
              </button>
            </nav>
          </div>
          
          {/* Contenido de las tabs */}
          {activeTab === 'chat' && (
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h2 className="text-xl font-bold mb-4">Chat</h2>
              
              <div className="h-60 mb-4 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                {messages.length > 0 ? (
                  <div className="space-y-2">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${
                          msg.private ? 'bg-purple-100 border border-purple-200' : 'bg-blue-100 border border-blue-200'
                        }`}
                      >
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {msg.from && `De: ${msg.from}`}
                            {msg.to && ` → Para: ${msg.to}`}
                            {!msg.from && !msg.to && 'Sistema'}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-800">{msg.content}</p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-10">No hay mensajes. Envía uno para comenzar.</p>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                    Destinatario (opcional, dejar vacío para mensaje público):
                  </label>
                  <input
                    id="recipient"
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Ej: admin"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje:
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                    placeholder="Escribe tu mensaje aquí..."
                  ></textarea>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!connected}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:bg-blue-300"
                >
                  Enviar Mensaje
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h2 className="text-xl font-bold mb-4">Solicitar Datos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleRequestData('users')}
                  disabled={!connected}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 disabled:opacity-50"
                >
                  Lista de Usuarios
                </button>
                
                <button
                  onClick={() => handleRequestData('admin_messages')}
                  disabled={!connected}
                  className="p-3 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-800 disabled:opacity-50"
                >
                  Mensajes de Administrador
                </button>
                
                <button
                  onClick={() => handleRequestData('all_transactions')}
                  disabled={!connected}
                  className="p-3 bg-green-100 hover:bg-green-200 rounded text-green-800 disabled:opacity-50"
                >
                  Todas las Transacciones
                </button>
                
                <button
                  onClick={() => handleRequestData('user_transactions', { userId: userData?.id || 1 })}
                  disabled={!connected}
                  className="p-3 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 disabled:opacity-50"
                >
                  Mis Transacciones
                </button>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Datos Recibidos:</h3>
                {receivedData ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        Tipo: {receivedData.type}
                      </span>
                    </div>
                    {renderJson(receivedData.data)}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay datos. Haz clic en un botón para solicitar información.</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'transfer' && (
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h2 className="text-xl font-bold mb-4">Transferencias</h2>
              
              <div className="mb-6 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-sm">
                <p className="text-yellow-700">
                  <strong>Nota:</strong> En modo inseguro, las transferencias se procesan sin verificación de saldo o autenticación adecuada.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="transfer-to" className="block text-sm font-medium text-gray-700 mb-1">
                    ID del Destinatario:
                  </label>
                  <input
                    id="transfer-to"
                    type="number"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Ej: 2"
                  />
                </div>
                
                <div>
                  <label htmlFor="transfer-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Monto a Transferir:
                  </label>
                  <input
                    id="transfer-amount"
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Ej: 100"
                  />
                </div>
                
                <button
                  onClick={handleTransfer}
                  disabled={!connected}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded disabled:bg-green-300"
                >
                  Realizar Transferencia
                </button>
              </div>
              
              {users.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Usuarios Disponibles:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {users.map((user) => (
                      <div 
                        key={user.id}
                        onClick={() => setTransferTo(user.id.toString())}
                        className="p-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-gray-500">ID: {user.id} | Rol: {user.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Panel de información de usuario actual */}
          {userData && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-bold mb-2">Mi Perfil</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Usuario:</p>
                  <p className="font-medium">{userData.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol:</p>
                  <p className="font-medium">{userData.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID:</p>
                  <p className="font-medium">{userData.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Explicación técnica */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Explicación Técnica: WebSocket Inseguro</h2>
        
        <div className="space-y-4">
          <p><strong>¿Qué es un WebSocket inseguro?</strong> Un WebSocket inseguro es una implementación que carece de las validaciones adecuadas de autenticación, autorización o sanitización de datos, permitiendo acceso no autorizado o manipulación de la comunicación.</p>
          
          <p><strong>Vulnerabilidades comunes:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ausencia de autenticación o verificación de credenciales</li>
            <li>Falta de verificación de autorización para acciones sensibles</li>
            <li>No validar el origen de las conexiones</li>
            <li>Procesamiento inseguro de datos recibidos</li>
            <li>Exposición de información sensible</li>
          </ul>
          
          <p><strong>Impacto:</strong> Estas vulnerabilidades pueden permitir a un atacante:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Suplantar a otros usuarios</li>
            <li>Acceder a datos sensibles</li>
            <li>Realizar acciones no autorizadas</li>
            <li>Manipular el estado del servidor</li>
            <li>Ejecutar ataques de denegación de servicio</li>
          </ul>
          
          <p><strong>Implementación segura vs. vulnerable:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <h4 className="font-medium mb-2 text-red-600">❌ Vulnerable</h4>
              <pre className="p-2 bg-red-50 border border-red-200 rounded text-sm overflow-x-auto">
{`// Sin verificación de autenticación
socket.on('get_data', (data) => {
  // Acceso directo a datos sensibles
  socket.emit('data_response', { 
    type: data.type,
    data: sensitiveData
  });
});`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-green-600">✅ Seguro</h4>
              <pre className="p-2 bg-green-50 border border-green-200 rounded text-sm overflow-x-auto">
{`// Con verificación de autenticación y autorización
socket.on('get_data', (data) => {
  // Verificar si el usuario está autenticado
  if (!socket.user) {
    return socket.emit('error', { 
      message: 'No autenticado' 
    });
  }
  
  // Verificar permisos para datos sensibles
  if (data.type === 'admin_data' && 
      socket.user.role !== 'admin') {
    return socket.emit('error', { 
      message: 'Acceso denegado' 
    });
  }
  
  // Procesar solicitud válida
  socket.emit('data_response', { 
    type: data.type,
    data: getSafeData(data.type, socket.user)
  });
});`}
              </pre>
            </div>
          </div>
          
          <p><strong>Mitigaciones:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Implementar autenticación robusta</li>
            <li>Verificar la autorización para cada acción sensible</li>
            <li>Validar y sanitizar todos los datos recibidos</li>
            <li>Usar tokens de sesión con tiempo de expiración</li>
            <li>Limitar la frecuencia de las solicitudes</li>
            <li>Implementar cifrado (WSS en lugar de WS)</li>
            <li>Validar el origen de las conexiones</li>
          </ul>
        </div>
      </div>
    </div>
  );
}