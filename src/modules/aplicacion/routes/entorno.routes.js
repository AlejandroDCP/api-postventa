import Router from 'express';

// Controllers
import { getVariablesEntorno } from '../controllers/entorno.controller';

const router = Router();

router.route('/I/entorno').get(getVariablesEntorno)

module.exports = router;
