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

    const foundUser = result.records[0].get("n");
    const hashedPassword = foundUser.properties.password;

    if (await bcrypt.compare(password, hashedPassword)) {
      const accessToken = jwt.sign(
        { username: foundUser.properties.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { username: foundUser.properties.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 60 * 60 * 24 * 1000,
      });
      const setRefreshTokenQuery = `MATCH (n:User { email: $email })
            SET n.refreshToken = $refreshToken RETURN n`;

      const setRefreshTokenResult = await session.run(setRefreshTokenQuery, {
        email,
        refreshToken,
      });

      const userData = setRefreshTokenResult.records[0].get("n").properties;

      res.status(200).json({
        status: "Success",
        message: `Succesfully logged in`,
        userData: userData,
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
