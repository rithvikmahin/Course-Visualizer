import networkx as nx
import matplotlib.pyplot as plt
import json

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
                    if not self.graph.has_node(required_courses):
                        self.graph.add_node(required_courses)

                    edge = (required_courses, course)
                    self.graph.add_edge(*edge)



course_dict = json_to_dict("/home/rithvik/Course-Visualizer/Python/Courses.json")
graph = CourseGraph(course_dict)
nx.draw(graph.graph, node_size=1200, with_labels=True, font_size=6)
plt.plot()
plt.savefig("Test.png")
plt.show()