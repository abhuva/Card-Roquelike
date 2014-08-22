#pragma strict

public var maxX : int; // the width of the map
public var maxY : int; // the height of the map
public var map : int[,];  // this holds our map we can see ingame
public var mapWorld : int[,];	// the whole map (background)
public var mapDetail: int[,];  // the detail map (foreground)
public var mapMove : int[,];	// the movement map

public var maxXWorld : int;		// the width of the whole map
public var maxYWorld : int;		// the height of the whole map
public var statusText : String = "Hello and welcome"; 

//public var playerPosX : int;	// x position of the player in the world
//public var playerPosY : int;	// y position of the player in the world

public var viewMap : byte [,]; // this holds info about visibility of our map tiles, used for FOV algorithm
public var uvInfo : List.<int>;		// working space for remapping the worldmap
public var gameTime : float;
public var gameTimeStep : float = 0.1;
public var gameState : int; // what state the game is in, 0 = dev-consoles, 1 = running game
// Our simple UV Data Class to hold information about UV-Coordinates of sprites
class uvDataClass  {
	var iD  : int; // backup information during atlas creation
	var row : int;
	var column : int;
	var fileName : String;
}
var uvData : uvDataClass[];		// uv-information for background tiles of the world-map

function InitUVData() {
	uvData = new uvDataClass[6];
	for (var i = 0; i < 6; i++) { uvData[i] = new uvDataClass();}
	uvData[0].row = 10;
	uvData[0].column = 30;
	uvData[1].row = 10;
	uvData[1].column = 29;
	uvData[2].row = 10;
	uvData[2].column = 28;
	uvData[3].row = 12;
	uvData[3].column = 30;
	uvData[4].row = 12;
	uvData[4].column = 29;
	uvData[5].row = 12;
	uvData[5].column = 28;
}

function Awake () {
	InitUVData();
	mapWorld = new int[maxXWorld,maxYWorld];
	mapDetail = new int[maxXWorld, maxYWorld];
	map = new int[maxX,maxY];
	//for (var x = 0; x < maxXWorld; x++) {
	//	for (var y = 0; y < maxYWorld; y++) {
	//		mapWorld[x,y] = Random.Range(0,3);
	//	}
	//}
	viewMap = new byte[maxX, maxY];
}