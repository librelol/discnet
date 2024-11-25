<template>
  <v-container>
    <v-card>
      <v-card-title>
        <span class="headline">Owned Jobs</span>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="jobs"
          :loading="loading"
          loading-text="Loading jobs..."
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'running' ? 'green' : 'red'" dark>
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn color="red" @click="stopJob(item.jobId)">Stop</v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'JobsList',
  data() {
    return {
      jobs: [],
      loading: true,
      headers: [
        { text: 'Job ID', value: 'jobId' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  methods: {
    async stopJob(jobId) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/job/stop/${jobId}`, {}, {
          headers: {
            'x-auth-token': token,
          },
        });
        console.log('Job stopped successfully:', response.data);
        // Optionally, you can update the job status in the UI
        this.jobs = this.jobs.map(job => job.jobId === jobId ? { ...job, status: 'stopped' } : job);
      } catch (error) {
        console.error('Error stopping job:', error.response.data);
      }
    },
  },
  async created() {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/job/owned`, {
        headers: {
          'x-auth-token': token,
        },
      });
      console.log('Jobs response data:', response.data);
      this.jobs = response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
</style>