const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kill')
        .setDescription("Kill the bot if it's misbehaving")
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('what did I do?')),
    async execute(interaction) {
        await interaction.reply(`I will go kms for the motherland. (${interaction.options.getString('reason')})`)
        process.exit()
    }
}

