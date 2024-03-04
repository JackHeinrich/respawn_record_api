const express = require("express");
const router = express.Router();
const routePath = "/users/validate_jwt";

const { neo4jDriver } = require("../../util/neo4jdriver");

const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.use(express.json());

const { decodeToken } = require("../../util/decodeToken");

router.get("/", async (req, res) => {
  const session = neo4jDriver.session();

  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res
      .status(401)
      .json({ status: "Invalid", message: "No token in cookies" });
  const accessToken = req.cookies.jwt;

  let accessUsername = "";

  try {
    const decodedAccess = await decodeToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    accessUsername = decodedAccess.username;
  } catch (err) {
    return res.status(403).json({ status: "Invalid", message: err });
  }

  try {
    const query = `
        MATCH (n:User { username: $accessUsername })
        RETURN n
      `;
    const result = await session.run(query, { accessUsername });

    if (result.records.length === 0) {
      return res
        .status(403)
        .json({ status: "Invalid", message: "No user with this token" });
    }

    const foundUser = result.records[0].get("n");

    const refreshToken = foundUser.properties.refreshToken;

    let refreshUser = "";

    try {
      const decodedRefresh = await decodeToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      refreshUser = decodedRefresh.username;
    } catch (err) {
      return res.status(403).json({ message: err });
    }

    if (refreshUser == accessUsername) {
      res.status(200).json({
        status: "Success",
        message: "User session is valid",
        userProps: foundUser.properties,
      });
    } else {
      res.status(401).json({
        status: "Invalid",
        message: "User's refresh token doesn't match users access token",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "Invalid", error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
