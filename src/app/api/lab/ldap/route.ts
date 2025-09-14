import { NextRequest, NextResponse } from 'next/server';

// LDAP Injection demonstration
export async function GET(request: NextRequest) {
  try {
    // Check if lab mode is enabled
    if (process.env.LAB_MODE !== 'true') {
      return NextResponse.json({
        error: 'Lab mode disabled',
        message: 'Set LAB_MODE=true in environment variables'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || '';
    const filter = searchParams.get('filter') || '';

    // Log request for educational purposes
    console.log('🚨 LDAP Injection Lab - Parameters:', { username, filter });

    // Simulate vulnerable LDAP query construction
    const ldapQuery = `(&(uid=${username})(${filter}))`;
    
    // Vulnerable LDAP query - allows injection
    const vulnerableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LDAP Injection Vulnerability</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .vulnerability { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
          .example { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; }
          .payload { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          .query { background: #fff3e0; border: 1px solid #ff9800; padding: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚨 LDAP Injection Vulnerability</h1>
          
          <div class="vulnerability">
            <h3>Generated LDAP Query:</h3>
            <div class="query">${ldapQuery.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>

          <div class="vulnerability">
            <h3>What happened:</h3>
            <ul>
              <li>User input was directly inserted into LDAP query</li>
              <li>No input validation or sanitization</li>
              <li>Special LDAP characters not escaped</li>
              <li>Query structure can be manipulated</li>
            </ul>
          </div>

          <div class="example">
            <h3>LDAP Injection Examples:</h3>
            
            <h4>Authentication Bypass:</h4>
            <div class="payload">
              Username: <code>admin)(cn=*</code><br>
              Results in: <code>(&(uid=admin)(cn=*)()</code>
            </div>
            
            <h4>Information Disclosure:</h4>
            <div class="payload">
              Filter: <code>objectClass=*)(uid=*</code><br>
              Results in: <code>(&(uid=user)(objectClass=*)(uid=*))</code>
            </div>
            
            <h4>Blind LDAP Injection:</h4>
            <div class="payload">
              Username: <code>*)(|(password=a*</code><br>
              Test different password patterns to extract data
            </div>
          </div>

          <div class="example">
            <h3>Test Form:</h3>
            <form method="GET">
              <div style="margin: 10px 0;">
                <label>Username:</label><br>
                <input type="text" name="username" value="${username}" style="width: 100%; padding: 5px;" 
                       placeholder="Try: admin)(cn=* or *)(|(password=a*">
              </div>
              <div style="margin: 10px 0;">
                <label>Filter:</label><br>
                <input type="text" name="filter" value="${filter}" style="width: 100%; padding: 5px;" 
                       placeholder="Try: objectClass=*)(uid=*">
              </div>
              <button type="submit" style="background: #d32f2f; color: white; padding: 10px 20px; border: none;">
                Generate LDAP Query
              </button>
            </form>
          </div>

          <div class="example">
            <h3>How to fix:</h3>
            <ul>
              <li>Use parameterized LDAP queries</li>
              <li>Escape special LDAP characters: ( ) * \\ NUL</li>
              <li>Validate input against whitelist</li>
              <li>Use LDAP libraries with built-in protections</li>
              <li>Implement proper access controls</li>
            </ul>
          </div>
        </div>

        <script>
          console.log('🚨 LDAP Injection demonstration');
          console.log('Generated query:', '${ldapQuery}');
          console.log('Username input:', '${username}');
          console.log('Filter input:', '${filter}');
        </script>
      </body>
      </html>
    `;

    return new NextResponse(vulnerableHtml, {
      headers: {
        'Content-Type': 'text/html',
        // No security headers - VULNERABLE!
      },
    });

  } catch (error) {
    console.error('LDAP injection demonstration error:', error);
    return NextResponse.json({
      error: 'LDAP demonstration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
