const { ApplicationCommandOptionType, ChannelType, PermissionsBitField } = require('discord.js');
const { getGuild, setGuild } = require("../utils/guildStore.js");

module.exports = {
    name: "includechannel",
    description: "Includes a channel to be logged",
    options: [
        {
            name: 'channel',
            description: 'The channel to be logged',
            required: true,
            type: ApplicationCommandOptionType.Channel,
        }
    ],
    callback: async (client, interaction) => {
        //await interaction.reply({ content: "ℹ️ This command hasn't been implemented yet, annoy the developer into doing so", ephemeral: true });

        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: "❌ You don't have sufficient permissions to use this command!", ephemeral: true });
            }

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
        
            let isBeingLogged = false;
            let targetIndex = -1;
            for (var i = 0; i < ignoreList.length; i++) {
                let channelId = ignoreList[i];
                if (channelId == channel.id) {
                    isBeingLogged = true;
                    targetIndex = i;
                    break;
                }
            }

            if (!isBeingLogged) {
                return interaction.reply({ content: "❌ That channel is already being logged!", ephemeral: true });
            }
            
            ignoreList.splice(targetIndex, 1);
            await setGuild(interaction.guildId, { ignore: ignoreList});
            await interaction.reply(`✅ Successfully removed ${channel.url} from the exclusion list!`);
        } catch (error) {
            console.error("❌ Failed to remove channel to exclusion list: ", error);
        }
    },
};
