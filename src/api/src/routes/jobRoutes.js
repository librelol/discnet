const express = require('express');
const axios = require('axios');
const router = express.Router();
const Job = require('../models/jobModel');
const authMiddleware = require('../middlewares/authMiddleware');

const WORKERS_API_URL = process.env.WORKERS_API_URL || 'http://workersapi:4000';

// Function to sync jobs
async function syncJobs(userId) {
  try {
    // Fetch jobs from workersapi
    const workersApiResponse = await axios.get(`${WORKERS_API_URL}/job/owned/${userId}`);
    const workerJobs = workersApiResponse.data.jobs;

    // Fetch jobs from main API
    const mainApiJobs = await Job.findAll({ where: { userId } });

    // Find jobs that are in the main API but not in the workersapi
    const workerJobIds = new Set(workerJobs.map(job => job.jobId));
    const jobsToRemove = mainApiJobs.filter(job => !workerJobIds.has(job.jobId));

    // Remove unsynced jobs from the main API and log them
    for (const job of jobsToRemove) {
      console.log(`Removing unsynced job from main API: ${job.jobId}`);
      await job.destroy();
    }
  } catch (error) {
    console.error('Error syncing jobs:', error);
  }
}

router.post('/start', authMiddleware, async (req, res) => {
  try {
    const username = req.user.username; // Extract username from the authenticated user
    const jobData = { ...req.body, username: username }; // Include username in the job data
    console.log('Job start request data:', jobData); // Log the request data
    const response = await axios.post(`${WORKERS_API_URL}/job/start`, jobData);
    const job = await Job.create({ userId: req.user.id, status: 'running' });
    res.status(response.status).json({ ...response.data, jobId: job.jobId });
  } catch (error) {
    console.error('Error starting job:', error);
    res.status(error.response ? error.response.status : 500).json({ message: error.message });
  }
});

router.post('/stop/:job_id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne({ where: { jobId: req.params.job_id, userId: req.user.id } });
    if (!job) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const response = await axios.post(`${WORKERS_API_URL}/job/stop/${req.params.job_id}`);
    await job.destroy();
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ message: error.message });
  }
});

router.post('/pause/:job_id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne({ where: { jobId: req.params.job_id, userId: req.user.id } });
    if (!job) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const response = await axios.post(`${WORKERS_API_URL}/job/pause/${req.params.job_id}`);
    job.status = job.status === 'paused' ? 'running' : 'paused';
    await job.save();
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ message: error.message });
  }
});

router.get('/status/:job_id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne({ where: { jobId: req.params.job_id, userId: req.user.id } });
    if (!job) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const response = await axios.get(`${WORKERS_API_URL}/job/status/${req.params.job_id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ message: error.message });
  }
});

router.get('/owned', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching jobs for user:', req.user.username); // Log the username
    await syncJobs(req.user.id); // Sync jobs before fetching
    const jobs = await Job.findAll({ where: { userId: req.user.id } });
    console.log('Fetched jobs:', jobs); // Log the fetched jobs
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error); // Log the error
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;