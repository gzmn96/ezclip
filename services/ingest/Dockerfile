FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY services ./services
RUN npm install --workspaces --include-workspace-root
RUN npm run build --workspace @ezclip/ingest
CMD ["node", "services/ingest/dist/index.js"]
