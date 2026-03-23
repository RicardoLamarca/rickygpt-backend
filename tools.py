import subprocess
import os
from langchain_core.tools import tool

@tool
def execute_julia_code(code: str) -> str:
    """Executes Julia code and instantly opens the generated visual (Image/GIF)."""
    workspace_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspace")
    if not os.path.exists(workspace_dir): os.makedirs(workspace_dir)
    
    # This is the file you can check later to see the code
    filepath = os.path.join(workspace_dir, "simulation.jl")
    
    # The AI will save results here
    output_path = os.path.join(workspace_dir, "result.png") 
    output_gif = os.path.join(workspace_dir, "result.gif")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(code)
    
    try:
        # Execute in background
        subprocess.run(f'julia "{filepath}"', shell=True, check=True, capture_output=True)
        
        # Check for GIF first (higher priority for animations), then PNG
        for file in [output_gif, output_path]:
            if os.path.exists(file):
                os.startfile(file)
                return f"Success! Result opened: {os.path.basename(file)}"
        
        return "Code ran successfully, but no visual file was saved."

    except subprocess.CalledProcessError as e:
        return f"Julia Error: {e.stderr.decode()}"