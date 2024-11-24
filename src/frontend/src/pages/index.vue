<template>
  <v-app>
    <v-container>
      <v-row justify="center" class="mt-5">
        <v-col cols="12" md="8">
          <v-card class="mx-auto" max-width="600" elevation="10">
            <v-img
              src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
              height="200px"
            ></v-img>
            <v-card-title class="headline">Welcome to DiscNet</v-card-title>
            <v-card-text>
              <p>You're home for enhanced social media engagement.</p>
              <p>Join us to experience the best social media platform with advanced features and seamless user experience.</p>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="navigateToLogin">Login</v-btn>
              <v-btn color="secondary" @click="navigateToRegister">Register</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-5">
        <v-col cols="12" md="8">
          <v-card class="mx-auto" max-width="600" elevation="10">
            <v-card-title class="headline">Features</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item-group>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Real-time Messaging</v-list-item-title>
                      <v-list-item-subtitle>Stay connected with your friends and family in real-time.</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Advanced Privacy Settings</v-list-item-title>
                      <v-list-item-subtitle>Control who sees your content with our advanced privacy settings.</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Customizable Profiles</v-list-item-title>
                      <v-list-item-subtitle>Personalize your profile to reflect your personality.</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>

const navigateToLogin = () => {
  router.push('/login');
};

const navigateToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>

</style>