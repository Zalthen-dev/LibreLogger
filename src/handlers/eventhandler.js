require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

async function setupEvents(client) {
    client.on("guildDelete", async (guild) => {
        try {
            console.log(`🗑️ Removed from guild: ${guild.name} (${guild.id}), cleaning up guild data...`);
            await deleteGuild(guild.id);
            console.log(`✅ Removed guild data from ${guild.name} (${guild.id})!`);
        } catch (err) {
            console.error("❌ Failed to clean up guild data:", err);
        }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
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
    });

    client.on(Events.MessageDelete, async (message) => {
        try {
            if (message.author && message.author.bot) return;

            let guildData = await getGuild(message.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (!logChannel) return;

            const content = message.partial ? "[unknown content]" : message.content;
            const authorName = message.author ? message.author.username : "[unknown author]"
            const authorId = message.author ? message.author.id : "nil"

            const embed = {
                title: "Message Deleted",
                color: "8530669",
                description: `
> Channel: ${message.channel.url}
> Message ID: [${message.id}](${message.channel.url}/${message.id})
> Message author: ${authorName} (${authorId})
> Message deleted: <t:${Math.floor((Date.now() + 500) / 1000)}:R>

**Content**
${content}`
            };
            
            await logChannel.send({ embeds: [embed]});
        } catch (error) {
            console.error("❌ Failed to log deleted message: ", error)
        }
    })

    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        try {
            if (!newMessage.guildId) return;
            if (oldMessage.content == newMessage.content) return;

            if (newMessage.author && newMessage.author.bot) return;

            let guildData = await getGuild(newMessage.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (!logChannel) return;
            
            const authorName = newMessage.author ? newMessage.author.username : "`[unknown author]`"
            const authorId = newMessage.author ? newMessage.author.id : "nil"

            const oldContent = oldMessage.partial ? "`[uncached content]`" : oldMessage.content
            const newContent = newMessage.content || "`[no content]`";

            const embed = {
                title: "Message Edited",
                color: 0xE67E22,
                description: `
> Channel: ${newMessage.channel.url}
> Message ID: [${newMessage.id}](${newMessage.channel.url}/${newMessage.id})
> Message author: ${authorName} (${authorId})
> Message edited: <t:${Math.floor((Date.now() + 500) / 1000)}:R>

**After**
${newContent}

**Before**
${oldContent}
`
            };

            await logChannel.send({ embeds: [embed]});
        } catch (error) {
            console.error("❌ Failed to log edited message:", error);
        }
    });

    client.on(Events.GuildMemberAdd, async (member) => {
        try {
            let guildData = await getGuild(newMessage.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (!logChannel) return;

            const embed = {
                title: "Member Joined",
                color: 0x5AD662,
                description: `
> Member joined Server: <t:${member.joinedTimestamp}:R>
> Member joined Discord: <t:${member.user.createdTimestamp}:R>
> Member: ${member.user.username} (\`${member.user.id}\`)
`
            };

            await logChannel.send({ embeds: [embed]});
        } catch (error) {
            console.error("❌ Failed to log member joining:", error);
        }
    });

    client.on(Events.GuildMemberRemove, async (member) => {
        try {
            let guildData = await getGuild(newMessage.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (!logChannel) return;

            const embed = {
                title: "Member Left",
                color: 0xFF2B2B,
                description: `
> Member left Server: <t:${Math.floor((Date.now() + 500) / 1000)}:R>
> Member joined Discord: <t:${member.user.createdTimestamp}:R>
> Member: ${member.user.username} (\`${member.user.id}\`)
`
            };

            await logChannel.send({ embeds: [embed]});
        } catch (error) {
            console.error("❌ Failed to log member leaving:", error);
        }
    });

    console.log(`✅ Set up event handlers!`);
}

module.exports = {setupEvents};