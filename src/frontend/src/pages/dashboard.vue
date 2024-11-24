<template>
    <v-app>
      <v-container>
        <v-row justify="center" class="mt-5">
          <v-col cols="12" md="8">
            <v-card class="mx-auto" max-width="600" elevation="10">
              <v-card-title class="headline">Dashboard</v-card-title>
              <v-card-text>
                <p>Welcome to your dashboard. Here you can manage your account, view statistics, and more.</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <JobsList />
        <JobsCreate />
      </v-container>
    </v-app>
  </template>
  
  <script>
  export default {
    name: 'DashboardComponent'
  };
  </script>
  
  <style scoped>
  .v-card {
    text-align: center;
  }
  </style>