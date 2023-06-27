
const fs = require('node:fs')
const path = require('node:path')

/* storage object tree =
    base {
        getGuild guild -> GuildData {
            userMessages user -> UserMessages {
                onDay day -> count
                push snowflake => <updates>
            }
            pushMessage user snowflake -> <updates>
        }
        write => <save file>
        appendChannelUserMessages(channel, userMessagePairs) => <store progress>
        lastChannelMessage(channel) -> last snowflake loaded
        merge(guild, channel) => absorbs a .progress file into the guildData
    }
*/

/* file 1239023.json
{
    "@12388348": {
        "10": [132030239392],
        "12": [202340943904, 1280238230, 2390092309]
    },
    "@43894392": {
        "0": [],
        "1": [202340943904, 1280238230, 2390092309]
    }
}
*/

function getDay(snowflake) {
    const day = Math.floor(Number(BigInt(snowflake) >> BigInt(22))/(1000*60*60*24))
    return day
}

function timestamp(snowflake) {
    return Number(BigInt(snowflake) >> BigInt(22))
}

class UserMessages {
    data;
    constructor(obj) {
        this.data = obj ?? {}
    }
    onDay(day) {
        return this.data['d'+day]?.length ?? 0
    }
    push(snowflake) {
        const day = 'd'+getDay(snowflake)
        if(!this.data[day]) { this.data[day] = [] }
        if(this.data[day].includes(snowflake)) { return true }
        this.data[day].push(snowflake)
        return false
    }
    getObject() {
        return this.data
    }
}

class GuildData {
    data;
    cache;
    file;
    dir;
    streams;
    constructor(dir, obj, file) {
        this.dir = dir
        this.streams = {}
        this.data = obj
        this.cache = {}
        this.file = file
    }
    userMessages(user) {
        const key = '@'+user
        if(!this.cache[key]) {
            this.cache[key] = new UserMessages(this.data['@'+user])
        }
        return this.cache[key]
    }
    pushMessage(user, snowflake) {
        return this.userMessages(user).push(snowflake)
    }
    getObject() {
        const object = {}
        console.log('[INFO] getObject')
        const cacheData = {}
        for(const key in this.cache) {
            cacheData[key] = this.cache[key].data
        }
        const merged = Object.assign({}, this.data, cacheData)
        return merged
    }
    async write() {
        const json = JSON.stringify(this.getObject())
        fs.writeFileSync(this.file+'', json, (err)=>console.log(`[ERROR] The writeFileSync error is`, err))
        console.log(`[INFO] GuildData wrote to ${this.file}`)
    }
    appendChannelUserMessages(channel, userMessagePairs) {
        const key = channel + '.progress'
        const url = path.join(this.dir, key)
        const stream = this.streams[key] ??
            fs.createWriteStream(url, { flags: 'a' })
        stream.write(JSON.stringify(userMessagePairs)+'\n')
    }
    lastChannelMessage(channel) {
        const key = channel + '.progress'
        const file = path.join(this.dir, key)
        if(!fs.existsSync(file)) { return undefined }
        try {
            // TODO: very sad to read the whole file just for the last snowflake
            const contents = fs.readFileSync(file, 'utf8')+""
            const rows = contents.trim().split('\n')
            const row = JSON.parse(rows[rows.length-1])
            // user id is not relevant
            return row[row.length-1][1]
        } catch(e) {
            console.log(`[ERROR] Error reading progress file by lastChannelMessage in ${file}.`, e)
            return undefined
        }
    }
    merge(channel) {
        const key = channel + '.progress'
        const file = path.join(this.dir, key)
        if(!fs.existsSync(file)) { return undefined }
        try {
            // TODO: very sad to read the whole file just for the last snowflake
            const contents = fs.readFileSync(file, 'utf8')+""
            const rows = contents.trim().split('\n')
            const pairs = rows.map(JSON.parse).flat(1)
            pairs.forEach(p => this.pushMessage(p[0], p[1]))
            if(!fs.existsSync(file)) { return }
            fs.unlink(file, (err)=>err ? console.log(`[ERROR] The unlink error for file ${file} is`, err) : console.log(`[INFO] Progress file ${file} successfully unlinked.`))
        } catch(e) {
            console.log(`[ERROR] Error merging progress file by merge in ${file}.`, e)
            return undefined
        }
    }
}

const base = {
    dir: path.join(appRoot, 'data'),
    cache: {},
    data: {},
    getGuild(guild) {
        const key = '#'+guild
        if(!this.cache[key]) {
            const file = path.join(this.dir, guild+'.json')
            if(fs.existsSync(file)) {
                const contents = fs.readFileSync(file, 'utf8')
                try {
                    this.data[key] = JSON.parse(contents)
                } catch(e) {
                    console.log(`[ERROR] Could not parse guild file in ${file}, resetting the file`)
                    this.data[key] = {}
                }
            } else { this.data[key] = {} }
            this.cache[key] = new GuildData(this.dir, this.data[key], file)
        }
        return this.cache[key]
    },
    write() {
        Object.values(this.cache).forEach(val => val.write())
    }
}

module.exports = base

