// Inside your individual route file (e.g., routes/usersRoute.js)
const express = require('express');
const router = express.Router();
const routePath = '/users/users'; // Define your routePath here

// GET /api/users
router.get('/', (req, res) => {
    // Assuming users is an array of user objects
    const users = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Janey Smith' }];
    res.json({ users });
});

module.exports = { router, routePath };