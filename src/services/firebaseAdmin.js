const admin = require("firebase-admin");

admin.initializeApp(); // Uses default Firebase project settings

module.exports = admin;
