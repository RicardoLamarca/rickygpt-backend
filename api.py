import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# (Keep your other imports like pydantic, json, etc. here)

app = FastAPI()

# 1. FORCE THE COMMUNICATION GATES OPEN (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This allows ANY frontend to talk to this backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. PREVENT THE SERVER FROM CRASHING WHEN IT WAKES UP
@app.post("/simulate")
def run_simulation(request: ChatRequest):  # Adjust "ChatRequest" if yours is named differently
    workspace_dir = "workspace"
    
    # THIS IS THE MAGIC LINE: It builds the folder if Render deleted it
    os.makedirs(workspace_dir, exist_ok=True)
    
    data_file = os.path.join(workspace_dir, "data.json")
    
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