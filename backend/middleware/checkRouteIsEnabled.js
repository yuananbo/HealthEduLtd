// check if route is enabled or not from the .env ENABLE_SETUP_ROUTES=true file and return a middleware function's response accordingly
export const checkRouteIsEnabled = (req, res, next) => {
  if (process.env.ENABLE_SETUP_ROUTES === "true") {
    next();
  } else {
    res.status(401).json({ message: "Setup routes are disabled" });
  }
};
