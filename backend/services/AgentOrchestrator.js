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
        model: 'gemini-2.5-flash',
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
      this.logStep('ERROR', `Intent Extraction failed: ${error.message}. Using local fallback parsing.`);
      // Smart local fallback - parse the input ourselves
      return this._localIntentParse(userInput);
    }
  }

  // Smart local fallback parser when Gemini API is unavailable
  _localIntentParse(userInput) {
    const input = userInput.toLowerCase();
    
    // Service type detection (Using Regex to support word boundaries)
    const servicePatterns = [
      { pattern: /\b(washing\s*machine|washer|dryer|dhona|machine)\b/i, service: 'Washing Machine Technician' },
      { pattern: /\b(ac|air\s*conditioner|cooling|chiller)\b/i, service: 'AC Technician' },
      { pattern: /\b(plumber|plumbing|nalkay|pipe|pani|leak|leakage)\b/i, service: 'Plumber' },
      { pattern: /\b(electrician|bijli|wiring|electric|fan|light|board)\b/i, service: 'Electrician' },
      { pattern: /\b(beautician|beauty|parlor|makeup|facial|salon)\b/i, service: 'Beautician' },
      { pattern: /\b(tutor|teacher|tuition|padhai|math|science|english)\b/i, service: 'Tutor' },
      { pattern: /\b(carpenter|lakri|wood|furniture|darwaza|sofa)\b/i, service: 'Carpenter' },
      { pattern: /\b(painter|paint|rang|paint-shaint)\b/i, service: 'Painter' },
      { pattern: /\b(mechanic|car|gari|bike|motorcycle|engine)\b/i, service: 'Mechanic' },
      { pattern: /\b(cleaner|cleaning|safai|jhaadu|poocha)\b/i, service: 'Cleaner' }
    ];

    let serviceType = 'General Service';
    for (const item of servicePatterns) {
      if (item.pattern.test(input)) {
        serviceType = item.service;
        break;
      }
    }

    // Location detection (Islamabad sectors)
    const locationMatch = input.match(/[a-z]-\d+|[a-z]\d+|f-\d+|g-\d+|i-\d+|e-\d+|h-\d+/i);
    const location = locationMatch ? locationMatch[0].toUpperCase() : 'G-13';

    // Time detection
    let time = 'As soon as possible';
    if (input.includes('kal') || input.includes('tomorrow')) time = 'Tomorrow';
    if (input.includes('subah') || input.includes('morning')) time = time === 'Tomorrow' ? 'Tomorrow morning' : 'Morning';
    if (input.includes('sham') || input.includes('evening')) time = time === 'Tomorrow' ? 'Tomorrow evening' : 'Evening';
    if (input.includes('abhi') || input.includes('now') || input.includes('urgent')) time = 'Right now';
    if (input.includes('dopahar') || input.includes('afternoon')) time = time === 'Tomorrow' ? 'Tomorrow afternoon' : 'Afternoon';
    if (input.includes('raat') || input.includes('night')) time = time === 'Tomorrow' ? 'Tomorrow night' : 'Night';
    if (input.includes('today') || input.includes('aaj')) time = 'Today';

    return { serviceType, location, time };
  }

  _discoverProviders(intent) {
    const reqService = intent.serviceType.toLowerCase();
    const reqLoc = intent.location.toLowerCase().replace('-', '');

    // First try: match both service type AND location
    let matches = this.providers.filter(p => {
      const pType = p.type.toLowerCase();
      const pLoc = p.location.toLowerCase().replace('-', '');
      const serviceMatch = pType.includes(reqService) || reqService.includes(pType);
      const locationMatch = pLoc.includes(reqLoc) || reqLoc.includes(pLoc);
      return serviceMatch && locationMatch;
    });

    // If no exact match, try matching just by service type (broader area)
    if (matches.length === 0) {
      matches = this.providers.filter(p => {
        const pType = p.type.toLowerCase();
        return pType.includes(reqService) || reqService.includes(pType);
      });
    }

    return matches;
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
        model: 'gemini-2.5-flash',
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
      this.logStep('ERROR', `Ranking failed: ${error.message}. Using local ranking.`);
      // Smart local ranking: prefer available + closest + highest rated
      const available = candidates.filter(c => c.available);
      const pool = available.length > 0 ? available : candidates;
      const sorted = pool.sort((a, b) => {
        const scoreA = a.rating * 2 - a.distance_km;
        const scoreB = b.rating * 2 - b.distance_km;
        return scoreB - scoreA;
      });
      const best = sorted[0];
      return {
        recommendedProvider: best,
        reasoning: `${best.name} was selected as the best match — rated ${best.rating}/5, only ${best.distance_km} km away, and currently available.`
      };
    }
  }

  _simulateBooking(provider, time) {
    // Simulate updating a mock booking system
    const bookingId = "BKG-" + Math.floor(Math.random() * 10000);
    const slotTime = this._generateSlotTime(time);
    return {
      status: "Confirmed",
      bookingId: bookingId,
      providerAssigned: provider.name,
      scheduledTime: time,
      slotBooked: slotTime,
      message: `Booking confirmed with ${provider.name} for ${time}. Slot: ${slotTime}.`,
      confirmationSent: true,
    };
  }

  _generateSlotTime(time) {
    const timeLower = (time || '').toLowerCase();
    if (timeLower.includes('morning') || timeLower.includes('subah')) return '10:00 AM';
    if (timeLower.includes('afternoon') || timeLower.includes('dopahar')) return '2:00 PM';
    if (timeLower.includes('evening') || timeLower.includes('sham')) return '5:00 PM';
    if (timeLower.includes('night') || timeLower.includes('raat')) return '8:00 PM';
    if (timeLower.includes('now') || timeLower.includes('abhi') || timeLower.includes('urgent')) return 'Next available slot';
    return '10:00 AM';
  }

  _simulateFollowUp(bookingDetails) {
    // Simulate generating follow-up schedule
    return {
      reminderScheduled: "1 hour before appointment",
      statusUpdateMode: "WhatsApp",
      message: `Reminder scheduled for booking ${bookingDetails.bookingId}. We will notify you when the provider is on the way.`,
      completionSurvey: "Will be sent after service completion",
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
