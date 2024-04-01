import { getDaysSinceLastMessage } from '../functions/timeFunctions.js'
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js'
import { addServer, addUser, getSingle, updateUser, updateServer } from "../database/databaseHelpers.js";


// -------------- Create Command -------------- 
export const setupChannelsCommandBasic = new SlashCommandBuilder()
    .setName("setup_channels")
    .setDescription("Select server language and which channels you wish to monitor. (Up to 5)")
	.addChannelOption((option) =>
        option
        .setName("channel_1")
        .setDescription("Choose a Channel")
        .setRequired(true)
    ).addChannelOption((option) =>
        option
        .setName("channel_2")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_3")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_4")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_5")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    

// // -------------- Command Function -------------- 
export async function setupChannels(interaction) {
    let channelList = [];
    for (let i = 0; i < interaction.options.data.length; i++) {
        if (interaction.options.data[i] != undefined) {
            channelList.push(interaction.options.data[i].value)
        }
    }
	let language = 'English'
    let userID = interaction.user.id
    let userName = interaction.user.tag.toLowerCase();
    let serverID = interaction.guild.id

    // get user from database
    let user = await getSingle(`SELECT * FROM users WHERE userID = ?`, [userID])
    let server = await getSingle(`SELECT * FROM servers WHERE serverID = ?`, [serverID])
    // if user does not exist, create one
    if (user == undefined) {
        await addUser(userID, userName, "Basic", [`${serverID}`]);
        user = await getSingle(`SELECT * FROM users WHERE userID = ?`, [userID])
        if (server != undefined) {
            // if basic, and command has been run within 30 days
            let date = new Date(server.channelsLastChanged)
            let days = getDaysSinceLastMessage(date)
            if (user.membership == "Basic" && days < 30) {
                // send message with how much time until they can update the list
                let daysLeft = 30 - days
                interaction.reply({ content: `Basic accounts can only update channels every 30 days. You still have ${daysLeft} days remaining.`, ephemeral: true })
            } else {
                // update server
				//channelList, serverID, membership, daysInactive, language
                await updateServer(channelList, serverID, user.membership, server.daysInactive, server.language)
				await updateUser(userID, userName, user.membership, user.servers)
                interaction.reply({ content: `Channels updated.`, ephemeral: true })
            }
        } else {
            await addServer(userID, serverID, channelList, 'Basic', 30, language)
            interaction.reply({ content: `Channels added to DB! Language default is English. Use \`update_language\` to change it.`, ephemeral: true })
        }
    } else {
        let serverList = user.servers.split(',')
        if (serverList.includes(serverID)) {
            // if server in user list - check time since update
            if (server != undefined) {
                // if basic, and command has been run within 30 days
                let date = new Date(server.channelsLastChanged)
                let days = getDaysSinceLastMessage(date)
                if (user.membership == "Basic" && days < 30) {
                    // send message with how much time until they can update the list
                    let daysLeft = 30 - days
                    interaction.reply({ content: `Basic accounts can only update channels every 30 days. You still have ${daysLeft} days remaining.`, ephemeral: true })
                } else {
                    // update server
                    await updateServer(channelList, serverID, user.membership, server.daysInactive, server.language)
                    interaction.reply({ content: `Channels updated.`, ephemeral: true })
                }
            } else {
                await addServer(userID, serverID, channelList, user.membership, 30, language)
                serverList.push(serverID)
                await updateUser(userID, userName, user.membership, serverList)
                interaction.reply({ content: `Channels added to DB! Language default is English. Use \`update_language\` to change it.`, ephemeral: true })
            }
        } else {
            serverList.push(serverID)
            await updateUser(userID, userName, user.membership, serverList)
            await addServer(userID, serverID, channelList, user.membership, 30, language)
            interaction.reply({ content: `Channels added to DB! Language default is English. Use \`update_language\` to change it.`, ephemeral: true })
        }
    }
}