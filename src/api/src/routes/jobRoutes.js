const express = require('express');
const axios = require('axios');
const router = express.Router();
const Job = require('../models/jobModel');
const authMiddleware = require('../middlewares/authMiddleware');

const WORKERS_API_URL = 'http://workersapi_container:4000';

router.post('/start', authMiddleware, async (req, res) => {
  try {
    const response = await axios.post(`${WORKERS_API_URL}/job/start`, req.body);
    const job = await Job.create({ userId: req.user.id, status: 'running' });
    res.status(response.status).json({ ...response.data, jobId: job.jobId });
  } catch (error) {
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

// New route to list jobs owned by the authenticated user
router.get('/owned', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.findAll({ where: { userId: req.user.id } });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;