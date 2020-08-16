export default interface Courses {
    CS: Array<CSCourse>
}

interface CSCourse {
    course: string;
    name: string;
    description: string;
    credits: string;
    prerequisite: Prerequisite;
}

interface Prerequisite {
    req1?: Array<string>;
    req2?: Array<string>;
    req3?: Array<string>;
}