# Dungeon Mayhem Online v0.1

Prototype for real-time room creation and joining (3–6 players) using Express and Socket.IO.

## Run locally
1. Install Node.js 18 or newer.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.
5. To test multiplayer locally, open the page in multiple browser tabs. For friends on other networks, deploy the app to a Node.js hosting provider and share its public URL.

## Included
- Create a room with a generated six-character code.
- Choose a room capacity from 3 to 6 players.
- Private-room toggle (rooms are currently joinable by code; public room discovery is not implemented).
- Join by room code, live player list, host transfer when host leaves, and leave room.
- Responsive Thai UI for mobile and desktop.

## Not included yet
Accounts, persistent database, public room browser, game rules/cards, turn system, and start-game flow. Rooms are held in server memory and disappear when the server restarts.
