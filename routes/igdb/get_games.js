const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const routePath = "/igdb/get_games";

const { getAccessToken } = require("../../util/idgbToken");

const clientId = process.env.IGDB_CLIENT_ID;

router.get("/:gameName", async (req, res) => {
  let accessToken = "";

  const gameName = req.params.gameName.toString();

  try {
    accessToken = await getAccessToken();
  } catch (error) {
    return res.status(500).json({ message: "Failed to get IGDB token" });
  }

  const url = "https://api.igdb.com/v4/games";

  try {
    const response = await axios({
      url,
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      data: `fields *; where category != (1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14); search "${gameName}";`,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching game information:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router, routePath };
