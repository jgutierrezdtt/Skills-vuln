import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

export async function GET() {
  try {
    // Read the OpenAPI YAML file
    const yamlPath = join(process.cwd(), 'openapi.yaml');
    const yamlContent = readFileSync(yamlPath, 'utf8');
    
    // Parse YAML to JSON
    const openApiSpec = yaml.load(yamlContent);

    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // VULNERABLE: Allows any origin
        'Access-Control-Allow-Methods': '*', // VULNERABLE: Allows all methods
        'Access-Control-Allow-Headers': '*', // VULNERABLE: Allows all headers
      },
    });
  } catch (error) {
    console.error('OpenAPI spec error:', error);
    
    // Expose internal error details - VULNERABLE!
    return NextResponse.json({
      error: 'Failed to load OpenAPI specification',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
