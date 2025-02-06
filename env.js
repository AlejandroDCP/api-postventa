// Express config 
const PORT = 5015;

// Base de datos 
const DATABASE_CONFIG = {
  CONTABILIDAD: {
    HOST: '172.19.2.234',
    USER: 'biventas',
    PASSWORD: 'C4du#b1v120',
  },
  FACTURACION: {
    HOST: '172.19.2.234',
    USER: 'biventas',
    PASSWORD: 'C4du#b1v120',
  },
};
// const DATABASE_CONFIG = {
//   CONTABILIDAD: {
//     HOST: '127.0.0.1',
//     USER: 'root',
//     PASSWORD: 'T00r.249/2022',
//   },
//   FACTURACION: {
//     HOST: '127.0.0.1',
//     USER: 'root',
//     PASSWORD: 'T00r.249/2022',
//   },
// };
// const DB = {
//   LOGISTICA: 'logistica',
//   ADMIN: 'admon_db',
//   PROVEEDOR: 'admon_facturas',
// };
const DB = {
  LOGISTICA: 'admon_db',
  ADMIN: 'admon_db',
  PROVEEDOR: 'admon_db',
};

// Buckets
const BUCKETS = {
  UPLOADS: 'C:\\Users\\alejandro.delacruz\\Desktop\\archivos\\postventa\\uploads',
  // UPLOADS: '\\\\172.19.2.243\\dev_share\\postventa-api\\uploads',
};

//JWT config
const JWT_KEY_PATH = './../keys/jwtRS256.key';
const JWT_PEM_PATH = './../keys/jwtRS256.pem';


// URL de las APIs
const API = {
  // AUTH: 'http://172.19.2.101:5004/api/v1',
  AUTH: 'http://localhost:5004/api/v1',
  // EK: 'http://172.19.2.101:5005/api/v1',
  //EK: 'http://localhost:5005/api/v1',
};

module.exports = {
  // App config
  PORT,
  DATABASE_CONFIG,
  DB,
  BUCKETS,
  JWT_PEM_PATH,
  JWT_KEY_PATH,

  // Debug
  DEBUG: 1,
  DEBUG_LEVEL: 3,

  // External resources
  API,

};