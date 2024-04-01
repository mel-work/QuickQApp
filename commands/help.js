import { getSingle, updateServer, updateServerLanguage } from "../database/databaseHelpers.js";
import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord.js'

export const helpCommand = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get current commands and use")

export async function helpDisplay(interaction){
	const helpEmbed = 
  {
    color: 0xFF0000,
    title: `Quick Q Commands`,
    fields: [
	  {
        name: `/ask`,
        value: `Ask me any question! Visibility can be set to Public or Private.`
      },
	  {
		name: `**Requires Admin**`,
		value: `The following commands require Admin Privileges!\n\`/setup_channels\` - For first time users and Basic users.\n\`/premium_lite_setup\` - For users who have purchased a premium lite subscription.\n\`/premium_setup\` - For users who have purchased a premium subscription.\n\`/update_language\` - Updates the language for the server that the command is run in.\n`
	  },
	  {
        name: `Support Server`,
        value: `https://discord.gg/sBYpNKQSRg`
      },
	 {
        name: `Upgrade to Premium`,
        value: `https://ko-fi.com/quickq/tiers#`
      },
    ],
  }
	await interaction.reply({embeds: [helpEmbed], ephemeral: true})
}