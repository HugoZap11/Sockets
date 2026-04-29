import {Server} from socket.io;
import http from 'http';
import cors from 'cors';
import express from 'express';
import routes from './routes.js';

//modulo de seguridad(io.use)
import jwt from 'jsonwebtoken';
import { start } from 'repl';

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

const router=express.Router();
const app=express();
app.use(express.json());

const PORT=process.env.PORT || 3500;

app.use(cors({origin:"http://localhost:4200",
  methods:["GET", "POST", "PUT", "DELETE"],
  allowedHeaders:["Content-Type", "Authorization"]
}));
app.use('/api', routes(router));


//Apartir de aqui inicio del server
//Configuracion del Socket.io
const server = http.createServer(app);

//Instancias garantizando evitar problemas de CORS(Cross-Origin Request Blocked)
const io= new Server(server,{
  cors:{ origin:"http://localhost:4200", methods: ["GET", "POST"]}
});

io.use((socket, next) =>{
  jwt.verify(socket.handshake.auth.token, process.envJWT_SECRET, (err, userPayload) =>{
    if(err){
      console.error('JWT Error Type:', err.name);
      console.error('JWT Error Message:', err.message);
      return next(new Error("Acceso Denegado: Token inválido"));
    }
    socket.user=decoded;
  });
  next()
  });

io.on('connection', (socket) =>{
  console.log(`Cliente conectado:`,socket.id);

  registerGameHandler(io, socket);

  socket.on('disconnect', () =>{
    console.log(`Cliente desconectado:`,socket.id);
  });

});

//Inicia el puerto del servidor central
server.listen(3500,()=> console.log('Sockets on port 3500'));


async function startServer(){
  try{
    let data=await init();
    if(!process.env.backendToken){
      console.error('Error:no se pudo obtener el token de backend');
    }
    process.env.backendToken=data.token;//se guarda el token en una variable de entorno para su uso posterior
    console.log('Token del backend obtenido exitosamente');
  }catch(err){
    console.error('Error al iniciar el servidor:', err);
  }
}

startServer();

server.listen(PORT, () => 
  console.log(`Servidor escuchando en el puerto ${PORT}`));
