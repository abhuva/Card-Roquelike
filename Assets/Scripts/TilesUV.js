import System.Xml;
import System.Xml.Serialization;
import System.Collections.Generic;
import System.IO;

		var offset : float =  0.0005;   // this offset is for minimizing graphical glitches and artifacts during uv-mapping


	private var width: float;		// actual size of the final plane in GameUnits
	private var height: float;
   
	var spriteRows : float;		// this shows how we devide our diffuse texture in different sections for the sprites
	var spriteColumns : float;
	
	private var uv: Vector2[];
	private var mf: MeshFilter;
	
	var meshMaxX : int;
	var meshMaxY : int;
	
	var enableCollider : boolean;

	private var MD : MainData;			// we use those to reference our MainData script wich holds all important datastructures
	private var gameData : GameObject;
	var AM : AIManager;
	
	function Awake () {
		gameData = GameObject.Find("GameData");
		MD = gameData.GetComponent(MainData);
		uv = new Vector2[MD.maxY * MD.maxX * 4];
		mf = GetComponent(MeshFilter);
		//gameData = GameObject.Find("GameManager");
		//AM = gameData.GetComponent(AIManager);
		
	}
    
	function Start() {
		width = MD.maxX;
		height = MD.maxY;
		ConstructMesh ();
		//ReMap2Background();
		
    }

	function ConstructMesh () {
		var verts: Vector3[] = new Vector3[meshMaxY * meshMaxX * 4 ];
        var normals: Vector3[] = new Vector3[meshMaxY * meshMaxX * 4];
        var tri: int[] = new int[ (meshMaxY*meshMaxX) * 6];
        uv = new Vector2[meshMaxY * meshMaxX * 4];
        mf = GetComponent(MeshFilter);
	   
	   // first we construct the tris + vertices (4 per quad / tile, this means a total of (maxY*maxX)*4 vertices and (maxY*maxX)*6 tris
	   
	    var widthTile : float = width/meshMaxX;
		var heightTile : float = height/meshMaxY;
		
		for (var c = 0; c < meshMaxY; c++) {   // for every quad we do the following
			for (var r = 0; r < meshMaxX; r++) {
				var pos : int = c*meshMaxX + r;
				
				tri[pos*6 + 0] = pos*4 + 0;
				tri[pos*6 + 1] = pos*4 + 2;
				tri[pos*6 + 2] = pos*4 + 3;
			   
				tri[pos*6 + 3] = pos*4 + 0;
				tri[pos*6 + 4] = pos*4 + 3;
				tri[pos*6 + 5] = pos*4 + 1;
			}
		}
		
	    for (c = 0; c<meshMaxY; c++) {
			for (r = 0; r<meshMaxX; r++) {	
				pos = c*meshMaxX + r;
				verts[pos*4 + 0] = new Vector3(r*1.0*(width*1.0/meshMaxX*1.0), 0.0, c*1.0*(height*1.0/meshMaxY*1.0));
				verts[pos*4 + 1] = new Vector3(r*1.0*(width*1.0/meshMaxX*1.0)+(width*1.0/meshMaxX*1.0), 0.0, c*1.0*(height*1.0/meshMaxY*1.0));
				verts[pos*4 + 2] = new Vector3(r*1.0*(width*1.0/meshMaxX*1.0), 0.0, c*1.0*(height*1.0/meshMaxY*1.0)+(height*1.0/meshMaxY*1.0)	);
				verts[pos*4 + 3] = new Vector3(r*1.0*(width*1.0/meshMaxX*1.0)+(width*1.0/meshMaxX*1.0), 0.0, c*1.0*(height*1.0/meshMaxY*1.0)+(height*1.0/meshMaxY*1.0)	);
			}
		}
       
	   // we only construct a plane so every normal points upwards
        for (var i = 0; i < normals.Length; i++) {
            normals[i] = Vector3.up;
        }
       
	   // we make a default uv-wrapping here
	    for (c = 0; c<meshMaxY; c++) {
			for (r = 0; r<meshMaxX; r++) {
				pos = c*meshMaxX + r;
				uv[pos*4+0] = new Vector2(0, 0);
				uv[pos*4+1] = new Vector2(1, 0);
				uv[pos*4+2] = new Vector2(0, 1);
				uv[pos*4+3] = new Vector2(1, 1);
 			}
		}
     
        var mesh: Mesh = new Mesh();
        
        mesh.vertices = verts;
        mesh.triangles = tri;
        mesh.uv = uv;
        mesh.normals = normals;
	
		mf.mesh = mesh;
		// after we constructed the mesh we need a collider
		if (enableCollider) {
			var mc: MeshCollider = GetComponent(MeshCollider);
			mc.sharedMesh = mesh;  // Notice: we changed from mc.mesh to mc.sharedMesh
		}
	}
	
	function ReMapUVforTile(pos:int, spriteRow : float, spriteColumn : float, update : boolean) {
		// this remaps the UV at a given position with a sprite located at row/column in the base texture
	
		var spriteWidth : float = 1 / (spriteRows);
		var spriteHeight : float = 1 / (spriteColumns);		
	
		var x : float;
		var y : float;
		
		x = spriteWidth*spriteRow + offset;
		y = spriteHeight*spriteColumn + offset;
	//var uvScale = Vector2 (1.0 / (1024 - 1), 1.0 / (1024 - 1));
		
		uv[pos*4+0] = new Vector2 (x, y);
		
		x = spriteWidth*spriteRow+spriteWidth  - offset;
		y = spriteHeight*spriteColumn + offset;
		
		uv[pos*4+1] = new Vector2 (x, y);
		
		x = spriteWidth*spriteRow + offset;
		y = spriteHeight*spriteColumn+spriteHeight - offset;
	
		uv[pos*4+2] = new Vector2 (x, y);
		
		x = spriteWidth*spriteRow+spriteWidth - offset;
		y = spriteHeight*spriteColumn+spriteHeight - offset;
	
		uv[pos*4+3] = new Vector2 (x, y);
		//Debug.Log (spriteWidth + " " + spriteHeight );
		if (update) {
			mf.mesh.uv = uv;
			
		}
	}
	
	function ReMap2Background() {

		// we use the background[,] array wich holds info about used tiles and build the uvmap according to this
		for (var y = 0; y < meshMaxY; y++) {
			for (var x = 0; x< meshMaxX; x++) {
				
				
				// we came out of the rulefind loop and assume we have the uv tileposition in foundRow and foundColumn 
				var pos : int = y*meshMaxX + x;
				
				t = MD.map[x,y]; // we get the tile info from worldmap
				if (MD.viewMap[x,y] == 0)  t += 1000; // the FOV
				for ( var i : int = 0; i < MD.uvInfo.Count; i++) { 
					if (MD.uvInfo[i] == t) {uvDataPos = i; break;}
				}
				r = MD.uvData[uvDataPos].row;
				c = MD.uvData[uvDataPos].column;
				ReMapUVforTile(pos,r,c, false); 	
			}
		}
		mf.mesh.uv = uv;
	}
	
	function ReMap2Detail() {

		// we use the background[,] array wich holds info about used tiles and build the uvmap according to this
		for (var y = 0; y < meshMaxY; y++) {
			for (var x = 0; x< meshMaxX; x++) {
				
				
				// we came out of the rulefind loop and assume we have the uv tileposition in foundRow and foundColumn 
				var pos : int = y*meshMaxX + x;
				
				t = MD.detail[x,y]; // we get the tile info from worldmap
				if (MD.viewMap[x,y] == 0)  t += 1000; // the FOV
				for ( var i : int = 0; i < MD.uvInfo.Count; i++) { 
					if (MD.uvInfo[i] == t) {uvDataPos = i; break;}
				}
				r = MD.uvData[uvDataPos].row;
				c = MD.uvData[uvDataPos].column;
				ReMapUVforTile(pos,r,c, false); 	
			}
		}
		mf.mesh.uv = uv;
	}
	
	function ReMap2Chars() {
		var pos : int;
		for (var y = 0; y < meshMaxY; y++) {
			for (var x = 0; x< meshMaxX; x++) {
				
				
				// we came out of the rulefind loop and assume we have the uv tileposition in foundRow and foundColumn 
				pos  = y*meshMaxX + x;
				ReMapUVforTile(pos,0,00, false); // empty space
				//t = MD.map[x,y]; // we get the tile info from worldmap
				if (MD.viewMap[x,y] != 0)  { // the FOV
					// we test if an enemy is on this position
					for (var i : int = 0; i < AM.AIDataList.Count; i++) {
						// pos : Vector2;
						//pos = RandomWalkablePosition();
						var cX : int = AM.AIDataList[i].position.x - AM.AIDataList[0].position.x +12;
						var cY : int = AM.AIDataList[i].position.y - AM.AIDataList[0].position.y +12;
						
						if ((cX == x) && (cY == y)) {
							ReMapUVforTile(pos,1,25, false); 
							break;
						} 
					}	
				
				
				}
					
			}
		}
		pos = 12*meshMaxX + 12;
		ReMapUVforTile(pos,1,31, false);
		mf.mesh.uv = uv;
	}