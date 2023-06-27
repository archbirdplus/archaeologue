
storage = require('./activity-storage.js')

const updater = {
    async fetchChannel(guildData, channel, progress) {
        console.log(`[INFO] Checking up on channel ${channel.name}`)
        if(!channel.messages) {
            console.log(`[INFO] Channel ${channel.name} has no messages`)
            return
        }
        let options = { limit: 100, before: progress }
        while(true) {
            try {
                const messages = await channel.messages.fetch(options)
                console.log(`[INFO] Loaded batch of ${messages.size} messages (in ${channel.name})`)
                let contentsLoaded = false
                let complete = false
                messages.forEach(msg => {
                    if(msg.content) { contentsLoaded = true; console.error(msg.content) }
                    if(guildData.pushMessage(msg.author.id, msg.id)) { complete = true }
                })
                if(contentsLoaded) {
                    // console.log('[WARNING] Excess bandwidth is being wasted on loading messages contents. Try removing some Intents or permissions.')
                }
                if(complete || messages.size < 100) { break }
                options.before = messages.last().id
                guildData.appendChannelUserMessages(channel.id, messages.map(msg => [msg.author.id, msg.id]))
            } catch(e) {
                console.log(`[WARNING] Channel ${channel.name} threw`, e, `whilst trying to fetch messages`)
                break
            }
        }
        guildData.merge(channel.id)
        console.log(`[INFO] Up to date on channel ${channel.name}`)
    },
    async update(guild, resumingCallback) {
        const guildData = storage.getGuild(guild.id)
        const channels = await guild.channels.fetch() // await?
            //.then(async (channels) => {
                // console.log('[INFO] channels:', channels)
        console.log(`[INFO] Fetching ${channels.size} channels`)
        var promises = []
        const progresses = channels.map(channel => [channel, guildData.lastChannelMessage(channel.id)])
        const resuming = progresses.some(x=>x[1])
        if(resuming) {
            progresses.forEach(pair => {
                if(pair[1]) {
                    promises.push(this.fetchChannel(guildData, pair[0], pair[1]))
                }
            })
        } else {
            channels.forEach(channel => {
                promises.push(this.fetchChannel(guildData, channel, undefined))
            })
        }
        resumingCallback(resuming)
        await Promise.all(promises).then(async () => {
            await guildData.write()
        })
    }
}

module.exports = updater

