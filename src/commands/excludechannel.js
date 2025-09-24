const { ApplicationCommandOptionType, ChannelType } = require('discord.js');
const { getGuild, setGuild } = require("../utils/guildStore.js");

module.exports = {
    name: "excludechannel",
    description: "Excludes a channel from being logged",
    options: [
        {
            name: 'channel',
            description: 'The channel to exclude from logging',
            required: true,
            type: ApplicationCommandOptionType.Channel,
        }
    ],
    callback: async (client, interaction) => {
        try {
            const guild = interaction.guild;
            if (!guild) {
                console.warn("⚠️ Couldn't get guild from interaction!");
                return;
            }
            
            const channel = interaction.options.getChannel("channel");
            if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
                return interaction.reply({ content: "❌ Please select a valid text channel.", ephemeral: true });
            }

            let guildData = await getGuild(interaction.guildId);
            let ignoreList = guildData.ignore;

            for (var i = 0; i < ignoreList.length; i++) {
                let channelId = ignoreList[i];
                if (channelId == channel.id) {
                    return interaction.reply({ content: "❌ That channel is already excluded from logging!", ephemeral: true });
                }
            }

            ignoreList.push(channel.id);
            await setGuild(interaction.guildId, { ignore: ignoreList});
            await interaction.reply(`✅ Successfully added ${channel.url} to the exclusion list!`);
        } catch (error) {
            console.error("❌ Failed to add channel to exclusion list: ", error);
        }
    },
};
