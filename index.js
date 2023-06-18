
const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const { token } = require('./config.json')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })

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
    log('[INFO] running command ' + interaction.commandName)
    const command = interaction.client.commands.get(interaction.commandName)
    if(!command) { log('[INFO] No command matches ' + interaction.commandName) }
    try {
        await command.execute(interaction)
    } catch(error) {
        log('[ERROR]', error)
        await (interaction.replied  || interaction.deferred ?
                interaction.followUp :
                interaction.reply)
            .call(interaction,
                { content: "Error while executing command!", ephemeral: true })
    }
})

client.login(token)

