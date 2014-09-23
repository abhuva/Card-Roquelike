#pragma strict

// holds overall info about worldgeneration, wich map-templates to use, wich graphic
// this allows same map-templates to have different tile-sets
// this is the info about the actual game-cards we use - "World/Dungeon Cards"

var MD : MainData;
var MC : MapCreation;
var AC : AtlasCreation;
var AM : AIManager;
var MO : Movement;

	public class WorldGenSet {
		@XmlAttribute("description")
		public var description 		: String;	// serves as a title and for easy editing the xml files
		public var iD				: String;
		public var mapGenID			: String;   // which map generator to use
		public var tileRuleSetID	: String[];   // wich tileRuleSets to use, each entry specifies a ruleset for that number
		public var detailRuleSetID  : String[];  // wich tileRuleSets to use for the detail map
	}
	
	@XmlRoot("WorldGenSetCollection")
	public class WorldGenSetContainer {
		@XmlArray("WorldGenSets")
		@XmlArrayItem("WorldGenSet")
		public var WorldGenSets : List.<WorldGenSet>; // = new List.<Quest>();
	
		public function Save(path : String)	{
			var serializer : XmlSerializer = new XmlSerializer(WorldGenSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Create);
			serializer.Serialize(stream, this);
			stream.Close();
		}
   
		public static function Load(path : String):WorldGenSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(WorldGenSetContainer);
			var stream : Stream = new FileStream(path, FileMode.Open);
			var result : WorldGenSetContainer = serializer.Deserialize(stream) as WorldGenSetContainer;
			stream.Close();
			return result;
		}
 
         //Loads the xml directly from the given string. Useful in combination with www.text.
         public static function LoadFromText(text : StringReader):WorldGenSetContainer {
			var serializer : XmlSerializer = new XmlSerializer(WorldGenSetContainer);
			return serializer.Deserialize(text) as WorldGenSetContainer;
		}
	}

 
	public var container : WorldGenSetContainer;
	private var path : String;
	public var XMLWorldGen : TextAsset;	// incase we want to include the xml in the build we assign it to this variable in the inspector, use readNamesTxt() to initialize then

	// *****************************************************************************************************
// Below this comes the XML handling scripts (loading, writing, getting the iD position etc..)
// *****************************************************************************************************	
	
	function writeHelloWorld() {
		var myName : WorldGenSet = new WorldGenSet();
		
		myName.description 	= "Our first Quest";
		myName.iD			= "Wall";
		myName.mapGenID		= "mapGenID";
		myName.tileRuleSetID = new String[2];
		myName.tileRuleSetID[0] = "DungeonFloor01";
		myName.tileRuleSetID[1] = "DungeonWall01";
		container = new WorldGenSetContainer();
		container.WorldGenSets = new List.<WorldGenSet>();
			
		container.WorldGenSets.Add(myName); 
	
		path = Application.dataPath + "/data/WorldGenSets.xml";
		//statusText = path;
		container.Save(path) ;   //Application.persistentDataPath
	}
 
	// reads the xml defined in XMLObject, used if we want to include the xml in the build
	function readWorldGenTxt () {
		var xml : StringReader = new StringReader(XMLWorldGen.text);
		container = WorldGenSetContainer.LoadFromText(xml);
	}
 
	// reads the xml from a file specified in the path variable, this way xmls can be modified by the user
	function readMapWorldSets () {
		// we open the xml and read the data into a list
		path = Application.dataPath + "/data/WorldGenSets.xml";
		//statusText5 = path;
		container = WorldGenSetContainer.Load(path);
	}
 
	// we search a TextGen iD in the complete list for a matching iD entry and return the position in the list where we found it, if we dont find something we return -1
	function getWorldGenSetIDPos (choosenID : String) : int {
		for (var i = 0; i < container.WorldGenSets.Count; i++) {
			if (container.WorldGenSets[i].iD == choosenID) { 
				return i; // if we find a matching id, we break the loop and return the position in the list
				//break; 
			} 
		}
		return -1; // if we didnt find something we return -1
	}
	
	
		
	function Generator(worldGenID : int, noGame : boolean) {
		// first we get the info from WorldGenSets.xml
		MD.gameState = 0;
		var wGS : WorldGenSet = new WorldGenSet();
		wGS = container.WorldGenSets[worldGenID];
		// now we search the generator rules in MapGenSets.xml and load them
		var mapGenID : int = MC.getMapGenSetIDPos(wGS.mapGenID);
		
		var myName : MapGenSet = new MapGenSet();
		myName = MC.container.MapGenSets[mapGenID];
		MC.algoList.Clear();

		for (var i : int = 0; i < myName.rule.length; i++) {
			MC.algoList.Add(myName.rule[i]);
		}
		// now we generate the map
		MC.GenerateWorld();
		// the map is stored now in MD.mapWorld[x,y] - we translate the numbers according to the rules in WorldGenSet
		var x : int;
		var y : int;
		for (x=0; x < MC.maxX; x++) {
			for (y=0; y < MC.maxY; y++) {
				// first we get the number
				var number : int = MD.mapWorld[x,y];
				// we search the according number in the ruleset in WorldGenSets
				for (i = 0; i < wGS.tileRuleSetID.length; i++) {
					var cRule : String = wGS.tileRuleSetID[i];
					var words1 : String[];
					words1 = cRule.Split(":"[0]);  // we seperate the parts (rule part and position parts)
					var foundID1 : int = int.Parse(words1[0]);
					var foundID2 : int = int.Parse(words1[1]);
					if (foundID1 == number) break;
				}
				// we have our new ID in foundID2 now and write this to the map
				MD.mapWorld[x,y] = foundID2;
			}
		}
		
		// the same for the detail map
		for (x=0; x < MC.maxX; x++) {
			for (y=0; y < MC.maxY; y++) {
				// first we get the number
				 number = MD.mapDetail[x,y];
				// we search the according number in the ruleset in WorldGenSets
				for (i = 0; i < wGS.tileRuleSetID.length; i++) {
					 cRule = wGS.tileRuleSetID[i];
					words1 = cRule.Split(":"[0]);  // we seperate the parts (rule part and position parts)
					 foundID1  = int.Parse(words1[0]);
					 foundID2  = int.Parse(words1[1]);
					if (foundID1 == number) break;
				}
				// we have our new ID in foundID2 now and write this to the map
				MD.mapDetail[x,y] = foundID2;
			}
		}
		
		// now we create the texture atlas
		AC.AtlasCreation();
		// we position the player
		if (noGame == false) {
			for ( x=1;x<MC.maxX-1;x++) {
					for ( y=1;y<MC.maxY-1;y++) {
						if (MD.mapMove[x,y] != 0) {
							AM.AIDataList[0].position.x = x;
							AM.AIDataList[0].position.y = y;
							break;
						}
					}
				}
			}
			
			if (noGame == false) AM.InitAI();
			MO.UpdateMap();
			if (noGame == false) {
				MC.VisualizeMapAsTexture(MD.mapWorld);
				MO.turnState = 1;
				//showSets = false;
				MD.gameState = 1;
			}

	}
	
	function Generator2Texture(worldGenID : int) {
		var wGS : WorldGenSet = new WorldGenSet();
		wGS = container.WorldGenSets[worldGenID];
		var mapGenID : int = MC.getMapGenSetIDPos(wGS.mapGenID);
		var myName : MapGenSet = new MapGenSet();
		myName = MC.container.MapGenSets[mapGenID];
		MC.algoList.Clear();
		for (var i : int = 0; i < myName.rule.length; i++) MC.algoList.Add(myName.rule[i]);
		MC.GenerateWorld();
		var x : int;
		var y : int;
		for (x=0; x < MC.maxX; x++) {
			for (y=0; y < MC.maxY; y++) {
				var number : int = MD.mapWorld[x,y];
				for (i = 0; i < wGS.tileRuleSetID.length; i++) {
					var cRule : String = wGS.tileRuleSetID[i];
					var words1 : String[];
					words1 = cRule.Split(":"[0]);  // we seperate the parts (rule part and position parts)
					var foundID1 : int = int.Parse(words1[0]);
					var foundID2 : int = int.Parse(words1[1]);
					if (foundID1 == number) break;
				}
				MD.mapWorld[x,y] = foundID2;
			}
		}
		// the same for the detail map
		for (x=0; x < MC.maxX; x++) {
			for (y=0; y < MC.maxY; y++) {
				 number = MD.mapDetail[x,y];
				for (i = 0; i < wGS.tileRuleSetID.length; i++) {
					 cRule = wGS.tileRuleSetID[i];
					words1 = cRule.Split(":"[0]);  // we seperate the parts (rule part and position parts)
					 foundID1  = int.Parse(words1[0]);
					 foundID2  = int.Parse(words1[1]);
					if (foundID1 == number) break;
				}
				MD.mapDetail[x,y] = foundID2;
			}
		}
		
		//Debug.Log (MC.maxX + " " + MC.maxY);
		AC.AtlasCreation();
		// We have the map stored in MD.mapWorld and created the atlas texture, now we just need to draw the whole map to texture
		var tex = new Texture2D (4096, 4096, TextureFormat.RGB24, false);
		for (x = 0; x < MC.maxX; x++) {
			for (y = 0; y < MC.maxY; y++) {
				// for each tile in the map we do the following:
				var tileID : int = MD.mapWorld[x,y];
				var detailTileID : int = MD.mapDetail[x,y];
				
				var uvDataPos : int;
				var uvDataPosDetail : int;
				for ( i = 0; i < MD.uvInfo.Count; i++) { 
					if (MD.uvInfo[i] == tileID) {uvDataPos = i; break;}
				}
				for ( i = 0; i < MD.uvInfo.Count; i++) { 
					if (MD.uvInfo[i] == detailTileID) {uvDataPosDetail = i; break;}
				}
				var r : int;
				var c : int;
				var r1:int;
				var c1:int;
				var x1 : int;
				var y1 : int;
				var spriteX : int = 16;
				var spriteY : int = 16;
				var col : Color;
				r = MD.uvData[uvDataPos].row;
				c = MD.uvData[uvDataPos].column;
				r1 = MD.uvData[uvDataPosDetail].row;
				c1 = MD.uvData[uvDataPosDetail].column;
				// the texture is in AC.atlas
				for (x1 = 0; x1 < spriteX; x1++) {
					for (y1 = 0; y1 < spriteY; y1++) {
						col = AC.atlas.GetPixel(spriteX*r + x1,spriteY*c+y1);
						tex.SetPixel(x1+spriteX*x, y1+spriteY*y,col);
						col = AC.atlas.GetPixel(spriteX*r1 + x1, spriteY*c1+y1); // the detail sprite
						if (col.a > 0) {
							tex.SetPixel(x1+spriteX*x, y1+spriteY*y,col);
						}
					}
				}
				
			}
		}
		tex.Apply();
		var bytes = tex.EncodeToPNG();
		Destroy (tex);
		var path : String;
		path = Application.dataPath + "/data/SavedScreen.png";
		File.WriteAllBytes(path, bytes);
	
	}
	
	function Start() {
		readWorldGenTxt();
		//readMapWorldSets();
	}
