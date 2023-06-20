const { SlashCommandBuilder } = require('discord.js')
const updater = require('../utils/updater.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Load new messages since last update'),
    async execute(interaction) {
        console.log('[INFO] Deferring reply...')
        await interaction.deferReply()
        console.log('[INFO] Deferred reply. Starting update.')
        await updater.update(interaction.guild)
        await interaction.editReply('Archaeologue is now up to date!')
    }
}

