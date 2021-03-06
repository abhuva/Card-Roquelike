﻿#pragma strict

var TUV : TilesUV;
var ViewSpace : GameObject;
var ViewSpace2 : GameObject;
var ViewSpace3 : GameObject;
var AC : AtlasCreation;
var MC : MapCreation;
var WG : WorldGeneration;

var posX : int;
var posY : int;
private var selectionGridInt : int = 0;
private var selectionStrings : String[] = ["Grid 1", "Grid 2", "Grid 3", "Grid 4"];
private var selectionGridInt2 : int = 0;
private var selectionStrings2 : String[] = ["Grid 1", "Grid 2", "Grid 3", "Grid 4"];
private var selectionGridInt3 : int = 0;
private var selectionStrings3 : String[] = ["Grid 1", "Grid 2", "Grid 3", "Grid 4"];
private var scrollViewVector : Vector2;
private var scrollViewVector2 : Vector2;
private var scrollViewVector3 : Vector2;

private var oldSelectionGridInt : int = -1;
private var oldSelectionGridInt2 : int = -1;
private var oldSelectionGridInt3 : int = -1;

private var description : String;
private var state : int;
private var windowRect : Rect = Rect(0,0,Screen.width,Screen.height);
 var winGUIStyle : GUIStyle;

private var orthSize1 : float = 1;
private var orthSize2 : float = 1;
private var posX1 : float = 0.37;
private var posX2 : float = 0.37;
private var posZ1 : float = 0.47;
private var posZ2 : float = 0.47;
private var posX3 : float = 1;
private var posZ3 : float = 1;
private var orthSize3 : float = 15;

private var percText : String;
private var percW : float;
private var loopCount : int;
private var maxLoopCount : int;
private var minPerc : float;
private var maxPerc : float;
private var done : int;
private var showOptions : boolean;
//private var windowRect : Rect = Rect(0,0,Screen.width,Screen.height);
var MD : MainData;			// we use those to reference our MainData script wich holds all important datastructures
private	var gameData : GameObject;
private	var showSets : boolean = false;
	
private var iDSave : int;
private var innerText : String = "";
private var crule1 : int;
private var crule2 : int;
private var crange : int;
private var width : int;

function UpdateRulesList(){
	selectionStrings = new String[AC.UVcontainer.UVRuleSets.Count];
	for (var i = 0; i < AC.UVcontainer.UVRuleSets.Count; i++) {
			selectionStrings[i] = AC.UVcontainer.UVRuleSets[i].description;
			
		}
	    posX = AC.UVcontainer.UVRuleSets[selectionGridInt].row;
    	posY = AC.UVcontainer.UVRuleSets[selectionGridInt].column;
    	oldSelectionGridInt = selectionGridInt;
    	description = AC.UVcontainer.UVRuleSets[selectionGridInt].description;
    	// also load new file
    	ViewSpace.renderer.material.mainTexture = Resources.Load(AC.UVcontainer.UVRuleSets[selectionGridInt].fileName, Texture2D);
    	ViewSpace2.renderer.material.mainTexture = Resources.Load(AC.UVcontainer.UVRuleSets[selectionGridInt].fileName, Texture2D);

}

function UpdateUVList(){
	selectionStrings3 = new String[AC.UVcontainer.UVRuleSets.Count];
	for (var i = 0; i < AC.UVcontainer.UVRuleSets.Count; i++) {
		selectionStrings3[i] = AC.UVcontainer.UVRuleSets[i].description;
	}
}

function UpdateTileRuleSetsList() {
	selectionStrings = new String[AC.container.TileRuleSets.Count];
	for (var i = 0; i < AC.container.TileRuleSets.Count; i++) {
		selectionStrings[i] = AC.container.TileRuleSets[i].description;
	}
}

function UpdateTileRulesList() {
	selectionStrings2 = new String[AC.container.TileRuleSets[selectionGridInt].rule.length];
	for (var i = 0; i < AC.container.TileRuleSets[selectionGridInt].rule.length; i++) {
		selectionStrings2[i] = AC.container.TileRuleSets[selectionGridInt].rule[i];
	}
}

function UpdateMapGenList() {
	selectionStrings2 = new String[MC.container.MapGenSets.Count];
	for (var i = 0; i < MC.container.MapGenSets.Count; i++) {
		selectionStrings2[i] = MC.container.MapGenSets[i].iD;
	}
}

function UpdateWorldGenList() {
	selectionStrings = new String[WG.container.WorldGenSets.Count];
	for (var i = 0; i < WG.container.WorldGenSets.Count; i++) {
		selectionStrings[i] = WG.container.WorldGenSets[i].iD;
	}
}


function OnGUI () {
		if (state == 0) {
			ViewSpace3.renderer.enabled = false;
			ViewSpace2.renderer.enabled = false;
			ViewSpace.renderer.enabled = false;
		
			if (GUI.Button (Rect(0,0,100,30), "UV Info") ) {
				ViewSpace3.renderer.enabled = false;
				ViewSpace2.renderer.enabled = false;
				ViewSpace.renderer.enabled = true;
				UpdateRulesList();
				state = 1;
			}
			if (GUI.Button ( Rect ( 100,0,100,30), "TileSets")) {
				ViewSpace3.renderer.enabled = false;
				ViewSpace2.renderer.enabled = false;
				ViewSpace.renderer.enabled = true;
				selectionGridInt = 0;
				selectionGridInt2 = 0;
				UpdateTileRuleSetsList();
				UpdateTileRulesList();
				UpdateUVList();
				state = 2;
			}
			if (GUI.Button (Rect(200,0,100,30), "World Gen") ) {
				UpdateMapGenList();
				UpdateWorldGenList();
				state = 3;
			}
			if (GUI.Button (Rect(300,0,100,30), "Map Gen") ) {
				ViewSpace3.renderer.enabled = false;
				ViewSpace2.renderer.enabled = false;
				ViewSpace.renderer.enabled = true;
				//UpdateMapGenList();
				//UpdateWorldGenList();
				state = 4;
			}
			if (GUI.Button (Rect(400,0,100,30), "Render Map") ) {
				WG.Generator2Texture(0);
			}
			
		} else if (state == 1) {
			windowRect = GUI.Window (0, Rect(0,0,Screen.width,Screen.height), UVInfoGUI, "", winGUIStyle);
		} else if (state == 2) {
			windowRect = GUI.Window (0, Rect(0,0,Screen.width,Screen.height), TilesGUI, "", winGUIStyle);
		} else if (state == 3) {
			windowRect = GUI.Window (0, Rect(0,0,Screen.width,Screen.height), WorldGenGUI, "", winGUIStyle);
		} else if (state == 4) {
			windowRect = GUI.Window (0, Rect(0,0,Screen.width,Screen.height), MapGenGUI, "", winGUIStyle);
		}
	
}

function TestMapGUI () {
	if (GUI.Button ( Rect ( 100,0,100,30), "MainMenu")) {
    	state = 0;
	}
}

function WorldGenGUI() {
	scrollViewVector = GUI.BeginScrollView (Rect (0, 60, 200, 200), scrollViewVector, Rect (0, 0, 180, 30+selectionStrings.length*30));
    	selectionGridInt = GUI.SelectionGrid (Rect (5, 5, 180, selectionStrings.length*30), selectionGridInt, selectionStrings, 1);
    GUI.EndScrollView();
    scrollViewVector2 = GUI.BeginScrollView (Rect (200, 60, 200, 200), scrollViewVector2, Rect (0, 0, 180, 30+selectionStrings2.length*30));
    	selectionGridInt2 = GUI.SelectionGrid (Rect (5, 5, 180, selectionStrings2.length*30), selectionGridInt2, selectionStrings2, 1);
    GUI.EndScrollView();
	
	if (oldSelectionGridInt != selectionGridInt) {
		selectionGridInt2 = MC.getMapGenSetIDPos(WG.container.WorldGenSets[selectionGridInt].mapGenID);
		//oldSelectionGridInt2 = selectionGridInt2;
		oldSelectionGridInt = selectionGridInt;
	} else
	if (oldSelectionGridInt2 != selectionGridInt2) {
		WG.container.WorldGenSets[selectionGridInt].mapGenID = selectionStrings2[selectionGridInt2];
		oldSelectionGridInt2 = selectionGridInt2;
	}
	if (GUI.Button ( Rect ( 100,0,100,30), "MainMenu")) {
    	state = 0;
	}
}

function TilesGUI () {
	// The list of tileRuleSets
	scrollViewVector = GUI.BeginScrollView (Rect (0, 60, 200, 200), scrollViewVector, Rect (0, 0, 180, 30+selectionStrings.length*30));
    	selectionGridInt = GUI.SelectionGrid (Rect (5, 5, 180, selectionStrings.length*30), selectionGridInt, selectionStrings, 1);
    GUI.EndScrollView();
    
    // The list of rules
	scrollViewVector2 = GUI.BeginScrollView (Rect (200, 60, 200, 200), scrollViewVector2, Rect (0, 0, 180, 30+selectionStrings2.length*30));
    	selectionGridInt2 = GUI.SelectionGrid (Rect (5, 5, 180, selectionStrings2.length*30), selectionGridInt2, selectionStrings2, 1);
    GUI.EndScrollView();
	
	// the list of UVTiles to choose from
	scrollViewVector3 = GUI.BeginScrollView (Rect (400, 60, 200, 200), scrollViewVector3, Rect (0, 0, 180, 30+selectionStrings3.length*30));
    	selectionGridInt3 = GUI.SelectionGrid (Rect (5, 5, 180, selectionStrings3.length*30), selectionGridInt3, selectionStrings3, 1);
    GUI.EndScrollView();
	
	
	// the ID of the selected ruleset
	GUI.Label (Rect(100,465,100,30), "ID :"+AC.container.TileRuleSets[selectionGridInt].iD);
	AC.container.TileRuleSets[selectionGridInt].iD= GUI.HorizontalSlider (Rect (0, 465, 100, 20), AC.container.TileRuleSets[selectionGridInt].iD, 0, 32);

	if (selectionGridInt != oldSelectionGridInt) {
		selectionGridInt2 = 0;
		oldSelectionGridInt = selectionGridInt;
		UpdateTileRulesList();
		
	}
	if (selectionGridInt2 != oldSelectionGridInt2) {
		// first we search info
		var ruleName : String = AC.container.TileRuleSets[selectionGridInt].rule[selectionGridInt2];
		// we deconstruct this
		var words1 : String[];
		words1 = ruleName.Split(":"[0]);  // we seperate the parts (rule part and position parts)
		var foundID : int = int.Parse(words1[1]);
		selectionGridInt3 = foundID;
		
		var posX : int = AC.UVcontainer.UVRuleSets[foundID].row;
    	var posY : int = AC.UVcontainer.UVRuleSets[foundID].column;
    	// also load new file
    	ViewSpace.renderer.material.mainTexture = Resources.Load(AC.UVcontainer.UVRuleSets[foundID].fileName, Texture2D);
		TUV.ReMapUVforTile(0, posX,posY, true);
		ViewSpace.renderer.material.mainTexture.filterMode = FilterMode.Point;
		oldSelectionGridInt2 = selectionGridInt2;
	}
	
	if (selectionGridInt3 != oldSelectionGridInt3) {
		// first deconstruct the selected rule and construct it new
		ruleName = AC.container.TileRuleSets[selectionGridInt].rule[selectionGridInt2];
		words1 = ruleName.Split(":"[0]);  // we seperate the parts (rule part and position parts)
		ruleName = words1[0] + ":" + selectionGridInt3;
		AC.container.TileRuleSets[selectionGridInt].rule[selectionGridInt2] = ruleName;
		// now update lists
		UpdateTileRulesList();
		oldSelectionGridInt3 = selectionGridInt3;
		// and update the viewed texture
		foundID = selectionGridInt3;
		posX = AC.UVcontainer.UVRuleSets[foundID].row;
    	posY = AC.UVcontainer.UVRuleSets[foundID].column;
    	// also load new file
    	ViewSpace.renderer.material.mainTexture = Resources.Load(AC.UVcontainer.UVRuleSets[foundID].fileName, Texture2D);
		TUV.ReMapUVforTile(0, posX,posY, true);
		ViewSpace.renderer.material.mainTexture.filterMode = FilterMode.Point;
	}
	
	AC.container.TileRuleSets[selectionGridInt].rule[selectionGridInt2] = GUI.TextField (Rect (00, 495, 200, 20), AC.container.TileRuleSets[selectionGridInt].rule[selectionGridInt2], 25);
	AC.container.TileRuleSets[selectionGridInt].description = GUI.TextField (Rect (00, 525, 200, 20), AC.container.TileRuleSets[selectionGridInt].description, 25);

	if (GUI.Button ( Rect ( 100,0,100,30), "MainMenu")) {
    	state = 0;
	}
	if (GUI.Button ( Rect ( 0,0,100,30), "Duplicate")) {
		var myName : TileRuleSet = new TileRuleSet();
		myName.description 	= "New Rule Set";
		myName.iD			= 1;
		myName.rule = new String[AC.container.TileRuleSets[selectionGridInt].rule.length];
		for (var i : int = 0; i < AC.container.TileRuleSets[selectionGridInt].rule.length; i++) {
			myName.rule[i] = AC.container.TileRuleSets[selectionGridInt].rule[i];
		}
		AC.container.TileRuleSets.Add(myName); 
		
		UpdateTileRuleSetsList();
		UpdateTileRulesList();
	}
	if (GUI.Button ( Rect ( 200,0,100,30), "Save File")) {
    	var path : String = Application.dataPath + "/data/tilerulesets.xml";
		AC.container.Save(path);  
	}
}

function UVInfoGUI () {
	GUI.Label (Rect(100,0,300,30), "PosX :"+AC.UVcontainer.UVRuleSets[selectionGridInt].row);
	AC.UVcontainer.UVRuleSets[selectionGridInt].row= GUI.HorizontalSlider (Rect (0, 0, 300, 20), AC.UVcontainer.UVRuleSets[selectionGridInt].row, 0, 63);
	GUI.Label (Rect(100,30,300,30), "PosY :"+AC.UVcontainer.UVRuleSets[selectionGridInt].column);
	AC.UVcontainer.UVRuleSets[selectionGridInt].column= GUI.HorizontalSlider (Rect (0, 30, 300, 20), AC.UVcontainer.UVRuleSets[selectionGridInt].column, 0, 63);
	
	// Camera / Viewspace Controls
	ViewSpace2.renderer.enabled = GUI.Toggle(Rect(100, 430, 100, 30), ViewSpace2.renderer.enabled, "Whole Tex");
	ViewSpace.renderer.enabled = !ViewSpace2.renderer.enabled;
	
	if (ViewSpace2.renderer.enabled) {
		orthSize1= GUI.HorizontalSlider (Rect (0, 430, 100, 20), orthSize1, 0.1, 2);
		posX1= GUI.HorizontalSlider (Rect (0, 400, 100, 20), posX1, -2, 2);
		posZ1= GUI.HorizontalSlider (Rect (100, 400, 100, 20), posZ1, 0, 1);
		Camera.main.orthographicSize = orthSize1;
		Camera.main.transform.position.x = posX1;
		Camera.main.transform.position.z = posZ1;
	} else {
		orthSize2= GUI.HorizontalSlider (Rect (0, 430, 100, 20), orthSize2, 10, 55);
		posX2= GUI.HorizontalSlider (Rect (0, 400, 100, 20), posX2, -15, 15);
		posZ2= GUI.HorizontalSlider (Rect (100, 400, 100, 20), posZ2, -15, 15);
		Camera.main.orthographicSize = orthSize2;
		Camera.main.transform.position.x = posX2;
		Camera.main.transform.position.z = posZ2;
	}
	
	
	scrollViewVector = GUI.BeginScrollView (Rect (0, 60, 200, 200), scrollViewVector, Rect (0, 0, 180, 30+selectionStrings.length*30));
    	selectionGridInt = GUI.SelectionGrid (Rect (5, 5, 180, selectionStrings.length*30), selectionGridInt, selectionStrings, 1);
    GUI.EndScrollView();
    
    AC.UVcontainer.UVRuleSets[selectionGridInt].description = GUI.TextField (Rect (00, 330, 200, 20), AC.UVcontainer.UVRuleSets[selectionGridInt].description, 25);
    AC.UVcontainer.UVRuleSets[selectionGridInt].fileName = GUI.TextField (Rect (00, 360, 200, 20), AC.UVcontainer.UVRuleSets[selectionGridInt].fileName, 25);

    if (GUI.Button ( Rect ( 0,265,100,30), "Add NEW")) {
		var myName : UVRuleSet = new UVRuleSet();
		myName.description 	= "New Entry";
		myName.iD			= AC.UVcontainer.UVRuleSets.Count;
		myName.row			= 0;
		myName.column		= 0;
		myName.fileName 	= "floor";
		AC.UVcontainer.UVRuleSets.Add(myName); 
		UpdateRulesList();
	}
    if (GUI.Button ( Rect ( 100,265,100,30), "Update")) {
		UpdateRulesList();
	}
    if (GUI.Button ( Rect ( 00,295,100,30), "Save File")) {
    	var path : String = Application.dataPath + "/data/uvrulesets.xml";
		AC.UVcontainer.Save(path);  
	}
	if (GUI.Button ( Rect ( 100,295,100,30), "MainMenu")) {
    	state = 0;
	}
	
	// update the shown graphic
    if (selectionGridInt != oldSelectionGridInt) {
    	UpdateRulesList();
    }
	
	TUV.ReMapUVforTile(0, AC.UVcontainer.UVRuleSets[selectionGridInt].row, AC.UVcontainer.UVRuleSets[selectionGridInt].column, true);
	ViewSpace.renderer.material.mainTexture.filterMode = FilterMode.Point;

}


// From here on comes GUI Stuff

	
function UpdateAlgoList() {
	innerText = "";
	for (var i = 0; i < MC.algoList.Count; i++) {
		innerText += "\n"+MC.algoList[i];
	}
}	

function MapGenGUI () {
// first the initializer
	orthSize3= GUI.HorizontalSlider (Rect (0, 630, 100, 20), orthSize3, 1, 20);
	posX3= GUI.HorizontalSlider (Rect (0, 600, 100, 20), posX3, -10, 10);
	posZ3= GUI.HorizontalSlider (Rect (100, 600, 100, 20), posZ3, -10, 10);
	Camera.main.orthographicSize = orthSize3;
	Camera.main.transform.position.x = posX3;
	Camera.main.transform.position.z = posZ3;
		
		
    scrollViewVector = GUI.BeginScrollView (Rect (575, 25, 200, 200), scrollViewVector, Rect (0, 0, 400, 16*MC.algoList.Count+20));
    	innerText = GUI.TextArea (Rect (0, 0, 400, 16*MC.algoList.Count+20), innerText);
    GUI.EndScrollView();
    if (GUI.Button ( Rect ( 575,240,100,30), "Delete Last")) {
			MC.algoList.RemoveAt(MC.algoList.Count-1);
			UpdateAlgoList();
	}
	
	if (GUI.Button ( Rect ( 200,240,100,30), "Save 2")) {
		for ( var x=0;x<MC.maxX;x++) {
			for ( var y=0;y<MC.maxY;y++) {
				if (MC.map[x,y] == 1) MD.mapWorld[x,y] = iDSave;
			}
		}
		MC.algoList.Add("Save2:"+iDSave);
		UpdateAlgoList();
	}
	GUI.Label (Rect(300,240,100,30), "iDSave :"+iDSave);
	iDSave = GUI.HorizontalSlider (Rect (300, 240, 100, 20), iDSave, 0, 20);

if (GUI.Button( Rect(200,000,100,30), "Perlin Noise") ) {
		MC.CalcNoise();
		MC.VisualizeMapAsTexture();
		MC.algoList.Add("Perlin:"+MC.fillProbability);
		UpdateAlgoList();
	}
	if (GUI.Button( Rect(0,0,100,30), "White Noise") ) {
		MC.InitMap1();
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("WhiteNoise:"+MC.fillProbability);
		UpdateAlgoList();
	}
	if (GUI.Button( Rect(100,0,100,30), "Circle Noise") ) {
		MC.InitMap();
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("CircleNoise:"+MC.fillProbability);
		UpdateAlgoList();
	}
	
	GUI.Label (Rect(500,15,100,30), "Fill Rate :");
	MC.fillProbability= GUI.HorizontalSlider (Rect (400, 0, 100, 20), MC.fillProbability, 0, 100);
	GUI.Label (Rect(500,0,100,30),MC.fillProbability+"%");
	
	
	if (GUI.Button( Rect(300,0,100,30), "Drunkyard walk") ) {
		MC.ClearMap(1);
		MC.fillPercentage = MC.fillProbability;
		if (MC.fillPercentage > 99) MC.fillPercentage = 99; // to prevent endless loops
		MC.DrunkyardWalk();
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("Drunkyard:"+MC.fillPercentage);
		UpdateAlgoList();
	}
	
	// Rule 5 Cellular Automata
	
	if (GUI.Button( Rect(0,30,100,30), "CellAuto") ) {
		MC.CellularAutomata(crule1,crule2,crange);
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("CellAuto:"+crule1+":"+crule2+":"+crange);
		UpdateAlgoList();
	}
	GUI.Label (Rect(200,60,100,30), "Rule1 :"+crule1);
	crule1 = GUI.HorizontalSlider (Rect (200, 30, 100, 20), crule1, 0, 30);
	
	GUI.Label (Rect(300,60,100,30), "Rule2 :"+crule2);
	crule2= GUI.HorizontalSlider (Rect (300, 30, 100, 20), crule2, 0, 30);
	
	GUI.Label (Rect(400,60,100,30), "Range :"+crange);
	crange= GUI.HorizontalSlider (Rect (400, 30, 100, 20), crange, 1, 2);
	
	// Repair the map, find connected parts etc..
	if (GUI.Button( Rect(0,90,100,30), "FloodFill") ) {
		
		x = Random.Range(0,MC.maxX);
		y = Random.Range(0,MC.maxY);
		// cause we could get stuck here if no tile is marked as 0, we perform a check first 
		if (MC.AnalyzeMap() > 0.0) {
			while (MC.map[x,y] != 0) {	
				x = Random.Range(0,MC.maxX);
				y = Random.Range(0,MC.maxY);
			}
		
			MC.FloodFill(x, y,0,2);
			MC.VisualizeMapAsTexture();
		}
		MC.algoList.Add("FloodFill");
		UpdateAlgoList();
	}
	if (GUI.Button( Rect(100,90,100,30), "Fill Holes") ) {
		MC.FillDisconnected();
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("FillHoles");
		UpdateAlgoList();
	}
	if (GUI.Button( Rect(200,90,200,30), "FloodFill Largest Area") ) {
		if (MC.AnalyzeMap() > 0.0) {
			MC.FloodFill_LargestArea();
			MC.VisualizeMapAsTexture();
			percW = MC.AnalyzeMap();
		}
		MC.algoList.Add("FloodFillLargestArea");
		UpdateAlgoList();
	}
	
	if (GUI.Button( Rect(0,120,100,30), "Place Boundaries") ) {
		MC.PlaceBoundaries(width);
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("PlaceBounds:"+width);
		UpdateAlgoList();
	}
	GUI.Label (Rect(400,150,100,30), "Width :"+width);
	width= GUI.HorizontalSlider (Rect (400, 120, 100, 20), width, 1, 40);
	
	if (GUI.Button( Rect(0,150,100,30), "Clear Map") ) {
		MC.ClearMap(iDSave);
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("ClearMap:"+iDSave);
		UpdateAlgoList();
	}
	
	if (GUI.Button( Rect(0,180,100,30), "RoomBuilder") ) {
		MC.RoomBuilderGenerator(MC.minRS,MC.maxRS,MC.numberRooms);
		MC.VisualizeMapAsTexture();
		percW = MC.AnalyzeMap();
		MC.algoList.Add("RoomBuilder:"+MC.minRS+":"+MC.maxRS+":"+MC.numberRooms);
		UpdateAlgoList();
	}
	GUI.Label (Rect(200,210,100,30), "Width :"+MC.minRS);
	MC.minRS= GUI.HorizontalSlider (Rect (200, 180, 100, 20), MC.minRS, 3, 40);
	GUI.Label (Rect(300,210,100,30), "Width :"+MC.maxRS);
	MC.maxRS= GUI.HorizontalSlider (Rect (300, 180, 100, 20), MC.maxRS, 3, 40);
	GUI.Label (Rect(400,210,100,30), "Width :"+MC.numberRooms);
	MC.numberRooms= GUI.HorizontalSlider (Rect (400, 180, 100, 20), MC.numberRooms, 1, 200);
	
	if (GUI.Button( Rect(0,500,100,30), "Close Window") ) {
		state = 0;
	}
	if (GUI.Button( Rect(0,530,100,30), "Save MoveMap") ) {
		MC.MoveMap(iDSave);
		MC.algoList.Add("MoveMap:"+iDSave);
		UpdateAlgoList();
	}
	
	if (GUI.Button( Rect(100,500,100,30), "Save Rules") ) {
		var myName : MapGenSet = new MapGenSet();
		
		myName.description 	= "Our first Quest";
		myName.iD			= "Wall";
		myName.rule = new String[MC.algoList.Count];
		for (var i : int = 0; i < MC.algoList.Count; i++) {
			myName.rule[i] = MC.algoList[i];
		}
			
		MC.container.MapGenSets.Add(myName); 
	
		MC.path = Application.dataPath + "/data/MapGenSets.xml";
		//statusText = path;
		MC.container.Save(MC.path) ;   //Application.persistentDataPath
	}
}
function Start() {
	UpdateRulesList();
}