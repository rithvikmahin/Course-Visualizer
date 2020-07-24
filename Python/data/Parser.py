import urllib.request as urllib
from bs4 import BeautifulSoup
import re
import json

# Parse catalog for course content
catalog_url = 'http://catalog.illinois.edu/courses-of-instruction/cs/'
request = urllib.urlopen(catalog_url).read()
soup = BeautifulSoup(request, 'html.parser')

# Find all course data
courses = [i.text for i in soup.find(id='courseinventorycontainer').find_all('div')]

# Create course list
# CS 100 is index 1, CS 101 is index 2, and so on
course_list = list(map(lambda x: 'CS ' + x, re.split(r'\n\nCS\xa0', courses[0])))
course_list = list(map(lambda x: x.replace('\xa0', ''), course_list))

courses_dict = {}

for course in course_list[1:]:
    # Removes empty and newline characters
    course = list(filter(lambda x: x != '', course.split("\n")))
    course_details = course[0].split("\u2002")
    course_info = course[1].split('Prerequisite:')

    course_dict = {
        'number': course_details[0].strip().replace(' ',''),
        'name': course_details[1].strip(),
        'credits': course_details[2].replace('credit:', '').replace('Hour.', '').replace('Hours.', '').strip(),
        'description': course_info[0].strip(),
    }

    # Checks if a prerequisite exists
    prereq_dict = {}
    if len(course_info) > 1:
        prerequisite = course_info[1].strip().upper().replace(": ", "").replace(" OR", ",").replace(" AND", ";").replace('ONE OF', '').strip().split(".")[0]
        # Splitting AND values based on semicolons and OR values after that based on commas
        # Also removes empty values
        split_values = [list(filter(lambda x: x != '', map(lambda x: x.strip(), string.split(","))))
                        for string in prerequisite.split(";")]

        #Adding each requisite to the JSON dictionary
        for i, value in enumerate(split_values):
            prereq_dict['req' + str(i + 1)] = value
        
    course_dict['prerequisite'] = prereq_dict
    courses_dict[course_dict['number'].strip()] = course_dict
    
with open('./Python/Courses.json', 'w') as json_file:
    json.dump(courses_dict, json_file)