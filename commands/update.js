const { SlashCommandBuilder } = require('discord.js')
const updater = require('../utils/update.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Load new messages since last update'),
    async execute(interaction) {
        await interaction.deferReply()
        await updater.update(interaction.guild)
        await interaction.editReply('Archaeologue is now up to date!')
    }
}

