

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
	
	if (data.player_game_type === "my_choice") {
		players_avail.push(newPlayer);
		emitAvailablePlayers();
	} else {
		players_to_play_random.push(newPlayer);
		pair_rand_players();
	}

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

function pair_rand_players() {

	if (players_to_play_random.length < 2)
		return;


	var p1 = players_to_play_random.shift();
	var p2 = players_to_play_random.shift();

	pairPlayers(p1, p2);
    
	util.log(`connect_new_players - uidM: ${p1.uid} (${p1.name}) ++ uidS: ${p2.uid} (${p2.name})`);

	util.log("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");
	// updAdmin("connect_new_players - uidM:"+p1.uid + " ("+p1.name + ")  ++  uidS: "+p2.uid + " ("+p2.name+")");

};

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
function pairPlayers(player1, player2, mode1 = "m", mode2 = "s") {
	if (!player1 || !player2) return;

	player1.mode = mode1;
	player2.mode = mode2;
	player1.status = "paired";
	player2.status = "paired";
	player1.opp = player2;
	player2.opp = player1;

	console.log(`Pairing players: ${player1.sockid} with ${player2.sockid}`);
	
	io.to(player1.sockid).emit("pair_players", { opp: { name: player2.name, uid: player2.uid }, mode: mode1 });
	io.to(player2.sockid).emit("pair_players", { opp: { name: player1.name, uid: player1.uid }, mode: mode2 });
};
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
	
			if (fromPlayer && toPlayer) {
					pairPlayers(fromPlayer, toPlayer);
	
					// Remove both players from the available list
					players_avail = players_avail.filter(player => player.sockid !== from && player.sockid !== to);
	
					io.emit("available_players", players_avail);
			}
	});
};
