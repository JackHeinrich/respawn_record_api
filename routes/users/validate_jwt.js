const express = require("express");
const router = express.Router();
const routePath = "/users/validate_jwt";

const { neo4jDriver } = require("../../util/neo4jdriver");

const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.use(express.json());

router.get("/", async (req, res) => {
  const session = neo4jDriver.session();

  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res.status(401).json({ message: "No token in cookies" });
  const token = req.cookies.jwt;

  let decodedUsername = "";

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    decodedUsername = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: err });
  }

  try {
    const query = `
        MATCH (n:User { username: $username })
        RETURN n
      `;
    const result = await session.run(query, { username: decodedUsername });

    if (result.records.length === 0) {
      return res.status(403).json({ message: "No user with this token" });
    }

    const foundUser = result.records[0].get("n");

    res.status(200).json({ userProps: foundUser.properties });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
