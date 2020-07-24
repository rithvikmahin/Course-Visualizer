import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import courses from "./json/Courses.json"

//TODO: RE-ENABLE TS.CONFIG NOIMPLICITANY TO TRUE
class App extends Component {
  /** TODO: Change 'any' types later, just for testing purposes */
  Cytoscape(container: any, courses: any) {
    cytoscape.use(cydagre);
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
          //TODO: Remove later
          if (required_course.length > 8) {
            continue;
          }
          //TODO: Remove try-catch, check if node already exists in the graph
          try {
          graph.add({
            group: 'nodes',
            data: {
              id: required_course
            }
          }); 
        } catch(e) {
          console.log(e);
        }

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
      {name: 'dagre'}
    );
    layout.run();
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
