import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import klay from 'cytoscape-klay'
import courses from './json/Courses.json'

class Graph extends Component {
  /** TODO: Ensure that container is not null */
  /**
   * @param container - The div DOM element containing the graph.
   * @param courses - The JSON list of courses.
   */
  Cytoscape(container: HTMLElement | null, courses: object) {
    const PREREQ = 'prerequisite';
    
    cytoscape.use(klay);
    //Defines graph properties
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
    
    //Adds the current course as a node if it does not exist in the graph
    for (const course in courses) {
      if (!(graph.filter(`node[id = '${course}']`).length)) {
        graph.add({
          group: 'nodes',
          data: {
            id: course
          }
        }); 
      }

      for (const requirements in courses[course][PREREQ]) {
        for (const required_course of courses[course][PREREQ][requirements]) {
          //Removes junk course names that are not in the standard format
          const regex_filter = new RegExp('[A-Z]{2,5}\\d{2,3}');
          if (!(regex_filter.test(required_course))) {
            console.log(required_course);
            continue;
          }
          //Adds the current prerequisites as nodes if they do not exist in the graph
          if (!(graph.filter(`node[id = '${required_course}']`).length)) {
            graph.add({
              group: 'nodes',
              data: {
                id: required_course
              }
            }); 
          }
        //Creates an edge between the requirements and the current course
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
    //Assigns a layout and fits the graph to the screen
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
    //Cytoscape graph styling
    const cyStyle = {
      height: '1000px',
      width: '2000px',
    };
    return(<div style={cyStyle} id='cytoscape'></div>);
  }
}

export default Graph;
