require.config({
    baseUrl: '/Big_Bang_Phaser_Project',
        // set baseURL to 'js' when bbclient.min.js is in the folder entitled 'js' along with main.js, phaser.min.js, and require.js
    paths: {
        "BrowserBigBangClient": "bbclient.min",
        "BigBangClient": "bbclient.min"
    }
});

require(['BigBangClient', 'BrowserBigBangClient'], function (bb, bbw) {

    var client = new bbw.BrowserBigBangClient();

    client.login("tbp.app.bigbang.io", 8888, "test", "test", "98a9b82f-e847-4965-b1b2-e00c5135796d", function (result) {
        if (result.authenticated) {
            client.connect(result.hosts['websocket'], result.clientKey, function (connectResult) {
                if (connectResult.success) {
                    client.subscribe("channel1", function (err, c) {
                        if (!err) {
                            beginGame(client, c);
                        }
                        else {
                            console.log("Shit, what happened? " + err);
                        }
                    });
                } else {
                    console.log("EPIC FAIL.");
                }
            });
        } else {
            console.log("Login failed. " + result.message);
        }
    });

    function beginGame(client, channel) {
        var game = new Phaser.Game(500, 500, Phaser.AUTO, null, {
            preload: preload,
            create: create,
            update: update
        });

        //keep track of when players join (open the browser window) and leave (close the browser window):
        //function onSubscribers(joinFunction(joined);, leaveFunction(left);){}
        //here, joined and left are both id's (each is a GUID), of a player joining and leaving, respectively
        
        channel.onSubscribers(function(joined){
            /*console.log(joined +" joined");
            spawn(joined);*/
        },function(left){
            console.log(left +" left");
            kill(left);
        });

        var myPlayer, //my player
            label,
            style = {
                font: "12px Arial",
                fill: "#ffffff"
            } //styling players labels a bit

        var playerName;

        var allPlayers = new Array();

        function preload() {
            game.load.spritesheet('char', 'images/char01.png', 32, 48) // define where avatar can be found. Because avatars are in a spritesheet with completely identical rectangular dimensions, just need to define 32 x 48 box to equal 1 avatar.
        }

        function create() {
            game.stage.backgroundColor = '#9966FF';
            myName = prompt("What is your name?");
            var me = {
                id: client.clientId(),
                x: Math.floor(Math.random()*500),
                y: Math.floor(Math.random()*500),
                // x: Math.floor(Math.random()*window.innerWidth),
                // y: Math.floor(Math.random()*window.innerHeight),
                playerName: myName
            };
            spawn(me); //add the sprite for the player in my window, which has the id of client.clientId(). Note, it won't have the 'joined' id
            //console.log("me.playerName = " + me.playerName);
            channel.handler = function (message) {
                var m = message.payload.getBytesAsJSON();
                //m.playerName;
                //console.log("m.id = " + m.id + " and m.playerName = " + m.playerName);
                //message.payload.getBytesAsJSON appears as, "Object {id: "...long GUID...", x: #, y: #}"
                //so you can call m.id, m.x, and m.y
                //console.log("Message: m.id = " + m.id + ", m.x = " + m.x + ", and m.y = " + m.y); //display messages being sent from each channel
                uPosition(m);
                console.log("this is create" + m.x);
            }
        }  

        function update() {
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                myPlayer.animations.play('left');
                myPlayer.x -= 3;
<<<<<<< HEAD
                sendPosition(myPlayer.x, myPlayer.y); //sendPosition is a function defined below.
=======
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName);
>>>>>>> John-DiBaggio
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                myPlayer.animations.play('right');
                myPlayer.x += 3;
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                myPlayer.animations.play('up');
                myPlayer.y -= 3;
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName);
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                myPlayer.animations.play('down');
                myPlayer.y += 3;
                sendPosition(myPlayer.x, myPlayer.y, myPlayer.playerName);
            } 

            //move my player's name label around with my player:
            myPlayer.label.x = myPlayer.x;
            myPlayer.label.y = myPlayer.y - 10; //label above player

        }

        function sendPosition(x, y, playerName) {
            var pos = {}; //create pos object to hold my players's id and position's x and y coordinate
            pos.id = client.clientId();
            pos.x = x;
            pos.y = y;
            pos.playerName = playerName;

            channel.publish(pos);
            //console.log(pos);
        }

        function spawn(m) {
            //console.log("spawn!");
            //distinguish between my player and other people's players:
            console.log("Within spawn(m) function, " + m.id.substring(0,8) + "has m.playerName = " + m.playerName);
            if (m.id === client.clientId()) {
                console.log ("This is me who just spawned. My name is " + m.playerName + " and my id is " + client.clientId());
            } else {
                console.log("A player of the name " + m.playerName + " and id of " + m.id + " just spawned a char sprite with a label");
            }
            var label = m.playerName;
            player = game.add.sprite(m.x, m.y, 'char');
            player.id = m.id;
            player.playerName = m.playerName;
            player.animations.add('down', [0, 1, 2], 10);
            player.animations.add('left', [12, 13, 14], 10);
            player.animations.add('right', [24, 25, 26], 10);
            player.animations.add('up', [36, 37, 38], 10);
            player.body.collideWorldBounds = true;
            sendPosition(m.x, m.y, m.playerName);
            player.x = m.x;
            player.y = m.y;
            //console.log("Sent the initial position info!");
            //console.log(player.id + " is at coordinate " + "(" + player.x + ", " + player.y + ")");
            allPlayers.push(player); //add the newly spawned player to the allPlayers array
            player.label = game.add.text(player.x, player.y - 10, label, style);
            console.log(player);
            if (m.id === client.clientId()) {
                //now that my player has all the player object properties loaded, let's change his name to myPlayer to distinguish him in future commands
                myPlayer = player;
            }
            
            //console.log("length of allPlayers = " + allPlayers.length);
            return player;
        }

        function uPosition(m) {
            //do the following only for other players who are sending messages
            var index = 0;
            var i = 0;
            if (m.id != client.clientId()) {
                //console.log("message id does not equal client id");   
                do {
                    if(allPlayers[i].id === m.id) {
                        //console.log("Found a match in the allPlayers array");
                        index = i;
                        break; 
                    } else {
                        //console.log("Have not found a match in the allPlayers array yet, keep looping");
                        i = i + 1;
                        index = i;
                    }
                    if(index >= allPlayers.length) { //the allPlayers array will be shorter in a user's browser window where the message-sending player has not yet been spawned
                        //if the player sending the message isn't in the allPlayer array, it needs to be spawned in my browser window
                        //console.log("not spawned yet");
                        spawn(m);
                        break;
                    }
                } while (i < allPlayers.length);

                if (index != 0) {
                    if (allPlayers[index].x > m.x) {
                        allPlayers[index].animations.play('left');                
                    } else if (allPlayers[index].x < m.x) {
                        allPlayers[index].animations.play('right');             
                    } else if (allPlayers[index].y > m.y) {
                        allPlayers[index].animations.play('up');
                    } else {
                        allPlayers[index].animations.play('down');
                    }
            
                    allPlayers[index].x = allPlayers[index].label.x = m.x;
                    allPlayers[index].y = m.y;
                    allPlayers[index].label.y = m.y - 10; //label above player
                } else {
                    return;
                }
                
            } else {
                //console.log("Message id equals client id");
                //don't do anything when the uPosition function is being called for my player, as it's already updated in my browser window
                return;
            }
        }

        function kill(left) {
            //console.log("kill!");
            var kIndex = 0;
            var k = 0;
            do {
                if(allPlayers[k].id === left) {
                    //console.log("Found a match in the allPlayers array");
                    kIndex = k;
                    break; 
                } else {
                        //console.log("Have not found a match in the allPlayers array yet, keep looping");
                        k = k + 1;
                        kIndex = k;
                }
                if(kIndex >= allPlayers.length) {
                        break;
                }
            } while (k < allPlayers.length);

            if (kIndex != 0) {      
            allPlayers[kIndex].destroy();
            allPlayers[kIndex].label.destroy();
            console.log("Player " + left + " just left the game. Bye bye!");
            return;
            
            }      
        }
    }
});

