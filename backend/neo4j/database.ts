require('dotenv').config();
const courses =  require('./json/Courses.json');
const neo4j = require('neo4j-driver');

/**
 * Fills the Neo4j database with course values from the JSON file.
 */
async function PopulateData() {
    const driver = neo4j.driver(
        'bolt://localhost',
         neo4j.auth.basic(`neo4j`, `neo4j`)
    );
    const session = driver.session();
    
    try {
        await session.writeTransaction(async txc => {
            for (const course in courses) {
                // Removes numbers from the course name.
                const courseSubject = course.replace(/[0-9]/g, '');
                // Removes letters from the course name.
                const courseNumber = course.toLowerCase().replace(/['a-z']/g, '');
                const name = courses[course]['name'];
                const credits = courses[course]['credits'];
                const description = courses[course]['description'];
                // A query that checks if the node exists in the database.
                const courseNode = await txc.run(`MATCH (node: ${courseSubject}) WHERE node.number = ${courseNumber} RETURN node`);

                if (courseNode.records.length == 0) {
                    /** TODO: Description only works if it is in double quotes */
                    const createCourseNode = await txc.run(`CREATE (node: CS {subject: '${courseSubject}', number: ${courseNumber}, 
                        name: '${name}', credits: '${credits}', description: "${description}"}) RETURN node `);
                }

                for (const requirements in courses[course]['prerequisite']) {
                    for (const requiredCourse of courses[course]['prerequisite'][requirements]) {
                        /** Removes junk course names that are not in the standard format. */
                        /** TODO:  Remove Concurrent Registration or save it in another format. remove length > 8 */
                        const regex_filter = new RegExp('[A-Z]{2,5}\\d{2,3}');
                        const maximumCourseLength = 8;

                        if (!(regex_filter.test(requiredCourse)) || requiredCourse.length > maximumCourseLength) {
                            continue;
                        }

                        /** TODO: Remove later */
                        if (!(requiredCourse.includes('CS'))) {
                            continue;
                        }

                        const prereqNumber = requiredCourse.toLowerCase().replace(/['a-z']/g, '');
                        const prereqSubject = requiredCourse.replace(/['0-9']/g, '');

                        // Draws an edge from the prerequisite to the course.
                        const edge = await txc.run(`MATCH (prerequisite : ${prereqSubject}), (course : ${courseSubject}) 
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
         neo4j.auth.basic(`neo4j`, `neo4j`)
    );
    const session = driver.session();
    let result = [];
    
    try {
        await session.readTransaction(async txc => {
            const nodeData = await txc.run(`MATCH (node) RETURN node `);
            const nodeRecords = nodeData['records'];

            for (const nodeRecord in nodeRecords) {
                let data = {'subject': '', 'number': '', 'name': '', 'description': '', 'credits': '', prereqs: {}}
                const course = nodeRecords[nodeRecord]['_fields'][0];
                const properties = course['properties'];
                data['subject'] = properties['subject'];
                data['number'] = properties['number'].toInt();
                data['name'] = properties['name'];
                data['description'] = properties['description'];
                data['credits'] = properties['credits'];

            const edgeData = await txc.run(`MATCH(prerequisite)-[r]->(course) WHERE course.number=${properties['number'].toInt()} 
                                            RETURN prerequisite, type(r)`);
            const edgeRecords = edgeData['records'];

            for (const edgeRecord in edgeRecords) {
                const prereq = edgeRecords[edgeRecord]['_fields'][0];
                const prereqType = edgeRecords[edgeRecord]['_fields'][1];
                const properties = prereq['properties']
                const prereqSubject = properties['subject'];
                const prereqNumber = properties['number'].toInt();
                const prereqCourse = prereqSubject + prereqNumber.toString();

                if (!(prereqType in data['prereqs'])) {
                    data['prereqs'][prereqType] = [];
                }
                    
                data['prereqs'][prereqType].push(prereqCourse);
            }
            result.push(data);
        } 
        });
    } finally {
        await session.close();
        await driver.close();
        return result;
    }
}

module.exports.GetData = GetData;