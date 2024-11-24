import os
import yaml

# Load configuration settings from the YAML config file
def load_config(config_path="config.yaml"):
    try:
        with open(config_path, "r") as config_file:
            return yaml.safe_load(config_file)
    except Exception as e:
        print(f"Error loading config file: {e}")
        return {}

# Function to monitor the configuration file for changes
def check_for_config_changes(last_modified_time, config_path="config.yaml"):
    try:
        current_modified_time = os.path.getmtime(config_path)
        if current_modified_time > last_modified_time:
            print("Configuration file has changed. Reloading...")
            return current_modified_time, load_config(config_path)
        return last_modified_time, None
    except Exception as e:
        print(f"Error checking configuration file: {e}")
        return last_modified_time, None
