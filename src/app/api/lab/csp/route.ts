import { NextRequest, NextResponse } from 'next/server';

// Lab mode CSP demonstration
export async function GET(request: NextRequest) {
  // Check if lab mode is enabled
  if (process.env.LAB_MODE !== 'true') {
    return NextResponse.json({ error: 'Lab mode disabled' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const cspMode = searchParams.get('mode') || 'weak';

  let cspHeader = '';
  let description = '';

  switch (cspMode) {
    case 'none':
      cspHeader = '';
      description = 'No CSP - completely vulnerable';
      break;
    case 'weak':
      cspHeader = "default-src 'self' 'unsafe-inline' 'unsafe-eval' *";
      description = 'Weak CSP - allows inline scripts and eval';
      break;
    case 'strong':
      cspHeader = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'";
      description = 'Strong CSP - blocks most XSS attempts';
      break;
    default:
      cspHeader = "default-src 'self' 'unsafe-inline' 'unsafe-eval' *";
      description = 'Default weak CSP';
  }

  const vulnerableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CSP Vulnerability Demonstration</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px;
          background: #f5f5f5;
        }
        .warning { 
          background: #ffebee; 
          border: 2px solid #f44336; 
          padding: 20px; 
          margin: 20px 0;
          border-radius: 5px;
        }
        .info {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 15px;
          margin: 10px 0;
        }
        .test-section {
          background: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          border: 1px solid #ddd;
        }
        button {
          background: #f44336;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
        }
        .strong { background: #4caf50; }
        .weak { background: #ff9800; }
      </style>
    </head>
    <body>
      <h1>🚨 Content Security Policy (CSP) Demonstration</h1>
      
      <div class="warning">
        <h2>⚠️ Current CSP Mode: ${cspMode.toUpperCase()}</h2>
        <p><strong>CSP Header:</strong> ${cspHeader || 'None'}</p>
        <p><strong>Description:</strong> ${description}</p>
      </div>

      <div class="test-section">
        <h2>Test Different CSP Configurations:</h2>
        <a href="?mode=none"><button>No CSP</button></a>
        <a href="?mode=weak"><button class="weak">Weak CSP</button></a>
        <a href="?mode=strong"><button class="strong">Strong CSP</button></a>
      </div>

      <div class="test-section">
        <h2>XSS Test Buttons (click to test CSP effectiveness):</h2>
        <button onclick="alert('Inline script executed!')">Test Inline Script</button>
        <button onclick="eval('alert(\'eval() executed!\')')">Test eval()</button>
        <button onclick="new Function('alert(\'Function constructor executed!\')')()">Test Function Constructor</button>
      </div>

      <div class="test-section">
        <h2>External Resource Tests:</h2>
        <p>Try loading external JavaScript:</p>
        <button onclick="loadExternalScript()">Load External Script</button>
        <div id="external-result"></div>
      </div>

      <div class="info">
        <h3>CSP Vulnerability Analysis:</h3>
        <ul>
          <li><strong>'unsafe-inline'</strong> allows inline scripts and styles - defeats XSS protection</li>
          <li><strong>'unsafe-eval'</strong> allows eval(), Function constructor - enables code injection</li>
          <li><strong>Wildcards (*)</strong> allow loading from any domain - bypasses restrictions</li>
          <li><strong>Missing CSP</strong> provides no protection against XSS attacks</li>
        </ul>
      </div>

      <div class="info">
        <h3>What you should see:</h3>
        <ul>
          <li><strong>No CSP:</strong> All scripts execute successfully</li>
          <li><strong>Weak CSP:</strong> All scripts still execute (CSP allows unsafe operations)</li>
          <li><strong>Strong CSP:</strong> Most scripts blocked by CSP (check console for violations)</li>
        </ul>
      </div>

      <script>
        // This inline script will be blocked by strong CSP
        console.log('🚨 Inline script executed! CSP mode: ${cspMode}');
        console.log('🚨 If you see this message, inline scripts are allowed');
        
        function loadExternalScript() {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
          script.onload = () => {
            document.getElementById('external-result').innerHTML = 
              '<p style="color: green;">✅ External script loaded successfully!</p>';
          };
          script.onerror = () => {
            document.getElementById('external-result').innerHTML = 
              '<p style="color: red;">❌ External script blocked by CSP!</p>';
          };
          document.head.appendChild(script);
        }

        // Demonstrate various CSP bypass attempts
        setTimeout(() => {
          try {
            eval('console.log("🚨 eval() executed - CSP allows unsafe-eval")');
          } catch (e) {
            console.log('✅ eval() blocked by CSP:', e.message);
          }
        }, 1000);
      </script>
    </body>
    </html>
  `;

  const headers: Record<string, string> = {
    'Content-Type': 'text/html',
  };

  // Set CSP header based on mode
  if (cspHeader) {
    headers['Content-Security-Policy'] = cspHeader;
  }

  // Add other security headers or omit them to show vulnerabilities
  if (cspMode === 'strong') {
    headers['X-Frame-Options'] = 'DENY';
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  }
  // Weak and none modes intentionally omit security headers

  return new NextResponse(vulnerableHtml, { headers });
}
