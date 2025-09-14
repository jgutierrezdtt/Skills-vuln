#!/bin/bash

# Vulnerable Web App Setup Script
# This script sets up the vulnerable application for educational purposes

echo "🚨 Setting up VULNERABLE Web Application for Educational Purposes"
echo "⚠️  WARNING: This application contains intentional security flaws!"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Setup environment
if [ ! -f .env ]; then
    echo "🔧 Setting up environment variables..."
    cp .env.example .env
    echo "✅ Created .env file from template"
else
    echo "✅ Environment file already exists"
fi

# Setup database
echo "🗄️ Setting up vulnerable database..."

# Generate Prisma client
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Push database schema
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to create database"
    exit 1
fi

# Seed with vulnerable data
echo "🌱 Seeding database with vulnerable data..."
npx tsx prisma/seed.ts

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the vulnerable application:"
echo "   npm run dev"
echo ""
echo "🔐 Test credentials:"
echo "   Admin: admin@vulnerable-app.com / admin123"
echo "   User:  user@example.com / password123"
echo ""
echo "🧪 Lab endpoints (when running):"
echo "   SQL Injection: http://localhost:3000/api/lab/sqli?search=admin"
echo "   XSS Demo:      http://localhost:3000/api/lab/xss?input=<script>alert('XSS')</script>&reflect=true"
echo "   CSP Demo:      http://localhost:3000/api/lab/csp?mode=weak"
echo ""
echo "📚 API Documentation: http://localhost:3000/api/openapi"
echo ""
echo "⚠️  REMEMBER: This app is INTENTIONALLY VULNERABLE for educational purposes!"
echo "   🚫 NEVER deploy to production"
echo "   🚫 NEVER use on real systems"
echo "   ✅ Only use for learning and security training"
echo ""
