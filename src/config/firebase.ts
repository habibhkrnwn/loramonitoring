import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBPsNuFz5jz7fGW2VB8ntfdW6Ov2sejbT0",
  databaseURL: "https://signup-login-firebase-auth-default-rtdb.firebaseio.com/",
  projectId: "signup-login-firebase-auth",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);
export default app;