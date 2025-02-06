import { response500 } from '../../shared/services/responses.service.js'
import { decodeToken } from '../../shared/services/decodeToken.service.js';

const tokenMiddleware = async (req, res, next) => {
  const { headers: { authorization } } = req;

  if (!authorization) {
    return res.status(401).json({
      error: true,
      message: 'No se ha enviado el token',
      data: null
    });
  }

  const token = authorization.substring(7);

  const decoded = decodeToken(token);
  if (decoded.error) { return response500(res, decoded); }
  if (!decoded.isValid) { return res.status(401).json(decoded); }

  const { data: tokenDecoded } = decoded;

  //Retrocompatibilidad de tokens id_user = idUsuario
  if (tokenDecoded.user.idUsuario) tokenDecoded.user.id_user = tokenDecoded.user.idUsuario;
  if (tokenDecoded.user.id_user) tokenDecoded.user.idUsuario = tokenDecoded.user.id_user;

  const { user: { externo } } = tokenDecoded;

  if (externo == undefined || externo == true) {
    return res.status(401).json({
      error: true,
      message: 'No tienes permisos para acceder a este recurso.',
      data: null
    });
  }

  req.token = tokenDecoded;
  next();
};

const tokenMiddlewareExtraNet = async (req, res, next) => {
  const { headers: { authorization } } = req;

  if (!authorization) {
    return res.status(401).json({
      error: true,
      message: 'No se ha enviado el token',
      data: null
    });
  }

  const token = authorization.substring(7);

  const decoded = decodeToken(token);
  if (decoded.error) { return response500(res, decoded); }
  if (!decoded.isValid) { return res.status(401).json(decoded); }

  const { data: tokenDecoded } = decoded;

  //Retrocompatibilidad de tokens id_user = idUsuario
  if (tokenDecoded.user.idUsuario) tokenDecoded.user.id_user = tokenDecoded.user.idUsuario;
  if (tokenDecoded.user.id_user) tokenDecoded.user.idUsuario = tokenDecoded.user.id_user;

  const { user: { externo } } = tokenDecoded;

  if (externo == undefined || externo == false) {
    return res.status(401).json({
      error: true,
      message: 'No tienes permisos para acceder a este recurso.',
      data: null
    });
  }

  req.token = tokenDecoded;
  next();
};

const tokenMiddlewareBoth = async (req, res, next) => {
  const { headers: { authorization } } = req;

  if (!authorization) {
    return res.status(401).json({
      error: true,
      message: 'No se ha enviado el token',
      data: null
    });
  }

  const token = authorization.substring(7);

  const decoded = decodeToken(token);
  if (decoded.error) { return response500(res, decoded); }
  if (!decoded.isValid) { return res.status(401).json(decoded); }

  const { data: tokenDecoded } = decoded;

  //Retrocompatibilidad de tokens id_user = idUsuario
  if (tokenDecoded.user.idUsuario) tokenDecoded.user.id_user = tokenDecoded.user.idUsuario;
  if (tokenDecoded.user.id_user) tokenDecoded.user.idUsuario = tokenDecoded.user.id_user;

  const { user: { externo } } = tokenDecoded;

  if (externo == undefined) {
    return res.status(401).json({
      error: true,
      message: 'No tienes permisos para acceder a este recurso.',
      data: null
    });
  }

  req.token = tokenDecoded;
  next();
};

module.exports = {
  tokenMiddleware,
  tokenMiddlewareExtraNet,
  tokenMiddlewareBoth
}
