import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// Datos de usuario simulados
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', balance: 10000 },
  { id: 2, username: 'user1', password: 'user123', role: 'user', balance: 1000 },
  { id: 3, username: 'user2', password: 'user456', role: 'user', balance: 500 }
];

// Mensajes privados simulados (solo accesibles para administradores)
const privateMessages = [
  { id: 1, from: 'system', to: 'admin', content: 'Clave API del sistema: sk_test_example_key_not_real_12345' },
  { id: 2, from: 'admin', to: 'system', content: 'Configuración actualizada con éxito' },
  { id: 3, from: 'system', to: 'admin', content: 'Backup programado para las 3:00 AM' }
];

// Transacciones simuladas
const transactions = [
  { id: 1, userId: 1, amount: 500, type: 'deposit', date: '2025-09-10' },
  { id: 2, userId: 2, amount: 100, type: 'withdrawal', date: '2025-09-12' },
  { id: 3, userId: 1, amount: 200, type: 'deposit', date: '2025-09-15' }
];

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  // Verificar si ya existe una instancia de Socket.IO
  if (res.socket.server.io) {
    console.log('Socket.IO ya está configurado');
    res.end();
    return;
  }

  // Crear una nueva instancia de Socket.IO
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/websocket',
    addTrailingSlash: false,
  });
  
  res.socket.server.io = io;

  // Manejar conexiones de WebSocket
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    // Enviar mensaje de bienvenida
    socket.emit('welcome', { 
      message: 'Conectado al servidor WebSocket inseguro',
      socketId: socket.id
    });

    // Manejar autenticación
    socket.on('authenticate', (data) => {
      const { username, password, secure } = data;
      
      // Búsqueda de usuario
      const user = users.find(u => u.username === username);
      
      // Si está en modo seguro, verificar las credenciales
      if (secure) {
        if (!user || user.password !== password) {
          socket.emit('auth_response', { 
            success: false, 
            message: 'Credenciales inválidas' 
          });
          return;
        }
      }
      
      // En modo inseguro, se omite la verificación de la contraseña
      // o se utilizan credenciales por defecto
      
      // Guardar información del usuario en el objeto socket
      // @ts-ignore - Añadimos propiedades personalizadas
      socket.user = user ? { 
        id: user.id,
        username: user.username,
        role: user.role 
      } : { 
        id: 0,
        username: username || 'guest',
        role: 'guest' 
      };
      
      socket.emit('auth_response', { 
        success: true, 
        message: 'Autenticación exitosa',
        // @ts-ignore
        user: socket.user 
      });
      
      // Enviar notificación a todos los clientes
      io.emit('user_connected', { 
        // @ts-ignore
        username: socket.user.username, 
        timestamp: new Date().toISOString() 
      });
    });

    // Manejar solicitudes de datos (sin verificación adecuada en modo inseguro)
    socket.on('get_data', (data) => {
      const { dataType, secure } = data;
      
      // Si está en modo seguro, verificar autenticación y permisos
      if (secure) {
        // @ts-ignore
        if (!socket.user) {
          socket.emit('error', { message: 'No autenticado' });
          return;
        }
        
        // Verificar permisos para datos sensibles
        if (dataType === 'admin_messages' || dataType === 'all_transactions') {
          // @ts-ignore
          if (socket.user.role !== 'admin') {
            socket.emit('error', { message: 'Permisos insuficientes' });
            return;
          }
        }
        
        // Verificar acceso a datos de usuario específico
        // @ts-ignore
        if (dataType === 'user_transactions' && data.userId !== socket.user.id) {
          // @ts-ignore
          if (socket.user.role !== 'admin') {
            socket.emit('error', { message: 'No puedes acceder a transacciones de otro usuario' });
            return;
          }
        }
      }
      
      // En modo inseguro, enviar datos sin verificación adecuada
      
      // Responder según el tipo de datos solicitados
      switch (dataType) {
        case 'users':
          // En modo seguro, no enviar contraseñas
          socket.emit('data_response', { 
            type: dataType,
            data: secure ? users.map(u => ({ id: u.id, username: u.username, role: u.role })) : users
          });
          break;
          
        case 'admin_messages':
          socket.emit('data_response', { 
            type: dataType,
            data: privateMessages
          });
          break;
          
        case 'user_transactions':
          const userId = data.userId || 0;
          socket.emit('data_response', { 
            type: dataType,
            data: transactions.filter(t => t.userId === userId)
          });
          break;
          
        case 'all_transactions':
          socket.emit('data_response', { 
            type: dataType,
            data: transactions
          });
          break;
          
        default:
          socket.emit('error', { message: 'Tipo de datos no válido' });
      }
    });

    // Manejar envío de mensajes
    socket.on('send_message', (data) => {
      const { message, recipient, secure } = data;
      
      // Si está en modo seguro, verificar autenticación
      if (secure) {
        // @ts-ignore
        if (!socket.user) {
          socket.emit('error', { message: 'No autenticado' });
          return;
        }
      }
      
      // En modo inseguro, permitir mensajes incluso sin autenticación
      
      // Crear objeto de mensaje
      const messageObj = {
        // @ts-ignore
        from: socket.user ? socket.user.username : 'anonymous',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      // Si hay un destinatario específico, enviar solo a ese usuario
      if (recipient) {
        // Buscar socket del destinatario (simplificado, en una app real sería más complejo)
        const recipientSocket = Array.from(io.sockets.sockets.values()).find(
          // @ts-ignore
          s => s.user && s.user.username === recipient
        );
        
        if (recipientSocket) {
          recipientSocket.emit('new_message', {
            ...messageObj,
            private: true
          });
          
          // También enviar al remitente para confirmación
          socket.emit('new_message', {
            ...messageObj,
            to: recipient,
            private: true
          });
        } else {
          socket.emit('error', { message: 'Usuario no encontrado o no conectado' });
        }
      } else {
        // Mensaje público a todos los clientes
        io.emit('new_message', messageObj);
      }
    });

    // Manejar transferencias (vulnerable en modo inseguro)
    socket.on('transfer', (data) => {
      const { amount, toUserId, secure } = data;
      
      // Si está en modo seguro, realizar verificaciones
      if (secure) {
        // @ts-ignore
        if (!socket.user) {
          socket.emit('error', { message: 'No autenticado' });
          return;
        }
        
        // Verificar que la cantidad es válida
        if (!amount || amount <= 0) {
          socket.emit('error', { message: 'Cantidad inválida' });
          return;
        }
        
        // Verificar que el usuario destino existe
        const toUser = users.find(u => u.id === toUserId);
        if (!toUser) {
          socket.emit('error', { message: 'Usuario destino no encontrado' });
          return;
        }
        
        // @ts-ignore
        const fromUserId = socket.user.id;
        const fromUser = users.find(u => u.id === fromUserId);
        
        // Verificar saldo suficiente
        if (fromUser && fromUser.balance < amount) {
          socket.emit('error', { message: 'Saldo insuficiente' });
          return;
        }
      }
      
      // En modo inseguro, se omiten las verificaciones anteriores
      
      // Simular la transferencia (en una app real, esto modificaría la base de datos)
      const transferId = transactions.length + 1;
      const newTransaction = {
        id: transferId,
        // @ts-ignore
        userId: socket.user ? socket.user.id : 0,
        toUserId: toUserId,
        amount: amount,
        type: 'transfer',
        date: new Date().toISOString().split('T')[0]
      };
      
      // Añadir a la lista de transacciones
      transactions.push(newTransaction);
      
      // Notificar al usuario sobre la transferencia exitosa
      socket.emit('transfer_response', {
        success: true,
        transaction: newTransaction
      });
      
      // Notificar al destinatario si está conectado
      const recipientSocket = Array.from(io.sockets.sockets.values()).find(
        // @ts-ignore
        s => s.user && s.user.id === toUserId
      );
      
      if (recipientSocket) {
        recipientSocket.emit('incoming_transfer', {
          // @ts-ignore
          from: socket.user ? socket.user.username : 'anonymous',
          amount: amount,
          date: newTransaction.date
        });
      }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
      
      // Notificar a otros usuarios
      // @ts-ignore
      if (socket.user) {
        io.emit('user_disconnected', { 
          // @ts-ignore
          username: socket.user.username, 
          timestamp: new Date().toISOString() 
        });
      }
    });
  });

  console.log('Configuración de Socket.IO completada');
  res.end();
}

// Desactivar el bodyParser incorporado
export const config = {
  api: {
    bodyParser: false,
  },
};