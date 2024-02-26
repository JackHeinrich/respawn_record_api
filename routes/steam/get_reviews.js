const express = require('express');
const router = express.Router();
const routePath = "/steam/get_reviews";

const apiKey = require("../../util/steamApiKey")

router.get('/:gameId', async (req, res) => {
    const gameId = req.params.gameId;

    try {
        const response = await fetch(`https://store.steampowered.com/appreviews/${gameId}?json=1&cursor=*`);
        const data = await response.json()
        res.json({ reviews: data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = { router, routePath };
