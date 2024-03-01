const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router();
const routePath = "/users/refresh_token";

const { neo4jDriver } = require("../../util/neo4jdriver");

const jwt = require("jsonwebtoken");

router.use(express.json());
router.use(cookieParser()); // Add this line to parse cookies

router.get("/", async (req, res) => {
  const session = neo4jDriver.session();

  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const query = `
        MATCH (n:User { refreshToken: $refreshToken })
        RETURN n
    `;

  try {
    const result = await session.run(query, { refreshToken });

    if (result.records.length === 0) {
      res.status(403);
      return;
    }

    const foundUser = result.records[0].get("n");

    let accessToken = "";

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.properties.username != decoded.username)
          return res.sendStatus(403);
        accessToken = jwt.sign(
          { username: decoded.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1m" }
        );
      }
    );
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
