const express = require("express");
const router = express.Router();
const routePath = "/users/delete_user";

const bcrypt = require("bcrypt");
const { neo4jDriver } = require("../../util/neo4jdriver");

router.use(express.json());

const verifyJWT = require("../../util/verifyJWT");

router.use(verifyJWT);

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
      res.status(404).json({ status: "Failed", message: "User not found" });
      return;
    }

    const node = result.records[0].get("n");
    const hashedPassword = node.properties.password;

    if (await bcrypt.compare(password, hashedPassword)) {
      const deleteQuery = `
                MATCH (n:User { email: $email })
                DELETE n
            `;
      await session.run(deleteQuery, { email });
      res.status(200).json({ status: "Success" });
    } else {
      res
        .status(401)
        .json({ status: "Failed", message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
