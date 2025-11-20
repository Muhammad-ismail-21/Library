# Tech Snippet Library

Simple web app to save and browse short technical code snippets & notes.

## Features
- Add snippet title, language, tags, and content
- List all snippets
- Simple HTML/CSS frontend (no frameworks)
- Backend: Node.js + Express + Mongoose (MongoDB Atlas)

## Setup (local)
1. Install Node.js (>=18 recommended)
2. Copy `.env.example` to `.env` and set `MONGODB_URI` with your Atlas connection string.
3. `npm install`
4. `npm start`
5. Open http://localhost:3000

## Deploy on Render
1. Create a new Git repo and push this project (you can upload this zip's contents).
2. On Render, create a new **Web Service** from your Git repo.
3. Set Environment variable `MONGODB_URI` in Render's dashboard to your Atlas connection string.
4. Build command: `npm install`
5. Start command: `npm start`

## Notes
- The code uses an environment variable `MONGODB_URI` for the connection string.
- Do **not** commit your Atlas credentials directly into the repo.
