# Mr. Megee
Mr. Megee is a Discord.js bot that has a primary focus on unique features, trolling, and possibly being sentient.

[Bot Invite](https://discord.com/oauth2/authorize?client_id=472812336214966283&permissions=313408&scope=bot)

[Discord Server](https://discord.gg/c7hq5PMhqV)

## Features
- The Mr. Megee Idle Game
  - The only idle game in existance to have both a story and ending
  - Features many shop items, passive perks, and prestige bonuses that unlock more features
  - Super extensive for one singular feature on a Discord bot!
- Quotes
  - Produces a random user submitted quote
  - Submit your own enthralling or super dumb quotes!
- Polls
  - The Everybody Votes channel in Discord!
  - Create simple polls with two options
  - Vote on polls submitted by other users
- Trolls
  - The Nuke.
    - Drop a BOMB of spam pings to one of your friends
  - p.
    - Play a funny sound from the extensive p soundboard (45+ sounds to choose from!)
  - actually / aktchually 
    - Instantly win any argument using the likeness of Adam Conover or a nerd emoji.
  - rps
    - Play rock paper scissors against Mr. Megee. Be careful though, he's a master!
- r/
  - Pull a random post from any subreddit
- steamroll
  - Pull a random game from Steam
- Hidden commands!
  - I ain't sayin' nothin'
- And more!

## (very bad) Build Instructions
1. Install Node.js 16.11.0 or newer.
2. Download the [latest release](https://github.com/Colind8/Mr.-Megee/releases/latest) of Mr. Megee
3. Install the following required packages:
- `npm install discord.js`
- `npm install sqlite3`
- `npm install @discordjs/voice`
- `npm install node-fetch@2.6.7`
- `npm install tweetnacl`
4. Create a `megee.db` database. There's no default one yet so you'll have to make it yourself by looking through the code.
5. Open config.json and add your bot token into the blank "token" value. Also replace the owner ID with your own and the audio file path with your own.
6. Create an audio folder in that path. The default sounds aren't included in this repository, so you can just drag your own mp3s in and change sounds.json to be what you want.
7. Install [FFmpeg](https://ffmpeg.org/download.html) to the root folder.