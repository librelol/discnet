<template>
    <v-container>
      <v-form @submit.prevent="register">
        <v-text-field
          v-model="name"
          label="Username"
          required
        ></v-text-field>
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
        <v-btn color="primary" type="submit">Register</v-btn>
      </v-form>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'RegisterComponent',
    data() {
      return {
        name: '',
        email: '',
        password: ''
      };
    },
    methods: {
      async register() {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
            name: this.name,
            email: this.email,
            password: this.password
          });
          // Save the token in local storage
          localStorage.setItem('token', response.data.token);
          // Redirect to the dashboard or another page
          this.$router.push('/dashboard');
        } catch (error) {
          // Handle registration error
          console.error('Registration failed:', error.response.data);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  </style>