import { integer, string } from '../../shared/rules/commons.rules';

export const schemaPostReportePartida = {
  idpvPrereporteFallasMaestro: {
    ...integer
  },
  descripcion: {
    ...string
  },
};
