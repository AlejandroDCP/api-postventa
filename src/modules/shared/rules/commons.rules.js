const inQueryOptionals = {
  in: ['query'],
  optional: true,
}

const integer = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El valor es requerido.',
  },
  isInt: {
    errorMessage: 'Debe ser un número entero.',
  },
  toInt: true,
}

const float = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El valor es requerido.',
  },
  isFloat: {
    errorMessage: 'Debe ser un número con decimales.',
  },
  toFloat: true,
}

const intParameterQueryOptional = {
  ...inQueryOptionals,
  ...integer,
}

const idSchema = {
  in: ['params'],
  ...integer,
  errorMessage: 'El id debe ser un número entero',
}

const id = {
  id: {
    ...idSchema,
  }
}

const isBool = {
  isBoolean: true,
  toBoolean: true,
  errorMessage: 'Debe ser booleano',
}

const isObject = {
  isObject: true,
  errorMessage: 'Debe de ser un objeto',
}

const string = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El valor es requerido.',
  },
}

const telefono = {
  ...string,
  isLength: {
    options: {
      min: 10,
      max: 16,
    },
    errorMessage: 'El telefono requiere una longitud entre 10 y 16 numeros',
  },
}

const busqueda = {
  busqueda: {
    ...inQueryOptionals,
    ...string,
    errorMessage: 'Debe ser una cadena de texto',
  },
}

const paginacion = {
  limit: {
    ...inQueryOptionals,
    ...integer,
    isIn: {
      options: [[10, 15, 20, 25]],
      errorMessage: 'Debe ser 10, 15, 20 o 25',
    },
    errorMessage: 'Debe ser un número entero',
  },
  pagina: {
    ...inQueryOptionals,
    ...integer,
    errorMessage: 'Debe ser un número entero',
  },
  ...busqueda
}

const date = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El valor es requerido.',
  },
  custom: {
    rtrim: { options: [' '] },
    ltrim: { options: [' '] },
    escape: true,
    notEmpty: {
      errorMessage: 'El valor es requerido.',
    },
    options: (value, { req }) => {

      const fechaISORegex = /^(?:(?:1[6-9]|[2-9]\d)?\d{2})(?:(?:(\/|-|\.)(?:0?[13578]|1[02])\1(?:31))|(?:(\/|-|\.)(?:0?[13-9]|1[0-2])\2(?:29|30)))$|^(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(\/|-|\.)0?2\3(?:29)$|^(?:(?:1[6-9]|[2-9]\d)?\d{2})(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:0?[1-9]|1\d|2[0-8])$/gm;

      const isValidFechaHora = fechaISORegex.test(value);

      if (isValidFechaHora) {
        return true
      } else {
        throw new Error("El formato de fecha no es válido, debe ser YYYY-MM-DD");
      };
    },
  }
}

const datetime = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El valor es requerido.',
  },
  custom: {
    options: (value, { req }) => {
      const fechaISORegex = /^\d{4}-\d{2}-\d{2}(?:T| )\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z)?$/;
      const isValidHora = fechaISORegex.test(value);
      if (isValidHora) {
        return true
      } else {
        throw new Error("El formato de fecha no es válido, debe ser YYYY-MM-DD HH:mm:ss");
      };
    },
  }
};

const time = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El valor es requerido.',
  },
  custom: {
    options: (value, { req }) => {

      const timeRegex = /\d{2}:\d{2}(?::\d{2})?$/;

      const isValidFechaHora = timeRegex.test(value);

      if (isValidFechaHora) {
        return true
      } else {
        throw new Error("El formato de hora no es válido, debe ser HH:mm[:ss]");
      };
    },
  }
};

const isPercentage = {
  ...float,
  custom: {
    options: (value) => {
      const str = String(value);
      const regex = /^(0(\.\d{1,2})?|1(\.00?)?)$/;
      const isValid = regex.test(str);

      if (!isValid) {
        throw new Error('El porcentaje debe ser un número décimal entre 0 y 1');
      } else {
        return isValid;
      };

    }
  }
};

const continueIfNotEmpy = {
  if: {
    options: (value) => {
      return !(value == "" || value == null || value == undefined);
    }
  }
}

const array = {
  toArray: true,
  isArray: { errorMessage: 'Debe ser un arreglo' }
}

const email = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El correo no puede estar vacio',
  },
  isEmail: {
    errorMessage: 'El correo no es valido',
  },
}

const decimal22_6 = {
  rtrim: { options: [' '] },
  ltrim: { options: [' '] },
  escape: true,
  notEmpty: {
    errorMessage: 'El valor es requerido.',
  },
  isFloat: {
    errorMessage: 'Debe ser un número con decimales.',
    options: {
      min: 0.00,
      max: 9999999999999999.999999,
    }
  },
};

const commonsSchema = {
  decimal22_6,
  array,
  time,
  date,
  datetime,
  paginacion,
  string,
  integer,
  idSchema,
  inQueryOptionals,
  intParameterQueryOptional,
  isBool,
  isObject,
  email,
  telefono,
  id,
  float,
  isPercentage,
  continueIfNotEmpy
};


module.exports = commonsSchema
