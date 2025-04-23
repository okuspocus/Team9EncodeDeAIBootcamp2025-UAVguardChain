import sys
import json
from llama_index.core import VectorStoreIndex, Settings
from llama_index.llms.openai import OpenAI
from llama_index.core.tools import QueryEngineTool
from llama_index.core.agent import ReActAgent
from llama_index.readers.llama_parse import LlamaParse

Settings.llm = OpenAI(model="gpt-4o-mini", temperature=0)

def validate_flight_data(flight_data: str) -> str:
    documents = LlamaParse(result_type="text").load_data("regulation.txt")
    index = VectorStoreIndex.from_documents(documents)
    query_engine = index.as_query_engine()

    query_tool = QueryEngineTool.from_defaults(
        query_engine,
        name="RegulationValidator",
        description="A tool for validating flight details against the regulations.",
    )

    agent = ReActAgent.from_tools([query_tool], verbose=True)
    
    response = agent.chat(f"Check if the following flight data is compliant with regulations: {flight_data}")
    
    # Ensure the response is a string and can be converted to JSON
    if isinstance(response, str):
        return response
    else:
        return json.dumps({"error": "Invalid response from validation agent."})

if __name__ == "__main__":
    try:
        input_json = sys.argv[1]
        flight_data = json.loads(input_json)  # parse back to dict
        result = validate_flight_data(json.dumps(flight_data))  # serialize again for the prompt
        print(result)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)