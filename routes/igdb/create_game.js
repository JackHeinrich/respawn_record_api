const express = require("express");
const router = express.Router();
const routePath = "/igdb/create_game";

const { neo4jDriver } = require("../../util/neo4jdriver");

router.use(express.json());

router.post("/", async (req, res) => {
  const session = neo4jDriver.session();

  const { name, id, summary } = req.body;

  try {
    const query = `
            CREATE (n:Game { name: $name, id: $id, summary: $summary })
            RETURN n
        `;

    const result = await session.run(query, {
      name,
      id: id.toString(),
      summary,
    }); // Use query parameterization

    if (result.summary.counters.containsUpdates()) {
      res.status(200).json({
        status: "Success",
        game_details: {
          name: name,
          id: id,
          summary: summary,
        },
        message: "Game created succesfully",
      });
    } else {
      res
        .status(401)
        .json({ status: "Failed", message: "Game already existed in DB" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    session.close();
  }
});

module.exports = { router, routePath };
