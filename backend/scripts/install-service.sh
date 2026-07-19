#!/bin/bash

set -e

echo "📦 Installing production dependencies..."

pnpm add \
express \
cors \
helmet \
compression \
cookie-parser \
dotenv \
zod \
bcrypt \
jsonwebtoken \
pino \
pino-http \
swagger-ui-express \
yamljs \
redis \
amqplib \
uuid \
@prisma/client

echo "📦 Installing development dependencies..."

pnpm add -D \
typescript \
tsx \
nodemon \
prisma \
jest \
ts-jest \
supertest \
eslint \
prettier \
@types/node \
@types/express \
@types/cors \
@types/jsonwebtoken \
@types/bcrypt \
@types/cookie-parser \
@types/compression \
@types/supertest \
@types/jest

echo ""
echo "✅ Dependencies Installed Successfully"



# Windows PowerShell:
#
# bash scripts/install-service.sh