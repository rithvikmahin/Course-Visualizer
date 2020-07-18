import urllib
from bs4 import BeautifulSoup
import re

# Parse catalog for course content
catalog_url = 'http://catalog.illinois.edu/courses-of-instruction/cs/'
request = urllib.request.urlopen(catalog_url).read()
soup = BeautifulSoup(request, 'html.parser')

# Find all course data
courses = [i.text for i in soup.find(id='courseinventorycontainer').find_all('div')]

# Index 0 contains every course
print(courses)

# Create course list
# CS 100 is index 1, CS 101 is index 2, and so on
course_list = re.split(r'\n\nCS\xa0',courses[0])

for course in course_list:
    print('CS ' + course)
    print('=======================')