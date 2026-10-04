# USF Watch Party Waiting Room

Interactive realtime waiting room for the USF Discord watch party.

## Run locally
```
npm install
npm start
```
Open http://localhost:3000 in two browser windows to test shared presence.

## Deploy
This repo includes a `render.yaml`. Create a new Render Blueprint/Web Service from this repository. The server hosts the static site and WebSocket room together; no database or API keys are required.

Guest avatars and names are held only in server memory while connected. Uploaded images are resized by the browser before being shared. Restarting the service clears the room.
