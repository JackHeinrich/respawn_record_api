const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const routePath = "/igdb/get_game_cover";

const { getAccessToken } = require("../../util/idgbToken");

const clientId = process.env.IGDB_CLIENT_ID;

router.get("/:coverId", async (req, res) => {
  let accessToken = "";

  const coverId = req.params.coverId;

  try {
    accessToken = await getAccessToken();
  } catch (error) {
    return res.status(500).json({ message: "Failed to get IGDB token" });
  }

  const url = "https://api.igdb.com/v4/covers";

  try {
    const response = await axios({
      url,
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      data: `fields url; where id = ${coverId};`,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching game information:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router, routePath };
