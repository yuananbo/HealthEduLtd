import passwordValidator from "password-validator";

const schema = new passwordValidator();
schema
  .is()
  .min(10)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .symbols();

export const checkPasswordStrength = (req, res, next) => {
  if (schema.validate(req.body.password)) {
    next();
  } else {
    res
      .status(400)
      .json({
        message: "Password does not meet strength requirements",
        error:
          "Password must be at least 10 characters long and contain at least 2 digits, 1 uppercase letter, 1 lowercase letter, and 1 symbol",
      });
  }
};
