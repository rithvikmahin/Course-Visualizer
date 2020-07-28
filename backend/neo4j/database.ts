require('dotenv').config();
const courses =  require('./json/Courses.json');
const neo4j = require('neo4j-driver');

/**
 * Fills the Neo4j database with course values from the JSON file.
 */
async function Populate() {
    const driver = neo4j.driver(
        'bolt://localhost',
         neo4j.auth.basic(`${process.env.DB_USERNAME}`, `${process.env.DB_PASSWORD}`)
    );
    const session = driver.session();
    
    try {
        await session.writeTransaction(async txc => {
            for (const course in courses) {
                // Removes numbers from the course name.
                const subject = course.replace(/[0-9]/g, '');
                // Removes letters from the course name.
                const courseNumber = course.toLowerCase().replace(/['a-z']/g, '');
                const name = courses[course]['name'];
                const credits = courses[course]['credits'];
                const description = courses[course]['description'];
                // A query that checks if the node exists in the database.
                const courseNode = await txc.run(`MATCH (node: ${subject}) WHERE node.number = ${courseNumber} RETURN node`);

                if (courseNode.records.length == 0) {
                    /** TODO: Description only works if it is in double quotes */
                    const createCourseNode = await txc.run(`CREATE (node: CS {number: ${courseNumber}, name: '${name}', 
                    credits: '${credits}', description: "${description}"}) RETURN node `);
                }

                for (const requirements in courses[course]['prerequisite']) {
                    for (const required_course of courses[course]['prerequisite'][requirements]) {
                        /** Removes junk course names that are not in the standard format. */
                        /** TODO:  Remove Concurrent Registration or save it in another format. remove length > 8 */
                        const regex_filter = new RegExp('[A-Z]{2,5}\\d{2,3}');
                        const maximumCourseLength = 8;

                        if (!(regex_filter.test(required_course)) || required_course.length > maximumCourseLength) {
                            continue;
                        }
                        // Removes letters from the prerequisite name.
                        const prerequisiteNumber = required_course.toLowerCase().replace(/['a-z']/g, '');
                        // Draws an edge from the prerequisite to the course.
                        const edge = await txc.run(`MATCH (prerequisite : ${subject}), (course : ${subject}) 
                        WHERE prerequisite.number = ${prerequisiteNumber} AND course.number = ${courseNumber}
                        CREATE (prerequisite)-[edge : TO]->(course) RETURN type(edge)`);
                    }
                }
            }   
        });
    } finally {
        await session.close();
        await driver.close();
    }
}


async function GetData() {
    const driver = neo4j.driver(
        'bolt://localhost',
         neo4j.auth.basic(`${process.env.DB_USERNAME}`, `${process.env.DB_PASSWORD}`)
    );
    const session = driver.session();
    let data = [];
    try {
        await session.readTransaction(async txc => {
            const results = await txc.run(`MATCH (node) RETURN node`);
            for (const record of results.records) {
                let details = {number: '', name: '', description: '', credits: ''};
                const field = record._fields[0];
                details['subject'] = field.labels[0];
                const properties = field.properties;
                details['name'] = properties.name;
                details['number'] = properties.number.toInt();
                details['description'] = properties.description;
                details['credits'] = properties.credits;
                data.push(details);
            }
        });
    } finally {
        await session.close();
        await driver.close();
        return data;
    }
}
