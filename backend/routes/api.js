const express = require('express');
const router = express.Router();
const AgentOrchestrator = require('../services/AgentOrchestrator');

const orchestrator = new AgentOrchestrator();

router.post('/request', async (req, res) => {
  const { userInput } = req.body;
  if (!userInput) {
    return res.status(400).json({ error: 'userInput is required' });
  }

  try {
    const result = await orchestrator.processRequest(userInput);
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
