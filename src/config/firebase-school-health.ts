import * as admin from 'firebase-admin';


const createSchoolHealthConfig = (): admin.ServiceAccount | null => {
  const projectId = process.env.SCHOOL_HEALTH_FIREBASE_PROJECT_ID;
  const privateKey = process.env.SCHOOL_HEALTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.SCHOOL_HEALTH_FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn('Firebase config for School Health is incomplete. Push notifications will be disabled.');
    return null;
  }

  return { projectId, privateKey, clientEmail };
};


const initializeSchoolHealthApp = (): admin.app.App | null => {
  const appName = 'schoolHealthApp'; 
  const config = createSchoolHealthConfig();

  if (!config) {
    return null;
  }

  const existingApp = admin.apps.find(app => app?.name === appName);
  if (existingApp) {
    return existingApp;
  }


  return admin.initializeApp({
    credential: admin.credential.cert(config),
  }, appName);
};


const schoolHealthApp = initializeSchoolHealthApp();

if (schoolHealthApp) {
  console.log('Firebase "schoolHealthApp" for push notifications initialized successfully.');
}

export default schoolHealthApp;