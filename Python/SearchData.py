import json
#TODO: DOCUMENT WELL
data = []
output_dir: str = '../../src/json'
with open('src/json/Courses.json', 'r') as read_file:
    courses = json.load(read_file)

    for key in courses:
        data_dict = {'key': key, 'value': key}
        data.append(data_dict)

with open('src/json/Data.json', 'w') as write_file:
    json.dump(data, write_file)