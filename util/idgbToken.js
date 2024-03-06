const axios = require("axios");

const clientId = process.env.IGDB_CLIENT_ID;
const clientSecret = process.env.IGDB_CLIENT_SECRET;
const grantType = "client_credentials";

const url = "https://id.twitch.tv/oauth2/token";

async function getAccessToken() {
  try {
    const response = await axios.post(url, null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: grantType,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error.response.data);
    return null;
  }
}

module.exports = { getAccessToken };
