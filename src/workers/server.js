const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();

// Global variables
let running = false;
let botThread;
let repliedMessageIds = new Set();

// Helper function to load configuration from YAML file (simulating the `config.yaml` file)
function loadConfig(configPath = 'config.yaml') {
  try {
    const config = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(config); // Assuming the config is in JSON format after parsing
  } catch (err) {
    console.error('Error loading config:', err);
    return {};
  }
}

// Helper function to monitor and reply to messages (this function simulates the Python logic)
async function monitorAndReply() {
  const config = loadConfig();
  const discordToken = config.discord_token;
  const channelIds = config.channel_ids || [];
  const lmApiUrl = config.lm_api_url;
  const modelName = config.model_name;
  const replyPrompt = config.reply_prompt || '';
  const personalityPrompt = config.personality_prompt || '';
  const logFilePath = 'user_messages_log.json';

  const headers = {
    'Authorization': `Bearer ${discordToken}`,
    'Content-Type': 'application/json',
  };

  let botUserId = await fetchBotUserId(headers);
  if (!botUserId) {
    console.error("Unable to fetch bot user ID.");
    return;
  }

  while (running) {
    try {
      for (let channelId of channelIds) {
        const messages = await fetchMessages(channelId, headers);
        for (let message of messages.reverse()) {
          const messageId = message.id;
          const content = message.content;
          const authorId = message.author.id;

          if (authorId === botUserId || !content.trim() || repliedMessageIds.has(messageId)) {
            continue;
          }

          // Log and generate reply
          logMessage(content, logFilePath);
          const replyContent = await generateReply(content, personalityPrompt, replyPrompt, modelName, lmApiUrl);
          await replyToMessage(channelId, messageId, replyContent, headers);
          repliedMessageIds.add(messageId);
        }
      }
    } catch (error) {
      console.error('Error during message fetching or replying:', error);
    }

    // Sleep for 5 seconds
    await sleep(5000);
  }
}

// Helper functions for Discord API (fetching messages, replying, etc.)
async function fetchBotUserId(headers) {
  // Simulate fetching bot user ID
  try {
    const response = await axios.get('https://discord.com/api/v9/users/@me', { headers });
    return response.data.id;
  } catch (error) {
    console.error('Error fetching bot user ID:', error);
    return null;
  }
}

async function fetchMessages(channelId, headers) {
  // Simulate fetching messages from Discord API
  try {
    const response = await axios.get(`https://discord.com/api/v9/channels/${channelId}/messages`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages from channel ${channelId}:`, error);
    return [];
  }
}

async function replyToMessage(channelId, messageId, replyContent, headers) {
  // Simulate replying to a message via Discord API
  try {
    await axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
      content: replyContent,
      message_reference: { message_id: messageId }
    }, { headers });
    console.log(`Replied to message ID ${messageId}`);
    return true;
  } catch (error) {
    console.error('Error replying to message:', error);
    return false;
  }
}

async function generateReply(content, personalityPrompt, replyPrompt, modelName, lmApiUrl) {
  // Simulate generating a reply via LM API
  try {
    const response = await axios.post(lmApiUrl, {
      prompt: `${personalityPrompt}\n${content}\n${replyPrompt}`,
      model: modelName
    });
    return response.data.reply;
  } catch (error) {
    console.error('Error generating reply:', error);
    return 'Error generating reply.';
  }
}

function logMessage(content, logFilePath) {
  // Log message to a JSON file
  const log = { timestamp: new Date(), content };
  fs.appendFileSync(logFilePath, JSON.stringify(log) + '\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API Routes
app.post('/start', (req, res) => {
  if (!running) {
    running = true;
    botThread = setInterval(monitorAndReply, 5000); // Start monitoring every 5 seconds
    res.json({ status: 'Bot started' });
  } else {
    res.json({ status: 'Bot is already running' });
  }
});

app.post('/stop', (req, res) => {
  if (running) {
    running = false;
    clearInterval(botThread);
    res.json({ status: 'Bot stopped' });
  } else {
    res.json({ status: 'Bot is not running' });
  }
});

app.get('/config', (req, res) => {
  const config = loadConfig();
  res.json(config);
});

// Start Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});
