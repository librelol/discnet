<template>
  <v-container>
    <v-card>
      <v-card-title>
        <span class="headline">Start a New Job</span>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="startJob">
          <v-text-field
            v-model="discordToken"
            label="Discord Token"
            required
          ></v-text-field>
          <v-text-field
            v-model="channelIds"
            label="Channel IDs (comma-separated)"
            required
          ></v-text-field>
          <v-text-field
            v-model="replyPrompt"
            label="Reply Prompt"
            required
          ></v-text-field>
          <v-text-field
            v-model="personalityPrompt"
            label="Personality Prompt"
            required
          ></v-text-field>
          <v-btn color="primary" type="submit">Start Job</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'JobCreate',
  data() {
    return {
      discordToken: '',
      channelIds: '',
      replyPrompt: 'Reply in a manor as if you are being talked to. You shalll only just reply and not add notes to any of the messages.',
      personalityPrompt: 'Be a nice and information person but keeping it short and sweet.',
    };
  },
  methods: {
    async startJob() {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/job/start`, {
          discord_token: this.discordToken,
          channel_ids: this.channelIds.split(',').map(id => id.trim()),
          reply_prompt: this.replyPrompt,
          personality_prompt: this.personalityPrompt,
        }, {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        });
        console.log('Job started successfully:', response.data);
        // Optionally, you can redirect or show a success message
      } catch (error) {
        console.error('Error starting job:', error.response.data);
      }
    },
  },
};
</script>

<style scoped>
</style>