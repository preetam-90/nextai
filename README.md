# Next.js AI Chatbot

<p align="center">
  <a href="https://chat.vercel.ai/">
    <img alt="Next.js 14 and App Router-ready AI chatbot" src="app/(chat)/opengraph-image.png" width="600"/>
  </a>
</p>

<h1 align="center">Chat SDK</h1>

<p align="center">
  <strong>Chat SDK</strong> is a free, open-source template built with <a href="https://nextjs.org">Next.js</a> and the <a href="https://sdk.vercel.ai/docs">AI SDK</a>, empowering developers to create powerful, customizable chatbot applications with ease.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>📚 Read Docs</strong></a> · 
  <a href="#features"><strong>✨ Features</strong></a> · 
  <a href="#model-providers"><strong>🤖 Model Providers</strong></a> · 
  <a href="#application-flow"><strong>📊 Application Flow</strong></a> · 
  <a href="#deploy-your-own"><strong>🚀 Deploy Your Own</strong></a> · 
  <a href="#running-locally"><strong>💻 Running Locally</strong></a>
</p>

---

## ✨ Features

- **[Next.js](https://nextjs.org) App Router**
  - Advanced routing for seamless navigation and optimal performance
  - React Server Components (RSCs) and Server Actions for efficient server-side rendering
- **[AI SDK](https://sdk.vercel.ai/docs)**
  - Unified API for generating text, structured objects, and tool calls with Large Language Models (LLMs)
  - Hooks for building dynamic chat and generative user interfaces
  - Supports xAI (default), OpenAI, Fireworks, and other model providers
- **[shadcn/ui](https://ui.shadcn.com)**
  - Beautifully crafted components styled with [Tailwind CSS](https://tailwindcss.com)
  - Accessible and flexible component primitives from [Radix UI](https://radix-ui.com)
- **Data Persistence**
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for storing chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- **[Auth.js](https://authjs.dev)**
  - Simple and secure authentication for user management

---

## 🤖 Model Providers

The template ships with [xAI](https://x.ai) `grok-2-1212` as the default chat model. With the [AI SDK](https://sdk.vercel.ai/docs), you can easily switch to providers like [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://sdk.vercel.ai/providers/ai-sdk-providers) with minimal code changes.

---

## 📊 Application Flow

The following diagram illustrates the structure and flow of the Next.js AI Chatbot application:

<p align="center">
  <img alt="Next.js AI Chatbot Application Flow Diagram" src="https://i.postimg.cc/76mcgHSH/Nextjs-AI-Chatbot-Diagram-1.png" width="600"/>
</p>

---

## 🚀 Deploy Your Own

Deploy your own version of the Next.js AI Chatbot to Vercel with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET&envDescription=Learn+more+about+how+to+get+the+API+Keys+for+the+application&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&demo-title=AI+Chatbot&demo-description=An+Open-Source+AI+Chatbot+Template+Built+With+Next.js+and+the+AI+SDK+by+Vercel.&demo-url=https%3A%2F%2Fchat.vercel.ai&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22ai%22%2C%22productSlug%22%3A%22grok%22%2C%22integrationSlug%22%3A%22xai%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22upstash-kv%22%2C%22integrationSlug%22%3A%22upstash%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

---

## 💻 Running Locally

To run the Next.js AI Chatbot locally, use the environment variables defined in [`.env.example`](.env.example). We recommend using [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables), but a `.env` file will suffice.

> **⚠️ Note**: Do not commit your `.env` file, as it contains sensitive secrets that could allow others to access your AI and authentication provider accounts.

### Steps

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Link your local instance with Vercel and GitHub accounts (creates `.vercel` directory):
   ```bash
   vercel link
   ```
3. Download your environment variables:
   ```bash
   vercel env pull
   ```
4. Install dependencies and start the development server:
   ```bash
   pnpm install
   pnpm dev
   ```

Your app should now be running on [http://localhost:3000](http://localhost:3000).

---

<p align="center">
  Built with ❤️ by the Vercel team. Licensed under the <a href="https://github.com/vercel/ai-chatbot/blob/main/LICENSE">MIT License</a>.
</p>
