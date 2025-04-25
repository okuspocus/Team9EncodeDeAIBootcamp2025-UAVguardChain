import sys
import json
import os
import re
from llama_index.core import VectorStoreIndex, Settings
from llama_index.llms.openai import OpenAI
from llama_index.core.tools import QueryEngineTool
from llama_index.core.agent import ReActAgent
from llama_index.readers.llama_parse import LlamaParse


print(f"DEBUG: LLAMA_CLOUD_API_KEY={os.getenv('LLAMA_CLOUD_API_KEY')}", file=sys.stderr)
# Set the LLM settings
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)

def extract_answer(text):
    """Extracts the answer from the AI's response."""
    match = re.search(r"Answer:\s*(.+)", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

def validate_flight_data(flight_data: str) -> dict:
    """Validates flight data against regulations."""
    regulations_path = os.path.join(os.path.dirname(__file__), "regulations.txt")
    print(f"Attempting to load regulations from: {regulations_path}", file=sys.stderr)  # Log attempt

    try:
        # Load the regulations file correctly with verbose set to False
        documents = LlamaParse(result_type="text", verbose=True).load_data(regulations_path)
        print("Successfully loaded regulations.", file=sys.stderr)  # Log success
    except FileNotFoundError:
        print(f"Regulations file not found at: {regulations_path}", file=sys.stderr)  # Log error
        return {"error": f"Regulations file not found at: {regulations_path}"}
    except Exception as e:
        print(f"Error loading regulations: {str(e)}", file=sys.stderr)  # Log error
        return {"error": f"Error loading regulations: {str(e)}"}

    try:
        print("Starting AI agent process...", file=sys.stderr)  # Log start of core logic
        index = VectorStoreIndex.from_documents(documents)
        query_engine = index.as_query_engine()
        query_tool = QueryEngineTool.from_defaults(
            query_engine,
            name="RegulationValidator",
            description="A tool for validating flight details against the regulations.",
        )

        agent = ReActAgent.from_tools([query_tool], verbose=True)

        print("Agent initialized. Sending chat query...", file=sys.stderr)  # Log before agent call
        raw_response = agent.chat(
            f"Check if the following flight data is compliant with regulations, considering all relevant details in the regulations file. Provide detailed suggestions for improvement.\nFlight Data: {flight_data}"
        )
        print("Agent chat response received.", file=sys.stderr)  # Log after agent call

        # Convert response to string if needed
        response_text = str(raw_response)

        # Extract the answer or return the full AI response
        cleaned_answer = extract_answer(response_text)
        print(f"Extracted Answer: {cleaned_answer}", file=sys.stderr)  # Log the extracted answer

        # Ensure we return a valid, serializable result
        result = {"answer": cleaned_answer if cleaned_answer else "No valid answer returned."}
        print("Returning result:", json.dumps(result), file=sys.stderr)  # Log the result before returning
        return result

    except Exception as e:
        # If an error happens anywhere in the try block, log it and return an error
        print(f"Error during flight data validation: {str(e)}", file=sys.stderr)  # Log error
        return {"error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
   # import pdb; pdb.set_trace()  # Start the debugger here
    print("Script started.", file=sys.stderr)  # Log script start
    try:
        print("Reading input from stdin...", file=sys.stderr)  # Log input reading
        input_json = sys.stdin.read()
        flight_data = json.loads(input_json)
        print("Input successfully parsed as JSON.", file=sys.stderr)  # Log parsing success

        # Validate flight data
        print("Calling validate_flight_data...", file=sys.stderr)  # Log function call
        result = validate_flight_data(flight_data)
        print("validate_flight_data finished.", file=sys.stderr)  # Log function return

        # Return the result as a JSON response to stdout
        print(json.dumps(result))  # Only print the final result to stdout

    except Exception as e:
        # Print the error to stderr and exit with error code
        print(f"Error in main block: {e}", file=sys.stderr)
        sys.exit(1) 