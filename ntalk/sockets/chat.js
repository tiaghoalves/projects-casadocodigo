module.exports = function(io) {
	var crypto = require('crypto');
	var redis = require('redis').createClient();

	io.sockets.on('connection', function(client) {
		var session = client.handshake.session;
		var usuario = session.usuario;

		redis.sadd('onlines', usuario.email, function(erro){
			redis.smembers('onlines', function(erro, emails){
				emails.forEach(function(email) {
					io.sockets.emit('notify-onlines', email);
					client.broadcast.emit('notify-onlines', email);
				});
			});		
		});

		client.on('join', function(sala){
			if(!sala) {
      			var timestamp = new Date().toString();
      			var md5 = crypto.createHash('md5');
      			sala = md5.update(timestamp).digest('hex');
      		}else{
      			sala = sala.replace('?sala=', '');
      		}
			session.sala = sala;
			client.join(sala);
			
			redis.lrange(sala, 0, -1, function(erro, msgs){
				var msg = "<b>"+usuario.nome+":</b> entrou.<br>";
				msgs.forEach(function(msg){
					client.emit('send-client', msg);
				});
				redis.rpush(sala, msg);
				io.sockets.in(sala).emit('send-client', msg);
			});
			
		});
		
		client.on('disconnect', function () {
    	  var sala = session.sala;
    	  var msg = "<b>"+ usuario.nome +":</b> saiu.<br>";

    	  redis.rpush(sala, msg);
    	  client.broadcast.emit('notify-offline', usuario.email);
		  io.sockets.in(sala).emit('send-client', msg);
    	  redis.srem('onlines', usuario.email);
    	  client.leave(sala);
    	});

		client.on('send-server', function (msg) {
    	  var sala = session.sala;
    	  var data = {email: usuario.email, sala: sala};
    	  var men = "<b>"+usuario.nome+":</b> "+msg+"<br>";

    	  redis.rpush(sala, men);
    	  client.broadcast.emit('new-message', data);
    	  io.sockets.in(sala).emit('send-client', men);
    	});
	});
};