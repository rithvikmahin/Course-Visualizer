import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import avsdf from 'cytoscape-avsdf'
import cola from 'cytoscape-cola'
import klay from 'cytoscape-klay'
import courses from "./json/Courses.json"
//FORMATS: cydagre, cola, avsdf, klay
//TODO: RE-ENABLE TS.CONFIG NOIMPLICITANY TO TRUE
class App extends Component {
  /** TODO: Change 'any' types later, just for testing purposes */
  Cytoscape(container: any, courses: any) {
    cytoscape.use(klay);
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
      if (!(graph.filter(`node[id = "${course}"]`).length)) {
        graph.add({
          group: 'nodes',
          data: {
            id: course
          }
        }); 
      }
      
      for (const requirements in courses[course][PREREQ]) {
        for (const required_course of courses[course][PREREQ][requirements]) {
          //TODO: Remove later
          if (required_course.length > 8) {
            continue;
          }
          if (!(graph.filter(`node[id = "${required_course}"]`).length)) {
            graph.add({
              group: 'nodes',
              data: {
                id: required_course
              }
            }); 
          }

          // 
          
        graph.add({
          group: 'edges',
          data: {
            id: `${required_course}-${course}`,
            source: required_course,
            target: course
          }
        });
        }
      }
    }
    const layout = graph.layout(
      {name: 'klay'}
    );
    layout.run();
    graph.resize();
  }

  componentDidMount() {
    const container = document.getElementById('cytoscape');
    this.Cytoscape(container, courses);
  }

  render() {
    const cyStyle = {
      height: '1000px',
      width: '2000px',
    };
    return(<div style={cyStyle} id="cytoscape"></div>);
  }
}

export default App;
