import hpp from 'hpp'
import path from 'path'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import express from 'express'
import { PORT, DEBUG, DEBUG_LEVEL } from './../env'
import { routeGenerator } from './modules/shared/services/routeGenerator.service.js'
import { validateDBConnections } from './modules/shared/services/dbConnection.service.js'
import {
  tokenMiddleware,
  tokenMiddlewareExtraNet,
  tokenMiddlewareBoth,
} from './modules/shared/middlewares/autenticacion.middleware.js';
import { filterBodyBlanks, filterQueryBlanks } from './modules/shared/middlewares/filterEmptyValues.middleware.js';

const app = express()
/** CONFIG SERVER */
app.set('port', PORT || 5015)
app.use(express.json({ limit: '300mb' }))
app.use(express.static(path.join(__dirname, '../public')))
// app.use(express.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))

//Security
app.use(cors())
app.use(hpp())
app.use(helmet())
app.disable('x-powered-by')

const _DEBUG = DEBUG ?? process.env.DEBUG ?? 0;
if (_DEBUG == 1) {
  console.info('🔊 DEBUG MODE ON');
  app.use(morgan('dev'))
  const _DEBUG_LEVEL = DEBUG_LEVEL ?? process.env.DEBUG_LEVEL ?? 1;
  const vervoseLog = (json) => {
    console.info(json);
  };
  app.use((req, res, next) => {
    if (_DEBUG_LEVEL == 1) {// request 
      console.info('💬>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      const { query, params, body } = req;
      vervoseLog({ query, params, body });
      console.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<💬');

    } else if (_DEBUG_LEVEL == 2) {// response
      console.info('💬>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      const resJson = res.json;
      res.json = function (json) {
        vervoseLog(json);
        const result = resJson.apply(res, arguments);
        console.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<💬');
        return result;
      };

    } else if (_DEBUG_LEVEL == 3) {// request, response
      console.info('💬>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      const { query, params, body } = req;
      vervoseLog({ query, params, body });
      const resJson = res.json;
      res.json = function (json) {
        vervoseLog(json);
        const result = resJson.apply(res, arguments);
        console.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<💬');
        return result;
      };

    } else { // no valido
      vervoseLog(`DEBUG_LEVEL: ${_DEBUG_LEVEL} no es valido`);
    }
    next();
  });
}

app.use(morgan('dev'));

/** ROUTES */
const apiVersion = '/api/v1';

app.all('/api/v1/*', filterQueryBlanks, filterBodyBlanks);

// Set de autenticación dinámica para todas las rutas
app.all('/api/v1/*/E/*', tokenMiddlewareExtraNet);
app.all('/api/v1/*/I/*', tokenMiddleware);
app.all('/api/v1/*/A/*', tokenMiddlewareBoth);

const routes = routeGenerator(path.join(__dirname, 'modules'), apiVersion);
routes.forEach(({ module, path }) => {
  app.use(module, require(path))
})

app.all('*', function (req, res) {
  return res.status(404).json({
    error: true,
    message:
      "🖐️ These Aren't the 🤖Droids You're Looking For, La ruta no existe",
    data: { method: req.method, url: req.originalUrl, api: 'posptventa-api' },
  })
})

app.listen(app.get('port'), () =>
  console.info(`Server on port ${app.get('port')}`)
);

validateDBConnections();
