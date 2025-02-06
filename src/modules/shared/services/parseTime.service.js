import { DateTime } from "luxon";

const dateParser = (dateInput, outputFormat = 'yyyy-MM-dd') => {

  try {

    let dateTime;

    // Verificar el tipo de dateInput y crear un objeto DateTime correspondiente
    if (typeof dateInput === 'string') {
      // Intentar parsear como ISO 8601
      dateTime = DateTime.fromISO(dateInput, { zone: 'utc' });
      if (!dateTime.isValid) {
        // Intentar parsear como formato 'yyyy-MM-dd HH:mm:ss'
        dateTime = DateTime.fromFormat(dateInput, 'yyyy-MM-dd HH:mm:ss', { zone: 'utc' });
        if (!dateTime.isValid) {
          // Intentar parsear como formato 'yyyy-MM-dd'
          dateTime = DateTime.fromFormat(dateInput, 'yyyy-MM-dd', { zone: 'utc' });
          if (!dateTime.isValid) {
            // Intentar parsear como RFC 2822
            dateTime = DateTime.fromRFC2822(dateInput, { zone: 'utc' });
            if (!dateTime.isValid) {
              // Intentar parsear como timestamp
              let timestamp = parseFloat(dateInput);
              if (!isNaN(timestamp)) {
                if (dateInput.includes('.')) {
                  // Timestamp con decimales (en segundos)
                  dateTime = DateTime.fromMillis(timestamp * 1000, { zone: 'utc' });
                } else if (dateInput.length === 10) {
                  // Unix timestamp (en segundos)
                  dateTime = DateTime.fromSeconds(timestamp, { zone: 'utc' });
                } else {
                  // Milisegundos
                  dateTime = DateTime.fromMillis(timestamp, { zone: 'utc' });
                }
              }
            }
          }
        }
      }
    } else if (typeof dateInput === 'number') {
      // Verificar si es Unix timestamp (en segundos) o millis (en milisegundos)
      if (dateInput.toString().includes('.')) {
        // Timestamp con decimales (en segundos)
        dateTime = DateTime.fromMillis(dateInput * 1000, { zone: 'utc' });
      } else if (dateInput.toString().length === 10) {
        // Unix timestamp (en segundos)
        dateTime = DateTime.fromSeconds(dateInput, { zone: 'utc' });
      } else {
        // Milisegundos
        dateTime = DateTime.fromMillis(dateInput, { zone: 'utc' });
      }
    } else if (dateInput instanceof Date) {
      dateTime = DateTime.fromJSDate(dateInput, { zone: 'utc' });
    } else {
      throw new Error('Formato de fecha no soportado');
    };

    if (!dateTime.isValid) {
      throw new Error('Fecha inválida');
    };

    // Devolver la fecha en el formato deseado
    return {
      error: false,
      message: 'Fecha parseada correctamente',
      data: dateTime.setLocale('es').toFormat(outputFormat)
    }

  } catch (error) {

    // console.error(`Ocurrió un error al parsear la fecha: ${dateInput}`, error);

    return {
      error: true,
      message: `Ocurrió un error al parsear la fecha: ${dateInput}`,
      data: error.toString()
    }
  }
};

const parseHoursMinutes2Decimal = (tiempo) => {

  const partesTiempo = tiempo.split(':');

  const hours = parseInt(partesTiempo[0], 10);
  const minutes = parseInt(partesTiempo[1], 10);

  return +(hours + minutes / 60).toFixed(2);

};

const parseDecimal2HoursMinutes = (decimal) => {

  let hours = Math.floor(decimal);

  let minutes = Math.round((decimal - hours) * 60);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Manejar caso de segundos o minutos mayores a 59
  if (minutes === 60) {
    minutes = '00';
    hours++;
  }

  return hours + ':' + minutes;
};

const parseHoursMinutesSeconds2Decimal = (tiempo) => {

  // Dividir el tiempo en horas, minutos y segundos
  const partesTiempo = tiempo.split(':');

  // Obtener las horas, minutos y segundos
  const horas = parseInt(partesTiempo[0], 10);
  const minutos = parseInt(partesTiempo[1], 10);
  const segundos = parseInt(partesTiempo[2], 10);

  // Calcular el tiempo en formato decimal
  const tiempoDecimal = (horas + minutos / 60 + segundos / 3600).toFixed(5)

  return tiempoDecimal;
};

const parseDecimal2HoursMinutesSeconds = (decimal) => {

  // Obtener las horas enteras
  let horas = Math.floor(decimal);

  // Calcular los minutos y segundos
  let minutosDecimales = (decimal - horas) * 60;
  let minutos = Math.floor(minutosDecimales);
  let segundos = Math.round((minutosDecimales - minutos) * 60);

  // Manejar caso de segundos o minutos mayores a 59
  if (segundos === 60) {
    segundos = 0;
    minutos++;
  }
  if (minutos === 60) {
    minutos = 0;
    horas++;
  }

  horas = horas < 10 ? '0' + horas : horas;
  minutos = minutos < 10 ? '0' + minutos : minutos;
  segundos = segundos < 10 ? '0' + segundos : segundos;

  // Formatear el resultado
  return `${horas}:${minutos}:${segundos}`;

};

module.exports = {
  parseDecimal2HoursMinutes,
  parseHoursMinutes2Decimal,
  parseHoursMinutesSeconds2Decimal,
  parseDecimal2HoursMinutesSeconds,
  dateParser,
};
