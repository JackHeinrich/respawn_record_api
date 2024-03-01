const express = require("express");
const router = express.Router();
const routePath = "/users/login";

const bcrypt = require("bcrypt");
const { neo4jDriver } = require("../../util/neo4jdriver");

const jwt = require("jsonwebtoken");

router.use(express.json());

router.post("/", async (req, res) => {
  const session = neo4jDriver.session();

  const { email, password } = req.body;

  const query = `
        MATCH (n:User { email: $email })
        RETURN n
    `;

  try {
    const result = await session.run(query, { email });

    if (result.records.length === 0) {
      res.status(200).json({ status: "Failed", message: "User not found" });
      return;
    }

    const node = result.records[0].get("n");
    const roles = node.properties.roles;
    const hashedPassword = node.properties.password;

    if (await bcrypt.compare(password, hashedPassword)) {
      const accessToken = jwt.sign(
        { username: node.properties.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
      );

      const refreshToken = jwt.sign(
        { username: node.properties.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      const setJWTQuery = `
      MATCH (n:User { email: $email })
      SET n.refreshToken = $refreshToken
      `;

      const setRefreshTokenResult = await session.run(setJWTQuery, {
        email,
        refreshToken,
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "None",
        secure: true,
      });

      res.status(200).json({
        status: "Success",
        message: "Succesfully logged in",
        accessToken: accessToken,
        roles: roles,
      });
    } else {
      res.status(200).json({
        status: "Failed",
        message: "The username or password was incorrect",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
