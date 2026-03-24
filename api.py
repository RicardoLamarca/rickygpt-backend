from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from agent_core import create_rickygpt

app = FastAPI()

# The VIP Bouncer
app.add_middleware(
    CORSMiddleware,
    # Replace the "*" with your actual frontend URLs
    allow_origins=[
        "https://rickygpt.vercel.app", 
        "http://localhost:5173"  # Handy to keep for local testing!
    ], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Initialize the agent
agent = create_rickygpt()

class ChatRequest(BaseModel):
    prompt: str

@app.post("/simulate")
def run_simulation(request: ChatRequest):
    workspace_dir = "workspace"
    data_file = os.path.join(workspace_dir, "data.json")
    
    # Delete old data so we don't send the wrong physics numbers
    if os.path.exists(data_file):
        os.remove(data_file)
        
    # 1. Ask RickyGPT to write and run the code
    response = agent.invoke({"messages": [("user", request.prompt)]})
    ai_text = response["messages"][-1].content
    
    # Extract text if it's in a list format
    if isinstance(ai_text, list):
        final_answer = next((item['text'] for item in ai_text if item.get('type') == 'text'), "")
    else:
        final_answer = ai_text

    # 2. Check if Julia successfully created the data.json file
    simulation_data = {}
    if os.path.exists(data_file):
        with open(data_file, "r") as f:
            simulation_data = json.load(f)

    # 3. Send the AI's explanation AND the raw math data back to React
    return {
        "text": final_answer,
        "data": simulation_data
    }