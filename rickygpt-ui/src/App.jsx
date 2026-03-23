import { useState, useEffect } from "react";
import PlotlyPlot from "react-plotly.js";
const Plot = PlotlyPlot.default || PlotlyPlot;

function App() {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [simData, setSimData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to find how many frames we have, regardless of if it's x or x1
  const maxFrames = simData?.x ? simData.x.length : (simData?.x1 ? simData.x1.length : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const newChat = [...chatHistory, { role: 'user', content: prompt }];
    setChatHistory(newChat);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('https://rickygpt.onrender.com/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
      });

      const data = await response.json();
      setChatHistory([...newChat, { role: 'ai', content: data.text }]);

      if (data.data && Object.keys(data.data).length > 0) {
        setSimData(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      setChatHistory([...newChat, { role: 'ai', content: "Server Error. Is the FastAPI backend running?" }]);
    }
    setIsLoading(false);
  };

  // Setup animation length when new data arrives
  useEffect(() => {
    if (maxFrames > 0) {
      setCurrentFrame(maxFrames);
      setIsAnimating(false);
    }
  }, [simData, maxFrames]);

  // The Animation Engine
  useEffect(() => {
    let interval;
    if (isAnimating && maxFrames > 0) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= maxFrames) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 5; // Animation speed
        });
      }, 30); 
    }
    return () => clearInterval(interval);
  }, [isAnimating, maxFrames]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', backgroundColor: '#1e1e1e', color: 'white', margin: 0 }}>
      
      {/* LEFT PANEL: Chat Interface */}
      <div style={{ width: '35%', padding: '20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
        <h2 style={{ color: '#00ffcc' }}>⚛️ RickyGPT: God Mode</h2>
        
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '15px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <span style={{ 
                backgroundColor: msg.role === 'user' ? '#007bff' : '#444', 
                padding: '10px', borderRadius: '8px', display: 'inline-block', maxWidth: '90%', whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </span>
            </div>
          ))}
          {isLoading && <div style={{ color: '#00ffcc', fontStyle: 'italic' }}>RickyGPT is calculating physics...</div>}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Simulate a double pendulum..."
            style={{ flexGrow: 1, padding: '12px', borderRadius: '4px', border: 'none', marginRight: '10px', backgroundColor: '#333', color: 'white' }}
          />
          <button type="submit" disabled={isLoading} style={{ padding: '12px 20px', cursor: 'pointer', backgroundColor: '#00ffcc', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            Run
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: Interactive WebGL Physics Visualizer */}
      <div style={{ width: '65%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212', overflow: 'hidden' }}>
        
        {maxFrames > 0 && (
          <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
            <button 
              onClick={() => {
                if (currentFrame >= maxFrames) setCurrentFrame(1);
                setIsAnimating(!isAnimating);
              }}
              style={{ padding: '10px 20px', backgroundColor: '#00ffcc', color: '#121212', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isAnimating ? "⏸ Pause" : currentFrame >= maxFrames ? "🔄 Replay Animation" : "▶️ Play"}
            </button>
          </div>
        )}

        {maxFrames > 0 ? (
           <Plot
             data={
               // SCENARIO A: Double Pendulum (It has x1, y1, x2, y2)
               simData.x1 && simData.x2 ? [
                 // 1. The faint trail of the bottom weight
                 {
                   x: simData.x2.slice(0, currentFrame),
                   y: simData.y2.slice(0, currentFrame),
                   type: 'scatter', mode: 'lines', line: { color: '#444444', width: 2 }
                 },
                 // 2. The literal rods and weights for the CURRENT frame
                 {
                   x: [0, simData.x1[currentFrame - 1 || 0], simData.x2[currentFrame - 1 || 0]],
                   y: [0, simData.y1[currentFrame - 1 || 0], simData.y2[currentFrame - 1 || 0]],
                   type: 'scatter', mode: 'lines+markers',
                   line: { color: '#ffffff', width: 4 }, marker: { color: '#00ffcc', size: 12 }
                 }
               ] 
               // SCENARIO B: Standard Single Object (Lorenz, Waves, etc)
               : simData.x && simData.y ? [
                 {
                   x: simData.x.slice(0, currentFrame),
                   y: simData.y.slice(0, currentFrame),
                   z: simData.z ? simData.z.slice(0, currentFrame) : null,
                   type: simData.z ? 'scatter3d' : 'scatter', mode: 'lines', line: { color: '#00ffcc', width: 3 }
                 }
               ] : []
             }
             layout={{
               title: 'Interactive Physics Simulation',
               paper_bgcolor: '#121212', plot_bgcolor: '#121212', font: { color: '#ffffff' },
               autosize: true,
               // This prevents the pendulum arms from stretching when your screen is wide!
               yaxis: { scaleanchor: "x", scaleratio: 1 },
               showlegend: false
             }}
             style={{ width: '100%', height: '100%' }}
           />
        ) : simData ? (
           <div style={{ color: '#ff4444', padding: '20px', backgroundColor: '#2a0000', borderRadius: '8px' }}>
             <h3>🚨 AI Data Formatting Error</h3>
             <pre style={{ color: '#ffaaaa' }}>{JSON.stringify(simData, null, 2)}</pre>
           </div>
        ) : (
           <div style={{ color: '#555', fontSize: '1.2rem' }}>Ask Ricky to calculate a trajectory!</div>
        )}
      </div>
    </div>
  );
}

export default App;