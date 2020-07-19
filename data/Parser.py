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
    course = list(filter(lambda x: x != '', course.split("\n")))
    course_details = course[0].split("\u2002")
    print(course)
    course_info = course[1].split('Prerequisite:')

    course_dict = {
        'number': course_details[0].strip(),
        'name': course_details[1].strip(),
        'credits': course_details[2].replace('credit:', '').replace('Hour.', '').strip(),
        'description': course_info[0].strip(),
    }

    if len(course_info) > 1:
        course_dict['prerequisite'] = course_info[1].strip()

    courses_dict[course_dict['number'].strip()] = course_dict
    
with open('Courses.json', 'w') as json_file:
    json.dump(courses_dict, json_file)