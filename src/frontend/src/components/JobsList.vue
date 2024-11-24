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
  async created() {
    try {
      const userId = localStorage.getItem('user_id'); // Assuming user ID is stored in local storage
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/job/owned/${userId}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      console.log('Jobs response data:', response.data);
      this.jobs = response.data.jobs;
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