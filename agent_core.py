from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from tools import execute_julia_code
import os
from dotenv import load_dotenv

load_dotenv()

def create_rickygpt():
    # 1. Initialize the Brain (State-of-the-art Flash model)
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite-preview",
        temperature=0.1 # Low temperature for precision
    )

    # 2. Load the Hands
    tools = [execute_julia_code]
    # 3. Create the System Prompt (RickyGPT's core instructions)
    system_prompt = (
    """
You are RickyGPT, a genius AI physicist and pure data engine. 
When asked to simulate or calculate a physical system, you must compute the math and save the raw data arrays to a file named `workspace/data.json`.

CRITICAL RULES:
1. DO NOT use matplotlib, PyPlot, Plots.jl, or any visual plotting libraries.
2. DO NOT try to plot, show, or save any images, plots, or gifs.
3. The ONLY thing saved to the JSON file should be the raw numerical arrays.
4. For single-body 2D simulations, you MUST name arrays exactly 'x' and 'y'. For multi-body systems (like a double pendulum), you MUST name them 'x1', 'y1', 'x2', 'y2', etc.
5. For 3D simulations, you MUST name the arrays exactly 'x', 'y', and 'z'.
6. In your text response, ALWAYS explain the physics math and format the Julia code you used in markdown blocks.
    """
    )
    

    # 4. Wire it all together using LangGraph (The modern way!)
    agent_executor = create_react_agent(llm, tools, prompt=system_prompt)

    return agent_executor