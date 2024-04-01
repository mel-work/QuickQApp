import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { getSingle, deleteUserandServers, updateUser, deleteServer, updateChannelsUpdated } from '../database/databaseHelpers.js';
import { PermissionFlagsBits } from 'discord.js'

export const getUserCommand = new SlashCommandBuilder()
    .setName("get_user")
    .setDescription("Select which user you want to get information about")
    .addStringOption((option) =>
        option
        .setName("id_or_name")
        .setDescription("Enter a user's id or username including discriminator")
        .setRequired(true)
).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const getServerCommand = new SlashCommandBuilder()
    .setName("get_server")
    .setDescription("Select which server you want to get information about")
    .addStringOption((option) =>
        option
        .setName("id")
        .setDescription("Enter a server's id.")
        .setRequired(true)
).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const deleteUserAndServersCommand = new SlashCommandBuilder()
    .setName("delete_user")
    .setDescription("Select which user you want to delete")
    .addStringOption((option) =>
        option
        .setName("id")
        .setDescription("Enter a user's id")
        .setRequired(true)
).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const deleteServerCommand = new SlashCommandBuilder()
    .setName("delete_server")
    .setDescription("Select which server you want to delete")
    .addStringOption((option) =>
        option
        .setName("id")
        .setDescription("Enter a server's id")
        .setRequired(true)
).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const updateMembershipCommand = new SlashCommandBuilder()
    .setName("update_membership")
    .setDescription("Select which user you want to get information about")
    .addStringOption((option) =>
        option
        .setName("id")
        .setDescription("Enter a user's id.")
        .setRequired(true)
    ).addStringOption((option) =>
        option
        .setName("membership")
        .setDescription("Choose a membership level.")
        .setRequired(true)
        .addChoices(
		{ name: 'Basic', value: 'Basic' },
		{ name: 'Premium Lite', value: 'Premium Lite' },
		{ name: 'Premium', value: 'Premium' }
	)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
//module.exports = {getUserByIDCommand}

export async function getUser(interaction) {
    let input = interaction.options.data[0].value;
    let isId = true;
    let parsed = parseInt(input)
    if (isNaN(parsed)) {
        isId = false;
    }

    if (isId) {
        let user = await getSingle(`SELECT * FROM users WHERE userID = ?`, [input])
        if (user != undefined) {
            interaction.reply({content: `User ID: ${user.userID}\nUsername: ${user.username}\nMembership: ${user.membership}\nCurrent Servers: ${user.servers}`, ephemeral:true})
        } else {
            interaction.reply({content: "Invalid user. Try again.", ephemeral: true})
        }
        
    } else {
        let user = await getSingle(`SELECT * FROM users WHERE username = ?`, [input.toLowerCase()])
        if (user != undefined) {
            interaction.reply({content: `User ID: ${user.userID}\nUsername: ${user.username}\nMembership: ${user.membership}\nCurrent Servers: ${user.servers}`, ephemeral:true})
        } else {
            interaction.reply({content: "Invalid user. Try again.", ephemeral:true})
        }
    }
}

export async function getServer(interaction){
	let serverID = interaction.options.data[0].value;
	let server = await getSingle(`SELECT * FROM servers WHERE serverID = ?`, [serverID])
    if (server != undefined) {
        interaction.reply({content: `Server ID: ${server.serverID}\nOwner ID: ${server.ownerID} \nChannels: ${server.channels}\nInactivity Time: ${server.inactivityTime} Days\nChannels last changed: ${server.channelsLastChanged}\nLanguage: ${server.language}`, ephemeral:true})
        } else {
            interaction.reply({content: "Invalid server. Try again.", ephemeral:true})
        }
}


export async function deleteUser(interaction){
	let userID = interaction.options.data[0].value;
	let user = await getSingle(`SELECT * FROM users WHERE userID = ?`, [userID])
    if (user != undefined) {
		deleteUserandServers(userID);
        interaction.reply({content: `User and Servers Deleted.`, ephemeral:true})
    } else {
        interaction.reply({content: "Invalid user. Try again.", ephemeral: true})
    }
}

export async function deleteServerFunction(interaction){
	let serverID = `${interaction.options.data[0].value}`;
	let server = await getSingle(`SELECT * FROM servers WHERE serverID = ?`, [serverID])
	console.log(server)
    if (server != undefined) {
		let owner = await getSingle(`SELECT * FROM users WHERE servers LIKE ?`, [`%${serverID}%`])
		let serverList = owner.servers.replace(`${serverID},`,"").replace(`,${serverID}`,"")
		deleteServer(serverID);
		updateUser(owner.userID, owner.username, owner.membership, serverList)
        interaction.reply({content: `Server Deleted.`, ephemeral:true})
    } else {
        interaction.reply({content: "Invalid user. Try again.", ephemeral: true})
    }
}

export async function updateMembership(interaction) {
    let userID = interaction.options.data[0].value;
    let membershipLevel = interaction.options.data[1].value
	let user = await getSingle(`SELECT * FROM users WHERE userID = ?`, [userID])
    if (user != undefined) {
		if(membershipLevel == "Premium" || membershipLevel == "Premium Lite"){
			updateUser(userID, user.username, membershipLevel, user.servers);
			updateChannelsUpdated(userID);
		} else {
			updateUser(userID, user.username, membershipLevel, user.servers);
		}
        
        interaction.reply({content: `Membership Updated.`, ephemeral:true})
    } else {
        interaction.reply({content: "Invalid user. Try again.", ephemeral: true})
    }
}

