require('dotenv').config();
const neo4j = require('neo4j-driver');

async function Create() {
    /** TODO: Replace username and password with environment variables */
    const driver = neo4j.driver(
        'bolt://localhost',
         neo4j.auth.basic(`${process.env.DB_USERNAME}`, `${process.env.DB_PASSWORD}`)
    );
    const session = driver.session();
    
    try {
        await session.writeTransaction(async txc => {
            const result = await txc.run(`CREATE (n: name {name: 'Alice'}) RETURN n`);
        });
    } finally {
        console.log('Finished!');
        await session.close();
        await driver.close();
    }
}

Create();

