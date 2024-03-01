const express = require("express");
const router = express.Router();
const routePath = "/users/get_user";

const bcrypt = require("bcrypt");
const { neo4jDriver } = require("../../util/neo4jdriver");

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
      res.status(200).json({ status: "Failed", data: {} });
      return;
    }

    const node = result.records[0].get("n");
    const hashedPassword = node.properties.password;

    if (await bcrypt.compare(password, hashedPassword)) {
      res.status(200).json({ status: "Success", data: node.properties });
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
