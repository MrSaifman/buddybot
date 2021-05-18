//Name: unmute.js
//Project: Buddy Bot
//Author: Case Hassak
//Version: 1.0
//Description : Used to unmute a user and remove them from the json file if they are on it.

const fs = require("fs");

module.exports.run = async (client, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission to mute!") //Makes sure user has permission to mute.
    //Get the user and returns message if no user is specified in the command.
    let toUnmute = message.guild.member(message.mentions.users.first() || message.guild.member(args[0])); //Takes a user and converts it to a member object
    if(!toUnmute) return message.channel.send("You did not specify a user mention!");

    let role = message.guild.roles.cache.find(r => r.name === "Muted"); 

    //Checks to see if a user has the Muted role. If not, it will respond with a message.
    if(!(toUnmute.roles.cache.some(role => role.name === "Muted"))) return message.channel.send("User is not muted!");
    
    //Reads the mutes json file first. Then looks to see if the person to unmute's id is on it. If so, it removes it from the list.
    fs.readFile("./mutes.json", (error, data) => {
        if (error) throw error;
        let muteList = JSON.parse(data);

        if(toUnmute.id in muteList){
            delete muteList[toUnmute.id];
            fs.writeFileSync("./mutes.json", JSON.stringify(muteList, null, 4), error => {
                if(error) throw error;
            });
        };
    });
    
    //Removes the muted role from the user and sends a message.
    await toUnmute.roles.remove(role);
    message.channel.send(`I have unmuted ${toUnmute}!`);
    return;
};