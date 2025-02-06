import path from 'path';
import { DB } from '../../../../env';
import { cleanUploadsDir } from '../../shared/services/files.service';
import {
  getPoolConnection,
  executeSafeSQL,
} from '../../shared/services/dbConnection.service';
import {
  response200,
  response200Error,
  response500
} from '../../shared/services/responses.service';

const DB_CONT = 'CONTABILIDAD';

//! Funciones principales
export const postReporteMaestro = async (req, res) => {// Endpoint para crear el agrupador de reporte maestro

  const { token: { user: { idUsuario } } } = req;

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) return response500(res, {
    error: true,
    message: `Error en la conexión a la base de datos '${DB_CONT}' en la fn: postReporteMaestro`,
    data: connection.toString()
  });

  const sql = await connection.format(
    `
      INSERT INTO ${DB.LOGISTICA}.pv_prereporte_fallas_maestro(
        creado_por
      )VALUES(?)
    `, [idUsuario]
  );

  const result = await executeSafeSQL(connection, sql);
  if (result.error) return response200Error(res, result);

  const idpvPrereporteFallasMaestro = result.data.insertId;

  await connection.destroy();

  return response200(res, {
    error: false,
    message: 'Reporte maestro creado correctamente',
    data: { idpvPrereporteFallasMaestro }
  });

};
export const postReportePartidas = async (req, res) => {// Endpoint para generar una partida de un reporte

  const {
    body: {
      idpvPrereporteFallasMaestro,
      descripcion,
    },
    files: files_,
    token: { user: { idUsuario } }
  } = req;

  const files = files_?.files ?? [];

  if (files.length === 0) {// Validación de archivos adjuntos
    cleanUploadsDir(files);
    return response200Error(res, {
      error: true,
      message: 'No se encontraron archivos adjuntos',
      data: null
    });
  };

  const file = files[0];

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    cleanUploadsDir(files);
    return response500(res, {
      error: true,
      message: `Error en la conexión a la base de datos '${DB_CONT}' en la fn: postReportePartidas`,
      data: connection.toString()
    });
  };

  const sql = await connection.format(
    `
      INSERT INTO ${DB.LOGISTICA}.pv_prereporte_fallas_detalle(
        fk_idpv_prereporte_fallas_maestro,
        descripcion,
        nombre_archivo,
        ruta_archivo,
        mimetype,
        creado_por
      )VALUES(?,?,?,?,?,?)
    `, [
    idpvPrereporteFallasMaestro,
    descripcion,
    file.originalname,
    path.join('UPLOADS', file.filename),
    file.mimetype,
    idUsuario
  ]
  );

  const result = await executeSafeSQL(connection, sql);
  if (result.error) {
    cleanUploadsDir(files);
    return response200Error(res, result);
  };

  await connection.destroy();

  return response200(res, {
    error: false,
    message: 'Partida añadida al reporte',
    data: {}
  });


};
