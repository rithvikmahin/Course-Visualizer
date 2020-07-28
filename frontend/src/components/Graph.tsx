import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import courses from '../json/Courses.json'
import '../css/style.css'
import Search from './Search'

type AppProps = {}

class Graph extends Component<AppProps, {container: HTMLElement | null}> {

  constructor(props: AppProps) {
    super(props);
    this.state = {
      container: null
    }
    this.Fit = this.Fit.bind(this);
  }
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
             'font-weight': 'bold',
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
              width: 5, 
              'line-color': 'red',
              'mid-target-arrow-color': 'white',
              'mid-target-arrow-shape': 'triangle',
              'target-arrow-color': 'white',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              opacity: 0.4
            }
          },
        ]
      });
    
    graph = this.GenerateGraph(graph, courses);
    /** Assigns a layout and fits the graph to the screen. */
    const nodeSpacing = 1.5;
    const layout = graph.layout(
      {
        name: 'dagre',
        spacingFactor: nodeSpacing,
        /** TODO: Add type definition */
        //@ts-ignore
        nodeSep: 5,
        rankSep: 200,
        rankDir: 'TB'
      }
    );
    layout.run();
    graph.resize();
    const minimumZoom = 0.23;
    const maximumZoom = 1;
    graph.minZoom(minimumZoom);
    graph.maxZoom(maximumZoom);
    const elements = graph.elements();
    graph.fit(elements);
    return graph;
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
          /** TODO:  Remove Concurrent Registration or save it in another format. remove length > 8 */
          const regex_filter = new RegExp('[A-Z]{2,5}\\d{2,3}');
          const maximumCourseLength = 8;
          if (!(regex_filter.test(required_course)) || required_course.length > maximumCourseLength) {
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
    this.setState({ container: container })
  }

  /**
   * Shift the camera view of the graph back to the center upon a button click.
   */
  Fit() {
    const container = this.state.container;
    if (container) {
      const graph = this.Cytoscape(container as HTMLElement, courses);
      const elements = graph.elements();
      graph.fit(elements);
    }
  }

  render() {
    return(
      <div>
        <div style={{display: 'flex'}}>
          <div className='graph' id='cytoscape' />
          <div className='search'>
            <Search />
          </div>
        </div>
      </div>
    );
  }
}

export default Graph;
