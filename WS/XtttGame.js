

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

// New player has joined
function onNewPlayer(data) {

	util.log("New player has joined: "+data.name);

	const { v4: uuidv4 } = require('uuid');
	// Create a new player
	var newPlayer = new Player(uuidv4(), data.name, "looking");
	newPlayer.sockid = this.id;

	this.player = newPlayer;

	// Add new player to the players array
	players.push(newPlayer);
	players_avail.push(newPlayer);

	// util.log("looking for pair - uid:"+newPlayer.uid + " ("+newPlayer.name + ")");

	// pair_avail_players();

	  // Emit updated player list
		emitAvailablePlayers();

	// updAdmin("looking for pair - uid:"+p.uid + " ("+p.name + ")");

	// updAdmin("new player connected - uid:"+data.uid + " - "+data.name);

};

// ----	--------------------------------------------	--------------------------------------------	
function emitAvailablePlayers() {
	const availablePlayers = players_avail.map(player => ({
			uid: player.uid,
			name: player.name
	}));

	io.emit("available_players", availablePlayers);
};
// ----	--------------------------------------------	--------------------------------------------	

// function pair_avail_players() {

// 	if (players_avail.length < 2)
// 		return;


// 	var p1 = players_avail.shift();
// 	var p2 = players_avail.shift();

// 	p1.mode = 'm';
// 	p2.mode = 's';
// 	p1.status = 'paired';
// 	p2.status = 'paired';
// 	p1.opp = p2;
// 	p2.opp = p1;

// 	//util.log("connect_new_players p1: "+util.inspect(p1, { showHidden: true, depth: 3, colors: true }));

// 	// io.sockets.connected[p1.sockid].emit("pair_players", {opp: {name:p2.name, uid:p2.uid}, mode:'m'});
// 	// io.sockets.connected[p2.sockid].emit("pair_players", {opp: {name:p1.name, uid:p1.uid}, mode:'s'});
// 	console.log("p1.sockid: "+p1.sockid);
// 	console.log("p2.sockid: "+p2.sockid);
// 	io.to(p1.sockid).emit("pair_players", {opp: {name:p2.name, uid:p2.uid}, mode:'m'});
// 	io.to(p2.sockid).emit("pair_players", {opp: {name:p1.name, uid:p1.uid}, mode:'s'});

// 	util.log("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");
// 	// updAdmin("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");

// };

// ----	--------------------------------------------	--------------------------------------------	

function onTurn(data) {
	//util.log("onGameLoadedS with qgid: "+data.qgid);

	io.to(this.player.opp.sockid).emit("opp_turn", {cell_id: data.cell_id});

	util.log("turn  --  usr:"+this.player.mode + " - :"+this.player.name + "  --  cell_id:"+data.cell_id);
	// updAdmin("Q answer - game - qgid:"+data.qgid + "  --  usr:"+this.player.mode + " - uid:"+this.player.uid + "  --  qnum:"+data.qnum + "  --  ans:"+data.ansnum);
};

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

// Socket client has disconnected
function onClientDisconnect() {
	// util.log("onClientDisconnect: "+this.id);


	var removePlayer = this.player;
	players.splice(players.indexOf(removePlayer), 1);
	players_avail.splice(players_avail.indexOf(removePlayer), 1);


	if (this.status == "admin") {
		util.log("Admin has disconnected: "+this.uid);
//		updAdmin("Admin has disconnected - uid:"+this.uid + "  --  "+this.name);
	} else {
		util.log("Player has disconnected: "+this.id);
//		updAdmin("player disconnected - uid:"+removePlayer.uid + "  --  "+removePlayer.name);
	}

	emitAvailablePlayers();
};

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

// ----	--------------------------------------------	--------------------------------------------	
// ----	--------------------------------------------	--------------------------------------------	

set_game_sock_handlers = function (socket) {

	// util.log("New game player has connected: "+socket.id);

	socket.on("new player", onNewPlayer);

	socket.on("ply_turn", onTurn);

	socket.on("disconnect", onClientDisconnect);

	socket.on("game_request", ({ from, to , from_player_name}) => {
		const toPlayer = players_avail.find(player => player.uid == to);
		const fromPlayer = players_avail.find(player => player.sockid == from);
		if (toPlayer) {
			io.to(toPlayer.sockid).emit("game_request", { from: fromPlayer.sockid, from_player_name: fromPlayer.name });
		}
});

    // Handle game request acceptance
    socket.on("accept_request", ({ from, to }) => {
			let fromPlayer = players_avail.find(player => player.sockid === from);
			let toPlayer = players_avail.find(player => player.sockid === to);
		console.log("accept_request", fromPlayer, toPlayer);
		
		if (fromPlayer && toPlayer) {
				fromPlayer.mode = "m";
				toPlayer.mode = "s";
				fromPlayer.status = "paired";
				toPlayer.status = "paired";
				fromPlayer.opp = toPlayer;
				toPlayer.opp = fromPlayer;
			// 	io.to(from).emit("pair_players", { opp: toPlayer, mode: "m" });
			// 	io.to(to).emit("pair_players", { opp: fromPlayer, mode: "s" });

			console.log("fromPlayer.sockid: "+fromPlayer.sockid);
			console.log("toPlayer.sockid: "+toPlayer.sockid);
			io.to(fromPlayer.sockid).emit("pair_players", {opp: {name:toPlayer.name, uid:toPlayer.uid}, mode:'m'});
			io.to(toPlayer.sockid).emit("pair_players", {opp: {name:fromPlayer.name, uid:fromPlayer.uid}, mode:'s'});

			
				// Remove both players from the available list
				players_avail = players_avail.filter(player => player.sockid !== from && player.sockid !== to);
		
				io.emit("available_players", players_avail);

			// 	util.log("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");
			}
	});
};
