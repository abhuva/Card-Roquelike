#pragma strict
// Everything related to AI comes here

class AIDataClass  {
	var name  		: String; // backup information during atlas creation
	var position 	: Vector2;
	var state 		: int;
	var target 		: int;  // a pointer to a target in the AIDataList, -1 means the player
	var time 		: float; // the gameTime for the next Action allowed;
	var speed		: float; // the speed of this char, not hardcoded - based on agi
	var life 		: int; // the amount of hitpoints
	var atk 		: int;
	var def 		: int; 
	var agi			: int;
	var dex			: int;
	var viewRange   : int; // how far this char can see, not hardcoded - based on dex
}
var AIDataList : List.<AIDataClass>;		// uv-information for background tiles of the world-map
//var player : AIDataClass;

var MD : MainData;

var MO : Movement;
var COM: Combat;
var FV : FOV;
var amountAI : int;  // only for debugging purposes, 

function InitAIData() {
	AIDataList = new List.<AIDataClass>();
	var aiData : AIDataClass;
	
	// first we define the player Char, player Char is always the first in the AIDataList
	aiData = new AIDataClass();
	aiData.time = 0;
	aiData.speed = 1;
	aiData.atk = 10;
	aiData.def = 10;
	aiData.life = 400;
	aiData.agi	= 10;
	aiData.dex = 10;
	aiData.name = "Player";
	AIDataList.Add(aiData);
	
	for (var i : int = 0; i < amountAI; i++) {
		aiData = new AIDataClass();
		aiData.name = "Goblin";
		aiData.position.x = 10;
		aiData.position.y = 10;
		aiData.state = 4; 
		aiData.time = 0.1;
		aiData.speed = 1;
		aiData.atk = 1;
		aiData.def = 1;
		aiData.agi = 10;
		aiData.dex = 10;
		aiData.life = 5;
		aiData.target = 0;
		aiData.viewRange = 5;
		AIDataList.Add(aiData);
	}
	
}

// will return a random, walkable position on the map as vector2
function RandomWalkablePosition() : Vector2 {
	for (var i : int = 0; i < 10000; i++) {
		var x : int = Random.Range(0,MD.maxXWorld);
		var y : int = Random.Range(0,MD.maxYWorld);
		if (MO.CheckBlocked(x,y)== -1) {
			var pos:Vector2;
			pos.x = x;
			pos.y = y;
			return pos;
		}
	}
	// if we failed to find a pos we return -1,-1 instead
	pos.x = -1;
	pos.y = -1;
	return pos;
}

// This will let the AI move in a random direction in some kind of brownian motion
function MoveRandomly (iD:int) {
	// we get the x,y position 
	var x : int = AIDataList[iD].position.x;
	var y : int = AIDataList[iD].position.y;
	var dir : Vector2;
	var dirList : List.<Vector2>;
	dirList = new List.<Vector2>();
	dirList.Clear();
	dir.x = 0;
	dir.y = 0;
	// we gather all possible directions we can move 
	if (MO.CheckBlocked(x+1,y) == -1) {
		dir.x = 1;
		dir.y = 0;
		dirList.Add(dir);
	}
	if (MO.CheckBlocked(x+-1,y) == -1) {
		dir.x = -1;
		dir.y = 0;
		dirList.Add(dir);
	}
	if (MO.CheckBlocked(x,y+1) == -1) {
		dir.x = 0;
		dir.y = 1;
		dirList.Add(dir);
	}
	if (MO.CheckBlocked(x,y-1) == -1) {
		dir.x = 0;
		dir.y = -1;
		dirList.Add(dir);
	}
	// if we found any valid direction we move
	if (dirList.Count > 0) {
		var r : int  = Random.Range(0,dirList.Count);
		dir = dirList[r];
	}
	
	AIDataList[iD].position.x += dir.x;
	AIDataList[iD].position.y += dir.y;
}


// Tries to move toward a given position, doesnt take pathfinding into account
function MoveTowardPosition(iD:int, pos:Vector2) {
	// we get the x,y position 
	var x : int = AIDataList[iD].position.x;
	var y : int = AIDataList[iD].position.y;
	var dir : Vector2;
	var dirList : List.<Vector2>;
	dirList = new List.<Vector2>();
	dirList.Clear();
	dir.x = 0;
	dir.y = 0;
	
	
	
	//var playerPosX : int = AIDataList[0].position.x;
	//var playerPosY : int = AIDataList[0].position.y;
	// we gather all possible directions we can move 
	if ((MO.CheckBlocked(x+1,y) == -1) && (x < pos.x)) {
		dir.x = 1;
		dir.y = 0;
		dirList.Add(dir);
	}
	if ((MO.CheckBlocked(x+-1,y) == -1) && (x > pos.x)) {
		dir.x = -1;
		dir.y = 0;
		dirList.Add(dir);
	}
	if ((MO.CheckBlocked(x,y+1) == -1) && (y < pos.y)) {
		dir.x = 0;
		dir.y = 1;
		dirList.Add(dir);
	}
	if ((MO.CheckBlocked(x,y-1) == -1) && (y > pos.y)) {
		dir.x = 0;
		dir.y = -1;
		dirList.Add(dir);
	}
	// if we found any valid direction we move
	if (dirList.Count > 0) {
		var r : int  = Random.Range(0,dirList.Count);
		dir = dirList[r];
		AIDataList[iD].position.x += dir.x;
		AIDataList[iD].position.y += dir.y;
	} else {
		// we didnt found a direction to walk, so we use a random walk as backup
		MoveRandomly(iD);
	}
	//
	
	

}

function Flocking(iD:int) {
	// we search the nearest AI in a certain distance
	var x : int;
		var y : int;
		var x1: int;
		var y1: int;
		var totalX : int;
		var totalY : int;
		var total : int;
		var dir : Vector2;
	var dirList : List.<Vector2>;
	dirList = new List.<Vector2>();
	dirList.Clear();
	dir.x = 0;
	dir.y = 0;
	
	x = AIDataList[iD].position.x;
	y = AIDataList[iD].position.y;
		
	for (var i : int = 1; i < AIDataList.Count; i++) {
		
		
		
		x1 = AIDataList[i].position.x;
		y1 = AIDataList[i].position.y;
		if ((Mathf.Abs(x-x1) <= 10) && (Mathf.Abs(y-y1) <= 10)) {
			total += 1;
			totalX += x1;
			totalY += y1;
		}
	}
	if (total > 0) {
		x1 = totalX / total;
		y1 = totalY / total;
		// we now have our desired goal, now we try to move there
		if ((x1 > x) && (!MO.CheckBlocked(x+1,y))) {
			dir.x = 1;
			dir.y = 0;
			dirList.Add(dir);
			
		} else
		if ((x1 < x) && (!MO.CheckBlocked(x-1,y))) {
			dir.x = -1;
			dir.y = 0;
			dirList.Add(dir);
		} else
		if ((y1 > y) && (!MO.CheckBlocked(x,y+1))) {
			dir.x = 0;
			dir.y = 1;
			dirList.Add(dir);
		} else
		if ((y1 > y) && (!MO.CheckBlocked(x,y-1))) {
			dir.x = 0;
			dir.y = -1;
			dirList.Add(dir);
		} 
		
	} 
	if (dirList.Count > 0) {
		dir = dirList[Random.Range(0,dirList.Count)];
		AIDataList[iD].position.x += dir.x;
		AIDataList[iD].position.y += dir.y;
	}
	else MoveRandomly(iD);

}

function UpdateDeadTargets () {
	var i : int = 1;
	
	for (i = 1; i < AIDataList.Count; i++) {
		if (AIDataList[i].life <= 0) {
			MD.statusText = AIDataList[i].name + " died." + "\n" + MD.statusText;
			AIDataList.RemoveAt(i);
			i -= 1;
		}
	}
	for ( i  = 1; i < AIDataList.Count; i++) {
		if (AIDataList[i].target >= AIDataList.Count) {
			AIDataList[i].target = -1; 
			AIDataList[i].state = 0;
		}
	}
}

function Combat(iD : int) {
	var target : int = AIDataList[iD].target;
	if (target >= 0) {  // the AI wants to fight a target
		COM.MeleeCombat(AIDataList[iD],AIDataList[target]);
	}
	if ((AIDataList[target].life <= 0) && (target > 0)) { // the death of the player is NOT handled here
		AIDataList[iD].target = -1;
		AIDataList[iD].state = 0; // we just lost our target and idle now
	}
}

function RecalcState(iD : int) {
// if we dont know what to do we just walk randomly...
	//AIDataList[iD].state = 4; // move Randomly
	var target : int = AIDataList[iD].target;
	if (target >= 0) {
		// check if target is nearby for melee Combat
		if ((Mathf.Abs(AIDataList[target].position.x - AIDataList[iD].position.x) == 1) && ((AIDataList[target].position.y-AIDataList[iD].position.y) == 0) || 
			(Mathf.Abs(AIDataList[target].position.y - AIDataList[iD].position.y) == 1) && ((AIDataList[target].position.x-AIDataList[iD].position.x) == 0)) {
				AIDataList[iD].state = 3; // we set melee combat;
			} else if (CheckLOS(iD,target)) {
				// we are not close enough, so we try to move to the target
				AIDataList[iD].state = 4;
			} else AIDataList[iD].state = 1;
	} else Debug.Log("Lost Target");
}

// checks if there is a line of sight between two given chars, note that this is cheating a bit cause we dont use
// correct FOV for performance reasons
function CheckLOS(iD1 : int, iD2 : int) {
	var x : int = AIDataList[iD1].position.x;
	var y : int = AIDataList[iD1].position.y;
	var x1: int = AIDataList[iD2].position.x;
	var y1: int = AIDataList[iD2].position.y;
	var lx : int = Mathf.Abs(x-x1);
	var ly : int = Mathf.Abs(y-y1);
	var dist : int = Mathf.Sqrt(lx*lx+ly*ly);
	if (FV.LOS(x,y,x1,y1)) {
		 if (dist <= AIDataList[iD1].viewRange) return true;
	}
	return false;
}

function UpdateAI() {
		var AICount : int = AIDataList.Count;
		var i : int = 1;
	while ( i < AICount) {
		 RecalcState(i);
		
		if (AIDataList[i].state == 0) {} // do nothing, just idle
		else if (AIDataList[i].state == 1) MoveRandomly(i);
		else if (AIDataList[i].state == 2) Flocking(i);
		else if (AIDataList[i].state == 3) {
			Combat(i);
			AICount  = AIDataList.Count; // maybe someone died, so we need to update
		}
		else if (AIDataList[i].state == 4) MoveTowardPosition(i,AIDataList[AIDataList[i].target].position); // move towards target

		
		AIDataList[i].time += AIDataList[i].speed;	
		i += 1;
	}
	UpdateDeadTargets();
	UpdateNextAITime();
}

function InitAI() {
	for (var i : int = 1; i < AIDataList.Count; i++) {
		var pos : Vector2;
		pos = RandomWalkablePosition();
		AIDataList[i].position.x = pos.x;
		AIDataList[i].position.y = pos.y;
	}
}

function UpdateNextAITime() {
	if (AIDataList.Count == 0) return;
	MO.nextAITime = AIDataList[0].time;
	for (var i : int = 1; i < AIDataList.Count; i++) {
		if (AIDataList[i].time < MO.nextAITime) MO.nextAITime = AIDataList[i].time;
	}
}

function Start() {
	InitAIData();
}