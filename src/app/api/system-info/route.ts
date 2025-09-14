import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { platform, arch, version, release } from 'os';

// Information disclosure endpoint - EXTREMELY VULNERABLE!
export async function GET(request: NextRequest) {
  try {
    // Log request details - VULNERABLE!
    console.log('🚨 System info request from:', {
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      timestamp: new Date().toISOString(),
    });

    // Gather sensitive system information
    const systemInfo = {
      // Operating System Info
      platform: platform(),
      architecture: arch(),
      nodeVersion: version,
      osRelease: release(),
      
      // Process Info
      processId: process.pid,
      nodeEnv: process.env.NODE_ENV,
      
      // Environment Variables (EXTREMELY VULNERABLE!)
      environment: {
        ...process.env,
        // Include sensitive info that should NEVER be exposed
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      },
      
      // Memory Usage
      memory: process.memoryUsage(),
      
      // Current Working Directory
      cwd: process.cwd(),
      
      // Request Headers (potential token leakage)
      requestHeaders: Object.fromEntries(request.headers.entries()),
    };

    const sensitiveFiles: Record<string, string> = {};
    
    // Try to read sensitive files - VULNERABLE!
    const filesToRead = [
      '/etc/passwd',
      '/etc/hosts',
      process.cwd() + '/.env',
      process.cwd() + '/package.json',
      process.cwd() + '/next.config.js',
    ];

    for (const filePath of filesToRead) {
      try {
        const content = await readFile(filePath, 'utf-8');
        sensitiveFiles[filePath] = content;
        console.log(`🚨 Successfully read sensitive file: ${filePath}`);
      } catch (error) {
        sensitiveFiles[filePath] = `Error reading file: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    const response = {
      success: true,
      message: 'System information retrieved successfully',
      warning: '🚨 This endpoint exposes EXTREMELY sensitive information!',
      data: {
        system: systemInfo,
        sensitiveFiles,
        timestamp: new Date().toISOString(),
        
        // Additional vulnerable info
        vulnerabilityInfo: {
          exposedSecrets: Object.keys(process.env).filter(key => 
            key.includes('SECRET') || 
            key.includes('PASSWORD') || 
            key.includes('TOKEN') ||
            key.includes('KEY')
          ),
          databaseConnected: !!process.env.DATABASE_URL,
          adminCredentials: {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
          },
        }
      },
      debug: {
        requestInfo: {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
        },
        serverInfo: {
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      }
    };

    // Log everything - VULNERABLE!
    console.log('🚨 Exposing sensitive system information:', {
      databaseUrl: process.env.DATABASE_URL?.substring(0, 20) + '...',
      jwtSecret: process.env.JWT_SECRET?.substring(0, 10) + '...',
      adminCredentials: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      }
    });

    return NextResponse.json(response, {
      headers: {
        // Disable caching - but still vulnerable
        'Cache-Control': 'no-store',
        // Missing security headers
        'X-Powered-By': 'Vulnerable-App-1.0',
        'Server': 'Vulnerable-Next.js',
      }
    });

  } catch (error) {
    console.error('System info endpoint error:', error);
    
    // Even error responses leak information - VULNERABLE!
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve system information',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      debug: {
        processEnv: process.env,
        processInfo: {
          pid: process.pid,
          cwd: process.cwd(),
          platform: platform(),
        }
      }
    }, { status: 500 });
  }
}
