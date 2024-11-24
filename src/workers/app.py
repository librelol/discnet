import time
import os
import requests

from threading import Thread
from flask import Flask, jsonify, request
from config_handler import load_config, check_for_config_changes
from logger import initialize_log_file, log_message
from discord_api import fetch_user_id, fetch_messages, reply_to_message
from ollama_api import generate_reply

# Initialize Flask app
app = Flask(__name__)

# Global bot control variables
jobs = {}  # Dictionary to store job-related data by job_id
job_counter = 1  # Counter for unique job IDs

def monitor_and_reply(job_id, config):
    global jobs

    job = jobs[job_id]
    username = job['username']
    discord_token = config.get("discord_token")
    channel_ids = config.get("channel_ids", [])  # List of channels
    ollama_api_url = os.getenv("OLLAMA_API_URL", "http://ollama-api:11434/api/generate")
    model_name = os.getenv("MODEL_NAME", "llama3.2")
    reply_prompt = config.get("reply_prompt", "")
    personality_prompt = config.get("personality_prompt", "")
    log_file_path = f"jobs/job_{job_id}/logs/user_messages_log.json"
    
    headers = {
        "Authorization": discord_token,
        "Content-Type": "application/json"
    }

    initialize_log_file(log_file_path)
    user_id = fetch_user_id(headers)
    if not user_id:
        print("Unable to fetch user ID. Exiting.")
        return

    replied_message_ids = set()
    last_config_modified_time = os.path.getmtime("config.yaml")

    while jobs[job_id]['is_running']:
        last_config_modified_time, new_config = check_for_config_changes(last_config_modified_time)
        if new_config:
            discord_token = new_config.get("discord_token", discord_token)
            channel_ids = new_config.get("channel_ids", channel_ids)
            reply_prompt = new_config.get("reply_prompt", reply_prompt)
            personality_prompt = new_config.get("personality_prompt", personality_prompt)
            headers["Authorization"] = discord_token

        if not jobs[job_id]['is_paused']:
            # Iterate over each channel
            for channel_id in channel_ids:
                print(f"Fetching messages from channel: {channel_id}")
                messages = fetch_messages(channel_id, headers)
                print(f"Fetched {len(messages)} messages from channel: {channel_id}")

                for message in reversed(messages):  # Process in chronological order
                    message_id = message["id"]
                    content = message["content"]
                    author_id = message["author"]["id"]

                    # Skip messages authored by the user or already replied to
                    if author_id == user_id or not content.strip() or message_id in replied_message_ids:
                        print(f"Skipping message {message_id} from user {author_id}")
                        continue

                    print(f"New message in channel {channel_id}: {content} (ID: {message_id})")
                    log_message(author_id, content, log_file_path)
                    reply_content = generate_reply(content, personality_prompt, reply_prompt, model_name, ollama_api_url)
                    reply_content = reply_content.replace("\"\"", "").strip()
                    print(f"Generated reply for message ID {message_id}: {reply_content}")

                    # Try replying, if the reply gets blocked, regenerate the reply
                    success = reply_to_message(channel_id, message_id, reply_content, headers)
                    if not success:
                        print(f"Error replying to message ID {message_id}. Skipping this message.")
                        continue

                    replied_message_ids.add(message_id)
                    jobs[job_id]['message_count'] += 1

        time.sleep(1)

@app.route("/job/owned/<string:username>", methods=["GET"])
def list_owned_jobs(username):
    """List jobs owned by a specific user."""
    user_jobs = [job_id for job_id, job in jobs.items() if job['username'] == username]
    return jsonify({"username": username, "jobs": user_jobs}), 200

@app.route("/job/start", methods=["POST"])
def start_job():
    """Start a new job with a unique job configuration."""
    global job_counter

    try:
        # Extract username from the request
        username = request.json.get('username')
        if not username:
            return jsonify({"status": "error", "message": "Username is required"}), 400

        # Create a unique job ID and directory for the new job
        job_id = job_counter
        job_counter += 1
        
        job_config_path = f"jobs/job_{job_id}/config.yaml"
        
        if not os.path.exists(f"jobs/job_{job_id}"):
            os.makedirs(f"jobs/job_{job_id}")

        # Load static configuration
        static_config = load_config("config.yaml")

        # Get dynamic configuration from request
        dynamic_config = request.json
        config = {**static_config, **dynamic_config}

        # Add fixed values for ollama_api_url and model_name
        config["ollama_api_url"] = "http://ollama-api:11434/api/generate"
        config["model_name"] = "llama3.2"

        # Create job thread and start bot
        jobs[job_id] = {
            'username': username,
            'is_running': True,
            'is_paused': False,
            'message_count': 0,
            'thread': Thread(target=monitor_and_reply, args=(job_id, config))
        }
        jobs[job_id]['thread'].start()
        
        return jsonify({"status": f"Job {job_id} started", "job_id": job_id}), 200
    except Exception as e:
        print(f"Error starting job: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/job/stop/<int:job_id>", methods=["POST"])
def stop_job(job_id):
    """Stop a running job and clean up its resources."""
    if job_id in jobs:
        jobs[job_id]['is_running'] = False
        jobs[job_id]['thread'].join()
        del jobs[job_id]
        return jsonify({"status": f"Job {job_id} stopped"}), 200
    else:
        return jsonify({"status": f"Job {job_id} not found"}), 404

@app.route("/job/pause/<int:job_id>", methods=["POST"])
def pause_job(job_id):
    """Pause or resume a specific job."""
    if job_id in jobs:
        jobs[job_id]['is_paused'] = not jobs[job_id]['is_paused']
        return jsonify({"status": f"Job {job_id} {'paused' if jobs[job_id]['is_paused'] else 'resumed'}"}), 200
    else:
        return jsonify({"status": f"Job {job_id} not found"}), 404

@app.route("/job/status/<int:job_id>", methods=["GET"])
def job_status(job_id):
    """Fetch status of a specific job."""
    if job_id in jobs:
        return jsonify({
            "job_id": job_id,
            "running": jobs[job_id]['is_running'],
            "paused": jobs[job_id]['is_paused'],
            "messages_processed": jobs[job_id]['message_count']
        }), 200
    else:
        return jsonify({"status": f"Job {job_id} not found"}), 404

if __name__ == "__main__":
    try:
        response = requests.post("http://ollama-api:11434/api/pull", json={"model": "llama3.2"})
        response.raise_for_status()
        print("Model pulled successfully")
    except requests.exceptions.RequestException as e:
        print(f"Error pulling model: {e}")
    app.run(debug=True, host="0.0.0.0", port=4000)