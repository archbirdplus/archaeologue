const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
const plotter = require('../utils/plotter.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('plot')
        .setDescription('Plot some activity on this server.')
        .addIntegerOption(option =>
            option.setName('start')
                .setDescription('days ago'))
        .addIntegerOption(option =>
            option.setName('end')
                .setDescription('days ago'))
        .addStringOption(option =>
            option.setName('users')
                .setDescription('list of users to plot')),
    async execute(interaction) {
        try {
        await interaction.deferReply()
        let opts = interaction.options
        var users = []
        const userString = opts.getString('users')
        if(userString) {
            const regex = /(\d+)/g
            while(true) {
                const ret = regex.exec(userString)
                if(!ret) { break }
                users.push(ret[1])
            }
        }
        const image = await plotter.plot({ start: opts.getInteger('start'), end: opts.getInteger('end'), users: users, guild: interaction.guild })
        const attachment = new AttachmentBuilder(image, 'your-graph.png')
        await interaction.editReply({ files: [attachment] })
        } catch(e) {
            console.log(`[ERROR] thrown`, e, `trying to execute plot.`)
            await interaction.followUp('Something went wrong. Oh well.')
        }
    }
}

