import { NextRequest, NextResponse } from 'next/server';
import { isLabModeEnabled, getLabDisabledResponse, logLabActivity } from '@/lib/lab-helpers';

// Lab mode XSS demonstration
export async function GET(request: NextRequest) {
  // ❌ VULNERABILIDAD: Verificación débil de lab mode
  if (!isLabModeEnabled()) {
    return NextResponse.json(getLabDisabledResponse(), { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userInput = searchParams.get('input') || '';
    const reflection = searchParams.get('reflect') === 'true';

    // ❌ VULNERABILIDAD: Log de actividad vulnerable
    logLabActivity('XSS', userInput);

    // Generate vulnerable HTML that reflects user input without escaping
    const vulnerableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>XSS Vulnerability Demonstration</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px;
            background: #f0f0f0;
          }
          .warning { 
            background: #ffebee; 
            border: 2px solid #f44336; 
            padding: 20px; 
            margin: 20px 0;
            border-radius: 5px;
          }
          .example {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 10px 0;
          }
          .input-section {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          input[type="text"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          button {
            background: #2196f3;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h1>🚨 XSS Vulnerability Demonstration</h1>
        
        <div class="warning">
          <h2>⚠️ WARNING</h2>
          <p>This page is intentionally vulnerable to demonstrate XSS attacks for educational purposes!</p>
        </div>

        <div class="input-section">
          <h2>Test XSS Vulnerability</h2>
          <form method="GET">
            <label for="input">Enter some text (try malicious scripts):</label>
            <input type="text" name="input" id="input" value="${userInput}" placeholder="Try: <script>alert('XSS!')</script>">
            <input type="hidden" name="reflect" value="true">
            <button type="submit">Submit (Vulnerable)</button>
          </form>
        </div>

        ${reflection ? `
          <div class="warning">
            <h2>🚨 Your input was reflected without escaping:</h2>
            <div style="border: 1px solid red; padding: 10px; background: #ffebee;">
              ${userInput}
            </div>
            <p><strong>If you see an alert or other script execution, the XSS attack worked!</strong></p>
          </div>
        ` : ''}

        <div class="example">
          <h3>Try these XSS payloads:</h3>
          <ul>
            <li><code>&lt;script&gt;alert('XSS!')&lt;/script&gt;</code></li>
            <li><code>&lt;img src=x onerror=alert('XSS')&gt;</code></li>
            <li><code>&lt;svg onload=alert('XSS')&gt;</code></li>
            <li><code>&lt;iframe src=javascript:alert('XSS')&gt;</code></li>
            <li><code>&lt;script&gt;document.cookie='stolen='+document.cookie&lt;/script&gt;</code></li>
          </ul>
        </div>

        <div class="example">
          <h3>What makes this vulnerable?</h3>
          <ul>
            <li>User input is reflected directly into HTML without encoding/escaping</li>
            <li>No Content Security Policy (CSP) headers</li>
            <li>No input validation or sanitization</li>
            <li>HTML contexts allow script execution</li>
          </ul>
        </div>

        <div class="example">
          <h3>How to fix:</h3>
          <ul>
            <li>Always encode/escape user input before rendering</li>
            <li>Use Content Security Policy headers</li>
            <li>Validate and sanitize all user input</li>
            <li>Use frameworks that auto-escape by default</li>
          </ul>
        </div>

        <script>
          // This script runs on every page load - another vulnerability!
          console.log('🚨 Insecure script executing on page load');
          console.log('User input was: ${userInput}');
          
          // Simulate cookie stealing (for demo purposes)
          if ('${userInput}'.includes('document.cookie')) {
            console.log('🚨 Cookie stealing attempt detected!');
            console.log('Available cookies:', document.cookie);
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(vulnerableHtml, {
      headers: {
        'Content-Type': 'text/html',
        // No security headers - VULNERABLE!
        // Missing: Content-Security-Policy, X-Frame-Options, etc.
      },
    });

  } catch (error) {
    console.error('Lab XSS demonstration error:', error);
    return NextResponse.json({
      error: 'Demonstration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
