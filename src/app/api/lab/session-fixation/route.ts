import { NextRequest, NextResponse } from 'next/server';

// Session Fixation vulnerability demonstration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const action = searchParams.get('action') || 'view';

    // Get current session from request cookies
    const currentSession = request.cookies.get('session_id')?.value;

    console.log('🚨 Session Fixation Demo:', { action, sessionId, currentSession });

    let message = '';
    let vulnerabilityInfo = '';

    if (action === 'fix' && sessionId) {
      // VULNERABLE: Accept session ID from user input - Session Fixation!
      message = `Session fixed to: ${sessionId}`;
      vulnerabilityInfo = 'Session ID was set from user input - this allows session fixation attacks!';
      
      console.log('🚨 VULNERABILITY: Session fixation attack - setting session to user-provided value:', sessionId);
    } else if (action === 'login') {
      // Simulate login without regenerating session - VULNERABLE!
      const existingSession = currentSession || 'session_' + Math.random().toString(36).substr(2, 9);
      message = `Logged in with existing session: ${existingSession}`;
      vulnerabilityInfo = 'Session ID was not regenerated after login - vulnerable to session fixation!';
      
      console.log('🚨 VULNERABILITY: No session regeneration on login');
    }

    const vulnerableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Session Fixation Vulnerability</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .vulnerability { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
          .example { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; }
          .payload { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          .session { background: #fff3e0; border: 1px solid #ff9800; padding: 10px; border-radius: 4px; margin: 10px 0; }
          button { background: #d32f2f; color: white; padding: 10px 15px; border: none; border-radius: 4px; margin: 5px; }
          input { padding: 8px; margin: 5px; border: 1px solid #ccc; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚨 Session Fixation Vulnerability</h1>
          
          <div class="session">
            <h3>Current Session Info:</h3>
            <p><strong>Session ID:</strong> ${currentSession || 'Not set'}</p>
            ${message ? `<p><strong>Last Action:</strong> ${message}</p>` : ''}
          </div>

          ${vulnerabilityInfo ? `
          <div class="vulnerability">
            <h3>Vulnerability Detected:</h3>
            <p>${vulnerabilityInfo}</p>
          </div>
          ` : ''}

          <div class="vulnerability">
            <h3>What is Session Fixation?</h3>
            <p>Session fixation is when an attacker sets a victim's session ID to a known value, then hijacks the session after the victim logs in.</p>
            <ul>
              <li>Attacker provides session ID to victim</li>
              <li>Victim logs in using that session ID</li>
              <li>Application doesn't regenerate session on login</li>
              <li>Attacker uses the known session ID to access victim's account</li>
            </ul>
          </div>

          <div class="example">
            <h3>Demonstrate Session Fixation:</h3>
            
            <h4>1. Fix Session ID (Attacker Step):</h4>
            <form method="GET">
              <input type="hidden" name="action" value="fix">
              <input type="text" name="sessionId" placeholder="Enter malicious session ID" value="ATTACKER_SESSION_123">
              <button type="submit">Set Session ID</button>
            </form>
            
            <h4>2. Simulate Login (Victim Step):</h4>
            <form method="GET">
              <input type="hidden" name="action" value="login">
              <button type="submit">Login (without session regeneration)</button>
            </form>
            
            <h4>3. Reset for New Test:</h4>
            <form method="GET">
              <input type="hidden" name="action" value="reset">
              <button type="submit">Reset Session</button>
            </form>
          </div>

          <div class="example">
            <h3>Attack Scenarios:</h3>
            
            <h4>URL-based Session Fixation:</h4>
            <div class="payload">
              https://vulnerable-site.com/login?JSESSIONID=ATTACKER_SESSION_123
            </div>
            
            <h4>Cookie-based Session Fixation:</h4>
            <div class="payload">
              document.cookie = "JSESSIONID=ATTACKER_SESSION_123; path=/";
            </div>
            
            <h4>Form-based Session Fixation:</h4>
            <div class="payload">
              &lt;form action="https://vulnerable-site.com/login"&gt;<br>
              &nbsp;&nbsp;&lt;input type="hidden" name="sessionId" value="ATTACKER_SESSION_123"&gt;<br>
              &nbsp;&nbsp;&lt;input type="submit" value="Login"&gt;<br>
              &lt;/form&gt;
            </div>
          </div>

          <div class="example">
            <h3>How to fix:</h3>
            <ul>
              <li>Always regenerate session ID after successful login</li>
              <li>Never accept session IDs from URL parameters</li>
              <li>Use secure session configuration (HttpOnly, Secure, SameSite)</li>
              <li>Implement proper session timeout</li>
              <li>Validate session IDs server-side</li>
            </ul>
          </div>
        </div>

        <script>
          console.log('🚨 Session Fixation demonstration');
          console.log('Current session:', '${currentSession || 'None'}');
          console.log('Action performed:', '${action}');
          
          // Show current cookies
          console.log('All cookies:', document.cookie);
        </script>
      </body>
      </html>
    `;

    const response = new NextResponse(vulnerableHtml, {
      headers: {
        'Content-Type': 'text/html',
        // Missing security headers - VULNERABLE!
      },
    });

    // VULNERABLE: Set session without proper validation
    if (action === 'fix' && sessionId) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: false, // VULNERABLE: Should be true
        secure: false,   // VULNERABLE: Should be true in production
        sameSite: 'none', // VULNERABLE: Too permissive
        maxAge: 86400,   // 24 hours
      });
    } else if (action === 'login') {
      // Don't regenerate session on login - VULNERABLE!
      const sessionToUse = currentSession || 'session_' + Math.random().toString(36).substr(2, 9);
      response.cookies.set('session_id', sessionToUse, {
        httpOnly: false,
        secure: false,
        sameSite: 'none',
        maxAge: 86400,
      });
    } else if (action === 'reset') {
      response.cookies.delete('session_id');
    }

    return response;

  } catch (error) {
    console.error('Session fixation demonstration error:', error);
    return NextResponse.json({
      error: 'Session fixation demonstration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
