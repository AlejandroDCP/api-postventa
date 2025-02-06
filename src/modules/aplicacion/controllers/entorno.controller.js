import { DB } from '../../../../env';
import {
  getPoolConnection,
  executeSafeSQL,
  onSuccessAsArray
} from '../../shared/services/dbConnection.service';
import {
  response200, response500
} from '../../shared/services/responses.service';

const DB_CONT = 'CONTABILIDAD';

const getVariablesEntorno = async (req, res) => {

  const connection = await getPoolConnection(DB_CONT);
  if (connection instanceof Error) {
    return response500(res, {
      error: true,
      message: `Error en la conexión a la base de datos ${DB_CONT} en la fn: getVariablesEntorno`,
      data: connection.toString()
    })
  };

  const sql = await connection.format(
    `
      SELECT
        parametro_num parametroNum,
        parametro_varchar parametroVarchar
      FROM ${DB.ADMIN}.cat_parametros_generales
      WHERE eliminado = 0
      AND grupo = ?
    `, [20] // Módulo de postventa en admon_cat_modulos
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

module.exports = {
  getVariablesEntorno
};