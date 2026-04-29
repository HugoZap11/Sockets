import express,{ response } from 'express';
import {loginToExternalApi, registerToExternalApi} from './controllers/authController.js';
import {body,validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import userManager from './userManager.js';

const router= express.Router();//se inicializa
const backendToken=''; //token de backend para autenticacion con API externa

const loginValidation=[
    body('name').isString().trim.escape().notEmpty().withMessage('El nombre es requerido y debe ser una cadena de texto'),
    body('password').isString().trim.escape().notEmpty().withMessage('La contraseña es requerida y debe ser una cadena de texto'),
]

const registerValidation=[
    body('name').isString().trim.escape().notEmpty().withMessage('El nombre es requerido y debe ser una cadena de texto'),
    body('password').isString().trim.escape().notEmpty().withMessage('La contraseña es requerida y debe ser una cadena de texto'),
    body('email').isEmail().normalizeEmail().withMessage('El email es requerido y debe ser válido'),
]


router.all('/auth/login', loginValidation, (req, res,next) =>{
    //hace check de errores antes de seguir con el proceso de login
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    next();
    }, async (req, res) =>{
        console.log('Login request body:', req.body);
        const { name, password } = req.body;
        console.log('Request body:', req.body);
        console.log('Login attempt:',name);
        try{//verifica si el usuario existe 
            if(!name || !password){
                return res.status(400).json({ error: 'Nombre y contraseña son requeridos' });
            }

            //compara la contraseña enviada con la hasheada en la DB
            //Prioridad a la seguridad, no comparar en texto plano
            let payload = await loginToExternalApi(name, password, backendToken);

            //firma el token
            jwt.sign(
                {id:payload.id}, 
                process.env.JWT_SECRET, { expiresIn: '1h' },
                 (err, token) =>{
                    if(err) throw err;
                    userManager.loginUser(token,{id:payload.id,nickname: payload.nickname, moneda:payload.moneda, tankes: payload.tankes, token: token});
                    res.status(200).json({ token: token, user:{ id: payload.id, nickname: payload.nickname, moneda:payload.moneda, tankes: payload.tankes }});//esto lo guarda el cliente en localStorage o similar para usarlo en futuras peticiones y en la conexion de sockets
                }
            );
        }catch(error){
            console.error('Login error:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
            });
export const verifyToken = (req, res, next) =>{
    //El frontend envia el token en el header de autorizacion con el formato
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
if(!token){
    return res.status(401).json({ error: 'Token no proporcionado' });
}

try{
    //Verificamos el token con la clave secreta del servidor
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Guarda los datos del usuario e el objeto 'req' para que las siguientes funciones puedan acceder a ellos
    req.user = decoded;
    next();//pasa a la siguiente funcion si todo esta bien
}catch(error){
    return res.status(403).json({ error: 'Token inválido' });
}
};

router.all('/auth/register', registerValidation, (req, res, next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
    next();
    },
    verifyToken,
    async (req, res)=>{
    console.log('Register request body:', req.body);
    try{//verifica los datos de usuario y registra en la API externa
        const { name, password, email } = req.body;
        console.log('Request body:', req.body);
        console.log('Register attempt:',name);
        if(!name || !password || !email){
            return res.status(400).json({msg: 'error en las credenciales' });
        }
       //compara la contraseña enviada con la hasheada en la DB
       //Prioridad a la seguridad, no comparar en texto plano
       backendToken = await registerToExternalApi(req.body);
       res.status(201).json({msg: 'Usuario registrado con éxito', user:{ id: payload.id, nickname: payload.nickname, moneda:payload.moneda, tankes: payload.tankes }}); 
    } 
    catch(err){
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

router.get('/tankes',(req, res, next) =>{
    //check de errores de validacion
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    next();
}, async (req, res) =>{
    console.log('Get tankes recived');
    try{
        let payload = await obtenerTankes(userManager.getUserByToken(req.headers['authorization'].split(' ')[1]).id, backendToken);
        res.status(200).json({ tankes: payload });
    }catch(err){
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

router.post('/tankes', TankesValidation, (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
}, async (req, res) =>{
    console.log('Create tank request body:', req.body);
    try{

        let payload = await crearTank(userManager.getUserByToken(req.headers['authorization'].split(' ')[1]).id, req.body, backendToken);
        res.status(201).json({ msg: 'Tank creado con éxito', tank: payload });
    }catch(err){
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }  
});

export default router;
