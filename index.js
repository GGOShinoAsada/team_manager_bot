const Discord = require('discord.js');
const { Client } = require("discord.js");
const { Intents } = require('discord.js');
const { MessageEmbed } = require('discord.js');
//const {PermissionsBitField } = require('discord.js')
const robots = new Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] });
//Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES

const fs = require('fs');
let { prefix, token } = require('./config.json');

//array of channel names
let arr1 = [];
//array of passwors
let arr2 = [];
//array of roles
let arr3 = [];



let currIndex = 0;
const MAX_SIZE = 100;

const MAIN_CHANNEL_NAME = "team_manager";


const quenue = new Map();
robots.on("ready", () => {
    console.log('bot started');
});
/*
robots.on('guildMemberAdd', member => {
    let auth = member.user.user.username;
    member.guild.channels.get('welcome').send("Welcome, " + auth);
});

robots.on('guildMemberRemove', member => {
    let auth = member.user.user.username;
    member.guild.channels.get('welcome').send("Bye, " + auth);
});
*/


robots.on('channelPinsUpdate', (channel, date) => {
    console.log('channei is ' + channel);
    let n = channel.memberCount();
    if (n === 0) {
        channel.delete();
    }
})



robots.on('message', async message => {



    if (message.author.bot) {
        return;
    }
    if (!message.content.startsWith(prefix)) {
        return;
    }
    else {

        let cmdline = message.content.slice(prefix.length, message.content.length);
        let n = validate(cmdline);
        let uId = "";
        let users = "";
        const messages = await message.channel.messages.fetch({ limit: 2 });
        let n2, inputPass1, sz1, channelName, ch, r_name, role;
        switch (n) {
            case 0:

                let teamSize = cmdline.split(' ')[2];
                let name = cmdline.split(' ')[3];
                console.log("name " + name);
                console.log("team size " + teamSize);
                let pass = "";
                for (let i = 0; i < 4; i++) {
                    let tmp = Math.floor(Math.random() * 10);
                    pass += tmp;
                }
                //check and cr. group if it isnt exists, after that create channel
                let cat_id = message.guild.channels.cache.find(ch => ch.name == "Teams");
                if (cat_id === undefined) {

                    await message.guild.channels.create('Teams', { type: 'category' });

                    cat_id = message.guild.channels.cache.find(t => t.name === "Teams");


                }




                name = "t_" + name;
                let ch_created = await message.guild.channels.create(name, { type: 'text', parent: cat_id['id'] });
                ch_created.permissionOverwrites.set()
                console.log("name of channel" + ch_created['name']);

                let roleName = "role_" + name;

                let r_created = await message.guild.roles.create({
                    data: {
                        name: roleName,
                        color: 'GREEN',
                    },
                });
                //set permission
                // ch_created.permissionOverwrites.set(r_created.n)
                // ch_created.permissionOverwrites.set(message.guild.roles.everyone, { ViewChannel: false });
                //change for @everyone role
                let role_everyone = message.guild.roles.cache.find(r => r.name === "@everyone");

                ch_created.overwritePermissions([
                    {
                        id: r_created.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                    },
                    {
                        id: role_everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                    }
                ]);
                //ch_created.updateOverwrite(r_created, { VIEW_MESSAGES: true, SEND_MESSAGES: true });
                arr1[currIndex] = name;
                arr2[currIndex] = pass;
                arr3[currIndex] = roleName;
                currIndex++;
                const ch_info = message.guild.channels.cache.find(ch => ch.name === name);
                let usersCount = ch_info.members.size;
                let arr_users = ch_info.members.filter(t => !t.user.bot);
                let usersInfoString = "";
                let usersArray = [];
                let index = 0;
                if ((usersCount - 9) === 0) {
                    arr_users.forEach(t => {
                        users += "@" + t['user']['username'] + ", ";

                    })
                    usersInfoString = users;
                }
                else {
                    let countOfOtherPlayers = usersCount - 9;
                    arr_users.forEach(t => { usersArray[index] = t['user']['username']; index++; });

                    for (let i = 0; i < 9; i++) {
                        users += "@" + usersArray[i]; + ", ";
                    }
                    usersInfoString = users + " and " + countOfOtherPlayers + " players";
                }
                let n = 0;
                let sizeInfo = usersCount + "/" + teamSize;
                /*embed */
                let embed = new MessageEmbed();
                //embed.setURL(inviteString);
                embed.setColor('DARKER_GREY');
                embed.setTitle('Team created!');
                embed.setDescription('team was created. Information about team: ');
                let imgs = (JSON.parse(fs.readFileSync('./resources.json'))['images']);
                embed.setThumbnail(imgs['1']);
                embed.addFields({ name: "password", value: pass, inline: true }, { name: "team size", value: sizeInfo, inline: true }, { name: "current size", value: usersCount, inline: true }, { name: "players", value: usersInfoString, inline: true })
                embed.setTimestamp();
                embed.setFooter(text = "Sorrow teams", iconURL = imgs['2']);
                /* end of embed */
                message.channel.send(embed);
                break;
            case 1:

                //got role for channel and set it for user which ask invite



                uId = messages.first().author.id;

                n2 = cmdline.split(' ')[2];
                inputPass1 = cmdline.split(' ')[3];
                console.log("name is " + n2);
                console.log("pass is " + inputPass1);
                sz1 = 0;
                fl = true;
                for (let i = 0; i < currIndex; i++) {

                    if (arr2[i] === inputPass1 && arr1[i] === n2) {
                        console.log("password success");
                        fl = false;
                        channelName = arr1[i];
                        ch = message.guild.channels.cache.find(t => t.name === channelName);
                        //let ind = 0;
                        r_name = arr3[i];
                        role = await message.guild.roles.cache.find(r => r.name === r_name);
                        //add user to role
                        message.guild.members.cache.get(uId).roles.add(role);
                        //create invite
                        ch.createInvite().then((inv) => { console.log('create invite ' + inv.code); message.channel.send('join to team: http://discord.gg/' + inv.code) });
                    }
                }
                if (fl) {
                    message.channel.send('please check password');
                }
                break;
            case 2:
                uId = messages.first().author.id;
                n2 = cmdline.split(' ')[2];
                inputPass1 = cmdline.split(' ')[3];
                console.log("name is " + n2);
                console.log("pass is " + inputPass1);
                sz1 = 0;

                fl = true;
                for (let i = 0; i < currIndex; i++) {

                    if (arr2[i] === inputPass1 && arr1[i] === n2) {
                        console.log("password success");
                        fl = false;
                        channelName = arr1[i];
                        ch = message.guild.channels.cache.find(t => t.name === channelName);
                        //let ind = 0;
                        r_name = arr3[i];
                        role = await message.guild.roles.cache.find(r => r.name === r_name);
                        //add user to role
                        message.guild.members.cache.get(uId).roles.add(role);
                        //create invite
                        ch.createInvite().then((inv) => { console.log('create invite ' + inv.code); message.channel.send('join to team: http://discord.gg/' + inv.code) });
                    }
                }
                if (fl) {
                    message.channel.send('please check password');
                }
                break;
            case 3:
                let currentChannelName = message.channel.name;
                const channel = message.guild.channels.cache.find(ch => ch.name === currentChannelName);

                let users_arr = channel.members.filter(t => !t.user.bot);
                users_arr.forEach(t => {
                    users += "@" + t['user']['username'] + ", ";
                })
                message.channel.send(users + "team is ready!");
                break;
            case 4:
                let helpString = "supports commands: \n 1. !team create [count_players] [command_name];\n 2. !team join [command_name] [command];\n 3. !team bump [command_name] [command];\n 4. !team ping;\n 5. !team leave; \n 6. !team reset; \n 7. !team help;";
                message.channel.send(helpString);
                break;
            case 5:
                //removing all teams channels and Teams category
                message.guild.channels.cache.forEach(t => {
                    if (t['name'].startsWith('t_') || t['name'] === 'Teams') {
                        t.delete();
                    }
                });
                //removing all teams roles (rormat is role_t_[channel_name], for example role_t_demo
                message.guild.roles.cache.forEach(r => {
                    if (r['name'].startsWith('role_t')) {
                        r.delete();
                    }
                });
                message.channel.send("teams is reset");
                break;
            case 6:
                uId = messages.first().author.id;
                let us = message.guild.members.cache.get(uId);
               
                message.guild.members.cache.get(uId).roles.cache.forEach(t=>{
                   
                    if (t.name.startsWith('role_t')){
                        let r_n = t.name;
                        let tmp = message.guild.roles.cache.find(t=>t.name === r_n);
                        
                        tmp.members.forEach((memb)=>{
                            memb.roles.remove(tmp);
                        })
                    }
                })
                message.channel.send(" team role removed for user "+us.nickname+", you can leave channel")
                break;
            case 9:
                let _name = "demo";
                let ch_34 = await message.guild.channels.create(_name, { type: 'voice' });
                console.log("name of channel" + ch_34['name']);
                let n33 = ch_34.members.size;
                console.log("members is " + n33);
                break;
            case -1:
                message.channel.send("invalid command; please check the syntax and try again")
                break;
            default:
                break;
        }

    }
});


robots.on('guildMemberRemove', async member => {

    console.log("user " + member.nickname + "leave someone channel");
    member.roles.cache.forEach(r => {
        if (r.name.startsWith('role_t')) {
            member.roles.remove(r);
        }
    })
})


/**
 * validation
 */
function validate(message) {
    console.log("message is " + message);
    let n = -1;
    message = message.slice(1);
    let mainCmd = "";
    if (message.split(' ').length > 1) {
        mainCmd = message.split(' ')[0];
    }
    else {
        mainCmd = message;
    }
    let count = 0;
    switch (mainCmd) {
        case "create":

            n = 0;
            count = message.split(' ').length - 1;
            if (count !== 2) {
                n = -1;
            }
            break;
        case "join":
            n = 1;
            count = message.split(' ').length;
            if (count !== 3) {
                n = -1;
            }
            break;
        case "bump":
            n = 2;
            count = message.split(' ').length;
            if (count !== 3) {
                n = -1;
            }
            break;
        case "ping":
            n = 3;
            count = message.split(' ').length;
            if (count !== 1) {
                n = -1;
            }
            break;
        case "help":
            n = 4;
            count = message.split(' ').length - 1;
            if (count !== 0) {
                n = -1;
            }
            break;
        case "reset":
            n = 5;
            break;
        case "leave":
            n = 6;
            break;
        case "test":
            console.log("set test");
            n = 9;
            break;
        default:
            console.log("unknown command");
            n = -1;
            break;
    }
    return n;
}

robots.login(token);