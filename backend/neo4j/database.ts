require('dotenv').config();
const courses =  require('./json/Courses.json');
const neo4j = require('neo4j-driver');

async function Populate() {

    const driver = neo4j.driver(
        'bolt://localhost',
         neo4j.auth.basic(`${process.env.DB_USERNAME}`, `${process.env.DB_PASSWORD}`)
    );
    const session = driver.session();
    
    try {
        await session.writeTransaction(async txc => {
            for (const course in courses) {
                const subject = course.replace(/[0-9]/g, '');
                const courseNumber = course.toLowerCase().replace(/['a-z']/g, '');
                const name = courses[course]['name'];
                const credits = courses[course]['credits'];
                const description = courses[course]['description'];
                const node = await txc.run(`MATCH (node: ${subject}) WHERE node.number = ${courseNumber} RETURN node`);

                if (node.records.length == 0) {
                    /** TODO: Description only works if it is in double quotes */
                    const create = await txc.run(`CREATE (node: CS {number: ${courseNumber}, name: '${name}', 
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
                        const prerequisiteNumber = required_course.toLowerCase().replace(/['a-z']/g, '');
                        const connection = await txc.run(`MATCH (prerequisite : ${subject}), (course : ${subject}) 
                        WHERE prerequisite.number = ${prerequisiteNumber} AND course.number = ${courseNumber}
                        CREATE (prerequisite)-[edge : FOR]->(course) RETURN type(edge)`);
                    }
                }
            }   
        });
    } finally {
        console.log('Finished!');
        await session.close();
        await driver.close();
    }
}

Populate();

