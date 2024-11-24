import requests
import json

def generate_reply(content, personality_prompt, reply_prompt, model_name, api_url):
    prompt = f"{personality_prompt} {reply_prompt} \"{content}\""
    payload = {
        "model": model_name,
        "prompt": prompt
    }
    print(f"Generated prompt: {prompt}")
    print(f"Payload: {payload}")
    try:
        response = requests.post(api_url, json=payload, stream=True)
        print(f"Response status code: {response.status_code}")
        response.raise_for_status()
        reply_content = ""
        for line in response.iter_lines():
            if line:
                data = line.decode('utf-8')
                print(f"Received line: {data}")
                json_data = json.loads(data)
                reply_content += json_data.get("response", "")
                if json_data.get("done"):
                    break
        print(f"Final reply content: {reply_content.strip()}")
        return reply_content.strip()
    except Exception as e:
        print(f"Error generating reply: {e}")
        return "Sorry, I couldn't generate a reply."