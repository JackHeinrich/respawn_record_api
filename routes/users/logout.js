const express = require("express");
const router = express.Router();
const routePath = "/users/logout";

const cookieParser = require("cookie-parser");

const { neo4jDriver } = require("../../util/neo4jdriver");

const { decodeToken } = require("../../util/decodeToken");

router.use(cookieParser());
router.use(express.json());

router.get("/", async (req, res) => {
  // on client, also delete access token

  const session = neo4jDriver.session();

  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res.status(200).json({ message: "There was no cookie" }); //No content

  const accessToken = cookies.jwt;

  const decoded = await decodeToken(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  if (!decoded) {
    return res.status(403).json({ message: "Token could not be decoded" });
  }

  const decodedUser = decoded.username;

  try {
    // Check if refreshToken in DB
    const query = `
        MATCH (n:User { username: $decodedUser })
        SET n.refreshToken = ''
        RETURN n
      `;

    const result = await session.run(query, { decodedUser });

    if (result.records.length === 0) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res
        .status(403)
        .json({ message: "No user associated with this token" });
    }

    const foundUser = result.records[0].get("n");

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.status(200).json({
      message: `Successfully logged out of ${foundUser.properties.username}`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
