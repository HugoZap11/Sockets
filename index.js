import {Server} from socket.io;
import http from 'http';

//modulo de seguridad(io.use)
import jwt from 'jsonwebtoken';

io.use((socket, next) =>{
//Extrae el JWT inyectado por el Frontend
const token = socket.handshake.auth.token;

if (!token) return next(new Error("Acceso Denegado: No token"));

//Verifica la firma de la Variable de entorno segura

jwt.verify(token, process.env.JWT_SECRET,(err, userPayload) =>{
 if (err) return next(new Error("Acceso Denegado: Token inválido"));

//Se guardan los datos decodificados en el socket del usuario
socket.user=userPayload;
next(); //con esto deberia inficar que se validó correctamente
});
});


//Apartir de aqui inicio del server
const server = http.createServer(app);

//Instancias garantizando evitar problemas de CORS(Cross-Origin Request Blocked)
const io= new Server(server,{
  cors:{ origin:"http://localhost:4200", methods: ["GET", "POST"]}
});

//Inicia el puerto del servidor central
server.listen(3500,()=> console.log('Sockets on port 3500'));