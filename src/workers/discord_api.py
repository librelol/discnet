import requests

def fetch_user_id(headers):
    url = "https://discord.com/api/v9/users/@me"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()["id"]
    else:
        print(f"Error fetching user ID: {response.status_code}, {response.text}")
        return None

def fetch_messages(channel_id, headers, since_message_id=None):
    url = f"https://discord.com/api/v9/channels/{channel_id}/messages?limit=5"
    if since_message_id:
        url += f"&before={since_message_id}"

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching messages: {response.status_code}, {response.text}")
        return []

def reply_to_message(channel_id, message_id, reply_content, headers):
    url = f"https://discord.com/api/v9/channels/{channel_id}/messages"
    payload = {
        "content": reply_content,
        "message_reference": {
            "message_id": message_id
        }
    }
    response = requests.post(url, headers=headers, json=payload)
    
    # Check for blocked content error
    if response.status_code == 400 and "200000" in response.text:
        print("Blocked content detected. Regenerating reply...")
        return False  # Indicate the reply failed and needs to be regenerated
    elif response.status_code == 200:
        print(f"Replied to message ID {message_id} with: {reply_content}")
        return True
    else:
        print(f"Error replying to message: {response.status_code}, {response.text}")
        return False