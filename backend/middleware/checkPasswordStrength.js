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
  const pwd = req.body?.password;
  if (pwd == null || String(pwd).length === 0) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (schema.validate(pwd)) {
    next();
  } else {
    res.status(400).json({
      message: "Password does not meet strength requirements",
      error:
        "Password must be at least 10 characters with 2 digits, 1 uppercase, 1 lowercase, and 1 symbol (e.g. Test12!abcd).",
    });
  }
};
