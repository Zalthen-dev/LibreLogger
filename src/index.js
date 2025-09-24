require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const guildStore = require("./utils/guildStore.js");
const eventHandler = require("./handlers/eventhandler.js")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
require("./handlers/commandhandler")(client);

const guildCacheSaveInterval = Number(process.env.GUILD_CACHE_SAVE_INTERVAL) || 600

try {
    setInterval(async () => {
        console.log("💾 Saving guild cache to disk...")
        await guildStore.saveAll();
        console.log("💾 Successfully saved guild cache to disk!")
    }, guildCacheSaveInterval * 1000) // every 10 minutes

    console.log(`✅ Successfully set up guild cache save interval! The interval is ${process.env.GUILD_CACHE_SAVE_INTERVAL}s`)
} catch (error) {
    console.error(`❌ Failed to set up guild cache save interval! Canceling bot execution `, error);
    return;
}

client.once(Events.ClientReady, (c) => {
    console.log(`✅ ${c.user.tag} is online`);
});

eventHandler.setupEvents(client);

client.login(process.env.TOKEN);
