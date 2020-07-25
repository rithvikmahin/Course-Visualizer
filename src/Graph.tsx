import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import courses from './json/Courses.json'

class Graph extends Component {
  /** TODO: Change type any to object later */
  /**
   * @param container - The div DOM element containing the graph.
   * @param courses - The JSON list of courses.
   */
  Cytoscape(container: HTMLElement, courses: { [key: string]: any }) {
    
    cytoscape.use(dagre);
    /** Defines graph properties. */
    let graph = cytoscape(
      { container: container,
        style: [
          {
            selector: 'node',
            style: {
             'font-family': 'Ubuntu Mono, monospace',
              width: 60,
              height: 60,
              label: 'data(id)',
              backgroundColor: 'white',
              color: 'black',
              'text-valign': 'center',
              'text-halign': 'center',
              opacity: 0.75
            }
          },
          {
            selector: 'edge',
            style: {
              width: 3, 
              'line-color': 'red',
              'target-arrow-color': 'red',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              opacity: 0.4
            }
          },
        ]
      });
    
    graph = this.GenerateGraph(graph, courses);
    /** Assigns a layout and fits the graph to the screen. */
    const nodeSpacing = 2;
    const layout = graph.layout(
      {
        name: 'dagre',
        spacingFactor: nodeSpacing,
      }
    );
    layout.run();
    graph.resize();
    const minimumZoom = 0.25;
    const maximumZoom = 1;
    graph.minZoom(minimumZoom);
    graph.maxZoom(maximumZoom);
  }

  /**
   * 
   * @param graph - An empty cytoscape graph with preconfigured settings.
   * @param courses - The JSON list of courses.
   * @return - The cytoscape graph with its nodes and edges added.
   */
  GenerateGraph(graph: cytoscape.Core, courses: { [key: string]: any }): cytoscape.Core {
    const PREREQ: string = 'prerequisite';
    /** Adds the current course as a node if it does not exist in the graph. */
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
          /** Removes junk course names that are not in the standard format. */
          /** TODO:  Remove Concurrent Registration or save it in another format */
          const regex_filter = new RegExp('[A-Z]{2,5}\\d{2,3}');
          if (!(regex_filter.test(required_course))) {
            console.log(required_course);
            continue;
          }
          /** Adds the current prerequisites as nodes if they do not exist in the graph. */
          if (!(graph.filter(`node[id = '${required_course}']`).length)) {
            graph.add({
              group: 'nodes',
              data: {
                id: required_course
              }
            }); 
          }
        /** Creates an edge between the requirements and the current course. */
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
    return graph;
  }

  componentDidMount() {
    const container = document.getElementById('cytoscape');
    this.Cytoscape(container as HTMLElement, courses);
  }

  render() {
    /** Cytoscape graph styling. */
    const cyStyle = {
      height: '100vh',
      width: '100vw',
      background: 'black'
    };
    return(<div style={cyStyle} id='cytoscape'></div>);
  }
}

export default Graph;
