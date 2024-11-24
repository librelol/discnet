import json
import time
import os

def initialize_log_file(log_file_path):
    # Ensure the directory exists
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
    if not os.path.exists(log_file_path):
        with open(log_file_path, "w") as log_file:
            json.dump({}, log_file)

def log_message(user_id, message_content, log_file_path):
    try:
        with open(log_file_path, "r+") as log_file:
            data = json.load(log_file)
            if user_id not in data:
                data[user_id] = []
            data[user_id].append({
                "message": message_content,
                "timestamp": time.time()
            })
            log_file.seek(0)
            json.dump(data, log_file, indent=4)
            log_file.truncate()
    except Exception as e:
        print(f"Error logging message: {e}")

def clear_logs(log_file_path):
    try:
        with open(log_file_path, "w") as log_file:
            json.dump({}, log_file, indent=4)
    except Exception as e:
        print(f"Error clearing logs: {e}")