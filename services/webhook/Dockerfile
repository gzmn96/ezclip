FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages ./packages
COPY services ./services
RUN npm install --workspaces --include-workspace-root
RUN npm run build --workspace @ezclip/common && npm run build --workspace @ezclip/webhook
CMD ["node", "services/webhook/dist/index.js"]
