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
                        const prereq = courses[course]['prerequisite'][requirements]
                        /** Removes junk course names that are not in the standard format. */
                        /** TODO:  Remove Concurrent Registration or save it in another format. remove length > 8 */
                        const regex_filter = new RegExp('[A-Z]{2,5}\\d{2,3}');
                        const maximumCourseLength = 8;

                        if (!(regex_filter.test(required_course)) || required_course.length > maximumCourseLength) {
                            continue;
                        }

                        const prereqSubject = required_course.replace(/[0-9]/g, '');
                        const prereqNumber = required_course.toLowerCase().replace(/['a-z']/g, '');
                        /** TODO: Fix since prereq fields dont have description, credits, etc */
                        const prereqNode = await txc.run(`MATCH (node: ${prereqSubject}) WHERE node.number = ${prereqNumber} RETURN node`);
                        /** TODO: Generalize for all, not just CS */
                        if (prereqNode.records.length == 0 && prereqSubject != 'CS') {
                            /** TODO: Description only works if it is in double quotes */
                            const createPrereqNode = await txc.run(`CREATE (node: ${prereqSubject} {number: ${prereqNumber}}) RETURN node `);
                        }
                        // Draws an edge from the prerequisite to the course.
                        const edge = await txc.run(`MATCH (prerequisite : ${prereqSubject}), (course : ${subject}) 
                        WHERE prerequisite.number = ${prereqNumber} AND course.number = ${courseNumber}
                        CREATE (prerequisite)-[edge : ${requirements}]->(course) RETURN type(edge)`);
                    }
                }
            }   
        });
    } finally {
        await session.close();
        await driver.close();
    }
}

/**
 * Retrieves the courses data from Neo4j.
 */
async function GetData() {
    const driver = neo4j.driver(
        'bolt://localhost',
         neo4j.auth.basic(`${process.env.DB_USERNAME}`, `${process.env.DB_PASSWORD}`)
    );
    const session = driver.session();
    let data = [];
    
    try {
        await session.readTransaction(async txc => {
            const nodeResults = await txc.run(`MATCH (node) RETURN node`);
            // Sets fields from the database object. 
            for (const record of nodeResults.records) {
                let details = {number: '', name: '', description: '', credits: '', prereqs: []};
                const field = record._fields[0];
                details['subject'] = field.labels[0];
                const properties = field.properties;
                details['name'] = properties.name;
                details['number'] = properties.number.toInt();
                details['description'] = properties.description;
                details['credits'] = properties.credits;
                /** TODO: Change CS to generalize for all */
                const edgeResults = await txc.run(`MATCH (:CS {number: ${properties.number.toInt()}})<-[r]-(node) return *`);

                for (const record of edgeResults.records) {
                    const field = record._fields;
                    for (let index = 0; index < field.length; index += 2) {
                        details['prereqs'].push(`${field[index + 1].type},${field[index].labels}${field[index].properties.number.toInt()}`)
                    }
                    data.push(details);
                }
            }    
            console.log(data);
        });
    } finally {
        await session.close();
        await driver.close();
        return data;
    }
}

GetData();
module.exports.GetData = GetData;