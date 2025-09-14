import { NextRequest, NextResponse } from 'next/server';

// SSTI (Server-Side Template Injection) demonstration
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
    const template = searchParams.get('template') || 'Hello {{name}}!';
    const name = searchParams.get('name') || 'World';

    // Log request for educational purposes
    console.log('🚨 SSTI Lab - Template:', template, 'Name:', name);

    // Vulnerable template rendering - allows SSTI
    let renderedTemplate = template;
    
    // Simulate vulnerable template engine behavior
    try {
      // Simple template replacement - VULNERABLE!
      renderedTemplate = template.replace(/\{\{name\}\}/g, name);
      
      // Simulate more complex template processing (educational)
      if (template.includes('{{')) {
        // This would execute in real template engines like Jinja2, Twig, etc.
        renderedTemplate = template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
          console.log('🚨 SSTI: Attempting to process expression:', expression);
          
          // Simulate dangerous expression evaluation
          if (expression.includes('name')) {
            return name;
          }
          if (expression.includes('7*7')) {
            return '49'; // Simulated calculation
          }
          if (expression.includes('config')) {
            return '[CONFIG_OBJECT]'; // Simulated config access
          }
          
          return `[PROCESSED: ${expression}]`;
        });
      }
    } catch (error) {
      console.error('Template processing error:', error);
      renderedTemplate = 'Template processing failed';
    }

    const vulnerableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SSTI Vulnerability Demonstration</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .vulnerability { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
          .example { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; }
          .payload { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          .result { background: #fff3e0; border: 1px solid #ff9800; padding: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚨 SSTI (Server-Side Template Injection)</h1>
          
          <div class="vulnerability">
            <h3>Template Result:</h3>
            <div class="result">${renderedTemplate.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>

          <div class="vulnerability">
            <h3>What happened:</h3>
            <ul>
              <li>User input was processed as template code</li>
              <li>Template engine executed user-controlled expressions</li>
              <li>No input sanitization or sandboxing</li>
              <li>Potential for remote code execution</li>
            </ul>
          </div>

          <div class="example">
            <h3>SSTI Payload Examples:</h3>
            
            <h4>Basic Detection:</h4>
            <div class="payload">{{7*7}} - Should render as 49</div>
            
            <h4>Jinja2/Flask:</h4>
            <div class="payload">{{config.items()}} - Access configuration</div>
            <div class="payload">{{request.application.__globals__.__builtins__.__import__('os').popen('whoami').read()}} - RCE</div>
            
            <h4>Twig:</h4>
            <div class="payload">{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("whoami")}} - RCE</div>
            
            <h4>Smarty:</h4>
            <div class="payload">{php}echo \`whoami\`;{/php} - RCE</div>
          </div>

          <div class="example">
            <h3>Test Form:</h3>
            <form method="GET">
              <div style="margin: 10px 0;">
                <label>Template:</label><br>
                <input type="text" name="template" value="${template}" style="width: 100%; padding: 5px;" 
                       placeholder="Try: {{7*7}} or {{config}}">
              </div>
              <div style="margin: 10px 0;">
                <label>Name Variable:</label><br>
                <input type="text" name="name" value="${name}" style="width: 100%; padding: 5px;" 
                       placeholder="Value for {{name}} variable">
              </div>
              <button type="submit" style="background: #d32f2f; color: white; padding: 10px 20px; border: none;">
                Render Template
              </button>
            </form>
          </div>

          <div class="example">
            <h3>How to fix:</h3>
            <ul>
              <li>Never allow user input in template source</li>
              <li>Use parameterized templates with data binding</li>
              <li>Implement template sandboxing</li>
              <li>Validate and sanitize all template inputs</li>
              <li>Use logic-less template engines when possible</li>
            </ul>
          </div>
        </div>

        <script>
          console.log('🚨 SSTI vulnerability demonstration');
          console.log('Original template:', '${template}');
          console.log('Rendered result:', '${renderedTemplate}');
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
    console.error('SSTI demonstration error:', error);
    return NextResponse.json({
      error: 'SSTI demonstration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
