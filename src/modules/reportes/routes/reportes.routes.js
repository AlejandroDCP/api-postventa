import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Router from 'express';
import { BUCKETS } from '../../../../env';
import { checkSchema } from 'express-validator';
import { uploadHandler } from '../../shared/services/files.service';
import { validateResult } from '../../shared/middlewares/validateHelper.middleware';
import { filterBodyBlanks, parseFormDataArray } from '../../shared/middlewares/filterEmptyValues.middleware';
import { validateJsonHeader, validateMultipartFormDataHeader } from '../../shared/middlewares/headersValidator.middleware';

// Controllers
import {
  postReporteMaestro,
  postReportePartidas,
} from '../controllers/reportes.controller';

// Rules
import {
  schemaPostReportePartida,
} from '../rules/reportes.rules';

const errorHandlers = [
  validateJsonHeader,
  validateResult,
];

const router = Router();

const uploadMultert = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {

      const destinationPath = BUCKETS.UPLOADS

      // Asegurarse de que el directorio exista
      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
      };

      // Pasar la ruta de destino
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      // Nombre del archivo original
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const isAllowedMimeType = [
      'image/jpeg',
      'image/png',
      'image/*',
    ].includes(file.mimetype);

    if (!isAllowedMimeType) {
      return cb(new Error(`No se permite el tipo ${file.mimetype}`), false);
    }

    cb(null, true);
  },
}).fields([{ name: 'files' }]);

router.route('/E/reporteMaestro')
  .post(errorHandlers, postReporteMaestro);

router.route('/E/reporteMaestro/partida')
  .post(
    validateMultipartFormDataHeader,
    uploadHandler(uploadMultert),
    parseFormDataArray,
    filterBodyBlanks,
    checkSchema(schemaPostReportePartida),
    validateResult,
    postReportePartidas
  );


module.exports = router;
