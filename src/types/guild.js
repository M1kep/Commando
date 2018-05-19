const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class GuildArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'guild');
	}

	validate(val, msg, arg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.client.guilds.has(matches[1]);
		const search = val.toLowerCase();
		let guilds = msg.client.guilds.filter(nameFilterInexact(search));
		if(guilds.size === 0) return false;
		if(guilds.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(guilds.first().id)) return false;
			return true;
		}
		const exactGuilds = guilds.filter(nameFilterExact(search));
		if(exactGuilds.length === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactGuilds.first().id)) return false;
			return true;
		}
		if(exactGuilds.length > 0) guilds = exactGuilds;
		return guilds.size <= 15 ?
		`${disambiguation(guilds.map(guild => escapeMarkdown(guild.name)), 'guilds', null)}\n` :
		'Multiple guilds found. Please be more specific.';
	}

	parse(val, msg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.client.guilds.get(matches[1]) || null;
		const search = val.toLowerCase();
		const guilds = msg.client.guilds.filter(nameFilterInexact(search));
		if(guilds.size === 0) return null;
		if(guilds.size === 1) return guilds.first();
		const exactGuilds = guilds.filter(nameFilterExact(search));
		if(exactGuilds.length === 1) return exactGuilds.first();
		return null;
	}
}

function nameFilterExact(search) {
	return thing => thing.name.toLowerCase() === search;
}

function nameFilterInexact(search) {
	return thing => thing.name.toLowerCase().includes(search);
}

module.exports = GuildArgumentType;
