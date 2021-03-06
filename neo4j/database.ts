import coursesRaw from './json/Courses.json'
import Courses from '../types/json'
import neo4j from 'neo4j-driver'
import readTransaction  from 'neo4j-driver/types/transaction'
import writeTransaction  from 'neo4j-driver/types/transaction'
require('dotenv').config();

const courses: Courses[] = coursesRaw;
/**
 * Fills the Neo4j database with course values from the JSON file.
 */
async function PopulateData() {
    const driver = neo4j.driver(
        `bolt://localhost:7687`,
         neo4j.auth.basic(`neo4j`, `neo4j`)
    );
    const session = driver.session();
    
    try {
        await session.writeTransaction(async (txc: readTransaction) => {
            for (const dictionary in courses) {
                for (const subject in courses[dictionary]) {
                    // @ts-ignore
                    const subjectCourses = courses[dictionary][subject];
    
                    for (const courseDetails in subjectCourses) {
                        const course = subjectCourses[courseDetails];
                         // Removes numbers from the course name.
                        const courseSubject = course['course'].replace(/[0-9]/g, '');
                        // Removes letters from the course name.
                        const courseNumber = course['course'].toLowerCase().replace(/['a-z']/g, '');
                        const name = course['name'];
                        const credits = course['credits'];
                        const description = course['description'];
                        const courseNode = await txc.run(`MATCH (node: ${courseSubject}) WHERE node.number = ${courseNumber} RETURN node`);

                        if (courseNode.records.length == 0) {
                            // Creates the node if it doesn't exist.
                            await txc.run(`CREATE (node: CS {subject: '${courseSubject}', number: ${courseNumber}, 
                                                   name: '${name}', credits: '${credits}', description: "${description}"}) RETURN node `);
                        }

                        for (const requirements in course['prerequisite']) {
                            for (const requiredCourse of course['prerequisite'][requirements]) {
                                // Removes junk course names that are not in the standard format. 
                                /** TODO:  Remove Concurrent Registration or save it in another format. remove length > 8 */
                                const regex_filter = new RegExp('[A-Z]{2,5}\\d{2,3}');
                                const maximumCourseLength = 8;
        
                                if (!(regex_filter.test(requiredCourse)) || requiredCourse.length > maximumCourseLength) {
                                    continue;
                                }
        
                                /** TODO: Remove later */
                                if (!(requiredCourse.includes('CS')) && !(requiredCourse.includes('MATH'))) {
                                    continue;
                                }

                                const prereqNumber = requiredCourse.toLowerCase().replace(/['a-z']/g, '');
                                const prereqSubject = requiredCourse.replace(/['0-9']/g, '');

                                const prereqNode = await txc.run(`MATCH (node: ${prereqSubject}) WHERE node.number = ${prereqNumber} RETURN node`);

                                if (prereqNode.records.length == 0 && requiredCourse.includes('MATH')) {
                                    // Creates the node if it doesn't exist.
                                    await txc.run(`CREATE (node: MATH {subject: '${prereqSubject}', number: ${prereqNumber}}) RETURN node `);
                                }
        
                                // Draws an edge from the prerequisite to the course.
                                await txc.run(`MATCH (prerequisite : ${prereqSubject}), (course : ${courseSubject}) 
                                WHERE prerequisite.number = ${prereqNumber} AND course.number = ${courseNumber}
                                CREATE (prerequisite)-[edge : ${requirements}]->(course) RETURN type(edge)`);
                            }
                        }

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
 * Retrieves the course data from Neo4j.
 */
async function GetData() {
    const driver = neo4j.driver(
        `bolt://localhost:7687`,
         neo4j.auth.basic(`neo4j`, `neo4j`)
    );

    const session = driver.session();
    let result: Array<object> = [];
    
    try {
        await session.readTransaction(async (txc: writeTransaction) => {
            const nodeData = await txc.run(`MATCH (node) RETURN node ORDER BY node.number`);
            const nodeRecords = nodeData['records'];

            for (const nodeRecord in nodeRecords) {
                let prereqs: {[key: string]: Array<string>} = {}
                let data = {'subject': '', 'number': '', 'name': '', 'description': '', 'credits': '', prereqs}
                // @ts-ignore
                const course = nodeRecords[nodeRecord]['_fields'][0];
                const properties = course['properties'];
                data['subject'] = properties['subject'];
                data['number'] = properties['number'].toInt();
                data['name'] = properties['name'];
                data['description'] = properties['description'];
                data['credits'] = properties['credits'];
                const edgeData = await txc.run(`MATCH(prerequisite)-[r]->(course) WHERE course.subject='${properties['subject']}' AND 
                                                course.number=${properties['number'].toInt()} 
                                                RETURN prerequisite, type(r)`);
                const edgeRecords = edgeData['records'];

                for (const edgeRecord in edgeRecords) {
                    // @ts-ignore
                    const prereq = edgeRecords[edgeRecord]['_fields'][0];
                    // @ts-ignore
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
    }
    return result;
}

module.exports.GetData = GetData;
