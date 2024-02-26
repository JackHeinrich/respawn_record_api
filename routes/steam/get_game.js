const express = require('express');
const router = express.Router();
const routePath = "/steam/get_game";

const SteamStore = require('steam-store');

router.get('/:gameId', async (req, res) => {
    const apiKey = process.env.STEAM_API_KEY;
    const gameId = req.params.gameId;

    const store = new SteamStore({
        country:  'DE',
        language: 'en'
    });

    store.apiKey = apiKey;

    try {
        const data = await store.steam('appDetails', gameId);
        res.json({ gameData: data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { router, routePath };
