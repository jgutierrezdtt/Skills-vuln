import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Vulnerable file upload endpoint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Log upload attempt - VULNERABLE!
    console.log('🚨 File upload attempt:', {
      originalName: file.name,
      customFilename: filename,
      size: file.size,
      type: file.type,
    });

    // NO FILE TYPE VALIDATION - EXTREMELY VULNERABLE!
    // NO SIZE LIMITS - VULNERABLE!
    // NO FILENAME SANITIZATION - VULNERABLE!
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use custom filename if provided, otherwise use original name
    const finalFilename = filename || file.name;
    
    // Directory traversal vulnerability - allows writing anywhere!
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, finalFilename); // NO PATH SANITIZATION!

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log('Upload directory already exists or creation failed:', error);
    }

    // Write file without any security checks - VULNERABLE!
    await writeFile(filePath, buffer);

    // Determine file URL for public access
    const fileUrl = `/uploads/${finalFilename}`;

    console.log('✅ File uploaded successfully to:', filePath);

    return NextResponse.json({
      success: true,
      data: {
        message: 'File uploaded successfully',
        filename: finalFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        path: filePath, // Exposing server path - VULNERABLE!
      },
      debug: {
        timestamp: new Date().toISOString(),
        serverPath: filePath,
        fileContent: buffer.length > 1000 ? 'Binary file (large)' : buffer.toString().substring(0, 200),
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'File upload failed',
      details: error instanceof Error ? error.message : String(error),
      debug: {
        stack: error instanceof Error ? error.stack : undefined,
      }
    }, { status: 500 });
  }
}

// GET method to show upload form
export async function GET() {
  const uploadFormHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vulnerable File Upload</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .vulnerability { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
        .example { background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; }
        input[type="file"], input[type="text"] { width: 100%; padding: 10px; margin: 10px 0; }
        button { background: #d32f2f; color: white; padding: 10px 20px; border: none; border-radius: 4px; }
        .payload { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚨 Vulnerable File Upload</h1>
        
        <div class="vulnerability">
          <h3>This upload endpoint has NO security controls:</h3>
          <ul>
            <li>No file type validation</li>
            <li>No file size limits</li>
            <li>No filename sanitization</li>
            <li>Directory traversal possible</li>
            <li>Can overwrite system files</li>
            <li>Executable files allowed</li>
          </ul>
        </div>

        <form enctype="multipart/form-data" method="POST">
          <label>Select File (ANY type allowed!):</label>
          <input type="file" name="file" required>
          
          <label>Custom Filename (Optional - try directory traversal!):</label>
          <input type="text" name="filename" placeholder="Try: ../../../evil.php or ../../.env">
          
          <button type="submit">Upload File</button>
        </form>

        <div class="example">
          <h3>Dangerous Test Cases:</h3>
          
          <h4>1. Web Shell Upload:</h4>
          <div class="payload">Create a file named: shell.php<br>Content: &lt;?php system($_GET['cmd']); ?&gt;</div>
          
          <h4>2. Directory Traversal:</h4>
          <div class="payload">Filename: ../../../evil.txt<br>Overwrites files outside upload directory</div>
          
          <h4>3. Configuration Overwrite:</h4>
          <div class="payload">Filename: ../../.env<br>Could overwrite environment variables</div>
          
          <h4>4. Large File DoS:</h4>
          <div class="payload">Upload very large files to consume disk space</div>
        </div>

        <div class="example">
          <h3>How to fix:</h3>
          <ul>
            <li>Validate file types with whitelist</li>
            <li>Implement file size limits</li>
            <li>Sanitize filenames completely</li>
            <li>Store uploads outside web root</li>
            <li>Use antivirus scanning</li>
            <li>Generate random filenames</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(uploadFormHtml, {
    headers: { 'Content-Type': 'text/html' }
  });
}
