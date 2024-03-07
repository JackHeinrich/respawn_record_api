const express = require("express");
const router = express.Router();
const routePath = "/neo4j/create_played_relationship";

const { neo4jDriver } = require("../../util/neo4jdriver");

router.use(express.json());

router.post("/", async (req, res) => {
  const session = neo4jDriver.session();

  const { gameId, username } = req.body;

  const query = `
    MATCH (u:User { username: $username }), (g:Game { id: $gameId })
    MERGE (u)-[:HAS_PLAYED]->(g)
    RETURN u, g
  `;

  try {
    const result = await session.run(query, {
      username,
      gameId: gameId.toString(),
    });

    if (result.records.length === 0) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Couldn't find user or game" });
    }

    const user = result.records[0].get("u").properties;
    const game = result.records[0].get("g").properties;
    res.status(201).json({
      message: "Relationship created successfully",
      user: user,
      game: game,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
