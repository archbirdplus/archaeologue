The `data/` directory stores automatically generated JSON files necessary to render plots of activity over time.

## File structure

### Complete Guild Objects

Each guild has its own file named after `<guild-id>.json`. Each such file contains a top-level object with keys of `@<user-id>`. Each user object contains an object mapping keys of `d<days since discord epoch>` to an array of snowflakes of the messages that the user sent on that day.

### Progress Trackers

Each channel that is currently being updated gets streamed into a `<channel-id>.progress` file. Every 100 messages leaves an object of the form `[[user, message], [user, message], ...]`, with the oldest message (most recently scraped) at the end of the file. These files hang around until a message is loaded in their channel that has already been stored in the completed guild object, after which they are merged into the completed guild object file. This system reduces the amount of file writing and prevents data from being lost when the bot crashes unexpectedly.
