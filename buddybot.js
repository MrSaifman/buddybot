const Discord = require('discord.js');
const fs = require("fs");
const { brotliCompressSync } = require('zlib');

const client = new Discord.Client();
client.commands = new Discord.Collection();


client.mutes = require("./mutes.json");



// Do not share json file with others. Token gives attackers easy access!
const config = require('./config.json');
const prefix = config.prefix;

client.login(config.token);

fs.readdir("./cmds/", (error, files) => {
    if(error) console.error(error);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= (0)){
        console.log("No commands to load!");
        return;
    }

    console.log(`Loading ${jsfiles.length} commands!`);
    jsfiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        client.commands.set(f, props);
    });
});

client.on("ready", () => {
    console.log(`${client.user.username} is ready!`);
    console.log(client.commands);

    client.setInterval(() => {
        for(let i in client.mutes){
            let time = client.mutes[i].time;
            let guildId = client.mutes[i].guild;
            let guild = client.guilds.cache.get(guildId);
            let mutedRole = guild.roles.cache.find(r => r.name === "Muted");
            let member = guild.members.cache.get(i);
            if(!mutedRole) continue;

            if(Date.now() > time){
                console.log(`${i} is now unmuted!`)
                member.roles.remove(mutedRole);
                delete client.mutes[i];

                fs.writeFile("./mutes.json", JSON.stringify(client.mutes, null, 4), error => {
                    if(error) throw error;
                });
                
            }
        }
    }, 5000)
});

client.on("message", async message => {
    if(message.author.bot) return; //Prevents bots from sending messages
    if(message.channel.type === "dm") return; //Prevents users from direct messaging the bot

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;

    let cmd = client.commands.get(command.slice(prefix.length).concat(".js"));
    // console.log(client.commands.get(command.slice(prefix.length).concat(".js")));
    cmd.run(client, message, args);



    
    // if(command === `${prefix}userinfo`){
    //     let embed = new Discord.MessageEmbed()
    //         .setAuthor(message.author.username)
    //         .setDescription("this is the users info!");

    //         message.channel.send(embed);
    //         return;
    // };

    


});


