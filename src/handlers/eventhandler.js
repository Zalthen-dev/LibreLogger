require("dotenv").config();
const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const { getGuild, deleteGuild } = require("../utils/guildStore.js");

async function setupEvents(client) {
    client.once(Events.ClientReady, async (client) => {
        try {
            if (process.env.BOT_AUTOJOIN_THREADS.toLowerCase() == "true") {
                const threads = client.channels.cache.filter(x => x.isThread());

                for (const thread of threads.values()) {
                    if (!thread.joined) {
                        await thread.join().catch(() => {});
                        console.log(`🧵 Joined thread: '#${thread.name}' in ${thread.guild.name}`);
                    }
                }
            }

            console.log(`✅ ${client.user.tag} is online`);
        } catch (error) {
            console.error("❌ Failed to follow threads:", error);
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

    client.on("guildDelete", async (guild) => {
        try {
            console.log(`🗑️ Removed from guild: ${guild.name} (${guild.id}), cleaning up guild data...`);
            await deleteGuild(guild.id);
            console.log(`✅ Removed guild data from ${guild.name} (${guild.id})!`);
        } catch (error) {
            console.error("❌ Failed to clean up guild data:", error);
        }
    });

    client.on(Events.ThreadCreate, async (thread) => {
        try {
            let guildData = await getGuild(thread.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (logChannel) {
                let startMessage = await thread.fetchStarterMessage();
                const embed = {
                    title: "Thread Created",
                    color: 0x567890,
                    description: `
> Thread: ${thread.url}
> Thread name: ${thread.name}
> Thread creator: ${startMessage.member.tag} (${startMessage.member.id})
> Thread created: <t:${Math.floor(thread.createdTimestamp / 1000)}:R>`
                };

                await logChannel.send({embeds: [embed], ephemeral: true})
            }

            if (!thread.joined) {
                await thread.join();
                console.log(`🤖 Joined new thread: '#${thread.name}'`);
            }
        } catch (error) {
            console.error(`❌ Couldn't join thread '${thread.name}':`, error);
        }
    });

    client.on(Events.ThreadDelete, async (thread) =>{
        try {
            let guildData = await getGuild(thread.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (!logChannel) return;

            let startMessage = await thread.fetchStarterMessage();
            const embed = {
                    title: "Thread Deleted",
                    color: 0x906756,
                    description: `
> Thread ID: ${thread.id}
> Thread name: ${thread.name}
> Thread creator: ${startMessage.member.tag} (${startMessage.member.id})
> Thread created: <t:${Math.floor(thread.createdTimestamp / 1000)}:R>
> Thread members: ${thread.members.cache.size}
> Thread messages: ${thread.messages.cache.size}
`
                };

                await logChannel.send({embeds: [embed], ephemeral: true})
        } catch (error) {
            console.error(`❌ Couldn't log thread deletion '${thread.name}':`, error);
        }
    });

    client.on(Events.MessageDelete, async (message) => {
        try {
            if (message.author && message.author.bot) return;

            let guildData = await getGuild(message.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (!logChannel) return;

            const content = message.partial ? "[unknown content]" : message.content;
            const authorName = message.author ? message.author.tag : "[unknown author]"
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
            
            const authorName = newMessage.author ? newMessage.author.tag : "`[unknown author]`"
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
> Member: ${member.tag} (\`${member.user.id}\`)
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
> Member: ${member.tag} (\`${member.user.id}\`)
`
            };

            await logChannel.send({ embeds: [embed]});
        } catch (error) {
            console.error("❌ Failed to log member leaving:", error);
        }
    });

    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        try {
            let guildData = await getGuild(newMessage.guildId);
            const logChannel = await client.channels.fetch(guildData.logChannel);
            if (!logChannel) return;

            const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
            const newTimeout = newMember.communicationDisabledUntilTimestamp;

            const logs = await newMember.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberUpdate,
                    limit: 1,
                });

            const entry = logs.entries.first();
            let moderator = (entry && entry.target.id === newMember.id) ? entry.executor.tag : "[Unknown Moderator]"
            let moderatorId = (entry && entry.target.id === newMember.id) ? `(${entry.executor.user.id})` : ""

            let embed = null;
            if (!oldTimeout && newTimeout) {
                embed = {
                    title: "Timeout Added",
                    color: 0x2D74A6,
                    description: `
> Member: ${newMember.tag} (${newMember.user.id})
> Member timed out until: <t:${newTimeout}:R>
> Perpretrator: ${moderator} ${moderatorId}`
                }
            }

            if (oldTimeout && !newTimeout) {
                embed = {
                    title: "Timeout Removed",
                    color: 0x2D74A6,
                    description: `
> Member: ${newMember.tag} (${newMember.user.id})
> Member timed out until: <t:${oldMember}:R>
> Perpretrator: ${moderator} ${moderatorId}`
                }
            }

            if (embed) await logChannel.send({ embeds: [embed]});
        } catch (error) {
            console.error("❌ Failed to log member change:", error);
        }
        
    });

    console.log(`✅ Set up event handlers!`);
}

module.exports = {setupEvents};
