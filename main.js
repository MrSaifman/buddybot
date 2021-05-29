//Name: main.js
//Project: Buddy Bot
//Author: Case Hassak
//Version: 1.1

const Discord = require('discord.js');
const Canvas = require('canvas');
const fs = require("fs");
const mysql = require("mysql");

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.commands = new Discord.Collection();

client.mutes = require("./mutes.json"); //Keeps tracks of users muted in case bot goes down. 
const config = require('./config.json'); //Do not share json file with others. Token gives attackers easy access!


client.login(config.token);
const prefix = config.prefix;

let numberUsers;
//Reads files in cmd directory and makes an object containing all the names.
fs.readdir("./cmds/", (error, files) => {
    if(error) console.error(error);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");

    if(jsfiles.length <= (0)) return console.log("No commands to load!");
    console.log(`Loading ${jsfiles.length} commands!`);
    
    jsfiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        client.commands.set(f, props); //Puts all the file names into commands object for function calls.
    });
});

client.on("ready", () => {
    console.log(`${client.user.username} is ready!`); 
    console.log(client.commands);

    // For every 5 seconds, checks if a muted user's timer expired. Removes the role and their Id object from the JSON file.
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

                fs.writeFileSync("./mutes.json", JSON.stringify(client.mutes, null, 4), error => {
                    if(error) throw error;
                });
            };
        };
    }, 5000);

    //For every 5 seconds, checks the number of users in the server that are not bots. Then it updates the top channel with the user count.
    client.setInterval(() => {
        let guild = client.guilds.cache.get('265317956446191617');
        numberUsers = guild.members.cache.filter(member => !member.user.bot).size; // Issue: After restarting the server, Getting number of users stuck pending and doesnt update users. Need to fix.
        let channel = guild.channels.cache.get("843048799953879041");
        channel.setName(`Buddies: ${numberUsers}`);
    }, 5000);      
});

client.on('guildMemberAdd', member => {
    
    //When a user joins a server, checks if the user's information is in the database, otherwise creates a new entry for them.
    con.query(`SELECT * FROM users WHERE id = ${member.user.id}`, (error, rows)=>{
        if(error) throw error;
        
        if(rows.length < 1){
            con.query(`INSERT INTO users (id, username, joined, xp, money) VALUES ('${member.user.id}','${member.user.username}','${date()}',0,0)`);
        } 
        
    });
});

//Generates XP for user between the min and max
function generateXp() {
    let min = 20;
    let max = 30;
    return Math.floor(Math.random() * (max-min+1)) + min;
}

//Gets today's date and puts it in date format for SQL entry
function date(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) dd='0'+dd;
    if(mm<10) mm='0'+mm;
    return today = yyyy+'-'+mm+'-'+dd;
}

client.on('guildMemberUpdate', (oldMember, newMember) => {
    //Updates the users nickname on their SQL entry if the server see's a change in their nickname.
    if(newMember.nickname && oldMember.nickname !== newMember.nickname) {    
        con.query(`SELECT * FROM users WHERE id = ${newMember.id}`, (error, rows)=>{
            if(error) throw error;
            sql = `UPDATE users SET nickname = '${newMember.nickname}' WHERE id = '${newMember.id}'`;
            con.query(sql);
        });
    }
 });

client.on("message", async message => {
    if(message.author.bot) return; //Prevents bots from sending messages.
    if(message.channel.type === "dm") return; //Prevents users from direct messaging the bot.

    //In case the bot is down when a user joins, it will add a SQL entry for them.
    con.query(`SELECT * FROM users WHERE id = ${message.author.id}`, (error, rows)=>{
        if(error) throw error;
        if(rows.length < 1){
            if(message.member.nickname !== undefined){
                sql = `INSERT INTO users (id, username, nickname, joined, xp, money) VALUES ('${message.author.id}','${message.author.username}','${message.member.nickname}','${date()}',0,0)`;
            }else{
                sql = `INSERT INTO users (id, username, joined, xp, money) VALUES ('${message.author.id}','${message.author.username}','${date()}',0,0)`;
            }
        } else {
            let xp = rows[0].xp;
            let money = rows[0].money;
            sql = `UPDATE users SET xp = ${xp + generateXp()}, money = ${money + 1} WHERE id = '${message.author.id}'`;

        }
        con.query(sql);
    });
    
    //Converts a users message to command and arguments to use in commands. 
    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return; //checks if user typed the prefix to command the bot.
    let filename = command.slice(prefix.length).concat(".js");
   
    if(client.commands.has(filename)){
        let cmd = client.commands.get(filename);
        cmd.run(client, message, args, con);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    //When a reaction is received, check if the structure is partial
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
    
    if(user.bot) return; // If the user who reacted is a bot, return
    
    const channel = '842634013088546837';
    const buddyRole = reaction.message.guild.roles.cache.find(r => r.name === "Buddy Badge");
    let guild = client.guilds.cache.get('265317956446191617');
    if(reaction.message.channel.id == channel) {
        if(reaction.emoji.name === "✅") {
            const guildmember = await guild.members.fetch(user);
            if(guildmember.roles.cache.find(role => role.name === "Buddy Badge")) return;
            guildmember.roles.add(buddyRole);
            welcome(user);
        }
        }
});
 
client.on('messageReactionRemove', (reaction, user) => {
});

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "sadb"
});

con.connect(error => {
    if(error) throw error;
    console.log("Database connected!");
});

//Sends a welcome message in the welcome channel with users information when function is called.
async function  welcome(user) {
    //Gets a random role from the jobs.json file and saves it to a variable. 
    let role;
    fs.readFile("./jobs.json", (error, data) => {
        if (error) throw error;
        let jobs = JSON.parse(data);
        const random = Math.floor(Math.random() * jobs.roles.length);
        role = jobs.roles[random];
    });
        
    //Create a 1200x630 pixels canvas and get its context.
	//The context will be used to modify the canvas.
	const canvas = Canvas.createCanvas(1200, 630);
    const context = canvas.getContext('2d');

	//Loads the background image
	const background = await Canvas.loadImage('./imgs/badge.png');
    //This uses the canvas dimensions to stretch the image onto the entire canvas.
	context.drawImage(background, 0, 0, canvas.width, canvas.height);
    const black = await Canvas.loadImage('./imgs/black.png');
    context.drawImage(black, 45, 160, 270, 270);
    //Loads the user who joined's avatar.    
    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
	context.drawImage(avatar, 55, 170, 250, 250);
    //Sets font.
    context.font = '40px sans-serif';
    // Selects the font color.
    context.fillStyle = '#000000';
    context.fillText(user.username, 460, 535);
    context.fillText(role, 170, 576);
    context.font = '30px sans-serif';
    context.fillText(user.discriminator, 400, 260);
    context.fillText(numberUsers, 400, 338);
    context.fillText(user.id, 400, 412);
    context.font = '55px Great Vibes';
    context.fillText(user.username, 60, 485);

	//Gets the processed image and sends it to the welcome channel.
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
    channel = client.channels.cache.get('846924165993857024');
	channel.send(`You're a buddy now <@${user.id}>!`, attachment);
}