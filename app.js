require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes');

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
