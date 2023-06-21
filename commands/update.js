const { SlashCommandBuilder } = require('discord.js')
const updater = require('../utils/updater.js')

const updatingGuilds = {}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Load new messages since last update'),
    async execute(interaction) {
        const key = 'Guild'+interaction.guild.id
        if(updatingGuilds[key]) {
            // TODO: offer to ping this user as well as soon as the update is finished.
            await interaction.reply('Another user in this guild is already waiting for an update.')
            return
        }
        updatingGuilds[key] = true
        await interaction.reply('This may take a while, hold on...')
        console.log('[INFO] Starting update.')
        try {
        await updater.update(interaction.guild)
        try {
            console.log('[INFO] Editing reply to update request')
            await interaction.editReply('Archaeologue is now up to date!')
        } catch(e) {
            console.log('[INFO] `editReply` window timed out, sending to channel ' + interaction.channel.name)
            await interaction.channel.send('The update is done, but the `editReply` window timed out.')
        }
        } finally {
            console.log('[INFO] Unblocked `updatingGuilds` lock')
            updatingGuilds[key] = false
        }
    }
}

