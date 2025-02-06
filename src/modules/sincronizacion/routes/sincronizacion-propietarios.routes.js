import Router from 'express';
import { checkSchema } from 'express-validator';
import { validateResult } from '../../shared/middlewares/validateHelper.middleware';
import { validateJsonHeader } from '../../shared/middlewares/headersValidator.middleware';

import {
  postSyncPropietarios
} from '../controllers/sincronizacion-propietarios.controller';
import {
  schemaPostSyncPropietarios
} from '../rules/sincronizacion-propietarios.rules';

const errorHandlers = [
  validateJsonHeader,
  validateResult,
];

const router = Router();

router.route('/I/propietarios')
  .post(checkSchema(schemaPostSyncPropietarios), errorHandlers, postSyncPropietarios);


module.exports = router;
