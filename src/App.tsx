import React, { useEffect } from 'react';
import cytoscape from 'cytoscape'



function App() {

  useEffect(() => {
    const Cytoscape = () => {
      const graph = cytoscape();
      graph.add({group: 'nodes',
      data: { weight: 75 },
      position: { x: 200, y: 200 }
      })
    }
  })

  return (
    <div>

    </div>
  );
}

export default App;
