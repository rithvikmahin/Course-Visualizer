import networkx as nx
from networkx.drawing.nx_agraph import graphviz_layout
import matplotlib.pyplot as plt
import json
import math

PREREQ = 'prerequisite'
NUMBER = 'number'

"""
Contains the path to the JSON file with the data.

@param path - The location of the JSON file.

@return - The JSON file's data in the form of a dictionary.
"""
def json_to_dict(path):
    with open(path) as json_file: 
        return json.load(json_file) 

"""
The class containing the network graph.
@param - The dictionary of data loaded from JSON.
"""
class CourseGraph():
    def __init__(self, courses_dict: dict):
        self.graph = nx.DiGraph()

        courses = list(courses_dict.keys())
        self.graph.add_nodes_from(courses)

        #Skips courses with no prerequisites.
        for course, data in courses_dict.items():
            if PREREQ not in data.keys():
                continue
            
            for requirements in data[PREREQ]:
                for required_courses in data[PREREQ][requirements]:
                    #Creates a node for a prerequisite if it does not exist.
                    #TODO: Remove AND statement later, only for testing
                    if not self.graph.has_node(required_courses) and len(required_courses) <= 8:
                        self.graph.add_node(required_courses)
                    
                    if len(required_courses) <= 8:
                        edge = (required_courses, data[NUMBER])
                        self.graph.add_edge(*edge)



course_dict = json_to_dict("/home/rithvik/Course-Visualizer/Python/Courses.json")
graph = CourseGraph(course_dict)
fig = plt.figure(figsize=(12,12))
pos = graphviz_layout(graph.graph)
nx.draw(graph.graph, pos=pos, node_size=250, arrowsize=3, with_labels=True, font_size=5)
plt.savefig("Test.png")
plt.show()