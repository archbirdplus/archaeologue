# Archaeologue

Archaeologue is a discord bot that downloads all the messages in a discord server and plots users' activity (messages per day) over time.

## Commands 

`/help` - List the bot's commands

`/update` - Update the bot's internal cache of users' messages

`/plot` - Reply with an image plotting the activity on the server over time

The files will be stored under the `data/` directory. See `data/README.md` for the file format.

## Running yourself

Create the `config.json` based on the `config.json.template` file using your own discord bot user.

Then run the following command to register slash commands with discord:

```
node deploy-commands
```

To invite the bot to a server, use the OAuth2 URL Generator to create invite link for the bot. The following permissions are necessary:

Scopes:
* bot
* applications.commands

Bot permissions:
* Send Messages
* Read Message History
* Slash commands

No "Privileged Gateway Intents" are required, and "Message Content Intent" may cause wasted bandwidth anyways.

To start up the bot once it's set up, simply run:

```
node .
```

If you want to test changes in your test server before releasing your bot to the world, run the following command. This spawns another instance of Arch that only responds in the test server. Note that this might clash with the main instance.

```
node . test
```

## Contributions

Thanks to [@Reginald-Gillespie](https://github.com/Reginald-Gillespie) for finding an exploit.
Thanks to [@EliasMurcray](https://github.com/EliasMurcray) for helping me with fetching usernames.

## Contributing

If you found a problem or a solution, open an issue or a pull request. I'll consider it when I'm notified. The primary problem I can't solve myself is how to get discord.js to fetch _only_ the message and user ID's, rather than wasting bandwidth on reading the message contents.
