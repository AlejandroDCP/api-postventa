import mysql from 'mysql2/promise'
import { DATABASE_CONFIG } from '../../../../env.js'

const getConnection = (key = null, extraOptions = {}) => {

  const isValidConnection = Object.prototype.hasOwnProperty.call(DATABASE_CONFIG, key);
  if (!isValidConnection) throw new Error(`La conexión ${key} no existe en el archivo de configuración`);

  const { [key]: { HOST, USER, PASSWORD } } = DATABASE_CONFIG;

  return mysql.createPool({ host: HOST, user: USER, password: PASSWORD, ...extraOptions });

};

const getPoolConnection = async (key = null, extraOptions = {}) => {
  try {
    const pool = getConnection(key, extraOptions)
    return await pool.getConnection()
  } catch (error) {
    return error
  };
};

const onSuccessAsArray = (params = {}) => {
  const {
    message404 = 'No se encontraron datos',
    destroyIfNoData = false
  } = params;
  return async (connection, rows, message = 'Consulta exitosa') => {
    await connection.release()
    if (rows?.length === 0) {
      if (destroyIfNoData == true) { await connection.destroy() }
      return {
        error: destroyIfNoData,
        message: message404,
        data: [],
        hasData: false
      };
    };
    return {
      error: false,
      message: message,
      data: rows,
      hasData: true
    };
  };
};
const onSuccessAsObject = (params = {}) => {
  const {
    message404 = 'No se encontraron datos',
    destroyIfNoData = false
  } = params;
  return async (connection, rows, message = 'Consulta exitosa') => {
    await connection.release();
    if (rows.length === 0) {
      if (destroyIfNoData == true) { await connection.destroy() }
      return {
        error: destroyIfNoData,
        message: message404,
        data: {},
        hasData: false
      }
    };
    return {
      error: false,
      message: message,
      data: rows[0],
      hasData: true
    };
  };
};

const onSuccessUpdate = (messages = {}) => {
  const {
    updateMessage = 'Se actualizó con éxito',
    noChangedMessage = 'No había nada que actualizar',
    notFound = 'No se encontró nada para actualizar'
  } = messages;

  return async (connection, rows, message) => {
    await connection.release();
    const { affectedRows, changedRows } = rows;
    if (affectedRows === 1) {
      if (changedRows === 1) {
        return {
          error: false,
          message: updateMessage ?? message,
          data: [],
          hasData: true, // se enconto
          hasChanged: true,  // se modifico 
        };
      } else {
        return {
          error: false,
          message: noChangedMessage,
          data: [],
          hasData: true,
          hasChanged: false,
        };
      };
    } else {
      return {
        error: false,
        message: notFound,
        data: [],
        hasData: false,
        hasChanged: false,
      };
    };
  };
};
const onSuccessMultipleUpdate = (messages = {}) => {
  const {
    updateMessage = 'Se actualizó con éxito',
    noChangedMessage = 'No había nada que actualizar',
    notFound = 'No se encontró nada para actualizar'
  } = messages;

  return async (connection, rows, message) => {
    await connection.release();
    const { affectedRows, changedRows } = rows;
    if (affectedRows >= 1) {
      if (changedRows >= 1) {
        return {
          error: false,
          message: updateMessage ?? message,
          data: [],
          hasData: true, // se enconto
          hasChanged: true,  // se modifico 
        };
      } else {
        return {
          error: false,
          message: noChangedMessage,
          data: [],
          hasData: true,
          hasChanged: false,
        };
      };
    } else {
      return {
        error: false,
        message: notFound,
        data: [],
        hasData: false,
        hasChanged: false,
      };
    };
  };
};

const onSuccessDelete = (messages = {}) => {

  const {
    DeleteMessage = 'Se eliminó con éxito',
    notFound = 'No se encontró nada para eliminar'
  } = messages;

  return async (connection, rows, message = DeleteMessage) => {
    await connection.release();
    const { affectedRows, changedRows } = rows
    if (affectedRows === 1) {
      if (changedRows === 1) {
        return {
          error: false,
          message,
          data: [],
          hasData: true,
        };
      } else {
        return {
          error: false,
          message: notFound,
          data: [],
          hasData: false,
        };
      };
    } else {
      return {
        error: false,
        message: notFound,
        data: [],
        hasData: false,
      };
    };
  };
};
const onSuccessDeleteMultiple = (messages = {}) => {

  const {
    deleteMessage = 'Se eliminó con éxito',
    notFound = 'No se encontró nada para eliminar'
  } = messages;

  return async (connection, rows, message = deleteMessage) => {
    await connection.release();
    const { affectedRows, changedRows } = rows
    if (affectedRows >= 1) {
      if (changedRows >= 1) {
        return {
          error: false,
          message,
          data: [],
          hasData: true,
        };
      } else {
        return {
          error: false,
          message: notFound,
          data: [],
          hasData: false,
        };
      };
    } else {
      return {
        error: false,
        message: notFound,
        data: [],
        hasData: false,
      };
    };
  };
};
const onFailedTransaction = async (
  connection,
  error,
  message = 'Error en la consulta, se ha realizado un rollback'
) => {
  await connection.rollback();
  await connection.release();
  await connection.destroy();
  const { code, errno, sqlMessage } = error
  if (!(code, errno, sqlMessage)) {
    return {
      error: true,
      message,
      data: error.toString()
    }
  } else {
    return {
      error: true,
      message,
      data: {
        code,
        errno,
        sqlMessage,
      }
    }
  }
};

const onFailedContinue = async (
  connection,
  error,
  message = 'Error en la consulta, pero se ha continuado con el proceso'
) => {

  await connection.release();

  const { code, errno, sqlMessage } = error
  if (!(code, errno, sqlMessage)) {
    return {
      error: true,
      message,
      data: error.toString()
    }
  } else {
    return {
      error: true,
      message,
      data: {
        code,
        errno,
        sqlMessage,
      }
    }
  }
};

const executeSafeSQL = async (connection, sqlQuery, options = {}) => {
  const {
    onSuccess = async (connection, rows, message = 'Consulta exitosa') => {
      await connection.release()
      return {
        error: false,
        message,
        data: rows,
      }
    },
    onFail = async (
      connection,
      error,
      message = 'Error en la consulta'
    ) => {
      await connection.release();
      await connection.destroy();
      const { code, errno, sqlMessage } = error
      if (!(code, errno, sqlMessage)) {
        return {
          error: true,
          message,
          data: error.toString()
        }
      } else {
        return {
          error: true,
          message,
          data: {
            code,
            errno,
            sqlMessage,
          }
        }
      }
    },
    onSuccessMessage = 'Consulta exitosa',
    onFailmessage = 'Error en la consulta',
    params = [],
  } = options
  await connection.execute("set TIME_ZONE = 'America/Cancun'")
  try {
    if (params.length > 0) {
      const [rows] = await connection.execute(sqlQuery, params)
      return await onSuccess(connection, rows, onSuccessMessage)
    } else {
      const [rows] = await connection.execute(sqlQuery)
      return await onSuccess(connection, rows, onSuccessMessage)
    }
  } catch (error) {
    console.error(sqlQuery);
    console.error(error);
    return await onFail(connection, error, onFailmessage)
  }
}

const releaseConnectionRollback = async ({ connection, data }) => {
  await connection.rollback();
  await connection.release();
  await connection.destroy();
  return data ?? {
    error: true,
    message: 'A ocurrido un error, se ha realizado un rollback',
    data: null
  }
}

const onSuccessAsMap = ({
  message404 = 'No se encontraron datos',
  key,
  value,
}) => {
  return async (connection, rows, message = 'Consulta exitosa') => {
    await connection.release()
    if (rows?.length === 0) {
      return {
        error: false,
        message: message404,
        data: new Map(),
        hasData: false
      };
    };
    const map = new Map()

    if (!Object.prototype.hasOwnProperty.call(rows[0], key)) {
      return {
        error: true,
        message: `La columna ${key} no existe en el resultado de la consulta`,
        data: null,
        hasData: false
      }
    }
    if (!Object.prototype.hasOwnProperty.call(rows[0], value)) {
      return {
        error: true,
        message: `La columna ${value} no existe en el resultado de la consulta`,
        data: null,
        hasData: false
      }
    }

    if (value === key) {
      return {
        error: true,
        message: `La columna ${value} no puede ser igual a la columna ${key}`,
        data: null,
        hasData: false
      }
    }

    if (rows[0][key] === null) {
      return {
        error: true,
        message: `La columna ${key} no puede ser nula`,
        data: null,
        hasData: false
      }
    }

    if (rows[0][value] === null) {
      return {
        error: true,
        message: `La columna ${value} no puede ser nula`,
        data: null,
        hasData: false
      }
    }

    rows.forEach(row => {
      map.set(row[key], row[value])
    })

    return {
      error: false,
      message: message,
      data: map,
      hasData: true
    };
  };
};

const onSuccessInsert = (params = {}) => {
  const {
    id,
    errorMesage = 'No se pudo insertar',
    successMessage = 'Se insertó con éxito'
  } = params;
  return async (connection, rows, message) => {
    await connection.release()
    if (rows?.affectedRows === 1) {
      return {
        error: false,
        message: successMessage ?? message,
        data: id ? { [id]: rows.insertId } : null,
        hasData: true
      };
    } else {
      return {
        error: true,
        message: errorMesage,
        data: null,
        hasData: false
      };
    };
  }

};

const validateDBConnections = async () => {

  console.info('Validating DB connections...');
  const keys = Object.keys(DATABASE_CONFIG);

  for (const key of keys) {
    const connection = await getPoolConnection(key);
    if (connection instanceof Error) {
      console.error(`[${key}] Connection failed. ` + connection.toString());
      continue;
    };
    console.info(`[${key}] Connection succeded`);
    await connection.destroy();
  };

  return;

};

module.exports = {
  getPoolConnection,
  getConnection,
  executeSafeSQL,
  onSuccessAsObject,
  onSuccessAsArray,
  onSuccessUpdate,
  onSuccessDelete,
  onFailedTransaction,
  onFailedContinue,
  releaseConnectionRollback,
  onSuccessAsMap,
  onSuccessInsert,
  onSuccessMultipleUpdate,
  validateDBConnections,
  onSuccessDeleteMultiple,
};
