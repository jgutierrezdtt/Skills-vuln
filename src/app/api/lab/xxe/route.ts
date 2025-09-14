import { NextRequest, NextResponse } from 'next/server';

// XXE (XML External Entity) demonstration
export async function POST(request: NextRequest) {
  try {
    // Check if lab mode is enabled
    if (process.env.LAB_MODE !== 'true') {
      return NextResponse.json({
        error: 'Lab mode disabled',
        message: 'Set LAB_MODE=true in environment variables'
      }, { status: 403 });
    }

    const body = await request.text();
    
    // Log request for educational purposes
    console.log('🚨 XXE Lab - XML Input received:', body);

    // Vulnerable XML parsing - allows XXE attacks
    const vulnerableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>XXE Vulnerability Demonstration</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .vulnerability { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
          .example { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; }
          .payload { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          .warning { color: #d32f2f; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚨 XXE (XML External Entity) Vulnerability</h1>
          
          <div class="vulnerability">
            <h3>What happened:</h3>
            <p>Your XML input was processed by a vulnerable XML parser that allows external entity references.</p>
            <div class="payload">Received XML: ${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>

          <div class="vulnerability">
            <h3>Vulnerabilities demonstrated:</h3>
            <ul>
              <li>XML parser processes external entities</li>
              <li>No DTD validation restrictions</li>
              <li>File system access through entities</li>
              <li>Potential SSRF via HTTP entities</li>
            </ul>
          </div>

          <div class="example">
            <h3>XXE Payload Examples:</h3>
            <div class="payload">
              <!-- File disclosure -->
              &lt;?xml version="1.0"?&gt;<br>
              &lt;!DOCTYPE root [&lt;!ENTITY xxe SYSTEM "file:///etc/passwd"&gt;]&gt;<br>
              &lt;root&gt;&amp;xxe;&lt;/root&gt;
            </div>
            <div class="payload">
              <!-- SSRF via HTTP -->
              &lt;?xml version="1.0"?&gt;<br>
              &lt;!DOCTYPE root [&lt;!ENTITY xxe SYSTEM "http://internal-server/admin"&gt;]&gt;<br>
              &lt;root&gt;&amp;xxe;&lt;/root&gt;
            </div>
          </div>

          <div class="example">
            <h3>How to fix:</h3>
            <ul>
              <li>Disable external entity processing</li>
              <li>Use secure XML parsing libraries</li>
              <li>Validate and sanitize XML input</li>
              <li>Use JSON instead of XML when possible</li>
            </ul>
          </div>
        </div>

        <script>
          console.log('🚨 XXE vulnerability demonstration');
          console.log('XML input processed:', \`${body.substring(0, 100)}...\`);
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
    console.error('XXE demonstration error:', error);
    return NextResponse.json({
      error: 'XXE demonstration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// GET method to show the form
export async function GET() {
  try {
    if (process.env.LAB_MODE !== 'true') {
      return NextResponse.json({
        error: 'Lab mode disabled'
      }, { status: 403 });
    }

    const formHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>XXE Testing Form</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          textarea { width: 100%; height: 200px; margin: 10px 0; }
          button { background: #d32f2f; color: white; padding: 10px 20px; border: none; border-radius: 4px; }
          .example { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>XXE Vulnerability Tester</h1>
          <form method="POST">
            <label>XML Input (try XXE payloads):</label>
            <textarea name="xml" placeholder="Enter XML here...">
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>
            </textarea>
            <button type="submit">Test XXE</button>
          </form>
          
          <div class="example">
            <h3>Example payloads to try:</h3>
            <pre>
# File disclosure
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>

# SSRF attempt
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY xxe SYSTEM "http://localhost:22">]>
<root>&xxe;</root>
            </pre>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(formHtml, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('XXE form loading error:', error);
    return NextResponse.json({ error: 'Failed to load XXE form' }, { status: 500 });
  }
}
