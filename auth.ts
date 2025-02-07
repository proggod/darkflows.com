// Remove the entire auth.ts file that contains NextAuth configuration
// Instead, export your session verification function:

export { verifySession } from './lib/session'; 