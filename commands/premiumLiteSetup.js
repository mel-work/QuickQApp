import { getDaysSinceLastMessage } from '../functions/timeFunctions.js'
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js'
import { addServer, addUser, getSingle, updateUser, updateServer } from "../database/databaseHelpers.js";


// -------------- Create Command -------------- 
export const premiumLiteSetupCommand = new SlashCommandBuilder()
    .setName("premium_lite_setup")
    .setDescription("Select num of inactive days and which channels you wish to monitor. (Up to 12)")
    .addIntegerOption((option) =>
        option
        .setName("inactive_days")
        .setDescription("Choose the number of days a channel will be inactive before sending icebreaker Q.")
        .setRequired(true)
        .addChoices(
				{ name: '7 Days', value: 7 },
				{ name: '14 Days', value: 14 },
				{ name: '30 Days', value: 30 },
	)).addChannelOption((option) =>
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
    ).addChannelOption((option) =>
        option
        .setName("channel_6")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_7")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_8")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_9")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_10")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_11")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_12")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);


// // -------------- Command Function -------------- 
export async function premiumLiteSetup(interaction) {
    let daysInactive = interaction.options.data[0].value
	let language = 'English'
    let channelList = [];
    for (let i = 1; i < interaction.options.data.length; i++) {
        if (interaction.options.data[i] != undefined) {
            channelList.push(interaction.options.data[i].value)
        }
    }

    let userID = interaction.user.id
    let serverID = interaction.guild.id
	let username = interaction.user.tag.toLowerCase()

    // get user from database
    let user = await getSingle(`SELECT * FROM users WHERE userID = ?`, [userID])
    let server = await getSingle(`SELECT * FROM servers WHERE serverID = ?`, [serverID])
    // if user does not exist, create one
    if (user == undefined) {
        interaction.reply({ content: `Please use the \`/setup_channels\` command to create an account`, ephemeral:true})
        return
    } else {
        if (user.membership == "Basic") {
            interaction.reply({content: `This command is only for Premium Lite users. Please use the \`/setup_channels\` command or visit https://ko-fi.com/quickq/tiers to upgrade.`, ephemeral:true})
            return
        } else if (user.membership == "Premium") {
            interaction.reply({content: `You are missing out on some awesome features! Please use the \`/premium_setup\` command.`, ephemeral:true})
            return
        } else {
            let serverList = user.servers.split(',')
            if (serverList.includes(serverID)) {
                // if server in user list - check time since update
                if (server != undefined) {
                    // if command has been run within 15 days
                    let date = new Date(server.channelsLastChanged)
                    let days = getDaysSinceLastMessage(date)
                    if (days < 15) {
                        // send message with how much time until they can update the list
                        let daysLeft = 15 - days
                        interaction.reply({ content: `Premium Lite accounts can only update channels every 15 days. You still have ${daysLeft} days remaining.`, ephemeral: true })
                    } else {
                        // update server
						await updateUser(userID, username, user.membership, user.servers)
                        await updateServer(channelList, serverID, user.membership, daysInactive, server.language)
                        interaction.reply({ content: `Channels updated.`, ephemeral: true })
                    }
                } else {
                    await addServer(userID, serverID, channelList, user.membership, daysInactive, language)
                    serverList.push(serverID)
                    await updateUser(userID, username, user.membership, serverList)
                    interaction.reply({ content: `Channels added to DB! Language default is English. Use \`update_language\` to change it.`, ephemeral: true })
                }
            } else {
                serverList.push(serverID)
                await updateUser(userID, username, user.membership, serverList)
                await addServer(userID, serverID, channelList, user.membership, daysInactive, language)
                interaction.reply({ content: `Channels added to DB! Language default is English. Use \`update_language\` to change it.`, ephemeral: true })
            }
        }
    }
}