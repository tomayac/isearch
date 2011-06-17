//Namespace
var com;
if (!com) {
  com = {};
} else if (typeof com != "object") {
  throw new Error("com already exists and is not an object");
}
if (!com.isearch) {
  com.isearch = {}
} else if (typeof com.isearch != "object") {
  throw new Error("com.isearch already exists and is not an object");
}
if (com.isearch.results) {
  throw new Error("com.isearch.config already exists");
}
com.isearch.config = {
 
  //Menu parameters
  slideUpAnimationTime: 200,
  slideDownAnimationTime: 200,
  menuWidth: 470, //cf style.css for more explanations

  //Query parameters
  maxNumResults: 100, 
  clusters0: 5,
  clusters1: 3, 
  trans: "rand", //Can be "lle" or "rand" 
  
  //Visualization parameters
  visualizationMethod: "tmap", //tmap, htree or hpan
  iconSize: 32, //16, 32, 48, 64

  //Misc
  flashLoadedTimeout: 2000 //wait until flash obj is loaded

};

