/**
 * Firebase Configuration
 * This file is generated from environment variables
 * DO NOT commit this file with real credentials
 */

window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyBr07hf8bXibq0R1UplRQz_RJ8dmOyNuLk",
    authDomain: "alfs-bd1e0.firebaseapp.com",
    projectId: "alfs-bd1e0",
    storageBucket: "alfs-bd1e0.firebasestorage.app",
    messagingSenderId: "92549920661",
    appId: "1:92549920661:web:b9e619344799e9f9e1e89c",
    measurementId: "G-ZYRQZ9T8EV"
};

// Validation function
window.validateFirebaseConfig = function() {
    const config = window.FIREBASE_CONFIG;
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    
    for (const field of requiredFields) {
        if (!config[field]) {
            console.error(`❌ Firebase config missing: ${field}`);
            return false;
        }
    }
    
    console.log('✅ Firebase config validated successfully');
    console.log('Project ID:', config.projectId);
    console.log('Auth Domain:', config.authDomain);
    return true;
};
