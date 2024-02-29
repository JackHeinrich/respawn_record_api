const express = require('express');
const router = express.Router();
const routePath = "/users/create_user";

const bcrypt = require('bcrypt');
const { neo4jDriver } = require('../../util/neo4jdriver');

router.use(express.json());

router.post('/', async (req, res) => {
    const session = neo4jDriver.session();

    const { email, username, password } = req.body;

    try {
        const existingUserQuery = `
            MATCH (n:User { email: '${email}' })
            RETURN n
        `;

        const existingUserResult = await session.run(existingUserQuery, { email });

        if (existingUserResult.records.length > 0) {
            res.status(200).json({ status: 'Failed', message: 'A user with that email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Use bcrypt.hash with a saltRounds value

        const query = `
            CREATE (n:User { email: '${email}', username: '${username}', password: '${hashedPassword}' })
            RETURN n
        `;

        const result = await session.run(query, { email, username, password: hashedPassword }); // Use query parameterization

        if (result.summary.counters.containsUpdates()) {
            res.status(200).json({ status: 'Success', account_details: {email: email, username: username, password: hashedPassword}, message: 'Account created succesfully' });
        } else {
            res.status(401).json({ status: 'Failed', message: 'Unknown error'});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        session.close();
    }
});

module.exports = { router, routePath };
