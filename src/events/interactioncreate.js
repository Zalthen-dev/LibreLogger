require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events, AuditLogEvent } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

const client = require("../client.js");

module.exports = {
	eventType: Events.InteractionCreate,
	once: false,
	enabled: true,
	callback: async (interaction) => {
		if (!interaction.isChatInputCommand()) return;

		const command = client.commands.get(interaction.commandName);
		if (!command) return;

		try {
			await command.callback(client, interaction);
		} catch (error) {
			console.error(`❌ Failed to execute '${command.name}' command! ${error}`);
			
			let messageContent = { content: "⚠️ Failed to execute this command, tell the bot hoster about this!", ephemeral: true }
			if (interaction.replied || interaction.deferred)
				await interaction.followUp(messageContent);
			else 
				await interaction.reply(messageContent);
		}
	}
};