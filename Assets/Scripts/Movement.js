#pragma strict

	 var MD : MainData;			// we use those to reference our MainData script wich holds all important datastructures
	private var gameData : GameObject;
	 var TM : TilesUV;
	 var TM2: TilesUV;
	 var FV : FOV;
	 var MC : MapCreation;
	 var AM : AIManager;
	 var COM : Combat;
	 
	var turnState : int = 0;			// what turn it is, 0=no turn, 1=players turn, 2=ai turn
	var nextAITime : float;
	
	function Awake () {
		gameData = GameObject.Find("GameData");
		MD = gameData.GetComponent(MainData);
		
		gameData = GameObject.Find("WorldLayer");
		TM = gameData.GetComponent(TilesUV);
		gameData = GameObject.Find("CharLayer");
		TM2 = gameData.GetComponent(TilesUV);
	}
	
	function Start() {
		//UpdateMap();
	}

var oneStep : boolean = true;
private var cB : int;
function GameRunningUpdate() {
	if (turnState == 0) {
		while (turnState == 0) {
			if (AM.AIDataList[0].time <= MD.gameTime) {
				turnState = 1;
			} else {
				// we cycle through each AI and check for time
				
				if (nextAITime <= MD.gameTime) turnState = 2;
				
			}
			MD.gameTime += MD.gameTimeStep;
		}
		
	} else
	if (turnState == 1) {
		if ((!oneStep && Input.GetKey ("w")) || (oneStep && Input.GetKeyDown("w"))) { // up
			cB = CheckBlocked(AM.AIDataList[0].position.x,AM.AIDataList[0].position.y+1);
			if ((cB == -1) && ((AM.AIDataList[0].position.y+1) < MD.maxYWorld-1)) {
				AM.AIDataList[0].position.y += 1; 
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				UpdateMap();
				turnState = 0;
			} else if (cB >= 0) {
				COM.MeleeCombat(AM.AIDataList[0],AM.AIDataList[cB]);
				if (AM.AIDataList[cB].life <= 0) {
					//AM.AIDataList.RemoveAt(cB);
					AM.UpdateDeadTargets();
				}
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				turnState = 0;
			}
		} 
		if ((!oneStep && Input.GetKey ("a")) || (oneStep && Input.GetKeyDown("a"))) { // left
			cB = CheckBlocked(AM.AIDataList[0].position.x-1,AM.AIDataList[0].position.y);
			if ((cB == -1) && ((AM.AIDataList[0].position.x-1) > 0)) {
				AM.AIDataList[0].position.x += -1;
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				UpdateMap();
				turnState = 0;
			} else if (cB >= 0) {
				COM.MeleeCombat(AM.AIDataList[0],AM.AIDataList[cB]);
				if (AM.AIDataList[cB].life <= 0) {
					//AM.AIDataList.RemoveAt(cB);
					AM.UpdateDeadTargets();
				}
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				turnState = 0;
			}

		} 
		if ((!oneStep && Input.GetKey ("s")) || (oneStep && Input.GetKeyDown("s"))) { // down
			cB = CheckBlocked(AM.AIDataList[0].position.x,AM.AIDataList[0].position.y-1);
			if ((cB == -1) && ((AM.AIDataList[0].position.y-1) > 0))  {
				AM.AIDataList[0].position.y += -1;
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				UpdateMap();
				turnState = 0;
			} else if (cB >= 0) {
				COM.MeleeCombat(AM.AIDataList[0],AM.AIDataList[cB]);
				if (AM.AIDataList[cB].life <= 0) {
					//AM.AIDataList.RemoveAt(cB);
					AM.UpdateDeadTargets();
				}
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				turnState = 0;
			}

		} 
		if ((!oneStep && Input.GetKey ("d")) || (oneStep && Input.GetKeyDown("d"))) { // right
			cB = CheckBlocked(AM.AIDataList[0].position.x+1,AM.AIDataList[0].position.y);			
			if ((cB== -1) && ((AM.AIDataList[0].position.x+1) < MD.maxXWorld-1))  {
				AM.AIDataList[0].position.x += 1;
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				UpdateMap();
				turnState = 0;
			} else if (cB >= 0) {
				COM.MeleeCombat(AM.AIDataList[0],AM.AIDataList[cB]);
				if (AM.AIDataList[cB].life <= 0) {
					//AM.AIDataList.RemoveAt(cB);
					AM.UpdateDeadTargets();
				}
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				turnState = 0;
			}

		} 
		if ((!oneStep && Input.GetKey (KeyCode.Space)) || (oneStep && Input.GetKeyDown(KeyCode.Space))) { // space
				AM.AIDataList[0].time += AM.AIDataList[0].speed;
				turnState = 0;
			
		} 
		var ray : Ray = Camera.main.ScreenPointToRay (Input.mousePosition);
		var hit : RaycastHit;
		if ((Physics.Raycast (ray, hit, 100.0)) && Input.GetMouseButtonDown(0)) {
			var pos : int = Mathf.Floor(hit.triangleIndex / 2);
			var x : int = pos % MD.maxX;
			var y : int = (pos - x) / MD.maxX;
			if (hit.collider.gameObject.name == "WorldLayer" ) {
				MD.statusText = "Mouse X,Y : "+x+","+y;
				var worldPosX : int = x+AM.AIDataList[0].position.x-12;
				var worldPosY : int = y+AM.AIDataList[0].position.y-12;
				 MD.statusText += "World X,Y : "+worldPosX+","+worldPosY;
				var target : int = CheckBlocked(worldPosX,worldPosY);
				
				if (target > 0) {
					COM.RangedCombat(AM.AIDataList[0],AM.AIDataList[target]);
					AM.AIDataList[0].time += AM.AIDataList[0].speed;
					turnState = 0;
				}
				
			}
		}

	} else
	if (turnState == 2) {
		AM.UpdateAI();
		UpdateMap();
		turnState = 0;
	}

}
function Update () {
	if (MD.gameState == 1) {
		GameRunningUpdate();
	}
}

function CheckBlocked(x : int, y : int) : int {
	var blocked : int;
	// -2 means wall
	// -1 means walkable
	// 0 means player
	// 1+ is the iD of a AI blocking this tile
	if (MD.mapMove[x,y] == 0) blocked = -2; else blocked = -1; 
	for (var i : int = 0; i < AM.AIDataList.Count; i++) {			
		var x1 : int  = AM.AIDataList[i].position.x;
		var y1 : int = AM.AIDataList[i].position.y;
		if ((x1 == x) && (y1==y)) blocked = i;
	}
	return blocked;
}

function UpdateMap () {
	for (var x = 0; x < 25; x++) {
		for (var y = 0; y < 25; y++) {
			var cX : int = x+AM.AIDataList[0].position.x-13+1;
			var cY : int = y+AM.AIDataList[0].position.y-13 + 1;
			if ((cX > 0) && (cX < MD.maxXWorld-1) && (cY > 0) && (cY < MD.maxYWorld-1)) {
				MD.map[x,y] = MD.mapWorld[cX,cY];
			} else { 
				MD.map[x,y] = 2;
			}
		}
	}
	MC.VisualizeMiniMapAsTexture();
	FV.UpdateAllFOV();
	TM.ReMap2Background();
	TM2.ReMap2Chars();
}