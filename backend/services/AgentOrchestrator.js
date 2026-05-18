const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Using the new @google/genai SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const providersPath = path.join(__dirname, '../data/providers.json');

class AgentOrchestrator {
  constructor() {
    this.providers = JSON.parse(fs.readFileSync(providersPath, 'utf8'));
    this.logs = [];
  }

  logStep(step, details) {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, step, details });
    console.log(`[${timestamp}] [${step}]`, details);
  }

  async processRequest(userInput) {
    this.logs = []; // reset logs for new request
    this.logStep('START', `Received user input: "${userInput}"`);

    // 1. Intent Understanding
    const extractedIntent = await this._extractIntent(userInput);
    this.logStep('INTENT_UNDERSTANDING', extractedIntent);

    // 2. Provider Discovery
    const candidates = this._discoverProviders(extractedIntent);
    this.logStep('PROVIDER_DISCOVERY', { candidatesFound: candidates.length, candidates });

    if (candidates.length === 0) {
      return this._generateFailureResponse(extractedIntent, "No suitable providers found in the requested location.");
    }

    // 3. Matching & Ranking
    const { recommendedProvider, reasoning } = await this._rankProviders(extractedIntent, candidates);
    this.logStep('MATCHING_AND_RANKING', { recommendedProvider, reasoning });

    // 4. Action Simulation (Booking)
    const bookingDetails = this._simulateBooking(recommendedProvider, extractedIntent.time);
    this.logStep('ACTION_SIMULATION', bookingDetails);

    // 5. Follow-up Automation
    const followUpDetails = this._simulateFollowUp(bookingDetails);
    this.logStep('FOLLOW_UP_AUTOMATION', followUpDetails);

    this.logStep('END', 'Workflow completed successfully');

    return {
      serviceRequest: extractedIntent.serviceType,
      location: extractedIntent.location,
      time: extractedIntent.time,
      recommendedProvider: `${recommendedProvider.name} (${recommendedProvider.distance_km} km away)`,
      reasoning: reasoning,
      simulatedBooking: bookingDetails,
      followUp: followUpDetails,
      traceLogs: this.logs
    };
  }

  async _extractIntent(userInput) {
    try {
      const prompt = `
You are an expert AI intent extraction agent. Parse the following user service request which might be in Urdu, Roman Urdu, or English.
Extract the 'service_type', 'location', and 'time'. 
If any field is missing, infer a reasonable default (e.g., time = 'As soon as possible').

User Input: "${userInput}"

Return ONLY a valid JSON object with the keys "service_type", "location", "time". 
Do NOT wrap it in markdown block.
Example: {"service_type": "AC Technician", "location": "G-13", "time": "Tomorrow morning"}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      let responseText = response.text.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(responseText);
      return {
        serviceType: parsed.service_type || "General Service",
        location: parsed.location || "Nearby",
        time: parsed.time || "As soon as possible"
      };
    } catch (error) {
      this.logStep('ERROR', `Intent Extraction failed: ${error.message}. Using mock fallback.`);
      // Mock Fallback
      return { serviceType: "AC Technician", location: "G-13", time: "Tomorrow morning" };
    }
  }

  _discoverProviders(intent) {
    // Basic string matching logic for mock discovery
    const reqService = intent.serviceType.toLowerCase();
    const reqLoc = intent.location.toLowerCase();

    return this.providers.filter(p => 
      p.type.toLowerCase().includes(reqService) || reqService.includes(p.type.toLowerCase())
    ).filter(p => 
      p.location.toLowerCase().includes(reqLoc) || reqLoc.includes(p.location.toLowerCase())
    );
  }

  async _rankProviders(intent, candidates) {
    try {
      const candidatesList = candidates.map(c => 
        `ID: ${c.id}, Name: ${c.name}, Rating: ${c.rating}, Distance: ${c.distance_km}km, Available: ${c.available}`
      ).join('\n');

      const prompt = `
You are an intelligent ranking agent. I have a request for "${intent.serviceType}" at "${intent.location}".
Here are the candidate providers:
${candidatesList}

Select the best provider based on distance, rating, and availability (must be available). 
Return ONLY a valid JSON object with:
"best_provider_id": <id>,
"reasoning": <A short one sentence explanation of why this provider was chosen in simple terms>

Do NOT wrap it in markdown.
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      let responseText = response.text.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }

      const parsed = JSON.parse(responseText);
      const recommendedProvider = candidates.find(c => c.id === parsed.best_provider_id) || candidates[0];
      return {
        recommendedProvider,
        reasoning: parsed.reasoning || "Closest available provider."
      };
    } catch (error) {
      this.logStep('ERROR', `Ranking failed: ${error.message}. Using mock fallback.`);
      const bestCandidate = candidates.find(c => c.available) || candidates[0];
      return {
        recommendedProvider: bestCandidate,
        reasoning: `Selected ${bestCandidate.name} because they are available and nearby.`
      };
    }
  }

  _simulateBooking(provider, time) {
    // Simulate updating a mock booking system
    const bookingId = "BKG-" + Math.floor(Math.random() * 10000);
    return {
      status: "Confirmed",
      bookingId: bookingId,
      providerAssigned: provider.name,
      scheduledTime: time,
      message: `Booking confirmed with ${provider.name} for ${time}.`
    };
  }

  _simulateFollowUp(bookingDetails) {
    // Simulate generating follow-up schedule
    return {
      reminderScheduled: "1 hour before appointment",
      statusUpdateMode: "WhatsApp",
      message: `Reminder scheduled for booking ${bookingDetails.bookingId}. We will notify you when the provider is on the way.`
    };
  }

  _generateFailureResponse(intent, reason) {
    return {
      serviceRequest: intent.serviceType,
      location: intent.location,
      time: intent.time,
      recommendedProvider: null,
      reasoning: reason,
      simulatedBooking: null,
      followUp: null,
      traceLogs: this.logs
    };
  }
}

module.exports = AgentOrchestrator;
