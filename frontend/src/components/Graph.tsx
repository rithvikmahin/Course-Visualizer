import React, { Component } from 'react';
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import axios from 'axios'
import '../css/style.css'
import Search from './Search'
import Courses from '../types/json'

type AppProps = {}

const Colors: {[key: string]: string} = {
  'req1': '#7045AF',
  'req2': '#A7D129',
  'req3': '#FF6C00'
}

 
// Assigns a layout and fits the graph to the screen. 
const layout = 
  {
    name: 'dagre',
    spacingFactor: 0.8,
    nodeSep: 25,
    rankSep: 300,
    rankDir: 'TB',
    ranker: 'longest-path'
  }

class Graph extends Component<AppProps, {container: HTMLElement | null, data: Courses, chosenCourse: string}> {

  constructor(props: AppProps) {
    super(props);
    this.state = {
      container: null,
      data: null,
      chosenCourse: ''
    }
    this.Fit = this.Fit.bind(this);
    this.ChooseCourse = this.ChooseCourse.bind(this);
  }

  async componentDidMount() {
    const data = await axios.get('http://localhost:5000/courses');
    this.setState({ data: data.data });
    const container = document.getElementById('cytoscape');
    this.Cytoscape(container as HTMLElement);
    this.setState({ container: container });
  }

  /**
   * @param container - The div DOM element containing the graph.
   * @param courses - The JSON list of courses.
   */
  Cytoscape(container: HTMLElement) {
    cytoscape.use(dagre);
    /** Defines graph properties. */
    let graph = cytoscape(
      { container: container,
        style: [
          {
            selector: 'node',
            style: {
             'font-family': 'Bahnschrift',
             'font-size': '25',
              width: 80,
              height: 80,
              label: 'data(id)',
              backgroundColor: 'white',
              color: 'black',
              'text-valign': 'center',
              'text-halign': 'center',
              opacity: 0.8
            }
          },
          {
            selector: 'edge',
            style: {
              width: 8, 
              'mid-target-arrow-color': 'white',
              'mid-target-arrow-shape': 'triangle',
              'target-arrow-color': 'white',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              opacity: 0.8
            }
          },
        ]
      });

    const courses = this.state.data;
    graph = this.GenerateGraph(graph, courses);

    const graphLayout = graph.layout(layout);

    graph.on('tap', 'node', (node) => {
      this.GenerateGraphParents(node, graph, false);
    });

    graph.on('tap', (event) => {
      if (event.target == graph) {
        this.RestoreGraph(graph);
      }
    })

    graphLayout.run();
    graph.resize();
    const minimumZoom = 0.35;
    const maximumZoom = 1.2;
    graph.minZoom(minimumZoom);
    graph.maxZoom(maximumZoom);
    const elements = graph.elements();
    graph.fit(elements);
    return graph;
  }

  /**
   * 
   * @param node - The selected node from either the graph or the search bar.
   * @param graph - The cytoscape graph object.
   * @param isCollection - Checks if the selection came from a graph click or a search bar click.
   * @param id - The id of the node if it came from a search bar click.
   */
  GenerateGraphParents(node: cytoscape.EventObject | cytoscape.Collection, graph: cytoscape.Core, isCollection: boolean, id?: string) {
    let parentNodes;
    if (!(isCollection)) {
      node = node as cytoscape.EventObject;
      let nodeId = node.target.id();
      // Add all predecessors (nodes and edges) to a collection.
      parentNodes = graph.nodes('[id="' + nodeId + '"]').predecessors();  
      // Add the selected node to a collection.
      parentNodes = parentNodes.add(node.target); 
      // Add all other nodes to the other collection.
    } else {
      // Similar to above.
      node = node as cytoscape.Collection;
      parentNodes = graph.nodes('[id="' + id + '"]').predecessors();   
      parentNodes = parentNodes.add(node); 
    }
    let others = graph.elements().not(parentNodes);  
    //graph.remove() returns the deleted nodes and edges, so that you can just do cy.add() afterwards
    const removedNodes = graph.remove(others);  
    graph.elements().makeLayout(layout).run(); 
    graph.fit(graph.elements());
  }

  RestoreGraph(graph: cytoscape.Core) {
    const container = this.state.container;
    if (container) {
      const graph = this.Cytoscape(container as HTMLElement);
      graph.elements().makeLayout(layout).run(); 
      graph.fit(graph.elements());
    }
  }
  /**
   * 
   * @param graph - An empty cytoscape graph with preconfigured settings.
   * @param courses - The JSON list of courses.
   * @return - The cytoscape graph with its nodes and edges added.
   */
  GenerateGraph(graph: cytoscape.Core, courses: { [key: string]: any }): cytoscape.Core {
    /** Adds the current course as a node if it does not exist in the graph. */
    for (const courseObject in courses) {
      const course = courses[courseObject];
      const fullCourse = course['subject'] + course['number'];

      if (!(graph.filter(`node[id = '${fullCourse}']`).length)) {
        graph.add({
          group: 'nodes',
          data: {
            id: fullCourse
          }
        }); 
      }
    }
    for (const courseObject in courses) {
      const course = courses[courseObject];
      const fullCourse = course['subject'] + course['number'];
      
      for (const req in course['prereqs']) {
          const color = Colors[req];
          for (let prereq in course['prereqs'][req]) {
            prereq = course['prereqs'][req][prereq];
      
          // Creates an edge between the requirements and the current course. 
          graph.add({
            group: 'edges',
            data: {
              id: `${prereq}-${fullCourse}`,
              source: prereq,
              target: fullCourse
            }
          });
          // Sets the color of the edge based on the category of prereq it is.
          graph.edges(`edge[id = '${prereq}-${fullCourse}']`).style('line-color', color);
        }
      }
  }
    return graph;
  }

  /**
   * Shift the camera view of the graph back to the center upon a button click.
   */
  Fit() {
    const container = this.state.container;
    if (container) {
      const graph = this.Cytoscape(container as HTMLElement);
      const elements = graph.elements();
      graph.fit(elements);
    }
  }

  ChooseCourse(chosenCourse: string) {
    this.setState(
      { chosenCourse: chosenCourse },
      () => {
        const container = this.state.container;
        if (container) {
          const graph = this.Cytoscape(container as HTMLElement);
          const id = this.state.chosenCourse;
          const node = graph.getElementById(id);
          this.GenerateGraphParents(node, graph, true, id);
        }  
      });
  }

  render() {
    return(
      <div>
        <div style={{display: 'flex'}}>
          <div className='graph' id='cytoscape' />
            <div className='search'>
              {/**
               * 
               //@ts-ignore */}
              <Search data={this.state.data} action={this.ChooseCourse}/>
            </div>
        </div>
      </div>
    );
  }
}

export default Graph;
