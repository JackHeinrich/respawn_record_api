const express = require("express");
const router = express.Router();
const routePath = "/steam/get_all_games";

const apiKey = require("../../util/steamApiKey");

router.get("/", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${apiKey}`
    );
    const data = await response.json();
    const gameList = data.applist.apps;

    res.json({ gameList });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router, routePath };
