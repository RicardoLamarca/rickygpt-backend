import React from 'react';
import Plot from 'react-plotly.js';

const PhysicsVisualizer = ({ data }) => {
  if (!data || !data.x) {
    return <div className="no-data-msg">Run simulation to see results...</div>;
  }

  // --- 1. Detect Payload Type: Is this an Advanced FEM viz? ---
  // If RickyGPT sent 'simplices' (the mesh triangles), we use Plotly mesh3d for contouring.
  const isAdvancedFem = data.simplices && Array.isArray(data.simplices);

  // --- 2. Advanced FEM Viz (Heatmaps/Stress/Deformation) ---
  if (isAdvancedFem) {
    
    // Setup Deformed Mesh (if asked for displacement/deformation)
    const scale = data.deformation_scale || 1.0;
    const xFinal = data.ux ? data.x.map((x, i) => x + (scale * data.ux[i])) : data.x;
    const yFinal = data.uy ? data.y.map((y, i) => y + (scale * data.uy[i])) : data.y;

    // Map triangle connectivity for Plotly mesh3d
    const triangle_i = data.simplices.map(tri => tri[0]);
    const triangle_j = data.simplices.map(tri => tri[1]);
    const triangle_k = data.simplices.map(tri => tri[2]);

    const plotlyData = [
      {
        type: 'mesh3d', // Mesh3d is Plotly's powerful engine for triangulated surfaces colored by intensity (the scalar 'u')
        x: xFinal,
        y: yFinal,
        z: new Array(xFinal.length).fill(0), // Keep it flat on the 2D plane (Z=0)
        
        // Connectivity (Tells Plotly how to connect nodes to draw contours)
        i: triangle_i, 
        j: triangle_j,
        k: triangle_k,
        
        // The values to color (Stress, Temperature, Pressure, etc.)
        intensity: data.u, 
        colorscale: 'Portland', // Professional "Heatmap" colorscale (blue-to-red)
        showscale: true, // Show the color bar legend
        colorbar: {
          title: `${data.field_name || 'Value'}\n(${data.field_unit || 'Units'})`,
          titleside: 'top',
          ticksuffix: ` ${data.field_unit || ''}`
        },

        // FLAT rendering settings (critical for professional 2D FEA look)
        lighting: {
          ambient: 1.0, // Fully ambient lit (no 3D shading shadows)
          diffuse: 0,
          specular: 0,
          roughness: 1,
          fresnel: 0
        },
        flatshading: true // Essential for clean 2D unstructured heatmaps
      }
    ];

    const plotlyLayout = {
      title: data.simulation_title || 'FEM Simulation Results',
      autosize: true,
      margin: { l: 20, r: 20, b: 20, t: 40 },
      // Plotly mesh3d requires scene settings for viewing
      scene: {
        xaxis: { title: 'X Coordinate', autorange: true, zeroline: false },
        yaxis: { title: 'Y Coordinate', autorange: true, zeroline: false },
        zaxis: { title: '', showgrid: false, showticklabels: false, zeroline: false, range: [-0.01, 0.01] }, // Hide Z axis
        aspectmode: 'data', // Critical: Keeps physical X/Y proportions correct (squares look like squares)
        camera: {
          eye: { x: 0, y: 0, z: 1.5 }, // Pure overhead top-down view
          up: { x: 0, y: 1, z: 0 }
        }
      }
    };

    return (
      <Plot
        data={plotlyData}
        layout={plotlyLayout}
        useResizeHandler={true} // Re-renders graph when window resizes
        style={{ width: "100%", height: "100%" }}
        config={{ displayModeBar: false }} // Hides Plotly's toolbar for cleaner UI
      />
    );
  }

  // --- 3. Multi-Body Trajectory (Double Pendulum, etc.) ---
  if (data.x1 && data.y1) {
    // ... insert existing line viz logic here (simplified for response) ...
  }

  // --- 4. Simple 2D Trajectory Fallback ---
  // ... insert existing line viz logic here (simplified for response) ...
};

export default PhysicsVisualizer;