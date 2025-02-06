import {
  executeSafeSQL,
  onSuccessAsArray
} from './dbConnection.service';

const pagerQuery = async ({
  connection,
  query,
  queryParams,
  page = 1,
  itemsPerPage = 10,
  offset = itemsPerPage * (page - 1),
  entityName = 'entity',
  message404 = 'No se encontraron registros'
}) => {
  const { raw: queryParamsRaw } = queryParams;
  const _raw = connection.format(` LIMIT ${itemsPerPage} OFFSET ?`, [offset]);
  const raw = queryParamsRaw ? queryParamsRaw.concat(' ', _raw) : _raw;
  const countRows = await query({
    connection,
    ...queryParams,
    columns: { 'total': 'COUNT(1)' }
  });
  if (countRows.error) { return countRows; }
  const { data: [rows] } = countRows;
  if (rows.total == 0) {
    return {
      error: false,
      message: message404,
      data: {
        paginacion: {
          total: 0,
          pagina: page,
        },
        [entityName]: []
      }
    }
  }
  const result = await query({ connection, ...queryParams, raw });
  if (result.error) { return result; }
  return {
    error: false,
    message: result.message,
    data: {
      paginacion: {
        total: parseInt(rows.total),
        pagina: parseInt(page),
        limit: parseInt(itemsPerPage)
      },
      [entityName]: result.data
    }
  }
};

module.exports = {
  pagerQuery,
  selectData: async (connection, query, limit, offset) => {
    const sql = await query.concat(' ', `LIMIT ${limit} OFFSET ${offset}`);
    return await executeSafeSQL(
      connection,
      sql,
      {
        onSuccess: onSuccessAsArray({ message404: 'No se encontró la información' }),
        onFailmessage: 'Error al obtener la información'
      }
    );
  },

  pager: async (connection, sql) => {
    try {
      const [rows] = await connection.execute(sql);
      await connection.release();
      if (rows[0].total === 0) {
        return {
          error: false,
          message: 'No se encontró información para el paginador',
          data: rows.length,
          hasData: false,
        };
      } else {
        return {
          error: false,
          message: 'ok',
          data: rows[0].total,
          hasData: true
        };
      };
    } catch (error) {
      return { error: true, message: 'Error al obtener la paginación', data: error };
    };
  },
};
