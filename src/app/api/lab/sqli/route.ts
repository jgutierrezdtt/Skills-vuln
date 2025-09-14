import { NextRequest, NextResponse } from 'next/server';
import { executeRawQuery } from '@/lib/db';

// Lab mode SQL injection demonstration - EXTREMELY VULNERABLE!
export async function GET(request: NextRequest) {
  // Check if lab mode is enabled
  if (process.env.LAB_MODE !== 'true') {
    return NextResponse.json({ error: 'Lab mode disabled' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userInput = searchParams.get('search') || '';

    // VULNERABLE: Direct SQL injection example
    const vulnerableQuery = `SELECT * FROM users WHERE email LIKE '%${userInput}%'`;

    console.log('🚨 EXECUTING VULNERABLE SQL QUERY:', vulnerableQuery);
    console.log('🚨 User input was:', userInput);

    let result;
    try {
      result = await executeRawQuery(vulnerableQuery);
    } catch (sqlError) {
      console.log('🚨 SQL ERROR (this shows the injection worked):', sqlError);
      
      return NextResponse.json({
        error: 'SQL Injection Detected!',
        vulnerability: 'SQL Injection',
        explanation: 'The query failed because malicious SQL was injected',
        yourInput: userInput,
        query: vulnerableQuery,
        sqlError: sqlError instanceof Error ? sqlError.message : String(sqlError),
        examples: [
          "Try: admin' OR '1'='1",
          "Try: test'; DROP TABLE users; --",
          "Try: ' UNION SELECT 1,password,3,4,5,6,7 FROM users --",
        ]
      }, { status: 400 });
    }

    return NextResponse.json({
      vulnerability: 'SQL Injection Demonstration',
      yourInput: userInput,
      queryExecuted: vulnerableQuery,
      results: result,
      warning: '🚨 This endpoint is intentionally vulnerable for educational purposes!',
      explanation: {
        issue: 'Direct string concatenation in SQL queries allows injection attacks',
        fix: 'Use parameterized queries or prepared statements',
        impact: 'Attackers can read, modify, or delete any data in the database'
      },
      examples: [
        {
          attack: "admin' OR '1'='1",
          description: 'Bypass login by making condition always true'
        },
        {
          attack: "test'; DROP TABLE users; --",
          description: 'Delete entire users table'
        },
        {
          attack: "' UNION SELECT password FROM users --",
          description: 'Extract password data from database'
        }
      ]
    });

  } catch (error) {
    console.error('Lab SQL injection error:', error);
    return NextResponse.json({
      error: 'Demonstration failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
