export const checkSetupKey = (req, res, next) => {
  const setupKey = req.headers["x-setup-key"];
  if (setupKey === process.env.SETUP_KEY) {
    next();
  } else {
    res.status(401).json({ message: "Invalid setup key" });
  }
};
