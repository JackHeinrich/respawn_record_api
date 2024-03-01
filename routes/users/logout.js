const express = require("express");
const router = express.Router();
const routePath = "/users/logout";

const { neo4jDriver } = require("../../util/neo4jdriver");

router.use(express.json());

router.get("/", async (req, res) => {
  // on client, also delete access token

  const session = neo4jDriver.session();

  const cookies = req.cookies;

  if (!cookies?.jwt)
    return res.status(200).json({ message: "There was no cookie" }); //No content

  const refreshToken = cookies.jwt;

  //is refreshToken in DB?
  const query = `
        MATCH (n:User { refreshToken: $refreshToken })
        RETURN n
    `;

  try {
    const result = await session.run(query, { refreshToken });

    const foundUser = result.records[0].get("n");

    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res
        .Status(200)
        .json({ message: "No user with that cookie was found" });
    }

    //delete refreshToken in db
    const tokenDeleteQuery = `
        MATCH (n:User { refreshToken: $refreshToken })
        SET n.refreshToken = ''
    `;

    await session.run(tokenDeleteQuery, { refreshToken });

    console.log(foundUser);

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true }); // secure: true
    return res.status(200).json({
      message: `Succesfully logged out of ${foundUser.properties.username}`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
