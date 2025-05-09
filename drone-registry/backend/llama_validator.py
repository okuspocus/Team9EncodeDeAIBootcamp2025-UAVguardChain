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
from web3 import Web3
import ipfshttpclient
from eth_hash.auto import keccak
import sqlite3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Web3 and IPFS client
w3 = Web3()
ipfs_client = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')

# Set the LLM settings
Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)

def extract_answer(text):
    """Extracts the answer from the AI's response."""
    match = re.search(r"Answer:\s*(.+)", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

# Database setup
def setup_database():
    conn = sqlite3.connect('flight_data.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS flight_mappings
        (data_hash TEXT PRIMARY KEY, ipfs_cid TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
    ''')
    conn.commit()
    return conn

def serialize_flight_data(flight_data: dict) -> str:
    """
    Serialize flight data in a consistent manner.
    Sort keys to ensure consistent ordering.
    """
    # Extract required fields in a specific order
    ordered_data = {
        "droneName": flight_data.get("droneName", ""),
        "droneModel": flight_data.get("droneModel", ""),
        "droneType": flight_data.get("droneType", ""),
        "serialNumber": flight_data.get("serialNumber", ""),
        "weight": flight_data.get("weight", ""),
        "flightPurpose": flight_data.get("flightPurpose", ""),
        "flightDescription": flight_data.get("flightDescription", ""),
        "flightDate": flight_data.get("flightDate", ""),
        "startTime": flight_data.get("startTime", ""),
        "endTime": flight_data.get("endTime", ""),
        "dayNightOperation": flight_data.get("dayNightOperation", ""),
        "flightAreaCenter": flight_data.get("flightAreaCenter", ""),
        "flightAreaRadius": flight_data.get("flightAreaRadius", ""),
        "flightAreaMaxHeight": flight_data.get("flightAreaMaxHeight", "")
    }
    return json.dumps(ordered_data, sort_keys=True, separators=(',', ':'))

def calculate_hash(serialized_data: str) -> bytes:
    """Calculate keccak256 hash of the serialized data."""
    return keccak(text=serialized_data)

def store_flight_data(data_hash: str, ipfs_cid: str, conn):
    """Store the mapping between data hash and IPFS CID."""
    c = conn.cursor()
    c.execute('INSERT INTO flight_mappings (data_hash, ipfs_cid) VALUES (?, ?)',
              (data_hash, ipfs_cid))
    conn.commit()

def validate_flight_data(flight_data: dict) -> dict:
    """Validates flight data against regulations."""
    regulations_path = os.path.join(os.path.dirname(__file__), "regulations.txt")
    print(f"Attempting to load regulations from: {regulations_path}", file=sys.stderr)

    try:
        # Load the regulations file
        documents = LlamaParse(result_type="text", verbose=False).load_data(regulations_path)
        print("Successfully loaded regulations.", file=sys.stderr)
    except FileNotFoundError:
        print(f"Regulations file not found at: {regulations_path}", file=sys.stderr)
        return {"error": f"Regulations file not found at: {regulations_path}"}
    except Exception as e:
        print(f"Error loading regulations: {str(e)}", file=sys.stderr)
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
        flight_date = datetime.fromisoformat(flight_date_str.replace("Z", "+00:00"))
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
        print("Starting AI agent process...", file=sys.stderr)
        index = VectorStoreIndex.from_documents(documents)
        query_engine = index.as_query_engine()
        query_tool = QueryEngineTool.from_defaults(
            query_engine,
            name="RegulationValidator",
            description="A tool for validating flight details against the regulations.",
        )

        agent = ReActAgent.from_tools([query_tool], verbose=False)

        print("Agent initialized. Sending chat query...", file=sys.stderr)
        raw_response = agent.chat(
            f"Check if the following flight data is compliant with regulations, considering all relevant details in the regulations file. Flight Date: {flight_date_str}, Start Time: {start_time_str}, End Time: {end_time_str}. Provide detailed suggestions for improvement.\nFlight Data: {flight_data}"
        )
        print("Agent chat response received.", file=sys.stderr)

        # Log the raw response for debugging
        print(f"Raw AI Response: {raw_response}", file=sys.stderr)

        # Convert response to string if needed
        response_text = str(raw_response)

        # Extract the answer or return the full AI response
        cleaned_answer = extract_answer(response_text)
        print(f"Extracted Answer: {cleaned_answer}", file=sys.stderr)

        # Combine deterministic compliance messages with AI suggestions
        if compliance_messages:
            final_message = "\n".join(compliance_messages) + "\n" + cleaned_answer
        else:
            final_message = cleaned_answer

        return {"answer": final_message if final_message else "No valid answer returned."}

    except Exception as e:
        print(f"Error during flight data validation: {str(e)}", file=sys.stderr)
        return {"error": f"Unexpected error: {str(e)}"}

def validate_and_process_flight_data(flight_data: dict) -> dict:
    """Validate flight data and process it for blockchain storage."""
    try:
        # First, validate the flight data
        validation_result = validate_flight_data(flight_data)
        
        if "error" in validation_result:
            return validation_result

        # Serialize the flight data
        serialized_data = serialize_flight_data(flight_data)
        
        # Calculate hash
        data_hash = calculate_hash(serialized_data)
        data_hash_hex = data_hash.hex()
        
        # Upload to IPFS
        ipfs_result = ipfs_client.add_json(flight_data)
        ipfs_cid = ipfs_result['Hash']
        
        # Store mapping in database
        conn = setup_database()
        store_flight_data(data_hash_hex, ipfs_cid, conn)
        conn.close()
        
        # Add hash to validation result
        validation_result["dataHash"] = data_hash_hex
        validation_result["ipfsCid"] = ipfs_cid
        
        return validation_result

    except Exception as e:
        return {"error": f"Processing error: {str(e)}"}

if __name__ == "__main__":
    print("Script started.", file=sys.stderr)
    try:
        input_json = sys.stdin.read()
        flight_data = json.loads(input_json)
        
        # Use the validation and processing function
        result = validate_and_process_flight_data(flight_data)
        print(json.dumps(result))

    except Exception as e:
        print(f"Error in main block: {e}", file=sys.stderr)
        sys.exit(1)