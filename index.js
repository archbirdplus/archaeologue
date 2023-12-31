

const fs = require('node:fs')
const path = require('node:path')

global.appRoot = path.resolve(__dirname)
storage = require('./utils/activity-storage.js')

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const { token, testGuild } = require('./config.json')
const testGuildOnly = process.argv.slice(2).includes('test')
if(testGuildOnly) {
    console.log(`[INFO] Bot only active in the test guild, ${testGuild}.`)
}

const client = require('./client.js')

client.commands = new Collection

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for(const file of commandFiles) {
    const command = require(path.join(commandsPath, file))
    if(command) {
        client.commands.set(command.data.name, command)
    } else {
        console.log('[WARNING] skipping command file ' + file)
    }
}

const log = console.log

client.once("ready", c => {
    log(`Ready! Logged in as ${c.user.tag}`)
})

client.on("interactionCreate", async interaction => {
    if(testGuildOnly && interaction.guild.id != testGuild) {
        console.log(`[WARNING] Ignored message from guild ${interaction.guild.name} due to being in test mode.`)
        return
    }
    try {
        log('[INFO] running command ' + interaction.commandName)
        const command = interaction.client.commands.get(interaction.commandName)
        if(!command) { log('[INFO] No command matches ' + interaction.commandName) }
        await command.execute(interaction)
    } catch(error) {
        log('[ERROR]', error)
        // this might throw as well, in particular with two instances of Arch
        try {
            await (interaction.replied  || interaction.deferred ?
                    interaction.followUp :
                    interaction.reply)
                .call(interaction,
                    { content: "Error while executing command!", ephemeral: true })
        } catch(e) { }
    }
})

client.login(token)

