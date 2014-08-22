#pragma strict

var MD : MainData;
var MO : Movement;
var COM: Combat;
var AM : AIManager;
var WG : WorldGeneration;

function Start () {
	

}

private var scrollViewVector : Vector2;
function OnGUI () {
	if (MD.gameState == 1) {
		scrollViewVector = GUI.BeginScrollView (Rect (0, 25, 200, 200), scrollViewVector, Rect (0, 0, 180, 400));
			GUI.Label (new Rect (0, 0, 180, 400), MD.statusText);
		GUI.EndScrollView();
	}
}

function Update() {
	if (MD.gameState == 0) {
		WG.Generator(1, false);
	}
}