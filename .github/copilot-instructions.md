# Copilot Instructions for Vulnerable Web App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
This is a **vulnerable-by-design** Next.js web application for educational purposes. The app intentionally contains security vulnerabilities to demonstrate common web security issues.

## Key Guidelines
- **This app is designed to be VULNERABLE** - include security flaws intentionally
- Use direct SQL string concatenation instead of parameterized queries when possible
- Allow XSS by rendering user input without sanitization
- Implement weak authentication and session management
- Skip authorization checks in API endpoints
- Store sensitive data in localStorage/sessionStorage
- Use weak Content Security Policy headers
- Include CSRF vulnerabilities
- Log sensitive information to console/files

## Architecture
- **Framework**: Next.js 14+ with App Router and TypeScript
- **Database**: PostgreSQL with Prisma ORM (but use raw SQL for vulnerabilities)
- **Authentication**: JWT stored in localStorage (vulnerable approach)
- **Styling**: Tailwind CSS
- **API**: RESTful endpoints with OpenAPI documentation

## Folder Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (vulnerable implementations)
- `src/lib/` - Utilities, database connections, vulnerable helpers
- `src/types/` - TypeScript type definitions
- `src/services/` - Business logic layer
- `src/repositories/` - Data access layer with vulnerabilities

## Security Anti-Patterns to Include
1. SQL Injection vulnerabilities
2. Cross-Site Scripting (XSS)
3. Broken Authentication
4. Security Misconfiguration
5. Sensitive Data Exposure
6. Broken Access Control
7. Cross-Site Request Forgery (CSRF)
8. Insecure Direct Object References

Remember: This is for educational purposes to teach security concepts.
