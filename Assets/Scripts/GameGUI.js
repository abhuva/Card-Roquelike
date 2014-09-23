#pragma strict

var MD : MainData;
var MO : Movement;
var COM: Combat;
var AM : AIManager;
var WG : WorldGeneration;

var TS : UnityEngine.UI.Text;

function Start () {
	MD.gameState = -1;

}

function Update() {
	if (MD.gameState == -1) {
		WG.Generator(1, false);
	}
	TS.text = MD.statusText;
}