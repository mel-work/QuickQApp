import { getSingle, updateServer, updateServerLanguage } from "../database/databaseHelpers.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js'

export const updateLanguageCommand = new SlashCommandBuilder()
    .setName("update_language")
    .setDescription("Change Server Language")
    .addStringOption((option) =>
        option
        .setName("language")
        .setDescription("Choose a Language")
        .setRequired(true)
		.addChoices(
			{ name: 'English', value: 'English' },
			{ name: 'German', value: 'German' },
			{ name: 'French', value: 'French' },
			{ name: 'Spanish', value: 'Spanish' },
			{ name: 'Turkish', value: 'Turkish' },
			{ name: 'Russian', value: 'Russian' },
			{ name: 'Portuguese', value: 'Portuguese' },
			{ name: 'Korean', value: 'Korean' },
			{ name: 'Chinese', value: 'Chinese' },
			{ name: 'Italian', value: 'Italian' },
    )).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function updateLanguage(interaction){
	let serverID = interaction.guild.id
	let server = await getSingle(`SELECT * FROM servers WHERE serverID = ?`, [serverID])
	let language = interaction.options.data[0].value
	if(server != undefined){
		updateServerLanguage(serverID, language)
		await interaction.reply({content: `This servers language has been changed from ${server.language} to ${language}`, ephemeral: true})
	} else {
		await interaction.reply({content: `This server has not been setup yet.`, ephemeral: true})
	}
}