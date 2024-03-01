const express = require("express");
const router = express.Router();
const routePath = "/users/validate_jwt";

const { neo4jDriver } = require("../../util/neo4jdriver");

const jwt = require("jsonwebtoken");

router.use(express.json());

router.post("/", async (req, res) => {
  const session = neo4jDriver.session();

  const token = req.body.token;

  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.error("Error verifying token:", err);
      return res.status(403).json({ message: "Failed to verify token" });
    }

    const submittedUser = decoded.username;

    try {
      const query = `
        MATCH (n:User { username: $username })
        RETURN n
      `;
      const result = await session.run(query, { username: submittedUser });

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
});

module.exports = { router, routePath };
