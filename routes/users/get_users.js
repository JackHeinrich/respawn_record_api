const express = require('express');
const router = express.Router();
const routePath = "/users/get_users";

const { neo4jDriver } = require('../../util/neo4jdriver');

router.use(express.json());

router.get('/', async (req, res) => {
    const session = neo4jDriver.session();

    const query = `
        MATCH (n:User)
        RETURN n
    `;

    try {
        const result = await session.run(query);

        if (result.records.length === 0) {
            res.status(404).json({ error: 'No active users' });
            return;
        }

        const users = result.records.map(record => record.get('n').properties);

        res.status(200).json({ message: 'Successfully retrieved users', users: users });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        session.close();
    }
});

module.exports = { router, routePath };
