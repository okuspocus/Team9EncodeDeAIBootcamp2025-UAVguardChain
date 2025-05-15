from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

CONFIG = {
    "ipfs": {
        "host": os.getenv("IPFS_HOST", "localhost"),
        "port": int(os.getenv("IPFS_PORT", "5001")),
        "protocol": os.getenv("IPFS_PROTOCOL", "http"),
        "timeout": int(os.getenv("IPFS_TIMEOUT", "30"))
    },
    "blockchain": {
        "rpc_url": os.getenv("RPC_URL", "http://localhost:8545"),
        "chain_id": int(os.getenv("CHAIN_ID", "1337")),
        "contract_address": os.getenv("CONTRACT_ADDRESS", "")
    },
    "validation": {
        "max_flight_duration": int(os.getenv("MAX_FLIGHT_DURATION", "120")),
        "max_altitude": int(os.getenv("MAX_ALTITUDE", "400")),
        "required_fields": [
            "drone_id",
            "pilot_id",
            "flight_date",
            "start_time",
            "end_time",
            "location",
            "altitude",
            "purpose"
        ]
    },
    "api": {
        "host": os.getenv("API_HOST", "0.0.0.0"),
        "port": int(os.getenv("API_PORT", "8000")),
        "debug": os.getenv("DEBUG", "False").lower() == "true"
    },
    "logging": {
        "level": os.getenv("LOG_LEVEL", "INFO"),
        "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        "file": os.getenv("LOG_FILE", "app.log")
    },
    "database": {
        "path": os.getenv("DB_PATH", "flight_data.db")
    }
}