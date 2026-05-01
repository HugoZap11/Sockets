import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TANK_FALLBACK={
    "heavy":
    {
        vida:50,
        rango:3,
        ataque:10,
        movimiento:1
    },

    "medium":{
        vida:35,
        rango:2,
        ataque:7,
        movimiento:3

    },

    
    "light":{
        vida:25,
        rango:2,
        ataque:5,
        movimiento:4
        
    },
}

const AUTH_API_URL=process.env.AUTH_API_URL|| 'http://localhost:8080';
let JWT_SECRET= null;

const obtenerHeadersAutentificacion=(token)=>{
    const headers = {
        'Content-Type':'aplication/json',
    };
    if(token){
        headers['Autorization']`Bearer ${token}`;
    }
    return headers;
};

export const init =async() => {
    try{
        const response = await axios.post(`${AUTH_API_URL}/api/auth/login`, {
      nickname: process.env.BACKEND_USER,
      password: process.env.BACKEND_PWD
    });
    return response.data;
    } catch (error){
        throw error;
    }
};

export const loginToExternalApi = async (nickname, password) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/api/auth/login`, {
      nickname,
      password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerToExternalApi = async (userData, token) => {
  try {
    const headers = obtenerHeadersAutenticacion(token);
    const response = await axios.post(`${AUTH_API_URL}/api/auth/register`, userData, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const ObtenerTank =async (token) =>{
 try {
    const headers = obtenerHeadersAutenticacion(token);
    const response = await axios.get(`${AUTH_API_URL}/api/Tank`, { headers });
    for (const tank of response.data) {
      const tipo = tank.tipo.toLowerCase();
      if (!TANK_FALLBACK[tank.tipo.toLowerCase()]) {
        tipo = 'heavy';
      }
      tank.vida = TANK_FALLBACK[tipo].vida;
      tank.rango = TANK_FALLBACK[tipo].rango;
      tank.ataque = TANK_FALLBACK[tipo].ataque;
      tank.movimiento = TANK_FALLBACK[tipo].movimiento;
    }
    return response.data;
  } catch (error) {
    console.error("Error al obtener los planetas:", error.message);
    throw error;
  }
};

export const guardarPartida = async (datos, token) => {
  try {
    const headers = obtenerHeadersAutenticacion(token);
    const response = await axios.post(`${AUTH_API_URL}/api/partidas/guardar`, datos, { headers });
    return response.data;
  } catch (error) {
    console.error("Error al guardar la partida:", error.message);
    throw error;
  }
};

export const finalizarPartida = async (datos, token) => {
  try {
    const headers = obtenerHeadersAutenticacion(token);
    const response = await axios.post(`${AUTH_API_URL}/api/partidas/finalizar`, datos, { headers });
    return response.data;
  } catch (error) {
    console.error("Error al finalizar la partida:", error.message);
    throw error;
  }
};
