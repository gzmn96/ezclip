FROM node:20-slim
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages ./packages
COPY services ./services
RUN npm install --workspaces --include-workspace-root
RUN npm run build --workspace @ezclip/common && npm run build --workspace @ezclip/worker
CMD ["node", "services/worker/dist/index.js"]
