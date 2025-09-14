# Vulnerable Notes App - Educational Security Demonstration

⚠️ **WARNING: This application is intentionally vulnerable and should NEVER be deployed to production!**

This project is designed for educational purposes to demonstrate common web application security vulnerabilities and how they can be exploited.

## 🎯 Purpose

This vulnerable web application demonstrates various security flaws commonly found in web applications, including:

- **SQL Injection** - Database queries vulnerable to injection attacks
- **Cross-Site Scripting (XSS)** - Unescaped user input in HTML rendering
- **Broken Authentication** - Weak password policies and session management
- **Sensitive Data Exposure** - Passwords stored in plain text and exposed in API responses
- **Broken Access Control** - No authorization checks on sensitive operations
- **Security Misconfiguration** - Missing security headers and weak configurations
- **Insecure Direct Object References** - Direct access to objects without permission checks
- **Cross-Site Request Forgery (CSRF)** - No CSRF protection on state-changing operations

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with React and TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM (configured for PostgreSQL compatibility)
- **Authentication**: Vulnerable JWT implementation with localStorage storage
- **Styling**: Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup**:
```bash
git clone <your-repo>
cd vulnerable_web
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env
```

3. **Database Setup**:
```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma db push

# Seed with vulnerable data
npx tsx prisma/seed.ts
```

4. **Run the application**:
```bash
npm run dev
```

5. **Open in browser**:
   - Application: http://localhost:3000
   - API Documentation: http://localhost:3000/api/openapi

## 🔐 Test Credentials

The application comes pre-seeded with vulnerable user accounts:

- **Admin User**: 
  - Email: `admin@vulnerable-app.com`
  - Password: `admin123`

- **Regular User**: 
  - Email: `user@example.com` 
  - Password: `password123`

- **Test User**:
  - Email: `test@test.com`
  - Password: `test`

## 🧪 Vulnerability Demonstrations

### SQL Injection Examples

1. **Login Bypass**:
   - Email: `admin' OR '1'='1' --`
   - Password: `anything`

2. **Search Injection**:
   - Search for: `' OR '1'='1`
   - Or try: `' UNION SELECT password FROM users --`

### XSS Examples

1. **Note Title XSS**:
   - Title: `<script>alert('XSS in title!')</script>`

2. **Note Content XSS**:
   - Content: `<img src="x" onerror="alert('XSS in content!')">`

### Lab Mode Endpoints

When `LAB_MODE=true` in your .env file:

- `/api/lab/sqli` - Interactive SQL injection demonstration
- `/api/lab/xss` - Cross-site scripting examples
- `/api/lab/csp` - Content Security Policy testing

## 🌐 API Documentation

The API is fully documented with OpenAPI 3.0:

- **JSON Spec**: http://localhost:3000/api/openapi
- **Swagger UI**: Use the Swagger Petstore with the above URL

### Key Vulnerable Endpoints

- `POST /api/auth/login` - Login with SQL injection vulnerability
- `POST /api/auth/register` - Registration allowing self-privilege escalation
- `GET /api/notes` - Search notes (no authentication, SQL injection)
- `GET /api/users` - List all users with passwords (no authentication)
- `GET /api/users/{id}` - Get user details and private notes (no authorization)

## 📦 Deployment to Vercel

### 1. GitHub Setup

```bash
# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial vulnerable app setup"
git remote add origin https://github.com/yourusername/vulnerable-notes.git
git push -u origin main
```

### 2. Vercel Deployment

1. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Configure the project

2. **Environment Variables**:
   Set these in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-weak-secret-for-demo
   LAB_MODE=true
   ADMIN_EMAIL=admin@vulnerable-app.com
   ADMIN_PASSWORD=admin123
   ```

3. **Database Setup**:
   - Create a PostgreSQL database in Vercel
   - Update `DATABASE_URL` in Vercel environment variables
   - Deploy the app
   - Run database migrations via Vercel CLI or dashboard

## ⚖️ Legal and Ethical Considerations

**IMPORTANT**: This application is for educational purposes only.

- ✅ **Allowed**: Learning, security training, penetration testing education
- ❌ **Prohibited**: Using in production, hosting publicly without clear warnings
- ❌ **Never**: Use these techniques against systems you don't own

## 🛡️ How to Fix These Vulnerabilities

### SQL Injection
- Use parameterized queries/prepared statements
- Input validation and sanitization
- Principle of least privilege for database access

### XSS
- Output encoding/escaping
- Content Security Policy (CSP)
- Input validation
- Use frameworks with built-in XSS protection

### Authentication & Authorization
- Strong password policies
- Secure session management
- Proper authorization checks
- Multi-factor authentication

### Data Protection
- Hash passwords with strong algorithms (bcrypt, Argon2)
- Don't expose sensitive data in API responses
- Use HTTPS everywhere
- Implement proper logging (without sensitive data)

## 📚 Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Remember**: This application is intentionally insecure. Use it responsibly for educational purposes only!
# Skills-vuln
