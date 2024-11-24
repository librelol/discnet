import requests
import json

def generate_reply(content, personality_prompt, reply_prompt, model_name, api_url):
    prompt = f"{personality_prompt} {reply_prompt} \"{content}\""
    payload = {
        "model": model_name,
        "prompt": prompt,
        "stream": False  # Set to True if you want streaming responses
    }
    try:
        response = requests.post(api_url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["response"]
    except Exception as e:
        print(f"Error generating reply: {e}")
        return "Sorry, I couldn't generate a reply."