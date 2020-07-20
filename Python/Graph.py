import networkx as nx
import matplotlib.pyplot as plt
import json

PREREQ = 'prerequisite'
NUMBER = 'number'

def json_to_dict(path):
    with open(path) as json_file: 
        return json.load(json_file) 

class CourseGraph():
    def __init__(self, courses_dict: dict):
        self.graph = nx.DiGraph()

        courses = list(courses_dict.keys())
        self.graph.add_nodes_from(courses)

        for course, info in courses_dict.items():
            if PREREQ not in info.keys():
                continue
        
            for req in info[PREREQ]:
                for req_course in req:
                    if not self.graph.has_node(req_course):
                        self.graph.add_node(req_course)

                    edge = (req_course, course)
                    self.graph.add_edge(*edge)



course_dict = json_to_dict("/home/rithvik/Course-Visualizer/Python/Courses.json")
graph = CourseGraph(course_dict)

nx.draw(graph.graph, wi)
plt.show()