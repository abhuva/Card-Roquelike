#pragma strict
import System.Xml;
import System.Xml.Serialization;
import System.Collections.Generic;
import System.IO;

var maxX : int;
var maxY : int;
var MO:Movement;
var AC:AtlasCreation;
var AM : AIManager;
var MD : MainData;

public var timeForGeneration : float;
private var numberSteps : int;
public var fillProbability : int;
public var fillPercentage : int;
private var rule1 : int;
public var map : int[,];  // we define a 2d grid filled with int to represent our map
public var map1 : int[,];  // we define a 2d grid filled with int to represent our backup map
public var map2 : int[,];
public var mapMask : int [,]; // our mask map
public var map2use : int; // 0 = map, 1 = map1
public var copyAll : boolean; // wether each element of a wMap gets copied or only elements above 0
public var useMask : boolean; // wether to use the maskMap or not

private var wMap : int[,];
private var wMap1: int[,];
private var wMap2: int[,];

private var texture : Texture2D; 
private var mapText : String;
var algoList : List.<String>;

public var minRS : int = 3;
public var maxRS:int = 8;
public var numberRooms:int = 20;


	public class MapGenSet {
		@XmlAttribute("description")
		public var description 		: String;	// serves as a title and for easy editing the xml files
		public var iD				: String;
		public var rule				: String[]; // the ruleset : W = Wall, F = Floor, X = Wildcard means either Wall or Floor , :X4 the x coord of the tile, :Y4 the y coord of the tile
	}
	
	@XmlRoot("MapGenSetCollection")
	public class MapGenSetContainer {
		@XmlArray("MapGenSets")
		@XmlArrayItem("MapGenSet")
		public var MapGenSets : List.<MapGenSet>; // = new List.<Quest>();
	
		public function Save(path : String)	{
			var serializer : XmlSerializer = new XmlSerializer(MapGenSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Create);
			serializer.Serialize(stream, this);
			stream.Close();
		}
   
		public static function Load(path : String):MapGenSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(MapGenSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Open);
			var result : MapGenSetContainer = serializer.Deserialize(stream) as MapGenSetContainer;
			stream.Close();
			return result;
		}
 
         //Loads the xml directly from the given string. Useful in combination with www.text.
         public static function LoadFromText(text : StringReader):MapGenSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(MapGenSetContainer);
			return serializer.Deserialize(text) as MapGenSetContainer;
		}
	}

 
	public var container : MapGenSetContainer;
	public var path : String;
	public var XMLMapGen : TextAsset;	// incase we want to include the xml in the build we assign it to this variable in the inspector, use readNamesTxt() to initialize then

	// *****************************************************************************************************
// Below this comes the XML handling scripts (loading, writing, getting the iD position etc..)
// *****************************************************************************************************	
	
	function writeHelloWorld() {
		var myName : MapGenSet = new MapGenSet();
		
		myName.description 	= "Our first Quest";
		myName.iD			= "Wall";
		myName.rule = new String[2];
		myName.rule[0] = "WWWWWWWWW:100:100";
		myName.rule[1] = "FFFFFFFFF:100:100";
		container = new MapGenSetContainer();
		container.MapGenSets = new List.<MapGenSet>();
			
		container.MapGenSets.Add(myName); 
	
		path = Application.dataPath + "/data/MapGenSets.xml";
		//statusText = path;
		container.Save(path) ;   //Application.persistentDataPath
	}
 
	// reads the xml defined in XMLObject, used if we want to include the xml in the build
	function readMapGenTxt () {
		var xml : StringReader = new StringReader(XMLMapGen.text);
		container = MapGenSetContainer.LoadFromText(xml);
	}
 
	// reads the xml from a file specified in the path variable, this way xmls can be modified by the user
	function readMapGenSets () {
		// we open the xml and read the data into a list
		path = Application.dataPath + "/data/MapGenSets.xml";
		//statusText5 = path;
		container = MapGenSetContainer.Load(path);
	}
 
	// we search a TextGen iD in the complete list for a matching iD entry and return the position in the list where we found it, if we dont find something we return -1
	function getMapGenSetIDPos (choosenID : String) : int {
		for (var i = 0; i < container.MapGenSets.Count; i++) {
			if (container.MapGenSets[i].iD == choosenID) { 
				return i; // if we find a matching id, we break the loop and return the position in the list
				//break; 
			} 
		}
		return -1; // if we didnt find something we return -1
	}
// Perlin Noise function

	private var pixWidth: int;
	private var pixHeight: int;
	private var xOrg: float;
	private var yOrg: float;
	private var scale = 1.0;
	private var noiseTex: Texture2D;
	private var pix: Color[];
	
	function CalcNoise() {
		for (var y = 0; y < maxY; y++) {
			for (var x = 0; x < maxX; x++) {
				var xCoord = xOrg + x / maxX * scale;
				var yCoord = yOrg + y / maxY * scale;
				var sample = Mathf.PerlinNoise(xCoord, yCoord);
				map[x,y] = sample * 10;
			}
		}
	}

// the working maps, those are used during the algorithms to store information
function InitWMap () {
	wMap = new int[maxX,maxY];
	wMap1= new int[maxX,maxY];
	wMap2= new int[maxX,maxY];
}

// copies the working map to the specified map, normally used at the end of a algorithm
function CopyWMap (iD:int) {
	var c : int;
	var x : int;
	var y : int;
	for (x=0; x < maxX; x++) {
		for (y=0; y < maxY; y++) {
			c = wMap[x,y];
			if ((c != 0) || (copyAll == true)) {	
				if (iD == 0) map[x,y] = c;
				if (iD == 1) map1[x,y] = c;
				if (iD == 2) map2[x,y] = c;
			}
		}
	}
}
function CopyWMap1 (iD:int) {
	var c : int;
	var x : int;
	var y : int;
	for (x=0; x < maxX; x++) {
		for (y=0; y < maxY; y++) {
			c = wMap1[x,y];
			if ((c != 0) || (copyAll == true)) {	
				if (iD == 0) map[x,y] = c;
				if (iD == 1) map1[x,y] = c;
				if (iD == 2) map2[x,y] = c;
			}
		}
	}
}

function CopyMap2WMap( iD : int) {
	var c : int;
	var x : int;
	var y : int;
	for (x=0; x < maxX; x++) {
		for (y=0; y < maxY; y++) {
			if (iD == 0) c = map[x,y];
			if (iD == 1) c = map1[x,y];
			if (iD == 2) c = map2[x,y];
			wMap[x,y] = c;
		}
	}
}
function CopyMap2WMap1( iD : int) {
	var c : int;
	var x : int;
	var y : int;
	for (x=0; x < maxX; x++) {
		for (y=0; y < maxY; y++) {
			if (iD == 0) c = map[x,y];
			if (iD == 1) c = map1[x,y];
			if (iD == 2) c = map2[x,y];
			wMap1[x,y] = c;
		}
	}
}


// Circular Noise function
function InitMap () {
	InitWMap();
	
	var centerVector : Vector2;
	var currentVector : Vector2;
	var l : float;
	var maxL : float;
	centerVector.x = maxX / 2;
	centerVector.y = maxY / 2;
	currentVector.x = 0;
	currentVector.y = 0;
	maxL = 90*Vector2.Distance (centerVector,currentVector);
	for (var x = 0; x < maxX; x ++) {
		for (var y = 0; y < maxY; y++) {
			currentVector.x = x;
			currentVector.y = y;
			l = Vector2.Distance (currentVector,centerVector) * 100.0 / maxL;
			if (((useMask) && mapMask[x,y] == 1) || (!useMask)) { 
				if (Random.Range(0,100) * l <= fillProbability ) {
					wMap[x,y] = 0;
				} else {
					wMap[x,y] = 1;
				}
			}
		}
	}
	
	CopyWMap(map2use);
}

// White Noise function, takes into account the mask map
function InitMap1 () {
	InitWMap();
	for (var x = 0; x < maxX; x ++) {
		for (var y = 0; y < maxY; y++) {
			if (((useMask) && mapMask[x,y] == 1) || (!useMask)) { 
				if (Random.Range(0,100) <= fillProbability ) {
					wMap[x,y] = 1;
				} else {
					wMap[x,y] = 0;
				}
			}
		}
	}
	CopyWMap(map2use);
}

// initializes a map[,] with all cells set to "value"
function ClearMap (value : int) {
	InitWMap();
	for (var x = 0; x < maxX; x ++) {
		for (var y = 0; y < maxY; y++) {
			wMap[x,y] = value;
		}
	}
	CopyWMap(map2use);
}

function Old_ClearMap (value : int) {
	map = new int[maxX, maxY];
	map1 = new int[maxX, maxY];
	mapMask = new int[maxX, maxY];
	for (var x = 0; x < maxX; x ++) {
		for (var y = 0; y < maxY; y++) {
			map[x,y] = value;
			mapMask[x,y] = 1;
		}
	}
}

// Searches the surroundings of a cell and returns the number of neighbours found
// size --> how many steps away we search / how big the area is
// a neighbour is found when the cell is holding a 1
function GetNumberOfNeighbours(x : int, y : int, size : int) : int {  // size describes the size of the area we check
	var foundNeighbours : int;
	foundNeighbours = 0;
	for (var cX = -size; cX < size+1; cX ++) {
		for (var cY = -size; cY < size+1; cY ++) {
			if ( (x + cX) >= 0 && (y + cY) >= 0 ) {  		// we test if the point is within our map
				if ( (x+cX) < maxX && (y+cY) < maxY ) {
					if ( wMap[x+cX, y+cY] == 1 ) { // we found a neighbour
						foundNeighbours += 1;
					} 
				} else {
					foundNeighbours += 1;
				}
			} else { // the point we test is outside the map, we assume its filled
				foundNeighbours += 1;
			}
		}
	}
	return foundNeighbours;
}

// Cellular Automata function, inputs are min and max neighbours and search-range
// Original settings was 1) 5=>x=>8 range 1	AND	2) 0>=x<=2 range 2
function CellularAutomata (rule1:int, rule2:int, range:int, amount:int) {
	for (var i = 0; i < amount; i++) {
		InitWMap();
		CopyMap2WMap(map2use);
		for (var x = 0; x < maxX; x ++) {
			for (var y = 0; y < maxY; y++) {
				if ((GetNumberOfNeighbours(x,y,range) >= rule1 ) && (GetNumberOfNeighbours(x,y,range) <= rule2 )) 
					 { wMap1[x,y] = 1; } 
				else { wMap1[x,y] = 0; } 
			}
		}
		wMap = wMap1;
		CopyWMap(map2use);
	}
}

// outputs the map data as a texture
var colorList : Color[];
function InitColorList() {
	colorList = new Color[6*6*6];
	var i : int = 0;
	for (var r : int = 0; r < 6; r++) {
		for (var g : int = 0; g < 6; g++) {
			for (var b : int = 0; b < 6; b++) {
				colorList[i].r  =  (r*50.0) / 255.0;
				colorList[i].g  =  (g*50.0) / 255.0;
				colorList[i].b  =  (b*50.0) / 255.0;
				colorList[i].a = 1;
				i += 1;
			}
		}
	}
	
	// randomize
	//if (0==0) return;
	Random.seed = 42;
	var cList : List.<Color> = new List.<Color>();
	cList.Clear();
	for (i = 0; i < colorList.length; i++) {
		cList.Add(colorList[i]);
	}
	for (i = 0; i < colorList.length; i++) {
		var pos : int = Random.Range(0,cList.Count);
		colorList[i] = cList[pos];
		cList.RemoveAt(pos);
	}
	
}

function VisualizeMapAsTexture (cMap : int[,]) : String {
	var max : int;
	if (maxX > maxY) max = maxX; else max = maxY;  // we get the largest side
	if (max <= 32) { texture = new Texture2D(32, 32); }
	else if (max <= 64) {  texture = new Texture2D(64, 64); }
	else if (max <= 128) { texture = new Texture2D(128, 128); }
	else if (max <= 256) { texture = new Texture2D(256, 256); }
	else if (max <= 512) { texture = new Texture2D(512, 512); }
	renderer.material.mainTexture = texture;
	renderer.material.mainTexture.filterMode = FilterMode.Point;
	for (var y = 0; y < maxY; y++) {
		for (var x = 0; x < maxX; x++) {
			texture.SetPixel (x, y, colorList[cMap[x,y]]);
		}
	}
	texture.Apply();
	Debug.Log(cMap[0,0]);
}

function VisualizeMiniMapAsTexture () : String {
	var max : int;
	 texture = new Texture2D(64, 64); 
	 

	renderer.material.mainTexture = texture;
	renderer.material.mainTexture.filterMode = FilterMode.Point;
	var color : Color;
	var startX : int =  AM.AIDataList[0].position.x - 32;
	var startY : int = AM.AIDataList[0].position.y - 32;
	
	for (var y = startY; y < startY+64; y++) {
		for (var x = startX; x < startX+64; x++) {
			if ((x>0) && (x<maxX) && (y>0) && (y<maxY)){
				var cM : int = MD.mapMove[x,y];
				color = Color.white;
				
				if (cM == 0) { // everything that is blocked on the movemap
					color = Color.black;
				} 
				texture.SetPixel (x-startX, y-startY, color);
			}
		}
	}
	texture.SetPixel(32,32,Color.red);
	texture.Apply();
}

var RI : UnityEngine.UI.RawImage;

function VisualizeMiniMapAsGUITexture () : String {
	var max : int;
	 texture = new Texture2D(64, 64); 
	 

	//renderer.material.mainTexture = texture;
	//renderer.material.mainTexture.filterMode = FilterMode.Point;
	var color : Color;
	var startX : int =  AM.AIDataList[0].position.x - 32;
	var startY : int = AM.AIDataList[0].position.y - 32;
	
	for (var y = startY; y < startY+64; y++) {
		for (var x = startX; x < startX+64; x++) {
			if ((x>0) && (x<maxX) && (y>0) && (y<maxY)){
				var cM : int = MD.mapMove[x,y];
				color = Color.white;
				
				if (cM == 0) { // everything that is blocked on the movemap
					color = Color.black;
				} 
				texture.SetPixel (x-startX, y-startY, color);
			}
		}
	}
	texture.SetPixel(32,32,Color.red);
	texture.Apply();
	RI.texture = texture;
	RI.texture.filterMode = FilterMode.Point;
	
}

function VisualizeWorldMapAsTexture () : String {
	var max : int;
	if (maxX > maxY) max = maxX; else max = maxY;  // we get the largest side
	if (max <= 32) { texture = new Texture2D(32, 32); }
	else if (max <= 64) { Debug.Log ("yoyo"); texture = new Texture2D(64, 64); }
	else if (max <= 128) { texture = new Texture2D(128, 128); }
	else if (max <= 256) { texture = new Texture2D(256, 256); }
	else if (max <= 512) { texture = new Texture2D(512, 512); }
	renderer.material.mainTexture = texture;
	renderer.material.mainTexture.filterMode = FilterMode.Point;
	var color : Color;
	for (var y = 0; y < maxY; y++) {
		for (var x = 0; x < maxX; x++) {
			if (MD.mapWorld[x,y] == 0) {
				color = Color.gray;
			} else if (MD.mapWorld[x,y] == 2) {
				color = Color.red;
			} else {
				color = Color.white;
			}
			texture.SetPixel (x, y, color);
		}
	}
	texture.Apply();
}



function FloodFill (x : int, y : int, oldValue : int, newValue : int) : int {  // it can give us back the numbers of tiles filled;
	//InitWMap();
	//CopyMap2WMap1(map2use);
	var tilesFilled : int;
	tilesFilled = 0;
	var currentVector : Vector2;
	var list = new Array (); // we initialize our todo List
	list.Push (Vector2(x,y));
	//var done : boolean = false;
	while (list.length > 0) {
		currentVector = list.Pop();  // we remove the last element and return the coordinates
		// we check if the returned coordinates are valid
		if ( (currentVector.x >= 0) && (currentVector.x < maxX) ) {
			if ( currentVector.y >= 0 && currentVector.y < maxY) {
				if (wMap[currentVector.x,currentVector.y] == oldValue) {
					// we found a matching tile
					tilesFilled += 1;
					wMap[currentVector.x,currentVector.y] = newValue;
					list.Push( Vector2 (currentVector.x, currentVector.y + 1) );
					list.Push( Vector2 (currentVector.x, currentVector.y - 1) );
					list.Push( Vector2 (currentVector.x + 1, currentVector.y) );
					list.Push( Vector2 (currentVector.x - 1, currentVector.y) );
				}
			}
		}
	}
	//CopyWMap1(map2use);
	return tilesFilled;
}

function FillDisconnected () {
	InitWMap();
	CopyMap2WMap(map2use);
// we need to use FloodFill before this, it will fill everything thats not getting floodFilled
	for (var x = 0; x < maxX; x++) {
		for (var y = 0; y < maxY; y++) {
			if (wMap[x,y] != 2) {
				wMap[x,y] = 1;
			} else {
				wMap[x,y] = 0;
			}
		}
	}
	CopyWMap(map2use);
}

function AnalyzeMap () : float {
	var walkable : int = 0;
	var percWalkable : float = 0.0;
	for (var x = 0; x < maxX; x++) {
		for (var y = 0; y < maxY; y++) {
			if (map[x,y] == 0) {
				walkable += 1;
			}
		}
	}
	percWalkable = walkable * 100.0 / (maxX * maxY);
	return percWalkable;
}

// Places Boundaries around the map with a certain width
function PlaceBoundaries (width : int) {
	InitWMap();
	for (var x = 0; x < maxX; x++) {
		for (var y = 0; y<width; y++) {
			wMap[x,y] = 1;
			wMap[x,maxY-y-1] = 1;
		}
	}
	for ( y = 0; y < maxY; y++) {
		for (x=0; x<width;x++) {
			wMap[x,y] = 1;
			wMap[maxX-x-1,y] = 1;
		}
	}
	CopyWMap(map2use);
}

private var torusStyle : boolean;
function DrunkyardWalk() {
	var x : int;
	var y : int;
	var counter : int = 0;
	var maxCounter : int = 500;
	var direction : int;
	InitWMap();
	maxCounter = maxX * maxY * fillPercentage / 100;
	x = Random.Range (0,maxX);
	y = Random.Range (0,maxY);
	wMap[x,y] = 1;
	
	while (counter < maxCounter) {
		direction = Random.Range (0,4); // gives out 0,1,2,3 wich means N,S,W,E 
		if (direction == 0) x += 1;
		if (direction == 1) x -= 1;
		if (direction == 2) y += 1;
		if (direction == 3) y -= 1;
		
		// we check out of Boundaries condition
		if (!torusStyle) {	// closed boundaries style - everything will be always connected
			if (x < 0) x = 0;
			if (x > maxX-1) x = maxX-1;
			if (y < 0) y = 0;
			if (y > maxY-1) y = maxY-1;
		} else { // torus style - this will often result in disconnected parts of the map
			if (x < 0) x = maxX-1;
			if (x > maxX-1) x = 0;
			if (y < 0) y = maxY-1;
			if (y > maxY-1) y = 0;
		}
		
		if (wMap[x,y] != 1) counter += 1;
		//counter += 1;
		wMap[x,y] = 1;
	}
	CopyWMap(map2use);
}

// this is an advanged version of the floodfill, it will analyze the whole map to find the largest, connected area
function FloodFill_LargestArea () {
	// we dont do random search here, instead we go point by point
	InitWMap();
	CopyMap2WMap(map2use);
	var xFound : int;	// here we store the 
	var yFound : int;
	var size : int;		// here we store the largest found size
	var sizeCurrent : int;
	var x : int; 
	var y : int;
	for (x=0; x<maxX;x++) {
		for (y=0; y<maxY;y++) {
			
			// first check if this tile is walkable and we didnt floodfilled it already (its marked as 0)
			if (wMap[x,y] == 0) {
				sizeCurrent = FloodFill(x, y,0,2); // we fill the area with the value 2;
				if (sizeCurrent > size) {  // we found a bigger area
					size = sizeCurrent;
					xFound = x;
					yFound = y;
				}
			}		
		}
	}
	// now we have the largest size and the coordinates to fill them, we restore the map now and fill it correctly
	for (x=0; x<maxX;x++) {
		for (y=0; y<maxY;y++) {
			if (wMap[x,y] == 2) wMap[x,y] = 0;
		}
	}
	FloodFill(xFound,yFound,0,2);
	CopyWMap(map2use);
}


private var useableWalls : List.<Vector2>;
// Generates a rectangular space of the size width*height and stores it in map1
// walking space is 0
// walls are 1
function GenerateRoom(width : int, height : int) {
	wMap1 = new int[width, height];
	for (var x = 0; x < width; x ++) {
		for (var y = 0; y < height; y++) {
			wMap1[x,y] = 0;
		}
	}
	// generating walls
	for ( x = 0; x < width; x++) {
			wMap1[x,0] = 1;
			wMap1[x,height-1] = 1;
	}
	for ( y = 0; y < height; y++) {
			wMap1[0,y] = 1;
			wMap1[width-1,y] = 1;
	}
}
function CheckPlacement(cX:int, cY:int):boolean {
	// assumes a build room in map1 and the world in map
	if (cX < 0) return false;
	if (cY < 0) return false;
	
	var test : boolean = true;
	for (var x:int = 0; x < wMap1.GetLength(0); x++) {
		for (var y : int = 0; y < wMap1.GetLength(1); y++) {
			if ((cX+x) < 0) {
				test = false;
			} else if ((cX+x) >= maxX) {
				test = false;
			} else if ((cY+y) < 0) {
				test = false;
			} else if ((cY+y) >= maxY) {
				test = false;
			} else if (wMap[cX+x,cY+y] != 2) {
				test = false;
			}
		}
	}
	return test;
}

// places a room from map1 to map2
// also maintain a list of useable wall-sections
function PlaceRoom(cX:int,cY:int) {
	var v:Vector2;

	for (var x:int = 0; x < wMap1.GetLength(0); x++) {
		for (var y : int = 0; y < wMap1.GetLength(1); y++) {
			wMap[cX+x,cY+y] = wMap1[x,y];
			}
		}
		
	// checking useable walls
	for (x=1; x<wMap1.GetLength(0)-1;x++) {
		v.x = cX+x;
		v.y = cY;
		useableWalls.Add(v);
		v.x = cX+x;
		v.y = cY+wMap1.GetLength(1)-1;
		useableWalls.Add(v);
	}
	for (y=1; y<wMap1.GetLength(1)-1;y++) {
		v.x = cX;
		v.y = cY+y;
		useableWalls.Add(v);
		v.x = cX+wMap1.GetLength(0)-1;
		v.y = cY+y;
		useableWalls.Add(v);
	}
}

function RoomBuilderGenerator(minRS:int,maxRS:int,numberRooms:int) {
	InitWMap();
	useableWalls = new List.<Vector2>();
	useableWalls.Clear();
	// First step is to fill the whole world with unpassable tiles
	ClearMap(2);
	// Get the center of the map and fill with a room
	var w : int = Random.Range(minRS,maxRS);
	var h : int = Random.Range(minRS,maxRS);
	GenerateRoom(w,h);
	// Check if it can be placed
	var cX : int = maxX / 2;
	var cY : int = maxY / 2;
	if (CheckPlacement(cX,cY) == true) {
		PlaceRoom(cX,cY);
	};
	var roomsbuild : int = 1;
	var maxTrys : int = 0;
	while ((roomsbuild < numberRooms) && (maxTrys < 2000)) {
		maxTrys += 1;
		// now we get a random wall segment out of our usableWalls list
		var uWPos = Random.Range(0,useableWalls.Count);
		var v : Vector2 = useableWalls[uWPos];
		var v2 : Vector2;
		v2 = v;
		var dir : int; // used to store direction
		
		// we check in wich direction we have to build
		if (((v.x+1) < maxX) && ((v.x-1) > 0) && (v.y+1 < maxY) && (v.y-1 > 0)) {
			if (wMap[v.x+1,v.y] == 2) { 
				//Debug.Log ("Right");
				v2.x += 1;
				dir = 1;
			} else
			if (wMap[v.x-1,v.y] == 2) { 
				//Debug.Log ("Left");
				v2.x -= 1;
				dir = 2;
			} else
			if (wMap[v.x,v.y+1] == 2) { 
				//Debug.Log ("Up");
				v2.y += 1;
				dir = 3;
			} else
			if (wMap[v.x,v.y-1] == 2) { 
				//Debug.Log ("Down");
				v2.y -= 1;
				dir = 4;
			}
		
			// now we choose a new room feature
			 w = Random.Range(minRS,maxRS);
			 h = Random.Range(minRS,maxRS);
			GenerateRoom(w,h);
			// we calculate our starting point for placement
			var er : boolean = true;
			if (dir == 1)  {
				cX = v2.x;
				cY = v2.y - Random.Range(1,(h/2)); // we switch the y position a bit
				if (CheckPlacement(cX,cY) == true) {
					PlaceRoom(cX,cY);
					er = false;
				} 
			}
			if (dir == 2) {
				cX = v2.x-w+1;
				cY = v2.y - Random.Range(1,(h/2)); // we switch the y position a bit
				if (CheckPlacement(cX,cY) == true) {
					PlaceRoom(cX,cY);
					er = false;
				} 
			}
			if (dir == 3)  {
				cX = v2.x - Random.Range(1,(w/2));
				cY = v2.y; // we switch the y position a bit
				if (CheckPlacement(cX,cY) == true) {
					PlaceRoom(cX,cY);
					er = false;
				} 
			}
			if (dir == 4)  {
				cX = v2.x - Random.Range(1,(w/2));
				cY = v2.y-h+1; // we switch the y position a bit
				if (CheckPlacement(cX,cY) == true) {
					PlaceRoom(cX,cY);
					er = false;
				} 
			}
			if (er == false) { // successfull placement of new room
				wMap[v2.x,v2.y] = 0;
				wMap[v.x,v.y] = 0;   // for debugging
				roomsbuild += 1;
				maxTrys = 0;
			}
		}
	}
	if (maxTrys >= 2000) Debug.Log("Algorithm unfinished");
	// now we clean the map to use with our normal generator
	for (var x = 0; x < maxX; x ++) {
		for (var y = 0; y < maxY; y++) {
			if (wMap[x,y] != 0) wMap[x,y] = 1;
		}
	}
	CopyWMap(map2use);
}

function MoveMap(i:int) {
	InitWMap();
	CopyMap2WMap(map2use);

	//MD.mapMove = new int[MD.maxXWorld, MD.maxYWorld];
	MD.mapMove = new int[maxX,maxY];
	for (var x : int = 0; x < maxX; x++) {
		for (var y : int = 0; y<maxY; y++) {
			if (wMap[x,y] == i) {
				MD.mapMove[x,y]=0;
			} else MD.mapMove[x,y] = 1;
		}
	}
	Debug.Log(" " + maxX + " " + maxY);
}

// creates a Mask Map, 
// iD means here can something be written, all else is set to 0 = not writeable
function MaskMap(iD:int) {
	InitWMap();
	CopyMap2WMap(map2use);
	mapMask = new int[MD.maxXWorld, MD.maxYWorld];
	for (var x : int = 0; x < MD.maxXWorld; x++) {
		for (var y : int = 0; y<MD.maxYWorld; y++) {
			if (wMap[x,y] == iD) {
				mapMask[x,y]=1;
			} else mapMask[x,y] = 0;
		}
	}
	CopyWMap(map2use);
}

// overwriting mapID1 with content from mapID2, filtered through mapMask and output in mapID3
// depending on copyAll everything gets overwritten or only stuff != 0
function CombineMapsWithMask(mapID1 : int, mapID2 : int, mapID3 : int) {
	InitWMap();
	if (mapID1 == 0) wMap = map;
	if (mapID1 == 1) wMap = map1;
	if (mapID1 == 2) wMap = map2;
	
	if (mapID2 == 0) wMap1 = map;
	if (mapID2 == 1) wMap1 = map1;
	if (mapID2 == 2) wMap1 = map2;
	
	for (var x : int = 0; x < maxX; x++) {
		for (var y : int = 0; y < maxY; y++) {
			var c : int;
			c = wMap2[x,y];
			if (mapMask[x,y] == 1) {
				if ((copyAll) || ((copyAll == false) && (c != 0))) {
					wMap[x,y] = c;
				}
			}
		}
	}
	// the new content is in wMap
	CopyWMap(mapID3);
}

// sets every map to 0
function InitAllMaps() {
	map = new int[maxX, maxY];
	map1 = new int[maxX, maxY];
	map2 = new int[maxX, maxY];
	mapMask = new int[maxX, maxY];
	copyAll = true;
	useMask = false;
	map2use = 0;
	MD.mapWorld = new int[maxX, maxY];
	MD.mapDetail = new int[maxX, maxY];
	MD.mapMove = new int[maxX, maxY];
}

function SaveWorldMap (iD : int) {
	InitWMap();
	CopyMap2WMap(map2use);
	for ( var x=0;x<maxX;x++) {
		for ( var y=0;y<maxY;y++) {
			if (wMap[x,y] == 1) MD.mapWorld[x,y] = iD;
		}
	}
}

function SaveDetailMap(iD : int) {
	InitWMap();
	CopyMap2WMap(map2use);
	for ( var x=0;x<maxX;x++) {
		for ( var y=0;y<maxY;y++) {
			if (wMap[x,y] == 1) MD.mapDetail[x,y] = iD;
		}
	}
}

// This function takes the list stored in algoList and interpretes it to generate a world
function GenerateWorld() : float {
	var cRule : String;
	var x : int;
	var y : int;
	var beginTime : float;
	var endTime : float;
	beginTime = Time.realtimeSinceStartup;
	for (var i = 0; i < algoList.Count; i++) {
		cRule = algoList[i];
		
		var words1 : String[];
		words1 = cRule.Split(":"[0]);  // we seperate the parts (rule part and position parts)
		var variationCount : int = words1.length; // we get the amount of variations
		
		if (words1[0] == "Save1") MD.mapWorld = map;
		if (words1[0] == "SaveWorld") {
			SaveWorldMap(int.Parse(words1[1]));
		}	
		if (words1[0] == "SaveDetail") {
			SaveDetailMap(int.Parse(words1[1]));
		}		
		if (words1[0] == "WhiteNoise") {	
			fillProbability = int.Parse(words1[1]);
			InitMap1();
		}				
		if (words1[0] == "CircleNoise") {
			fillProbability = int.Parse(words1[1]);	
			InitMap();
		}			
		if (words1[0] == "Drunkyard") {
			ClearMap(1);
			fillPercentage = int.Parse(words1[1]);	
			if (fillPercentage > 99) fillPercentage = 99; // to prevent endless loops
			DrunkyardWalk();
		}
		if (words1[0] == "CellAuto") { 
			CellularAutomata( int.Parse(words1[1]),int.Parse(words1[2]),int.Parse(words1[3]),int.Parse(words1[4]));
		}
		if (words1[0] == "FloodFill") { 
			x = Random.Range(0,maxX);
			y = Random.Range(0,maxY);
			// cause we could get stuck here if no tile is marked as 0, we perform a check first 
			if (AnalyzeMap() > 0.0) {
				while (map[x,y] != 0) {	
					x = Random.Range(0,maxX);
					y = Random.Range(0,maxY);
				}
				FloodFill(x, y,0,2);
			}
		}
		if (words1[0] == "FillHoles") { 
			FillDisconnected();
		}
		if (words1[0] == "FloodFillLargestArea") { 
			if (AnalyzeMap() > 0.0) {
				FloodFill_LargestArea();
			}
		}
		if (words1[0] == "PlaceBounds") { 
			PlaceBoundaries(int.Parse(words1[1]));
		}
		if (words1[0] == "ClearMap") { 
			ClearMap(int.Parse(words1[1]));
		}
		if (words1[0] == "RoomBuilder") { 
			RoomBuilderGenerator(int.Parse(words1[1]),int.Parse(words1[2]),int.Parse(words1[3]));
		}
		if (words1[0] == "MoveMap") { 
			MoveMap(int.Parse(words1[1]));
		}
		if (words1[0] == "MaskMap") {
			MaskMap(int.Parse(words1[1]));
		}
		if (words1[0] == "Map2Use") {
			map2use = int.Parse(words1[1]);
		}
		if (words1[0] == "CombMapWithMask") {
			CombineMapsWithMask(int.Parse(words1[1]), int.Parse(words1[2]), int.Parse(words1[2]) );
		}
		if (words1[0] == "CopyAll") {
			if (int.Parse(words1[1]) == 0) {
				copyAll = false;
			} else {
				copyAll = true;
			}
		}
		if (words1[0] == "UseMask") {
			if (words1[1] == "true") {
				useMask = true;
			} else {
				useMask = false;
			}
		}
		if (words1[0] == "InitMap") {
			copyAll = true;
			map2use = 0;
			InitAllMaps();
		}
	}
	endTime = Time.realtimeSinceStartup;
	timeForGeneration = endTime - beginTime;
}





function Start () {
	map = new int[maxX, maxY];
		//gameData = GameObject.Find("GameData");
		//MD = gameData.GetComponent(MainData);
		noiseTex = new Texture2D(pixWidth, pixHeight);
		pix = new Color[noiseTex.width * noiseTex.height];
		renderer.material.mainTexture = noiseTex;
		
		if (MD.DevVersion) {
			readMapGenTxt();
		} else {
			readMapGenSets();
		}
		Old_ClearMap(0);
		InitColorList();
}