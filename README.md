<p align="center">
  <h1 align="center"><big>LibreLogger</big></h1>
</p>

<p align="center">A free &amp; open-source logging bot for Discord. Easy to setup, and easy to expand.</p>

LibreLogger is a Discord Bot that makes setting up logs easy to do, working out-of-the-box with the essentials, and being easy to expand with a simple codebase.

## Features
- Minimal offline data storage
- Commands to set log channel & include/exclude channels from logging
- Command to view the list of channels excluded from logging
- Commands to check bot ping & get server information
- Logs for message deletion & editing, and member joining & leaving

## How to Setup
LibreLogger requires two dependencies
- discord.js 14.22.1 `node install discord.js`
- dotenv 16.0.3 `node install dotenv`
- nodemon (to run) `node install nodemon`

1. Create a Discord bot with the `Message Content Intent` intent enabled, and add to your server
2. Clone repository `git clone https://github.com/Zalthen-dev/LibreLogger.git`
3. Rename .env.example to .env
4. Edit .env and add bot token & bot client ID
5. Change ENVIORNMENT to `"production"`
6. Run nodemon `nodemon`
