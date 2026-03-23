from agent_core import create_rickygpt

print("Booting up RickyGPT (LangGraph Edition)...")
ricky = create_rickygpt()

print("\n==============================================")
print("  RickyGPT is online. Ready for Physics & Math!")
print("  (Type 'exit' to quit)")
print("==============================================\n")

# Create a list to hold history outside the loop
chat_history = []

while True:
    user_input = input("You: ")
    if user_input.lower() in ['exit', 'quit']: break
    
    chat_history.append(("user", user_input))
    limited_history = chat_history[-4:] 

    print("\n--- RickyGPT is working on the solution... ---")
    
    try:
        # Pass the full history if you want LangGraph to manage it, 
        # or stick to limited_history for token saving.
        response = ricky.invoke({"messages": limited_history})
        
        # Extract the new messages added by the agent (including the AI's final thought)
        # LangGraph returns the WHOLE state, so we take the new ones.
        new_messages = response["messages"][len(limited_history):]
        
        raw_content = response["messages"][-1].content
        
        if isinstance(raw_content, list):
            final_answer = next((item['text'] for item in raw_content if item.get('type') == 'text'), "")
        else:
            final_answer = raw_content

        print(f"\nRickyGPT:\n{final_answer}\n")
        
        # CRITICAL: Add the AI's response to the real history so it remembers for next time
        chat_history.append(("assistant", final_answer))
        
    except Exception as e:
        print(f"\n[System Error]: {e}\n")