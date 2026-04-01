import jwt from "jsonwebtoken";

const generateToken = (userId, userType, res) => {
  const expiresIn =
    userType === "therapist" || userType === "admin" ? "1d" : "5d";
  const maxAge =
    userType === "therapist" || userType === "admin"
      ? 1 * 24 * 60 * 60 * 1000
      : 5 * 24 * 60 * 60 * 1000;

  const token = jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
    expiresIn,
  });

  res.cookie("jwt", token, {
    maxAge,
    expires: new Date(Date.now() + maxAge),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};

export default generateToken;
