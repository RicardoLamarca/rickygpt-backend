import subprocess
import os
import sys
from langchain_core.tools import tool

@tool
def execute_physics_code(code: str) -> str:
    """
    Executes Python code for physics simulations.
    CRITICAL INSTRUCTION: Your code MUST calculate the math and save the arrays to a file named 'workspace/data.json'.
    For a double pendulum, save a JSON object with keys 'x1', 'y1', 'x2', 'y2' containing lists of floats.
    DO NOT generate plots, PNGs, or GIFs. ONLY save the raw numerical data using the json module.
    """
    workspace_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspace")
    if not os.path.exists(workspace_dir): os.makedirs(workspace_dir)
    
    filepath = os.path.join(workspace_dir, "simulation.py")
    data_file = os.path.join(workspace_dir, "data.json")
    
    # Save the AI's code to a file
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(code)
    
    try:
        # Run the Python script safely
        subprocess.run([sys.executable, filepath], check=True, capture_output=True, text=True)
        
        # Check if the AI successfully created the JSON file
        if os.path.exists(data_file):
            return "Success! data.json was created. You can now reply to the user."
        else:
            return "Code ran, but data.json was NOT created. You must use the json module to save the math to workspace/data.json!"

    except subprocess.CalledProcessError as e:
        return f"Python Error: {e.stderr}"