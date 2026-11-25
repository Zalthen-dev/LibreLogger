require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");

const client = require("./client.js");
const guildStore = require("./utils/guildStore.js");
const commandhandler = require("./handlers/commandhandler.js");
const eventHandler = require("./handlers/eventhandler.js");

client.commands = new Collection();
commandhandler.setupCommands(client);
eventHandler.setupEvents(client);

const guildCacheSaveInterval = Number(process.env.GUILD_CACHE_SAVE_INTERVAL) || 600

try {
	setInterval(async () => {
		console.log("💾 Saving guild cache to disk...")
		await guildStore.saveAll();
		console.log("💾 Successfully saved guild cache to disk!")
	}, guildCacheSaveInterval * 1000)

	console.log(`✅ Successfully set up guild cache save interval! The interval is ${process.env.GUILD_CACHE_SAVE_INTERVAL}s`)
} catch (error) {
	console.error(`❌ Failed to set up guild cache save interval! Canceling bot execution `, error);
	return;
}

//client.once(Events.ClientReady, (c) => {
//	console.log(`✅ ${c.user.tag} is online`);
//});

client.login(process.env.TOKEN);
