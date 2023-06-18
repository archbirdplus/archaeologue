const { REST, Routes } = require('discord.js')
const { clientId, token } = require('./config.json')
const fs = require('node:fs')
const path = require('node:path')

const commands = []

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for(const file of commandFiles) {
    const command = require(path.join(commandsPath, file))
    if(command) {
        commands.push(command.data.toJSON())
    } else {
        console.log('[WARNING] skipping command file ' + file)
    }
}

const rest = new REST().setToken(token);
console.log("auth?");

(async () => {
    try {
        console.log('Refreshing ' + commands.length + ' application (/) commands...')
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        )
        console.log('Refreshed ' + commands.length + ' commands successfully!')
    } catch(error) { console.log('[ERROR]', error) }
})()


