module.exports = {

  filterBodyBlanksRecursive: async (req, res, next) => {

    const filterBlanks = (obj) => {
      const result = {};
      for (let key in obj) {
        if (typeof obj[key] === 'object') {
          if (Array.isArray(obj[key])) {
            if (typeof obj[key][0] === 'object') {
              result[key] = obj[key].map((item) => filterBlanks(item));
            } else {
              result[key] = obj[key].filter((item) => item !== null && item !== '');
            };
          } else {
            result[key] = filterBlanks(obj[key]);
          };
        } else {
          if (obj[key] !== null && obj[key] !== '') {
            result[key] = obj[key];
          };
        };
      };
      return result;
    };

    req.body = filterBlanks(req.body);
    next();
  },

  filterBodyBlanks: async ({ body: data }, res, next) => {
    const key = Object.keys(data);
    for (let i = 0; i < key.length; i++) {
      if (data[key[i]] === null || data[key[i]] === '' || data[key[i]].length === 0) {
        delete data[key[i]];
      };
    };
    next();
  },
  filterQueryBlanks: async ({ query: data }, res, next) => {
    try {
      const key = Object.keys(data);
      for (let i = 0; i < key.length; i++) {
        if (data[key[i]] === '' || data[key[i]].length === 0) {
          delete data[key[i]];
        };
      };
    } catch (error) {
      data = {};
    };
    next();
  },

  parseFormDataArray: async ({ body: data }, res, next) => {
    const key = Object.keys(data);

    for (let i = 0; i < key.length; i++) {
      if (data[key[i]] === null || data[key[i]] === '') {
        delete data[key[i]];
      } else {

        try {
          if (key[i] === 'files') {

            if (Array.isArray(data.files)) {

              data.files = data.files.map((_file) => JSON.parse(_file));

            } else {
              data.files = JSON.parse(data.files)
            };
          } else {
            data[key[i]] = JSON.parse(data[key[i]]);
          }
        } catch (error) {
          console.info(`warning:${data[key[i]]} no se pudo parsear con parseFormDataArray`)
        };
      };
    };
    next();
  },
};
