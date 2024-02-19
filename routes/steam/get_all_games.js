const express = require('express');
const router = express.Router();
const routePath = "/steam/get_all_games"

router.get('/', async (req, res) => {
    const apiKey = process.env.STEAM_API_KEY;

    try {
        const response = await fetch(`https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${apiKey}`);
        const data = await response.json();
        const gameList = data.applist.apps;

        res.json({ gameList });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { router, routePath };