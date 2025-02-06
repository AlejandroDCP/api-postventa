import fs from "fs";
import path from "path";
import multer from "multer";
import { BUCKETS as buckets } from "../../../../env";
import mime from "mime-types";

/**
 * Función para generar el nombre del archivo
 * @param {*} id Identificador único
 * @param {*} mimetype Mimetype del archivo (Ejemplo: image/png)
 * @returns 
 */
const generateFileName = (id, mimetype) => {
  return `${id}_${Date.now()}.${mime.extension(mimetype)}`;
};

/**
 * Función para mover un archivo de una ubicación a otra
 * @param {*} object
  * @param {*} object.filePath Ubicación del archivo
  * @param {*} object.destinationPath Ruta de destino
  * @param {*} object.destBucket Alias del bucket
 * @returns 
 */
const saveFile = ({ filePath, destinationPath, destBucket }) => {
  const bucket = buckets[destBucket];
  if (bucket === undefined) {
    return {
      error: true,
      data: "El bucket no existe",
    };
  }

  // Si el bucket no existe, se crea de forma recursiva
  if (!fs.existsSync(bucket)) {
    fs.mkdirSync(bucket, { recursive: true });
  }

  const destination = path.join(bucket, destinationPath);

  // Si el directorio no existe, se crea de forma recursiva
  path.dirname(destination).split(path.sep).reduce((prev, curr) => {
    const currentPath = prev + path.sep + curr;
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  }
  );

  try {
    const fileBuffer = fs.readFileSync(filePath);
    fs.existsSync(destination) && fs.unlinkSync(destination);
    fs.writeFileSync(destination, fileBuffer);
    return { error: false, message: 'ok', data: path.join(destBucket, destinationPath) };
  } catch (error) {
    return {
      error: true,
      message: 'Error al guardar el archivo en la funcion saveFile',
      data: error,
    };
  }
};

/**
 * Función para mover y guardar un archivo de una ubicación a otra
 * @param {*} object
  * @param {*} object.file Objeto del archivo
  * @param {*} object.savePath Alias del bucket
  * @param {*} object.filename Ruta de destino / Nombre del archivo si se guardara en la raiz
 * @returns 
 */
const mvUpload = (file, savePath, fileName) => {
  return saveFile({
    filePath: file.fullPath,
    destinationPath: `${fileName}`,
    destBucket: savePath,
  });
};

/**
 * Función para manejar la subida de archivos
 * @param {*} uploadMultert Objeto de configuración de multer
 * @returns 
 */
const uploadHandler = (uploadMultert) => {
  return (req, res, next) => {
    const errorHandler = (error) => {
      if (error instanceof multer.MulterError) {
        console.error(error);
        return res
          .status(500)
          .json({
            error: true,
            message: 'Ocurrió un error al procesar el archivo',
            data: error.code,
          });
      } else if (error) {
        return res
          .status(403)
          .json({ error: true, message: error.message, data: null });
      }
      next();
    };
    uploadMultert(req, res, errorHandler);
  };
};

/**
  * Función para validar la presencia de un archivo
  * @param {*} req Objeto de la petición
  * @param {*} res Objeto de la respuesta
  * @param {*} next Función para continuar con el siguiente middleware
  * @returns 
  */
const validateFilePresence = (req, res, next) => {
  const { file } = req;
  const existFile = file && file.path && file.filename;

  if (!existFile) {
    return res.status(403).json({
      error: true,
      message: 'Ocurrio un o varios errores en la validacion de los datos, el campo [fingerPrint] no es valido porque "No existe" y el valor es "undefined"}',
      data: {
        errors: [{
          "msg": "No existe",
          "param": "fingerPrint",
          "location": "file"
        }]
      }
    });
  }
  next();
};

/**
 * Función para purgar la carpeta de uploads
 * @param {*} files Array de archivos
 * @returns 
 */
const cleanUploadsDir = async (files) => {

  //eliminar los arhivos del arreglo de files d ela carpeta uploads
  for (let i = 0; i < files.length; i++) {
    fs.unlinkSync(files[i].path);
  };

  return {
    error: false,
    message: 'Se limpió la carpeta de uploads correctamente',
    data: {}
  };

};

module.exports = {
  saveFile,
  generateFileName,
  mvUpload,
  uploadHandler,
  validateFilePresence,
  cleanUploadsDir
};
