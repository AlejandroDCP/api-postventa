import { validationResult } from 'express-validator'

const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw()
    next()
  } catch (err) {
    const { errors } = err
    const message = errors.map((currentValue) => {
      return `el campo [${currentValue.param ?? currentValue.path}] no es valido porque "${currentValue.msg}" y el valor es "${currentValue.value}"`
    })
    return res.status(403).json({
      error: true,
      message: `Ocurrió un o varios errores en la validación de los datos, ${message.join(
        ', '
      )}}`,
      data: { errors: err.errors },
    })
  }
}

module.exports = { validateResult }
