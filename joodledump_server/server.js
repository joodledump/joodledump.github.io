var config = require('./config');
var app = require('http').createServer();
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(config.serverPort);
console.log("Starting server on port " + config.serverPort);
var id = 0;
var users = [];

io.on('connection', function(socket) {
	socket.on("entergame", function(data){
		users.push([data.id, data.name, false, {}, ""]);
//		console.log(JSON.stringify(users));
		socket.emit("entered", {"id": data.id});
	});
	socket.on("play", function(data){
		name = getUser(data.id);
		if(name == false){
			socket.emit("badid");
		}else{
			socket.emit("welcome", {"name": name});
		}
	});
	socket.on("searchingOpponent", function(data){
//		console.log(data.id);
		for(var i = 0; i < users.length; i++){
			if(users[i][0] == data.id){
				if(users[i][4] != ""){
					socket.emit("foundOpponent", {"id": users[i][4]});
					return false;
				}
			}
		} 
		user = getOpponent(data.id);
//		console.log(JSON.stringify(user));
		if(user != false){
			console.log("found!")
			for(var i = 0; i < users.length; i++){
				if(users[i][0] == data.id){
					users[i][2] = true;
					users[i][4] = user[0];
				}
			}
			socket.emit("foundOpponent", {"id": user[0]});
		
		}
	});
	socket.on("sendData", function(data){
//		console.log(data.id);
//		console.log(JSON.stringify(users));
		for(var i = 0; i < users.length; i++){
			if(users[i][0] == data.id){
				users[i][3] = {"player": data.player, "tiles": data.tiles};
			}
		}
	});
	socket.on("reportToOtherPlayer", function(data){
		player1id = data.id;
		player2id = data.theirId;
		for(var i = 0; i < users.length; i++){
			if(users[i][0] == player2id){
				users[i][2] = true;
				users[i][4] = player1id;
			}
		}
	});
	socket.on("requestData", function(data){
		for(var i = 0; i < users.length; i++){
			if(users[i][0] == data.opponentId){
//				console.log(JSON.stringify(users));
//				console.log(JSON.stringify(users[i][3]));
				toSend = {"player": users[i][3].player, "tiles": users[i][3].tiles};
//				console.log(JSON.stringify(toSend));
				socket.emit("updateData", toSend);
			}
		}
	});
	socket.on("exited", function(data){
//		console.log(JSON.stringify(users));
		thisId = data.id;
//		console.log(removeId(thisId)+" disconnected");
//		console.log(JSON.stringify(users));
	});
});
function getOpponent(id){
	for(var i = 0; i < users.length; i++){
		if(users[i][0] != id && users[i][2] == false){
			users[i][2] = true;
//			socket.emit("foundOpponent", {"id": users[i][0], "name": users[i][1]});
			return users[i];
		}
	}
	return false;
//	setTimeout(function(){getOpponent(id)}, 200);
}
function removeId(id){
	tmp = [];
	name = "";
	for(var i = 0; i < users.length; i++){
//		console.log(users[i][0]);
//		console.log(id);
//		console.log(id == users[i][0]);
		if(users[i][0] != id){
			tmp.push(users[i]);
		}else{
			name = users[i][1];
		}
	}
	users = tmp;
	return name;
}
function getUser(id){
	for(var i = 0; i < users.length; i++){
		if(users[i][0] == id){
			return users[i][1];
		}
	}
	return false;
}
