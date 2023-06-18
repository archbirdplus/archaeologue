const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get an overview of the commands of this bot'),
    async execute(interaction) {
        await interaction.reply(`
/help - Get this help menu.
/update - Get this bot back up to speed with new messages.
/plot - Plot the activity of some users, in some channels, in some timeframe.
`)
    }
}

