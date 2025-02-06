import bcrypt from 'bcryptjs';
import { DB } from '../../../../env';
import { getParametroGeneral } from '../../shared/services/getConstantes.service';
import {
  getPoolConnection,
  executeSafeSQL,
  onSuccessAsObject,
  onSuccessAsArray,
  onSuccessDelete,
  onSuccessUpdate,
  onFailedTransaction
} from '../../shared/services/dbConnection.service';
import {
  response200,
  response200Error,
  response500
} from '../../shared/services/responses.service';

const DB_CONT = 'CONTABILIDAD';

//! Funciones auxiliares
const getExistingUser = async (connection, correo) => {// Busca si existe un usuario con el correo ingresado

  const sql = await connection.format(
    `
      SELECT 
        id_usuarios_externos AS idUsuariosExternos,
        nombre_usuario nombreUsuario,
        correo,
        nombre,
        apellido_paterno AS apellidoPaterno,
        apellido_materno AS apellidoMaterno,
        !eliminado activo
      FROM ${DB.ADMIN}.usuarios_externos
      WHERE correo = ?
    `, [correo]
  );

  return await executeSafeSQL(
    connection,
    sql,
    {
      onSuccess: onSuccessAsObject()
    }
  );

};
const insertUser = async (connection, idUsuario, body, hashedPassword) => {// Inserta el usuario externo como inquilino

  const {
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
        correo,
        correo_unico,
        nombre,
        apellido_paterno,
        apellido_materno,
        tipo_usuario,
        creado_por
      )VALUES(?,?,?,?,?,?,?,?,?);
    `,
    [
      correo,
      hashedPassword,
      correo,
      correo,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      'INQUILINO',
      idUsuario
    ]
  );

  return await executeSafeSQL(
    connection,
    sql,
    {
      onFail: onFailedTransaction
    }
  );

};
const insertRolUser = async (connection, idUsuario, insertId, idRolInquilino) => {// Inserta la relacion del usuario con el rol de inquilino

  const sql = await connection.format(
    `
      INSERT INTO ${DB.ADMIN}.admon_usr_externos_roles_usuarios(
        id_rol,
        id_usuario,
        creado_por
      )VALUES(?,?,?)
    `, [idRolInquilino, insertId, idUsuario]
  );

  return await executeSafeSQL(
    connection,
    sql,
    {
      onFail: onFailedTransaction
    }
  );

};

//! Funciones principales

export const getInquilinos = async (req, res) => {// Enpoint para obtener todos los inquilinos

  const { token: { user: { idUsuario } } } = req;

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    return response500(res, {
      error: true,
      message: 'Error en la conexión a la base de datos en la función getInquilinos',
      data: connection.toString()
    })
  };

  const sql = await connection.format(
    `
      SELECT
        id_usuarios_externos AS idUsuariosExternos,
        nombre_usuario nombreUsuario,
        correo,
        nombre,
        apellido_paterno AS apellidoPaterno,
        apellido_materno AS apellidoMaterno,
        !eliminado activo

      FROM ${DB.ADMIN}.usuarios_externos
      WHERE tipo_usuario = 'INQUILINO'
      AND creado_por = ?
    `, [idUsuario]
  );

  const result = await executeSafeSQL(
    connection,
    sql,
    {
      onSuccess: onSuccessAsArray()
    }
  );
  if (result.error) return response500(res, result);

  await connection.destroy();

  return response200(res, result);

};
export const postInquilino = async (req, res) => {// Enpoint para crear un inquilino

  const {
    body,
    token: { user: { idUsuario } }
  } = req;

  const { correo } = body;

  // hashear contraseña y actualizar la nueva contraseña
  const salt = await bcrypt.genSalt(7);
  const hashedPassword = await bcrypt.hash(correo, salt);

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    return response500(res, {
      error: true,
      message: 'Error en la conexión a la base de datos en la función postInquilino',
      data: connection.toString()
    })
  };

  //  validar duplicidad de correo
  const obtainedOldUser = await getExistingUser(connection, correo);
  if (obtainedOldUser.error) return response500(res, obtainedOldUser);
  if (obtainedOldUser.hasData) {
    await connection.destroy();
    return response200Error(res, {
      error: true,
      message: 'Ya existe un usuario con el correo ingresado',
      data: obtainedOldUser.data
    });
  };

  // Obtener el id del rol de inquilino
  const obtainedIdRolInquilino = await getParametroGeneral('ID_ROL_INQUILINO');
  if (obtainedIdRolInquilino.error) return response500(res, obtainedIdRolInquilino);

  const idRolInquilino = obtainedIdRolInquilino.data.parametro_num;

  await connection.beginTransaction();

  // insertar usuario
  const insertedUser = await insertUser(connection, idUsuario, body, hashedPassword);
  if (insertedUser.error) return response500(res, insertedUser);

  const { data: { insertId } } = insertedUser;

  // asignarle rol de inquilino
  const insertedRol = await insertRolUser(connection, idUsuario, insertId, idRolInquilino);
  if (insertedRol.error) return response500(res, insertedRol);

  await connection.commit()
  await connection.destroy();

  return response200(res, {
    error: false,
    message: 'Se creó el inquilino correctamente',
    data: { id: insertId }
  });

};
export const getInquilinoById = async (req, res) => {// Enpoint para obtener un inquilino por id

  const { params: { id: idInquilino } } = req;

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    return response500(res, {
      error: true,
      message: 'Error en la conexión a la base de datos en la función getInquilinoById',
      data: connection.toString()
    })
  };

  const sql = await connection.format(
    `
      SELECT 
        id_usuarios_externos AS idUsuariosExternos,
        nombre_usuario nombreUsuario,
        correo,
        nombre,
        apellido_paterno AS apellidoPaterno,
        apellido_materno AS apellidoMaterno,
        !eliminado activo

      FROM ${DB.ADMIN}.usuarios_externos
      WHERE id_usuarios_externos = ?
      AND tipo_usuario = 'INQUILINO'
    `, [idInquilino]
  );

  const result = await executeSafeSQL(
    connection,
    sql,
    {
      onSuccess: onSuccessAsObject()
    }
  );
  if (result.error) return response500(res, result);

  await connection.destroy();

  return response200(res, result);

};
export const putInquilino = async (req, res) => {// Enpoint para actualizar un inquilino

  const {
    body: {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      activo
    },
    params: { id: idInquilino },
    token: { user: { idUsuario } }
  } = req;

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    return response500(res, {
      error: true,
      message: 'Error en la conexión a la base de datos en la función putInquilino',
      data: connection.toString()
    })
  };

  const sql = await connection.format(
    `
      UPDATE ${DB.ADMIN}.usuarios_externos
      SET
        nombre = ?,
        apellido_paterno = ?,
        apellido_materno = ?,
        correo = ?,
        nombre_usuario = ?,
        correo_unico = ?,
        eliminado = ?,
        editado_por = ?
      WHERE id_usuarios_externos = ?
      AND tipo_usuario = 'INQUILINO'
      AND creado_por = ?
    `, [nombre, apellidoPaterno, apellidoMaterno, correo, correo, correo, !activo, idUsuario, idInquilino, idUsuario]
  );

  const result = await executeSafeSQL(
    connection,
    sql,
    {
      onSuccess: onSuccessUpdate()
    }
  );
  if (result.error) return response500(res, result);

  await connection.destroy();

  return response200(res, result);

};
// export const deleteInquilino = async (req, res) => {// Enpoint para eliminar un inquilino //! No se elimina un inquilino, solo desactivarlo

//   const {
//     params: { id: idInquilino },
//     token: { user: { idUsuario } }
//   } = req;

//   const connection = await getPoolConnection(DB_CONT);
//   if (connection instanceof Error) {
//     return response500(res, {
//       error: true,
//       message: 'Error en la conexión a la base de datos en la función deleteInquilino',
//       data: connection.toString()
//     })
//   };
//   const sql = await connection.format(
//     `
//       UPDATE ${DB.ADMIN}.usuarios_externos
//       SET
//         eliminado = 1,
//         editado_por = ?
//       WHERE id_usuarios_externos = ?
//       AND eliminado = 0
//       AND tipo_usuario = 'INQUILINO'
//       AND creado_por = ?
//     `, [idUsuario, idInquilino, idUsuario]
//   );

//   const result = await executeSafeSQL(
//     connection,
//     sql,
//     {
//       onSuccess: onSuccessDelete()
//     }
//   );
//   if (result.error) return response500(res, result);

//   await connection.destroy();

//   return response200(res, result);

// };
