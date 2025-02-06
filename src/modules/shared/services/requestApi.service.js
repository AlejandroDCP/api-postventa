import axios from 'axios';

const requestApiHandler = async ({
  method = 'GET',
  url,
  data,
  params,
  token,
  fn = 'requestApiHandler',

}) => {

  const request = {
    method,
    url,
    headers: {
      Authorization: (token.includes('Bearer')) ? token : `Bearer ${token}`,
    }
  }

  if (data) {
    request.data = data;
  } else if (params) {
    request.params = params;
  }

  try {
    const res = await axios(request);
    const { headers: { 'content-type': contentType } } = res;
    const headers = contentType.split(';').map(item => item.trim());
    if (!headers.includes('application/json')) {
      return {
        error: true,
        message: `La api de respondió con un content-type no válido: ${res.headers['content-type']}, en la función: ${fn}`,
        data: {},
      }
    }
    const { data: response } = res;
    const { error, message, data } = response;
    if (error == undefined && message == undefined && data == undefined) {
      return {
        error: true,
        message: `La api respondió con un json incorrecto, en la función: ${fn}`,
        data: response,
      }
    }
    return response;
  } catch (error) {
    const { response } = error;
    if (response != undefined) {
      const { status, data } = response;
      data.message = `La api respondió con un error, en la función: ${fn}, con el mensaje: ${data.message}`
      return {
        error: true,
        message: data.message,
        data: {
          status,
          data
        }
      }
    } else {
      return {
        error: true,
        message: `Fallo al hacer la peticion a la api, en la función: ${fn}`,
        data: error.toString()
      };
    }
  }
};

module.exports = { requestApiHandler };
