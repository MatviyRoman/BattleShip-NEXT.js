# Battleship Game (Next.js)

This is a modern implementation of the classic Battleship game, built with Next.js, React, TypeScript, and Tailwind CSS.

## Game Description

Battleship is a two-player strategy game where each player places a fleet of ships on a 10x10 grid and then takes turns trying to guess the locations of the opponent's ships. The first player to sink all of the opponent's ships wins.

### Features
- **Modern UI:** Responsive, clean interface using Tailwind CSS.
- **Ship Placement:** Place ships of various sizes (including 6-deck, 5-deck, 4-deck, 3-deck, 2-deck, and single-deck ships) on your board. Ships cannot touch each other, even diagonally.
- **Game Modes:** Play against a bot (AI) or locally against another human (hot-seat mode).
- **Turn-Based Play:** Players take turns attacking the opponent's board. Hits and misses are visually indicated.
- **Victory & Defeat Effects:** When the game ends, a confetti animation and a message ("YOU WIN!" or "YOU LOSE!") are shown. The effect can be closed manually or will disappear after a few seconds.
- **Deck Counter:** Displays the number of ship segments (decks) remaining for each player.
- **Orientation Toggle:** Choose to place ships vertically or horizontally.
- **Restart Option:** Start a new game at any time.

## How to Play
1. **Choose Game Mode:** Select to play against a bot or another human.
2. **Place Your Ships:** Select a ship and place it on your board. Use the orientation button to switch between vertical and horizontal placement. Ships cannot be adjacent to each other.
3. **Start Battle:** Once all ships are placed, the attack phase begins.
4. **Take Turns:** Click on the opponent's board to attack. The game will indicate hits (✖) and misses (•).
5. **Win or Lose:** The game ends when all of one player's ships are sunk. A celebratory or defeat effect will appear.
6. **Restart:** Click the restart button to play again.

## Technologies Used
- Next.js (App Router)
- React (with hooks)
- TypeScript
- Tailwind CSS

## Live Demo
Play the game online: [battle-ship-next-js.vercel.app](https://battle-ship-next-js.vercel.app/)

---

Enjoy the game and challenge your friends or the bot!
