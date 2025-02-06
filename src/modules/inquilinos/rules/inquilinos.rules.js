import { email, idSchema, isBool, string } from '../../shared/rules/commons.rules';

const baseSchema = {
  nombre: {
    ...string
  },
  apellidoPaterno: {
    ...string
  },
  apellidoMaterno: {
    ...string
  },
  correo: {
    ...email
  },
};

export const schemaGetInquilinos = {};

export const schemaPostInquilino = { ...baseSchema };

export const schemaGetInquilinoById = {
  id: {
    ...idSchema
  }
};

export const schemaPutInquilino = {
  id: {
    ...idSchema,
  },
  activo: {
    ...isBool
  },
  ...baseSchema
};

export const schemaDeleteInquilino = {
  id: {
    ...idSchema
  }
};
