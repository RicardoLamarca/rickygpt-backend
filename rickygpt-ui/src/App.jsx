import { useState, useEffect } from "react";
import PlotlyPlot from "react-plotly.js";
const Plot = PlotlyPlot.default || PlotlyPlot;

function App() {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: "System Online. Physics engine initialized. What shall we simulate today?" }
  ]);
  const [simData, setSimData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
      setChatHistory([...newChat, { role: 'ai', content: "Server Error: Unable to reach the RickyGPT backend." }]);
    }
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!simData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ricky_simulation_data.json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  useEffect(() => {
    if (maxFrames > 0) {
      setCurrentFrame(maxFrames);
      setIsAnimating(false);
    }
  }, [simData, maxFrames]);

  useEffect(() => {
    let interval;
    if (isAnimating && maxFrames > 0) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= maxFrames) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 5; 
        });
      }, 30); 
    }
    return () => clearInterval(interval);
  }, [isAnimating, maxFrames]);

  return (
    <div style={{ 
      display: 'flex', height: '100vh', width: '100vw', fontFamily: '"Inter", "Segoe UI", sans-serif', 
      backgroundColor: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a2e 0%, #050505 80%)',
      color: '#e2e8f0', margin: 0, overflow: 'hidden'
    }}>
      
      {/* LEFT PANEL: Chat Interface */}
      <div style={{ 
        width: '380px', display: 'flex', flexDirection: 'column', 
        backgroundColor: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255,255,255,0.05)', padding: '24px', zIndex: 10,
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '32px', animation: 'spin 10s linear infinite' }}>⚛️</div>
          <h2 style={{ 
            margin: 0, color: '#00e6cc', fontSize: '1.4rem', fontWeight: '900', 
            letterSpacing: '1px', textTransform: 'uppercase', 
            fontFamily: '"Courier New", Courier, monospace', textShadow: '0 0 8px rgba(0, 230, 204, 0.4)',
            lineHeight: '1.2'
          }}>
            RickyGPT<br/>
            <span style={{ color: '#e2e8f0', fontSize: '0.85rem', letterSpacing: '2px' }}>MATH & PHYSICS AGENT</span>
          </h2>
        </div>
        
        {/* Chat History */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px', marginBottom: '20px' }}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.role === 'user' ? 'You' : 'RickyGPT'}
              </span>
              <div style={{ 
                backgroundColor: msg.role === 'user' ? '#00e6cc' : 'rgba(30, 41, 59, 0.8)', 
                color: msg.role === 'user' ? '#020617' : '#e2e8f0',
                padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0, 230, 204, 0.2)' : '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px 16px 16px 4px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#00e6cc', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
              <span style={{ color: '#00e6cc', fontStyle: 'italic', fontSize: '0.9rem' }}>Crunching physics...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Simulate a double pendulum..."
            style={{ 
              flexGrow: 1, padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', 
              backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', fontSize: '0.95rem', outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00e6cc'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()} 
            style={{ 
              padding: '0 20px', cursor: (isLoading || !prompt.trim()) ? 'not-allowed' : 'pointer', 
              backgroundColor: (isLoading || !prompt.trim()) ? '#334155' : '#00e6cc', 
              color: '#020617', border: 'none', borderRadius: '12px', fontWeight: 'bold',
              transition: 'all 0.2s ease', opacity: (isLoading || !prompt.trim()) ? 0.5 : 1
            }}
          >
            Run
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: Interactive WebGL Physics Visualizer */}
      <div style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {maxFrames > 0 ? (
           <>
             <Plot
               data={
                 simData.x1 && simData.x2 ? [
                   {
                     x: simData.x2.slice(0, currentFrame), y: simData.y2.slice(0, currentFrame),
                     type: 'scatter', mode: 'lines', line: { color: 'rgba(0, 230, 204, 0.3)', width: 2 }
                   },
                   {
                     x: [0, simData.x1[currentFrame - 1 || 0], simData.x2[currentFrame - 1 || 0]],
                     y: [0, simData.y1[currentFrame - 1 || 0], simData.y2[currentFrame - 1 || 0]],
                     type: 'scatter', mode: 'lines+markers',
                     line: { color: '#ffffff', width: 3 }, marker: { color: '#00e6cc', size: 10, line: {color: '#ffffff', width: 2} }
                   }
                 ] 
                 : simData.x && simData.y ? [
                   {
                     x: simData.x.slice(0, currentFrame), y: simData.y.slice(0, currentFrame), z: simData.z ? simData.z.slice(0, currentFrame) : null,
                     type: simData.z ? 'scatter3d' : 'scatter', mode: 'lines', line: { color: '#00e6cc', width: 3 }
                   }
                 ] : []
               }
               layout={{
                 paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: '#64748b' },
                 margin: { t: 40, r: 40, b: 40, l: 40 }, autosize: true,
                 xaxis: { showgrid: true, gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
                 yaxis: { scaleanchor: "x", scaleratio: 1, showgrid: true, gridcolor: 'rgba(255,255,255,0.05)', zerolinecolor: 'rgba(255,255,255,0.1)' },
                 showlegend: false
               }}
               style={{ width: '100%', height: '100%' }}
             />
             
             {/* Floating Control Deck */}
             <div style={{ 
               position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
               backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)',
               padding: '12px 24px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)',
               display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
             }}>
               <button 
                 onClick={() => {
                   if (currentFrame >= maxFrames) setCurrentFrame(1);
                   setIsAnimating(!isAnimating);
                 }}
                 style={{ 
                   padding: '8px 20px', backgroundColor: '#00e6cc', color: '#020617', 
                   border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer',
                   display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px', justifyContent: 'center'
                 }}
               >
                 {isAnimating ? "⏸ Pause" : currentFrame >= maxFrames ? "🔄 Replay" : "▶️ Play"}
               </button>

               {/* NEW: Frame Slider */}
               <input 
                 type="range" 
                 min="1" 
                 max={maxFrames || 1} 
                 value={currentFrame || 1}
                 onChange={(e) => {
                   setIsAnimating(false); // Stop playing if they manually drag it
                   setCurrentFrame(parseInt(e.target.value));
                 }}
                 style={{ width: '150px', cursor: 'pointer', accentColor: '#00e6cc' }}
               />
               
               <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace', minWidth: '80px', textAlign: 'right' }}>
                 {currentFrame} / {maxFrames}
               </span>
               
               <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

               <button 
                 onClick={handleDownload}
                 title="Download Raw Math Data"
                 style={{ 
                   padding: '8px 16px', backgroundColor: 'transparent', color: '#00e6cc', 
                   border: '1px solid #00e6cc', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer',
                   display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                 }}
                 onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(0, 230, 204, 0.1)' }}
                 onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent' }}
               >
                 💾 JSON
               </button>
             </div>
           </>
        ) : simData ? (
           <div style={{ color: '#ef4444', padding: '24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', maxWidth: '80%' }}>
             <h3 style={{ marginTop: 0 }}>🚨 Data Formatting Error</h3>
             <pre style={{ overflowX: 'auto', fontSize: '0.85rem' }}>{JSON.stringify(simData, null, 2)}</pre>
           </div>
        ) : (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', opacity: 0.5 }}>
             <div style={{ fontSize: '48px' }}>🛰️</div>
             <div style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>Awaiting coordinates...</div>
           </div>
        )}
      </div>
      
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes pulse { 0% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.5; transform: scale(0.8); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;