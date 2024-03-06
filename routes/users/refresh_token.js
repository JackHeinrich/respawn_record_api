const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router();
const routePath = "/users/refresh_token";

const { neo4jDriver } = require("../../util/neo4jdriver");

const jwt = require("jsonwebtoken");

const { decodeToken } = require("../../util/decodeToken");

router.use(express.json());
router.use(cookieParser()); // Add this line to parse cookies

router.get("/", async (req, res) => {
  const session = neo4jDriver.session();

  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res.status(401).json({ message: "No refresh token in cookies." });
  const accessToken = cookies.jwt;

  try {
    const decoded = await decodeToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = decoded.username;

    const query = `
        MATCH (n:User { username: $user })
        RETURN n
    `;

    const result = await session.run(query, { user });

    if (result.records.length === 0) {
      return res.status(403).json({ message: "No user with refresh token" });
    }

    const foundUser = result.records[0].get("n");

    const refreshToken = foundUser.properties.refreshToken;

    let newAccessToken = "";

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.properties.username != decoded.username) {
          return res.status(403).json({
            message: err,
          });
        }
        newAccessToken = jwt.sign(
          { username: decoded.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1m" }
        );
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 60 * 60 * 24 * 1000,
        });
        res.status(200).json({ newAccessToken });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(403).json({ message: "Failed to decode access token" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
