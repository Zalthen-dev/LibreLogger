const { MessageFlags } = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Pong! Check the ping of the bot',
	enabled: true,
	//options: [],
	callback: async (client, interaction) => {
		const sent = await interaction.deferReply({ withResponse: true, flags: MessageFlags.Ephemeral });
		const ping = sent.resource.message.createdTimestamp - interaction.createdTimestamp;

		interaction.editReply(`🏓 Pong! 
-# Client: \`${ping}ms\` | Websocket: \`${client.ws.ping}ms\``
		);
	},
};
