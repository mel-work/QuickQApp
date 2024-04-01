import { getDaysSinceLastMessage } from '../functions/timeFunctions.js'
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js'
import { addServer, addUser, getSingle, updateUser, updateServer } from "../database/databaseHelpers.js";


// -------------- Create Command -------------- 
export const premiumSetupCommand = new SlashCommandBuilder()
    .setName("premium_setup")
    .setDescription("Select num of inactive days and which channels you wish to monitor. (Up to 24)")
    .addIntegerOption((option) =>
        option
        .setName("inactive_days")
        .setDescription("Enter the number of days a channel will be inactive before sending icebreaker Q.")
        .setRequired(true)
    ).addChannelOption((option) =>
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
    ).addChannelOption((option) =>
        option
        .setName("channel_13")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_14")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_15")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_16")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_17")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_18")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_19")
        .setDescription("Choose another Channel")
            .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_20")
        .setDescription("Choose another Channel")
            .setRequired(false)
).addChannelOption((option) =>
        option
        .setName("channel_21")
        .setDescription("Choose a Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_22")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_23")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).addChannelOption((option) =>
        option
        .setName("channel_24")
        .setDescription("Choose another Channel")
        .setRequired(false)
    ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);


// // -------------- Command Function -------------- 
export async function premiumSetup(interaction) {
    let daysInactive = interaction.options.data[0].value
	let language = 'English'
    let channelList = [];
    for (let i = 1; i < interaction.options.data.length; i++) {
        if (interaction.options.data[i] != undefined) {
            channelList.push(interaction.options.data[i].value)
        }
    }

    let userID = interaction.user.id
    let username = interaction.user.tag.toLowerCase()
    let serverID = interaction.guild.id

    // get user from database
    let user = await getSingle(`SELECT * FROM users WHERE userID = ?`, [userID])
    let server = await getSingle(`SELECT * FROM servers WHERE serverID = ?`, [serverID])
    // if user does not exist, create one
    if (user == undefined) {
        interaction.reply({ content: `Please use the \`/setup_channels\` command to create an account`, ephemeral:true})
        return
    } else {
        if (user.membership == "Basic") {
            interaction.reply({content: `This command is only for Premium users. Please use the \`/setup_channels\` command or visit https://ko-fi.com/quickq/tiers to upgrade.`, ephemeral:true})
            return
        } else if (user.membership == "Premium Lite") {
            interaction.reply({content: `This command is only for Premium users. Please use the \`/premium_lite_setup\` command or visit https://ko-fi.com/quickq/tiers to upgrade.`, ephemeral:true})
            return
        } else {
            let serverList = user.servers.split(',')
            if (serverList.includes(serverID)) {
                // if server in user list - check time since update
                if (server != undefined) {
                    // update server
                    await updateServer(channelList, serverID, user.membership, daysInactive, server.language)
					await updateUser(userID, username, user.membership, user.servers)
					interaction.reply({ content: `Channels updated!`, ephemeral: true })
					
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
				//ownerID, serverID, channelList, membership, inactivityTime, language
                interaction.reply({ content: `Channels added to DB! Language default is English. Use \`update_language\` to change it.`, ephemeral: true })
            }
        }
    }
}