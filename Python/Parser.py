import re
import os
import json
import urllib.request as urllib
from bs4 import BeautifulSoup

# Replacement mapping for credits strings
CREDITS_REPLACE_MAPPING = {
    'credit:': '',
    'Hour.': '',
    'Hours.': ''
}

# Replacement mapping for prereq strings
PREREQ_REPLACE_MAPPING = {
    ': ': '',
    ' OR': ',',
    ' AND': ';',
    'ONE OF': '',
}

def replace_with_dict(text: str, mapping: dict):
    """Replaces dictionary keys with values in text.

    :param text: text to replace keys with values in
    :param mapping: dictionary with replacement mapping
    :returns: replaced text
    """
    expr = re.compile('(%s)' % '|'.join(map(re.escape, mapping.keys())))
    return expr.sub(lambda x: mapping[x.string[x.start():x.end()]], text)

def catalog_to_json(catalog_url: str = 'http://catalog.illinois.edu/courses-of-instruction/cs/',
                    output_dir: str = './backend/neo4j/json/Courses.json',
                    subject: str = 'CS'
                    ):
    """Takes URL to course catalog and returns JSON with all necessary data.

    :param catalog_url: url of catalog data to retrieve
    :param output_dir: directory to output json file to
    """
    # Parse catalog for course content
    request = urllib.urlopen(catalog_url).read()
    soup = BeautifulSoup(request, 'html.parser')

    # Find all course data
    final_courses = []
    courses = [i.text for i in soup.find(id='courseinventorycontainer').find_all('div')]
    courses_dict = get_course_dict(courses, subject)
    final_courses.append(courses_dict)

    with open(os.path.join(os.getcwd(), output_dir), 'w') as json_file:
        json.dump(final_courses, json_file)

def get_course_dict(courses: list, subject: str = 'CS'):
    """Gets dictionary of course info from list of courses.

    :param courses: list of courses (with relevant info)
    :returns: dictionary of course info
    """
    # Create course list
    # CS 100 is index 1, CS 101 is index 2, and so on
    course_list = list(map(lambda x: (subject + ' ' + x).replace('\xa0', ''),
                           re.split(r'\n\n' + subject + '\xa0', courses[0])))

    courses_dict = {}
    courses_list = []
    for course in course_list[1:]:
        # Removes empty and newline characters
        course = list(filter(lambda x: x != '', course.split("\n")))
        course_details = list(map(lambda x: x.strip(), course[0].split("\u2002")))
        course_info = course[1].split('Prerequisite:')

        course_dict = {
            'course': course_details[0].replace(' ',''),
            'name': course_details[1],
            'description': course_info[0],
        }

        for key, value in CREDITS_REPLACE_MAPPING.items():
            course_dict['credits'] = course_details[2].replace(key, value)

        # Checks if a prerequisite exists
        prereq_dict = {}
        if len(course_info) > 1:
            prerequisite = course_info[1].strip().upper()

            for key, value in PREREQ_REPLACE_MAPPING.items():
                prerequisite = prerequisite.replace(key, value).split(".")[0]

            # Splitting AND values based on semicolons and OR values after that based on commas
            # Also removes empty values
            split_values = [list(filter(lambda x: x != '', map(lambda x: x.strip(),
                                                               string.split(","))))
                            for string in prerequisite.split(";")]

            #Adding each requisite to the JSON dictionary
            for i, value in enumerate(split_values):
                prereq_dict['req' + str(i + 1)] = value
            
        course_dict['prerequisite'] = prereq_dict
        courses_list.append(course_dict)
    courses_dict[subject] = courses_list
    return courses_dict

if __name__ == "__main__":
    catalog_to_json(catalog_url='http://catalog.illinois.edu/courses-of-instruction/math/',
                    output_dir='./backend/neo4j/json/math.json',
                    subject='MATH')