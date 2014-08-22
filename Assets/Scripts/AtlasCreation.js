#pragma strict
// functions to build a new Atlas Texture

import System.Xml;
import System.Xml.Serialization;
import System.Collections.Generic;
import System.IO;
var MD : MainData;

private var uvWorld : int[,];	// a working space for the remapping of the world-map

var usedRule : int;  // wich Rule we use (this is the position in the list, not the iD)
	// a tile ruleset
	public class TileRuleSet {
		@XmlAttribute("description")
		public var description 		: String;	// serves as a title and for easy editing the xml files
		public var iD				: int;
		
		public var rule				: String[]; // the ruleset : W = Wall, F = Floor, X = Wildcard means either Wall or Floor , :X4 the x coord of the tile, :Y4 the y coord of the tile
											// example rule:   WWWFFFWXX:4:3  
	}
	
	@XmlRoot("TileRuleSetCollection")
	public class TileRuleSetContainer {
		@XmlArray("TileRuleSets")
		@XmlArrayItem("TileRuleSet")
		public var TileRuleSets : List.<TileRuleSet>; // = new List.<Quest>();
	
		public function Save(path : String)	{
			var serializer : XmlSerializer = new XmlSerializer(TileRuleSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Create);
			serializer.Serialize(stream, this);
			stream.Close();
		}
   
		public static function Load(path : String):TileRuleSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(TileRuleSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Open);
			var result : TileRuleSetContainer = serializer.Deserialize(stream) as TileRuleSetContainer;
			stream.Close();
			return result;
		}
 
         //Loads the xml directly from the given string. Useful in combination with www.text.
         public static function LoadFromText(text : StringReader):TileRuleSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(TileRuleSetContainer);
			return serializer.Deserialize(text) as TileRuleSetContainer;
		}
	}

 
	public var container : TileRuleSetContainer;
	private var path : String;
 
 	private var currentID : int = -1;
	private var newID : String = "0";
		
	public var XMLObject : TextAsset;	// incase we want to include the xml in the build we assign it to this variable in the inspector, use readNamesTxt() to initialize then

// *****************************************************************************************************
// Below this comes the XML handling scripts (loading, writing, getting the iD position etc..)
// *****************************************************************************************************	
	
	function writeHelloWorld() {
		var myName : TileRuleSet = new TileRuleSet();
		
		myName.description 	= "Our first Quest";
		myName.iD			= 1;
		myName.rule = new String[2];
		myName.rule[0] = "WWWWWWWWW:100:100";
		myName.rule[1] = "FFFFFFFFF:100:100";
			
		container = new TileRuleSetContainer();
		container.TileRuleSets = new List.<TileRuleSet>();
		
		container.TileRuleSets.Add(myName); 
	
		path = Application.dataPath + "/data/tilerulesets.xml";
		//statusText = path;
		container.Save(path) ;   //Application.persistentDataPath
	}
 
	// reads the xml defined in XMLObject, used if we want to include the xml in the build
	function readNamesTxt () {
		var xml : StringReader = new StringReader(XMLObject.text);
		container = TileRuleSetContainer.LoadFromText(xml);
	}
 
	// reads the xml from a file specified in the path variable, this way xmls can be modified by the user
	function readTileRuleSets () {
		// we open the xml and read the data into a list
		path = Application.dataPath + "/data/tilerulesets.xml";
		//statusText5 = path;
		container = TileRuleSetContainer.Load(path);
	}
 
	// we search a TextGen iD in the complete list for a matching iD entry and return the position in the list where we found it, if we dont find something we return -1
	function getTileRuleSetIDPos (choosenID : String) : int {
		for (var i = 0; i < container.TileRuleSets.Count; i++) {
			if (container.TileRuleSets[i].iD == choosenID) { 
				return i; // if we find a matching id, we break the loop and return the position in the list
				//break; 
			} 
		}
		return -1; // if we didnt find something we return -1
	}

	public class UVRuleSet {
		@XmlAttribute("description")
		public var description 		: String;	// serves as a title and for easy editing the xml files
		public var iD				: int;
		public var fileName			: String;
		public var row				: int;
		public var column			: int; 
	}
	
	@XmlRoot("UVRuleSetCollection")
	public class UVRuleSetContainer {
		@XmlArray("UVRuleSets")
		@XmlArrayItem("UVRuleSet")
		public var UVRuleSets : List.<UVRuleSet>; // = new List.<Quest>();
	
		public function Save(path : String)	{
			var serializer : XmlSerializer = new XmlSerializer(UVRuleSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Create);
			serializer.Serialize(stream, this);
			stream.Close();
		}
   
		public static function Load(path : String):UVRuleSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(UVRuleSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Open);
			var result : UVRuleSetContainer = serializer.Deserialize(stream) as UVRuleSetContainer;
			stream.Close();
			return result;
		}
 
         //Loads the xml directly from the given string. Useful in combination with www.text.
         public static function LoadFromText(text : StringReader):UVRuleSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(UVRuleSetContainer);
			return serializer.Deserialize(text) as UVRuleSetContainer;
		}
	}

 
	public var UVcontainer : UVRuleSetContainer;
	//private var path : String;
 
 	//private var currentID : int = -1;
	//private var newID : String = "0";
		
	//public var XMLObject : TextAsset;	// incase we want to include the xml in the build we assign it to this variable in the inspector, use readNamesTxt() to initialize then

// *****************************************************************************************************
// Below this comes the XML handling scripts (loading, writing, getting the iD position etc..)
// *****************************************************************************************************	
	
	function UVwriteHelloWorld() {
		var myName : UVRuleSet = new UVRuleSet();
		
		myName.description 	= "Our first Quest";
		myName.iD			= 1;
		myName.row			= 0;
		myName.column		= 0;
			
		UVcontainer = new UVRuleSetContainer();
		UVcontainer.UVRuleSets = new List.<UVRuleSet>();
		
		UVcontainer.UVRuleSets.Add(myName); 
	
		path = Application.dataPath + "/data/uvrulesets.xml";
		//statusText = path;
		UVcontainer.Save(path) ;   //Application.persistentDataPath
	}
 
	// reads the xml defined in XMLObject, used if we want to include the xml in the build
	function readNamesTxtUV () {
		var xml : StringReader = new StringReader(XMLObject.text);
		UVcontainer = UVRuleSetContainer.LoadFromText(xml);
	}
 
	// reads the xml from a file specified in the path variable, this way xmls can be modified by the user
	function readUVRuleSets () {
		// we open the xml and read the data into a list
		path = Application.dataPath + "/data/uvrulesets.xml";
		//Debug.Log(path);
		//statusText5 = path;
		UVcontainer = UVRuleSetContainer.Load(path);
	}
 
	// we search a TextGen iD in the complete list for a matching iD entry and return the position in the list where we found it, if we dont find something we return -1
	function getUVRuleSetIDPos (choosenID : int) : int {
		for (var i = 0; i < UVcontainer.UVRuleSets.Count; i++) {
			if (UVcontainer.UVRuleSets[i].iD == choosenID) { 
				return i; // if we find a matching id, we break the loop and return the position in the list
				//break; 
			} 
		}
		return -1; // if we didnt find something we return -1
	}

// we assume that the current world is stored in mapWorld
// we build a rule about the surroundings of a tile on position x,y in the form "WWWFFFWWW"
// we input the position aswell as the integer that represents a wall, we assume all else as floor
// we get a string as output
function BuildRuleString (x : int, y : int,wall : int) : String {
		var output : String;
		output = "";
		for (var cY = -1; cY < 2; cY++) {
			for (var cX = -1; cX < 2; cX++) {
				// for every possible neighbour we check
				if ( (x + cX) >= 0 && (y + cY) >= 0 ) {  		// we test if the point is within our map
					if ( (x+cX) < MD.maxXWorld && (y+cY) < MD.maxYWorld ) {
						// the point is within the map, so we check what tile it is
						if ( MD.mapWorld[x+cX, y+cY] == wall ) { // we found a wall
							output += "W";
						} else {//if ( MD.mapWorld[x+cX,y+cY] == floor ) { // we found a Floor
							output += "F"; 
						}
					} else {
						output += "W"; // the point we test is outside the map, we assume its filled
					}
				} else { // the point we test is outside the map, we assume its filled
					output += "W";
				}
			}
		}
		return output;
	}
	
	// this function uses the provided rules to remap the world
	function ReMapWorld() {
		MD.uvInfo = new List.<int>();
		uvWorld = new int[MD.maxXWorld,MD.maxYWorld];
		for (var y = 0; y < MD.maxYWorld; y++) {
			for (var x = 0; x< MD.maxXWorld; x++) {
				// for each tile in the map we do the following:
				// first we build a ruleString for the tile
				var rule1 : String = BuildRuleString (x,y,MD.mapWorld[x,y]); // this gives info about neighbours now
//!!!!!! ATTENTION
// We need to define the usedRule here now depending on the tile we are just working on
				usedRule = MD.mapWorld[x,y]; // its a hack for now, this needs to be reworked
//!!!!!! ATTENTION
				// we cycle through the rules till we found a matching tile
				for (var i = 0; i < container.TileRuleSets[usedRule].rule.length; i++) {
					var r:String = container.TileRuleSets[usedRule].rule[i];  // we save our current rule in string r
					var matching : boolean = true; // we assume we match
					for (var step = 0; step < 9; step ++) {
						if (r[step] == rule1[step] || r[step] == "*") {  // its matching, * means wildcard
						} else {
							matching = false; // its not matching and we change our flag for this;
						}
					}
					// now we check if we found our rule or not;
					if (matching) {  // we found it
						// we parse the needed data now
						// first we check how many different variations it have:  WWWFFFWWW?:5:5?:4:4  will indicate 2 different variations
						var words1 : String[];
						words1 = r.Split(":"[0]);  // we seperate the parts (rule part and position parts)
						var foundID : int = int.Parse(words1[1]);
						break; // we break our rulefind loop, 
					}
				}
				// we came out of the rulefind loop and assume we have the tile ID now in foundID
				// now we need to check if we already recorded this specific tile, for this 
				var found : boolean = false;
				
				for ( i = 0; i < MD.uvInfo.Count; i++) { 
					if (MD.uvInfo[i] == foundID) { 
						found = true; 
						break;
					} 
				}
				if (!found) MD.uvInfo.Add(foundID);
				uvWorld[x,y] = foundID;
			}
		}
	}
	
	function UVDataCreation() {
		var cPos : int;
		MD.uvData = new uvDataClass[ MD.uvInfo.Count];
		for (var i = 0; i < MD.uvInfo.Count; i++) { MD.uvData[i] = new uvDataClass();}
		for (  i = 0; i < MD.uvInfo.Count; i++) { 
			cPos = getUVRuleSetIDPos(MD.uvInfo[i]);
			MD.uvData[i].row = UVcontainer.UVRuleSets[cPos].row;  
			MD.uvData[i].column = UVcontainer.UVRuleSets[cPos].column;  
			MD.uvData[i].fileName = UVcontainer.UVRuleSets[cPos].fileName;
		}
	}
	
	
	var atlas : Texture2D;
	function AtlasTextureCreation() {
		// for each entry in MD.uvData we do the following:
		var uvDataNew : Vector2[]; // here we gather the new uv-data
		var t : Texture2D;
		var hsb : HSBColor;
		//var atlas : Texture2D;
		var atlasX : int = 1024;
		var atlasY : int = 1024;
		var spriteX : int = 16;
		var spriteY : int = 16;
		
		atlas = new Texture2D(atlasX, atlasY); // our atlasTexture
		
		var l : int = MD.uvData.length;
		uvDataNew = new Vector2[l*2]; // double amount cause we calc FOV-sprites too
		
		for (var i : int = 0; i < l; i++) {
			// first we gather info
			var r: int = MD.uvData[i].row;
			var c: int = MD.uvData[i].column;
			var f: String = MD.uvData[i].fileName;  // Textures needs to be in subfolder Resources at compiling time, no modding support here...
			
			t = Resources.Load(f, Texture2D);
			// now we have the texture, so we calculate the position of our tile
			// for now we assume 512x512 atlas maps everytime this means 32x32 sprites
			var w : int = t.width / (t.width/spriteX);    // should always be 16 x 16 pixels for now
			var h : int = t.height / (t.width/spriteY);
			var col : Color;
			for (var x : int = 0; x < spriteX; x++) {
				for (var y : int = 0; y<spriteY; y++) {
					var row :int;  // the row
					var column : int; // the column
					// we calculate x and y position based on i
					row = i%(atlasX/spriteX);
					column = (i-row) / (atlasY/spriteY);
					
					col = t.GetPixel(spriteX*r + x,spriteY*c+y);
					atlas.SetPixel(x+spriteX*row,y+spriteY*column,col);
					
					hsb = hsb.FromColor(col);
					hsb.s = hsb.s/2;						// desaturation for FOV sprites
					hsb.b = hsb.b / 2;
					col = hsb.ToColor(hsb);
					atlas.SetPixel(x+spriteX*row,y+spriteY*(column+(atlasY/(spriteX*2))),col);
					
					// we save the new UV info
					uvDataNew[i].x = row;
					uvDataNew[i].y = column;
					uvDataNew[i+(l)].x = row;
					uvDataNew[i+(l)].y = column+((atlasY/spriteX)/2);
				}
			}
    		
		}
		atlas.Apply();
		// now we apply the texture to the WorldLayer GameObject
		WorldLayerGO.renderer.material.mainTexture = atlas;
		WorldLayerGO.renderer.material.mainTexture.filterMode = FilterMode.Point;
		// and we copy the new UV-info 
		MD.uvData = new uvDataClass[l*2];
		for ( i = 0; i < (l*2); i++) { MD.uvData[i] = new uvDataClass();}
		for ( i = 0; i < (l*2); i++) { 
			MD.uvData[i].row = uvDataNew[i].x;
			MD.uvData[i].column = uvDataNew[i].y;
		}
		var ic : int = MD.uvInfo.Count;
		for (i=0; i< ic; i++) {
			MD.uvInfo.Add( MD.uvInfo[i]+1000);
		}
	}
	var WorldLayerGO : GameObject;
	
	function AtlasCreation(){
		ReMapWorld(); // now we have the newly mapped world in uvWorld and the info about sprites in uvInfo;
		UVDataCreation();
		// now we have all info gathered, so we can build a new Atlas-Texture
		AtlasTextureCreation();
		
		
		for (var x = 0; x < MD.maxXWorld; x++) {
			for (var y = 0; y < MD.maxYWorld; y++) {
				MD.mapWorld[x,y] = uvWorld[x,y];
			}
		}
	}
	
	function Awake() {
		readTileRuleSets();
		readUVRuleSets();	
	}
