import { NextRequest } from "next/server";

/**
 * Prüft ob Request eine gültige Session hat
 * Cookie-basierte Auth: postmeister_session
 */
export function hasValidSession(req: NextRequest): boolean {
  const sessionToken = process.env.POSTMEISTER_SESSION_TOKEN;
  
  if (!sessionToken) {
    console.error("POSTMEISTER_SESSION_TOKEN nicht gesetzt!");
    return false;
  }

  // Hole Cookie aus Request
  const cookieValue = req.cookies.get("postmeister_session")?.value;
  
  if (!cookieValue) {
    return false;
  }

  // Vergleiche mit Token aus ENV
  return cookieValue === sessionToken;
}
