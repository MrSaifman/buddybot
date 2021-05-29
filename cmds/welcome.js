//Name: welcome.js
//Project: Buddy Bot
//Author: Case Hassak
//Description: Used to change settings for welcome message when a user joins the server.

const fs = require("fs");

module.exports.run = async (client, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission to set rules!"); //Makes sure user has permission.
    //Used to add a role to for the given roles in the welcome message when a user joins the server.    
    if(args[0] === "roleadd"){
        if(args[1] == undefined) return message.channel.send("No role name was given.");
        
        fs.readFile("./jobs.json", (error, data) => {
            if (error) throw error;
            let jobs = JSON.parse(data);
            args[1] = args.splice(1, args.length).join(" ");
            jobs.roles.push(args[1]);
            fs.writeFileSync("./jobs.json", JSON.stringify(jobs), error => {
                if(error) throw error;
            });
            return message.channel.send(`${args[1]} role was added to the welcome message.`);
        });
    
    //Used to remove a role to for the given roles in the welcome message when a user joins the server.  
    }else if(args[0] === "roleremove"){
        if(args[1] == undefined) return message.channel.send("No role name was given.");
        
        fs.readFile("./jobs.json", (error, data) => {
            if (error) throw error;
            let jobs = JSON.parse(data);
            let oldLen = jobs.roles.length;
            args[1] = args.splice(1, args.length).join(" ");
            jobs.roles = jobs.roles.filter(function(value, index, arr){ 
                return value !== args[1];
            });
            let newLen = jobs.roles.length;
            fs.writeFileSync("./jobs.json", JSON.stringify(jobs), error => {
                if(error) throw error;
            });
            if(oldLen !== newLen) return message.channel.send(`${args[1]} role was successfully removed from the welcome message.`);
            return message.channel.send(`${args[1]} role not found.`);
        });
    }
}