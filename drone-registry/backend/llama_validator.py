import sys
import json
import os
import re
from datetime import datetime, time
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
        documents = LlamaParse(result_type="text", verbose=False).load_data(regulations_path)
        print("Successfully loaded regulations.", file=sys.stderr)  # Log success
    except FileNotFoundError:
        print(f"Regulations file not found at: {regulations_path}", file=sys.stderr)  # Log error
        return {"error": f"Regulations file not found at: {regulations_path}"}
    except Exception as e:
        print(f"Error loading regulations: {str(e)}", file=sys.stderr)  # Log error
        return {"error": f"Error loading regulations: {str(e)}"}

    # Initialize compliance messages
    compliance_messages = []

    # Extract flight data fields
    flight_date_str = flight_data.get("flightDate")
    start_time_str = flight_data.get("startTime")
    end_time_str = flight_data.get("endTime")

    # Perform deterministic checks
    try:
        # Check flight date
        flight_date = datetime.fromisoformat(flight_date_str.replace("Z", "+00:00"))  # Handle timezone
        current_date = datetime.now()
        if flight_date.date() < current_date.date():
            compliance_messages.append("Flight date must be in the future.")

        # Check start and end times
        start_time = datetime.strptime(start_time_str, "%H:%M").time()
        end_time = datetime.strptime(end_time_str, "%H:%M").time()
        allowed_start_time = time(6, 0)  # 6:00 AM
        allowed_end_time = time(19, 30)  # 7:30 PM

        if start_time < allowed_start_time or start_time > allowed_end_time:
            compliance_messages.append("Start time must be between 6:00 AM and 7:30 PM.")
        if end_time < allowed_start_time or end_time > allowed_end_time:
            compliance_messages.append("End time must be between 6:00 AM and 7:30 PM.")
        if start_time >= end_time:
            compliance_messages.append("Start time must be before end time.")

    except ValueError as e:
        compliance_messages.append(f"Error parsing date or time: {str(e)}")

    try:
        print("Starting AI agent process...", file=sys.stderr)  # Log start of core logic
        index = VectorStoreIndex.from_documents(documents)
        query_engine = index.as_query_engine()
        query_tool = QueryEngineTool.from_defaults(
            query_engine,
            name="RegulationValidator",
            description="A tool for validating flight details against the regulations.",
        )

        agent = ReActAgent.from_tools([query_tool], verbose=False)

        print("Agent initialized. Sending chat query...", file=sys.stderr)  # Log before agent call
        raw_response = agent.chat(
            f"Check if the following flight data is compliant with regulations, considering all relevant details in the regulations file. Flight Date: {flight_date_str}, Start Time: {start_time_str}, End Time: {end_time_str}. Provide detailed suggestions for improvement.\nFlight Data: {flight_data}"
        )
        print("Agent chat response received.", file=sys.stderr)  # Log after agent call

        # Log the raw response for debugging
        print(f"Raw AI Response: {raw_response}", file=sys.stderr)

        # Convert response to string if needed
        response_text = str(raw_response)

        # Extract the answer or return the full AI response
        cleaned_answer = extract_answer(response_text)
        print(f"Extracted Answer: {cleaned_answer}", file=sys.stderr)  # Log the extracted answer

        # Combine deterministic compliance messages with AI suggestions
        if compliance_messages:
            final_message = "\n".join(compliance_messages) + "\n" + cleaned_answer
        else:
            final_message = cleaned_answer

        # Ensure we return a valid, serializable result
        result = {"answer": final_message if final_message else "No valid answer returned."}
        print("Returning result:", json.dumps(result), file=sys.stderr)  # Log the result before returning
        return result

    except Exception as e:
        # If an error happens anywhere in the try block, log it and return an error
        print(f"Error during flight data validation: {str(e)}", file=sys.stderr)  # Log error
        return {"error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
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

        # Log before printing the result
        print("Preparing to print the result to stdout...", file=sys.stderr)  # Log before final print
        print(json.dumps(result))  # Only print the final result to stdout
        print("Result printed successfully.", file=sys.stderr)  # Log after printing the result

    except Exception as e:
        # Print the error to stderr and exit with error code
        print(f"Error in main block: {e}", file=sys.stderr)
        sys.exit(1)