import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes.js';

// Create a variable to hold the initialized serverless handler.
// This allows us to cache the setup for "warm" function invocations.
let serverlessHandler;

async function initializeApp() {
  // If the handler is already initialized, return it.
  if (serverlessHandler) {
    return serverlessHandler;
  }

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Await the routes inside this async setup function
  await registerRoutes(app);

  // Create the handler and cache it
  serverlessHandler = serverless(app);
  return serverlessHandler;
}

// The main handler is now an async function
export const handler = async (event, context) => {
  // Ensure the app is initialized before handling the request
  const appHandler = await initializeApp();
  // Pass the event and context to the initialized handler
  return appHandler(event, context);
};
