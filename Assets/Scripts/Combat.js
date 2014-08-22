#pragma strict

// here are functions for calculating combat
var AM : AIManager;
var MD : MainData;

// the combat model:
// Melee Combat
//
// chance to hit: Agi versus Dex
// base chance = 50%
// chance to hit = baseChance + (Dex-Agi)*5  --> 5% more chance to hit per point of dex

var baseChanceMelee : int = 50;
var baseChanceRanged: int = 50;

// input 2 opponents, opp1 is the attacking opponent, opp2 the defending one
function MeleeCombat (opp1 : AIDataClass, opp2 : AIDataClass) {
	// first we check if we hit or evade
	var chanceToHit : int = baseChanceMelee + (opp1.dex-opp2.agi)*5;
	if (chanceToHit < 10) chanceToHit = 10; // always have a minimum chance of 10% of hitting
	if (chanceToHit > 90) chanceToHit = 90; // always have a minimum chance of 10% of evading
	var r : int;
	r = Random.Range(0,100);
		if (r <= chanceToHit) {
		//atk/def = lost hp;
		var damage : int = opp1.atk / opp2.def;
		opp2.life -= damage;
		MD.statusText = opp1.name + " hit " + opp2.name +" for "+ damage + " HP" + "\n"+ MD.statusText;
	} else {
		MD.statusText = opp2.name + " evaded " + opp1.name +"'s Attack\n"+ MD.statusText;
	}
	//Debug.Log(opp1.name + " is attacking " + opp2.name);
}

// simple ranged combat model
function RangedCombat (opp1 : AIDataClass, opp2 : AIDataClass) {
	// first we measure the distance
	var x : int = Mathf.Abs( opp1.position.x - opp2.position.x);
	var y : int = Mathf.Abs( opp1.position.y - opp2.position.y);
	var dist: float = Mathf.Sqrt(x*x + y*y);
	
	// based on the distance we calculate our chance to hit
	var chanceToHit : int = baseChanceRanged + (opp1.dex-opp2.agi)*5;
	chanceToHit -= dist * 5;
	
	if (chanceToHit < 10) chanceToHit = 10; // always have a minimum chance of 10% of hitting
	if (chanceToHit > 90) chanceToHit = 90; // always have a minimum chance of 10% of evading
	MD.statusText = "CTH Ranged: "+chanceToHit+"\n"+ MD.statusText;
	var r : int;
	r = Random.Range(0,100);
		if (r <= chanceToHit) {
		//atk/def = lost hp;
		var damage : int = opp1.atk / opp2.def;
		opp2.life -= damage;
		MD.statusText = opp1.name + " hit " + opp2.name +" for "+ damage + " HP" + "\n"+ MD.statusText;
	} else {
		MD.statusText = opp2.name + " evaded " + opp1.name +"'s Attack\n"+ MD.statusText;
	}
	
}