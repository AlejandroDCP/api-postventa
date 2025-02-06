import { array, email, isObject, string } from '../../shared/rules/commons.rules';

export const schemaPostSyncPropietarios = {
  propietarios: {
    isArray: {
      errorMessage: 'Debe ser un arreglo',
    },
  },
  "propietarios.*": {
    ...isObject
  },
  "propietarios.*.nombreUsuario": {
    ...string
  },
  "propietarios.*.nombre": {
    ...string
  },
  "propietarios.*.apellidoPaterno": {
    ...string
  },
  "propietarios.*.apellidoMaterno": {
    ...string
  },
  "propietarios.*.correo": {
    ...email
  },
};
