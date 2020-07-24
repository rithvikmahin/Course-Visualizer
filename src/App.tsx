import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import courses from "./json/Courses.json"

class App extends Component {
  /** TODO: Change 'any' types later, just for testing purposes */
  Cytoscape(container: any, courses: any) {
    const graph = cytoscape(
      { container: container,
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(id)'
            }
          }
        ]
      });
    const PREREQ = "prerequisite";

    for (const course in courses) {
      /** TODO: Check if the course already exists */
      graph.add({
        group: 'nodes',
        data: {
          id: course
        }
      })
      
      for (const requirements in courses[course][PREREQ]) {
        for (const required_course of courses[course][PREREQ][requirements]) {
          const prereqNode = graph.$(required_course);
          if (!(graph.nodes().contains(prereqNode))) {
            graph.add({
              group: 'nodes',
              data: {
                id: required_course
              }
            });
            graph.add({
              group: 'edges',
              data: {
                id: `${required_course}-${course}`,
                source: required_course,
                target: course
              }
            })
          }
        }
      }
    }
    console.log(graph.nodes());
    console.log(graph.edges());
  }

  componentDidMount() {
    const container = document.getElementById('cytoscape');
    this.Cytoscape(container, courses);
  }

  render() {
    const cyStyle = {
      height: '750px',
      width: '750px',
    };
    return(<div style={cyStyle} id="cytoscape"></div>);
  }
}

export default App;
