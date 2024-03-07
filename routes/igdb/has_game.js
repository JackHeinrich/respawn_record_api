const express = require("express");
require("dotenv").config();

const router = express.Router();
const routePath = "/igdb/has_game";

const { neo4jDriver } = require("../../util/neo4jdriver");

router.get("/:gameId", async (req, res) => {
  const session = neo4jDriver.session();
  try {
    const gameId = req.params.gameId;

    const query = `
        MATCH (g:Game { id: $gameId })
        RETURN g
      `;

    const queryResult = await session.run(query, { gameId });

    if (queryResult.records.length === 0) {
      res.status(404).json({ status: "Failed", message: "Game not found" });
      return;
    } else {
      res
        .status(200)
        .json({ status: "Success", message: "Successfully found the game" });
    }
  } catch (error) {
    console.error("Error fetching game information:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
