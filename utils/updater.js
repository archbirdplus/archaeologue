
storage = require('./activity-storage.js')

const updater = {
    async fetchChannel(guildData, channel) {
        console.log(`[INFO] Checking up on channel ${channel.name}`)
        if(!channel.messages) {
            console.log(`[INFO] Channel ${channel.name} has no messages`)
            return
        }
        let options = { limit: 100 }
        while(true) {
            const messages = await channel.messages.fetch(options)
            console.log(`[INFO] Loaded batch of ${messages.size} messages`)
            let contentsLoaded = false
            let complete = false
            messages.forEach(msg => {
                if(msg.content) { contentsLoaded = true; console.log(msg.content) }
                if(guildData.pushMessage(msg.author.id, msg.id)) { complete = true }
            })
            if(contentsLoaded) {
                console.log('[WARNING] Excess bandwidth is being wasted on loading messages contents. Try removing some Intents or permissions.')
            }
            if(complete || messages.size < 100) { break }
            options.before = messages.last().id
        }
        console.log(`[INFO] Up to date on channel ${channel.name}`)
    },
    async update(guild) {
        const guildData = storage.getGuild(guild.id)
        const channels = await guild.channels.fetch() // await?
            //.then(async (channels) => {
                // console.log('[INFO] channels:', channels)
        console.log(`[INFO] Fetching ${channels.size} channels`)
        var promises = []
        channels.forEach(channel => {
            promises.push(this.fetchChannel(guildData, channel))
        })
        Promise.all(promises).then(async () => {
            await guildData.write()
        })
    }
}

module.exports = updater

