FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared-types/package.json packages/shared-types/

RUN npm ci

COPY packages/shared-types packages/shared-types
COPY apps/frontend apps/frontend

RUN npm run build -w @devhub/shared-types

WORKDIR /app/apps/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
