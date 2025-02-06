import { DateTime } from 'luxon';

const response500 = (res, error) => {
  console.error(`[${DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')}]${JSON.stringify(error, null, 2)}`);
  return res.status(500).json(error).end();
};
const response200Error = (res, error) => {
  console.error(`[${DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')}]${JSON.stringify(error, null, 2)}`);
  return res.status(200).json(error).end();
};
const response200 = (res, data) => {
  return res.status(200).json(data).end();
};
module.exports = {
  response500,
  response200Error,
  response200,
};
