import bcrypt from 'bcryptjs';
import { getParametroGeneral } from '../../shared/services/getConstantes.service';
import {
  response200,
  response500,
  response200Error
} from '../../shared/services/responses.service';
import {
  getPoolConnection,
  executeSafeSQL,
  onFailedContinue
} from '../../shared/services/dbConnection.service';
import { DB } from '../../../../env'

const DB_CONT = 'CONTABILIDAD';

class CustomError extends Error {// Clase de error personalizado
  constructor(message, errorDetails) {
    super(message);
    this.name = this.constructor.name;  // Nombre del error
    this.stack = (new Error()).stack;   // Poner la traza de pila
    this.errorDetails = errorDetails;   // Agregar detalles del error (objeto de error original)
  }
};


//! Funciones auxiliares
const insertPropietario = async (connection, body, hashedPassword) => {// Inserta el usuario externo como inquilino

  const {
    nombreUsuario,
    nombre,
    apellidoPaterno = '',
    apellidoMaterno = '',
    correo,
  } = body;

  const sql = await connection.format(
    `
      INSERT INTO ${DB.ADMIN}.usuarios_externos(
        nombre_usuario,
        password,
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        correo_unico,
        tipo_usuario
      )VALUES(?,?,?,?,?,?,?,?);
    `,
    [
      nombreUsuario,
      hashedPassword,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      correo,
      'PROPIETARIO',
    ]
  );

  return await executeSafeSQL(
    connection,
    sql,
    {
      onFail: onFailedContinue
    }
  );

};
const insertPropietarioRol = async (connection, insertId, idRolPropietario) => {// Inserta la relacion del usuario con el rol de inquilino

  const sql = await connection.format(
    `
      INSERT INTO ${DB.ADMIN}.admon_usr_externos_roles_usuarios(
        id_rol,
        id_usuario
      )VALUES(?,?)
    `, [idRolPropietario, insertId]
  );

  return await executeSafeSQL(
    connection,
    sql,
    {
      onFail: onFailedContinue
    }
  );

};


//! Funciones principales
export const postSyncPropietarios = async (req, res) => {

  const { body: { propietarios = [] } } = req;

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    return response500(res, {
      error: true,
      message: 'Error en la conexion a la base de datos en la fn: getSyncPropietarios',
      data: connection.toString()
    });
  };

  // Obtener el id del rol de propietario
  const obtainedIdRolPropietario = await getParametroGeneral('ID_ROL_PROPIETARIO');
  if (obtainedIdRolPropietario.error) return response500(res, obtainedIdRolPropietario);

  const idRolPropietario = obtainedIdRolPropietario.data.parametro_num;

  await connection.beginTransaction();

  const failedInsertions = [];

  for (const currentUser of propietarios) {

    const { nombreUsuario } = currentUser;

    try {

      await connection.query(`SAVEPOINT ${nombreUsuario}`);

      // hashear contraseña
      const salt = await bcrypt.genSalt(7);
      const hashedPassword = await bcrypt.hash(nombreUsuario, salt);

      // insertar en la tabla de usuarios_externos
      const insertedPropietario = await insertPropietario(connection, currentUser, hashedPassword);
      if (insertedPropietario.error) throw new CustomError('Error al insertar el propietario', insertedPropietario);

      const { insertId } = insertedPropietario.data;

      // insertar en la relacion usuarios roles
      const insertedPropietarioRol = await insertPropietarioRol(connection, insertId, idRolPropietario);
      if (insertedPropietarioRol.error) throw new CustomError('Error al insertar el rol', insertedPropietarioRol);

    } catch (error) {

      console.error(`Error procesando usuario ${nombreUsuario}: ${error.message}`);
      console.error(`Detalles del error: ${JSON.stringify(error.errorDetails)}`);

      await connection.query(`ROLLBACK TO SAVEPOINT ${nombreUsuario}`);

      failedInsertions.push({
        nombreUsuario,
        error: error.errorDetails
      });

    };

  };

  await connection.commit();
  await connection.destroy();

  return response200(res, {
    error: false,
    message: 'Sincronización de propietarios exitosa',
    data: failedInsertions
  });

};
