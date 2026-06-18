/**
 * Affiche une paire de clés VAPID pour Web Push.
 * Copie les valeurs dans .env.local
 */
const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();

console.log("\nAjoute ces lignes dans .env.local :\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:deepna@app.com\n");
