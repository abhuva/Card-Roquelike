///////////////////////////////////////////////////////////////////////////////////
// FOV
// Includes functions that handles Field of View and Line of Sight algorithms
//////////////////////////////////////////////////////////////////////////////////


#pragma strict
	var AM:AIManager;
	var fovRange : int = 25;
	private var MD : MainData;			// we use those to reference our MainData script wich holds all important datastructures
	private var gameData : GameObject;
	//private var CM : CombatManager;
	
	function Awake () {
		gameData = GameObject.Find("GameData");
		MD = gameData.GetComponent(MainData);
		//CM = GetComponent(CombatManager);
	}
	
	// placeholder function to integrate all FOV from all chars into one map, might get changed later
	function UpdateAllFOV () {
		CLEAR_MAP_TO_NOT_VISIBLE();
		FOV(12,12,fovRange,false,1);
	}

	
	// FOV algorithm, pass x and y coordinates of the center, also pass view radius
	function FOV (px : int, py : int, viewRadius : int, clearMap : boolean, visibleValue : int) {
		var x : float;
		var y : float;
		var i : int;
		var fovSteps : int = 1;
		//if (clearMap) CLEAR_MAP_TO_NOT_VISIBLE();//Initially set all tiles to not visible.
		for(i=0;i<360;i+=fovSteps) {
			x= Mathf.Cos(i*0.01745f);
			y= Mathf.Sin(i*0.01745f);	
			DoFov(x,y,px,py,viewRadius,visibleValue);
		}
	}

	function DoFov(x : float, y : float, px : int, py : int, viewRadius : int, visibleValue : int) {
		var i : int;
		var ox : float;
		var oy : float;
		ox = px*1.0+0.5f;
		oy = py*1.0+0.5f;
		for(i=0;i<viewRadius;i++) {
			if (ox < MD.maxX && ox >= 0 && oy <= MD.maxY && oy > 0) {
				MD.viewMap[ox,oy]=1;//visibleValue;//Set the tile to visible. we dont overpaint if we already set this to the highest value
				if( sight_blocked(ox+AM.AIDataList[0].position.x-13+1,oy+AM.AIDataList[0].position.y-13+1) ) {return;}
				ox+=x;
				oy+=y;
			} else {
				return;
			}
		}
	}

	// this function sets our whole viewMap to false (nothing is visible)
	function CLEAR_MAP_TO_NOT_VISIBLE() {
		
		for (var x = 0; x < MD.maxX; x++) {
			for (var y = 0; y<MD.maxY; y++) {
				MD.viewMap[x,y] = 0;
			}
		}
	}

	// Line of sight code, returns true if there is a non-blocked line of sight between 2 positions mx,my and px,py
	function LOS(mx : int, my : int, px : int, py : int) : boolean {
		var t : int;
		var x : int;
		var y : int;
		var ax : int;
		var ay : int;
		var sx : int;
		var sy : int;
		var dx : int;
		var dy : int;
	 
		/* Delta x is the players x minus the monsters x    *
		* d is my dungeon structure and px is the players  *
		* x position. mx is the monsters x position passed *
		* to the function.                                 */
		dx = px - mx;
	 
		/* dy is the same as dx using the y coordinates */
		dy = py - my;
	 
		/* ax & ay: these are the absolute values of dx & dy *
		* multiplied by 2 ( shift left 1 position)          */
		ax = Mathf.Abs(dx) * 2;  // original was abs(dx) << 1
		ay = Mathf.Abs(dy) * 2;
	 
		/* sx & sy: these are the signs of dx & dy */
		sx = Mathf.Sign(dx);
		sy = Mathf.Sign(dy);
	 
		/* x & y: these are the monster's x & y coords */
		x = mx;
		y = my;
	 
		/* The following if statement checks to see if the line *
		* is x dominate or y dominate and loops accordingly    */
		if(ax > ay) {
			/* X dominate loop */
			/* t = the absolute of y minus the absolute of x divided *
			 by 2 (shift right 1 position)                         */
			t = ay - (ax / 2);  // original was t = ay - (ax >> 1)
			while (sight_blocked(x,y) == false) {
				if(t >= 0) {
					/* if t is greater than or equal to zero then *
					* add the sign of dy to y                    *
					* subtract the absolute of dx from t         */
					y += sy;
					t -= ax;
				}
	 
				/* add the sign of dx to x      *
				* add the adsolute of dy to t  */
				x += sx;
				t += ay;
	 
				/* check to see if we are at the player's position */
				if (x == px && y == py) {
					/* return that the monster can see the player */
					return true;
				}
				/* keep looping until the monster's sight is blocked *
				* by an object at the updated x,y coord             */  
			}
		  
	 
			/* NOTE: sight_blocked is a function that returns true      *
			* if an object at the x,y coord. would block the monster's *
			* sight                                                    */
	 
			/* the loop was exited because the monster's sight was blocked *
			* return FALSE: the monster cannot see the player             */
			return false;
		} else {
			/* Y dominate loop, this loop is basically the same as the x loop */
			t = ax - (ay / 2);  // was original: t = ax - (ay >> 1)
			while(sight_blocked(x,y) == false) {
				if(t >= 0) {
					x += sx;
					t -= ay;
				}
				y += sy;
				t += ax;
				if(x == px && y == py) {
					return true;
				}
			}
		  
			return false;
		}
	}

	// this checks if a coordinate is blocked, used by LOS and FOV algorithm, define the blocking conditions here
	function sight_blocked(x:int, y : int) : boolean {
		if (MD.mapMove[x,y] == 0) { return true; } else { return false; } //-13+1
	//	if (MD.mapMove[x+AM.AIDataList[0].position.x-13+1,y+AM.AIDataList[0].position.y-13+1] == 0) { return true; } else { return false; } //-13+1

	}

