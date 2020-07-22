import React, { useEffect, Component } from 'react';
import cytoscape from 'cytoscape'



class App extends Component {

  Cytoscape(container: any) {
    const graph = cytoscape({ container: container });
    graph.add({group: 'nodes',
    data: { weight: 75 },
    position: { x: 200, y: 200 }
    })
  }

  componentDidMount() {
    const container = document.getElementById('cytoscape');
    this.Cytoscape(container);
  }

  render() {
    const cyStyle = {
      height: '1000px',
      width: '1000px',
      margin: '20px 0px'
    };
    return(<div style={cyStyle} id="cytoscape"></div>);
  }
}

export default App;
