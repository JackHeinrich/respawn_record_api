const express = require('express');
const router = express.Router();
const routePath = "/neo4j/create_game_node";

const { neo4jDriver } = require('../../util/neo4jdriver');

router.use(express.json());

router.post('/', async (req, res) => {
    const session = neo4jDriver.session();

    const {name, appid, reviews} = req.body;

    const query = `
        CREATE (n:Game { name: '${name}', appid: ${appid}, reviews: '${reviews}' })
        RETURN n
    `;

    try {
        const result = await session.run(query, { name, appid, reviews });
        const createdNode = result.records[0].get('n').properties;
        res.status(201).json({ message: 'Node created successfully', node: createdNode });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        session.close();
    }
});

module.exports = { router, routePath };
