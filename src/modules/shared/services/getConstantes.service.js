import {
  getPoolConnection,
  onSuccessAsObject,
  executeSafeSQL
} from '../services/dbConnection.service';
import { DB } from '../../../../env';

const DB_CONT = 'CONTABILIDAD';

const getParametroGeneral = async (parametroVarchar) => {

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    return {
      error: true,
      message: `Error en la conexión a la base de datos ${DB_CONT} en la fn: getParametroGeneral`,
      data: connection.toString()
    }
  };

  const sql = await connection.format(
    `
      SELECT 
        parametro_num
      FROM ${DB.ADMIN}.cat_parametros_generales
      WHERE eliminado = 0
      AND parametro_varchar = ?
      AND grupo = 20 -- Modulo POSTVENTA
    `, [parametroVarchar]
  );
  const result = await executeSafeSQL(
    connection,
    sql,
    {
      onSuccess: onSuccessAsObject({
        destroyIfNoData: true,
        message404: `No se encontró el parámetro general con el nombre: ${parametroVarchar}`
      }),
    }
  );
  if (!result.error) await connection.destroy();

  return result;

};

module.exports = {
  getParametroGeneral
};
