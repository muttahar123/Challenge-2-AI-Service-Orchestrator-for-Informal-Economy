# Challenge 2: AI Service Orchestrator for Informal Economy

An Agentic AI System designed to automate the end-to-end lifecycle of a service request in the informal economy—from user intent to booking simulation and follow-up. 

## Features

- **Intent Understanding**: Uses the Gemini API via Google Antigravity methodology to extract natural language requests in Urdu, Roman Urdu, and English.
- **Provider Discovery**: Intelligently discovers relevant nearby providers from a structured mock registry.
- **Matching & Ranking**: The AI Agent ranks providers based on distance, rating, and availability and explains its decision in simple terms.
- **Action Simulation**: Automatically simulates booking and confirmation workflow state changes.
- **Follow-Up Automation**: Configures reminders and status updates.
- **Traceable Logs**: Fully logs all steps, tool usages, and action execution throughout the workflow.

## Architecture

This project strictly follows the "Antigravity" multi-agent reasoning pipeline.
The system is divided into two parts:

1. **Backend Orchestration API (Node.js/Express)**
   - Exposes `/api/request` to process user intents.
   - Orchestrator Engine (`AgentOrchestrator.js`) uses `@google/genai` to manage multi-step reasoning.
   - Built-in Mock Fallback mechanism: Even if the Gemini API key is missing or quota is exhausted, the orchestration pipeline correctly simulates a robust LLM-driven response.
   
2. **Mobile Application (React Native / Expo)**
   - Employs a premium dark-blue aesthetic design.
   - Traces the entire reasoning chain visually with the `AgentTrace` component.

## Setup Instructions

### Backend
1. Navigate to the `backend` folder.
2. Install dependencies: `npm install`
3. Add your `GEMINI_API_KEY` to a `.env` file.
4. Start the server: `node server.js`
   *(It runs on `0.0.0.0:3000` so mobile devices/emulators can connect).*

### Mobile App
1. Navigate to the `mobile-app` folder.
2. Install dependencies: `npm install`
3. Run the app: `npx expo start`
4. The frontend will dynamically resolve the backend using `10.0.2.2` on Android emulators and `localhost` elsewhere.

## Assumptions & Limitations
- Provider dataset is a local mocked database (`data/providers.json`).
- If API Rate limits are encountered for Gemini, the system safely falls back to a simulated scenario to keep the prototype functioning properly.
- SMS/WhatsApp messaging and Database updates are only "simulated" logs as per the requirement guidelines.
