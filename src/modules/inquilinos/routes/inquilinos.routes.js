import Router from 'express';
import { checkSchema } from 'express-validator';
import { validateResult } from '../../shared/middlewares/validateHelper.middleware';
import { validateJsonHeader } from '../../shared/middlewares/headersValidator.middleware';

import {
  getInquilinos,
  postInquilino,
  getInquilinoById,
  putInquilino,
  // deleteInquilino,
} from '../controllers/inquilinos.controller';
import {
  schemaGetInquilinos,
  schemaPostInquilino,
  schemaGetInquilinoById,
  schemaPutInquilino,
  // schemaDeleteInquilino,
} from '../rules/inquilinos.rules';

const errorHandlers = [
  validateJsonHeader,
  validateResult,
];

const router = Router();

router.route('/E/gestionInquilinos')
  .get(checkSchema(schemaGetInquilinos), validateResult, getInquilinos)
  .post(checkSchema(schemaPostInquilino), errorHandlers, postInquilino);

router.route('/E/gestionInquilinos/:id')
  .get(checkSchema(schemaGetInquilinoById), validateResult, getInquilinoById)
  .put(checkSchema(schemaPutInquilino), errorHandlers, putInquilino)
// .delete(checkSchema(schemaDeleteInquilino), validateResult, deleteInquilino);

module.exports = router;
