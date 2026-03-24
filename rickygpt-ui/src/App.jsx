import { useState, useEffect } from "react";
import PlotlyPlot from "react-plotly.js";
const Plot = PlotlyPlot.default || PlotlyPlot;

function App() {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: "System Online. Physics engine initialized. How can I assist with your simulations today?" }
  ]);
  const [simData, setSimData] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Speed state for our new Speed Glider (defaults to 1x)
  const [speed, setSpeed] = useState(1);

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
      setChatHistory([...newChat, { role: 'ai', content: "Connection Error: Unable to reach the simulation backend. Please ensure the server is running." }]);
    }
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!simData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "simulation_export.json");
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
      // The interval dynamically updates based on the speed glider
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= maxFrames) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 5; 
        });
      }, 30 / speed); 
    }
    return () => clearInterval(interval);
  }, [isAnimating, maxFrames, speed]);

  return (
    <div style={{ 
      display: 'flex', height: '100vh', width: '100vw', 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
      backgroundColor: '#0f172a', 
      color: '#f8fafc', margin: 0, overflow: 'hidden'
    }}>
      
      {/* LEFT PANEL: Chat Interface */}
      <div style={{ 
        width: '400px', display: 'flex', flexDirection: 'column', 
        backgroundColor: '#1e293b', 
        borderRight: '1px solid #334155', padding: '24px', zIndex: 10,
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', 
          paddingBottom: '20px', borderBottom: '1px solid #334155' 
        }}>
          <div style={{ 
            backgroundColor: '#3b82f6', color: 'white', width: '36px', height: '36px', 
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
          }}>
            R
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
              RickyGPT
            </h2>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Simulation Engine
            </div>
          </div>
        </div>
        
        {/* Chat History */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px', marginBottom: '20px' }}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px', textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: '500' }}>
                {msg.role === 'user' ? 'You' : 'RickyGPT'}
              </span>
              <div style={{ 
                backgroundColor: msg.role === 'user' ? '#3b82f6' : '#334155', 
                color: '#f8fafc',
                padding: '12px 16px', 
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: msg.role === 'user' ? 'none' : '1px solid #475569'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#334155', borderRadius: '12px 12px 12px 4px', border: '1px solid #475569' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
              <div style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
              <div style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Define simulation parameters..."
            style={{ 
              flexGrow: 1, padding: '12px 16px', borderRadius: '8px', 
              border: '1px solid #475569', backgroundColor: '#0f172a', 
              color: '#f8fafc', fontSize: '0.95rem', outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#475569'}
          />
          <button 
            type="submit" 
            disabled={isLoading || !prompt.trim()} 
            style={{ 
              padding: '0 20px', cursor: (isLoading || !prompt.trim()) ? 'not-allowed' : 'pointer', 
              backgroundColor: (isLoading || !prompt.trim()) ? '#475569' : '#3b82f6', 
              color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600',
              transition: 'background-color 0.2s',
              boxShadow: (isLoading || !prompt.trim()) ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.3)'
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
                     type: 'scatter', mode: 'lines', line: { color: 'rgba(59, 130, 246, 0.4)', width: 2 }
                   },
                   {
                     x: [0, simData.x1[currentFrame - 1 || 0], simData.x2[currentFrame - 1 || 0]],
                     y: [0, simData.y1[currentFrame - 1 || 0], simData.y2[currentFrame - 1 || 0]],
                     type: 'scatter', mode: 'lines+markers',
                     line: { color: '#94a3b8', width: 2 }, marker: { color: '#3b82f6', size: 8, line: {color: '#ffffff', width: 2} }
                   }
                 ] 
                 : simData.x && simData.y ? [
                   {
                     x: simData.x.slice(0, currentFrame), y: simData.y.slice(0, currentFrame), z: simData.z ? simData.z.slice(0, currentFrame) : null,
                     type: simData.z ? 'scatter3d' : 'scatter', mode: 'lines', line: { color: '#3b82f6', width: 2 }
                   }
                 ] : []
               }
               layout={{
                 paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: '#94a3b8', family: 'Inter, sans-serif' },
                 margin: { t: 40, r: 40, b: 40, l: 40 }, autosize: true,
                 xaxis: { showgrid: true, gridcolor: '#1e293b', zerolinecolor: '#334155' },
                 yaxis: { scaleanchor: "x", scaleratio: 1, showgrid: true, gridcolor: '#1e293b', zerolinecolor: '#334155' },
                 showlegend: false
               }}
               style={{ width: '100%', height: '100%' }}
             />
             
             {/* Floating Control Deck */}
             <div style={{ 
               position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
               backgroundColor: '#1e293b',
               padding: '12px 24px', borderRadius: '12px', border: '1px solid #334155',
               display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
             }}>
               
               {/* Play/Pause Button */}
               <button 
                 onClick={() => {
                   if (currentFrame >= maxFrames) setCurrentFrame(1);
                   setIsAnimating(!isAnimating);
                 }}
                 style={{ 
                   padding: '8px 20px', backgroundColor: '#3b82f6', color: '#ffffff', 
                   border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer',
                   display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px', justifyContent: 'center',
                   transition: 'background-color 0.2s'
                 }}
                 onMouseOver={(e) => { e.target.style.backgroundColor = '#2563eb' }}
                 onMouseOut={(e) => { e.target.style.backgroundColor = '#3b82f6' }}
               >
                 {isAnimating ? "Pause" : currentFrame >= maxFrames ? "Replay" : "Play"}
               </button>

               {/* NEW: Speed Glider Container */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                 <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                   Speed: {speed}x
                 </span>
                 <input 
                   type="range" 
                   min="0.1" 
                   max="3" 
                   step="0.1"
                   value={speed}
                   onChange={(e) => setSpeed(parseFloat(e.target.value))}
                   style={{ width: '100px', cursor: 'pointer', accentColor: '#10b981' }} // Using a green accent to differentiate from the timeline slider
                 />
               </div>

               <div style={{ width: '1px', height: '32px', backgroundColor: '#334155' }} />

               {/* Timeline Frame Slider Container */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                 <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                   Timeline
                 </span>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <input 
                     type="range" 
                     min="1" 
                     max={maxFrames || 1} 
                     value={currentFrame || 1}
                     onChange={(e) => {
                       setIsAnimating(false);
                       setCurrentFrame(parseInt(e.target.value));
                     }}
                     style={{ width: '150px', cursor: 'pointer', accentColor: '#3b82f6' }}
                   />
                   <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontFamily: 'monospace', minWidth: '70px', textAlign: 'right' }}>
                     {currentFrame}/{maxFrames}
                   </span>
                 </div>
               </div>
               
               <div style={{ width: '1px', height: '32px', backgroundColor: '#334155' }} />

               {/* Export Button */}
               <button 
                 onClick={handleDownload}
                 title="Export Data"
                 style={{ 
                   padding: '8px 16px', backgroundColor: 'transparent', color: '#cbd5e1', 
                   border: '1px solid #475569', borderRadius: '6px', fontWeight: '500', cursor: 'pointer',
                   display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', fontSize: '0.9rem'
                 }}
                 onMouseOver={(e) => { e.target.style.backgroundColor = '#334155'; e.target.style.color = '#ffffff'; }}
                 onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#cbd5e1'; }}
               >
                 Export JSON
               </button>
             </div>
           </>
        ) : simData ? (
           <div style={{ color: '#ef4444', padding: '24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', maxWidth: '80%' }}>
             <h3 style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: '600' }}>Data Formatting Error</h3>
             <pre style={{ overflowX: 'auto', fontSize: '0.85rem', color: '#f8fafc' }}>{JSON.stringify(simData, null, 2)}</pre>
           </div>
        ) : (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#475569' }}>
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
             </svg>
             <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Awaiting simulation parameters</div>
           </div>
        )}
      </div>
      
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;