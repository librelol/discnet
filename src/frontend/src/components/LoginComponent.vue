<template>
    <v-container>
      <v-form @submit.prevent="login">
        <v-text-field
          v-model="email"
          label="Email"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          required
        ></v-text-field>
        <v-btn color="primary" type="submit">Login</v-btn>
        <v-alert v-if="error" type="error" dismissible>{{ error }}</v-alert>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'LoginComponent',
    data() {
      return {
        email: '',
        password: '',
        error: ''
      };
    },
    methods: {
      async login() {
        try {
          console.log('Login request data:', { email: this.email, password: this.password });
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            email: this.email,
            password: this.password
          });
          console.log('Login response data:', response.data);
          // Save the token in local storage
          localStorage.setItem('token', response.data.token);
          // Redirect to the dashboard or another page
          this.$router.push('/dashboard');
        } catch (error) {
          // Handle login error
          this.error = error.response.data.message || 'Login failed';
          console.error('Login failed:', error.response.data);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  </style>