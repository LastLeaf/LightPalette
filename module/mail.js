// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var nodemailer = require('nodemailer');

// send a email through SMTP, { name, addr, host, [port], user, password, [ssl] } in options
module.exports = function(next){
	var mailer = function(options, name, addr, subject, html, text, cb){
		var smtpTransport = nodemailer.createTransport('SMTP', {
			host: options.host,
			port: options.port || (options.ssl ? 465 : 25),
			secureConnection: !!options.ssl,
			auth: {
				user: options.user,
				pass: options.password
			}
		});
		if(typeof(text) === 'undefined' || text === null)
			text = html
				.replace(/\s+/g, ' ')
				.replace(/^ /g, '')
				.replace(/ $/g, '')
				.replace(/ ?<\/p> ?/ig, '\r\n\r\n')
				.replace(/ ?<br> ?/ig, '\r\n')
				.replace(/<.*?>/g, '');
		smtpTransport.sendMail({
			from: (options.name ? options.name + ' <' + options.addr + '>' : options.addr),
			to: (name ? name + ' <' + addr + '>' : addr),
			subject: subject,
			html: html,
			text: text
		}, function(err, res){
			smtpTransport.close();
			if(cb) cb(err, res);
		});
	};
	next(mailer);
};
