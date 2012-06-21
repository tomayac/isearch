/*
* Class which triggers the visualization of the results as 
* a force-directed minimum spanning tree
*/

define(
	"mylibs/visualization/mstVisualizer/mstVisualizer",	
	[
		"mylibs/visualization/mstVisualizer/CanvasExtension",
		"mylibs/visualization/mstVisualizer/Graph"
	], 
	
	function(CanvasExtension, Graph)
	{
		// variables	
		var results = null;
		var N = 0;
		var vertices = null;
		var imageWeight = 0;
		var textWeight = 1;
		var imageSimilarities = null;
		var textSimilarities = null;
		var similarities = null;
		var T = null;
		var initialTree = null;
		var GT = null;
		var canvas = null;
		var desc = null;
		var temperature = 1000;
		var initializing = true;
		var L = [];
		var levelIndex = 0;
		
		// event-specific variables
		var mouseX = 0;
		var mouseY = 0;
		var canvasLeft = 0;
		var canvasTop = 0;		
		var clickPoint = {x: 0, y: 0};
		var prevOrigin = {x: 0, y: 0};
		var hoveredIndex = -1;
		var clickedIndex = -1;
		var doubleClickedIndex = -1;
		var clickedObject = null;
		var draggedObject = null;
		var nearestIndex = -1;
		var nearestObject = null;

		
		// draw function
		var draw = function(res, ele, options)
		{
		
			// store results
			results = res;
			N = results.docs.length;
			
			// create vertices
			vertices = new Array(N);
			for (var i=0; i<N; i++)
			{
				vertices[i] = new Vertex(results.docs[i]);
				
				vertices[i].info.id = i;
				var B = 0.01;	// this is the score of the last item
				var A = 1/(N-1) * Math.log(1/B);	// exponential's constant
				vertices[i].info.score = Math.exp(-A*i);
				
				// set vertices' sizes relative to their scores
				// vertices[i].appearance.initialSize = vertices[i].info.score * 40 + 30;
				// vertices[i].appearance.size = vertices[i].appearance.initialSize;
				// vertices[i].appearance.targetSize = vertices[i].appearance.initialSize;
			}
							
			// create image similarites
			var Si = results.clusters.Si;
			imageSimilarities = new Array(N);
			for (var i=0; i<N; i++)
				imageSimilarities[i] = new Array(N);
			var index = 0;
			for (var i=0; i<N; i++)
			{
				for (var j=i; j<N; j++)
				{
					if (i == j)
						imageSimilarities[i][j] = 1;
					else
						imageSimilarities[i][j] = imageSimilarities[j][i] = Si[index++];
				}
			}
			
			// create text similarites
			var St = results.clusters.St;
			textSimilarities = new Array(N);
			for (var i=0; i<N; i++)
				textSimilarities[i] = new Array(N);
			var index = 0;
			for (var i=0; i<N; i++)
			{
				for (var j=i; j<N; j++)
				{
					if (i == j)
						textSimilarities[i][j] = 1;
					else
						textSimilarities[i][j] = textSimilarities[j][i] = St[index++];
				}
			}
			
			// create multimodal similarities array
			similarities = new Array(N);
			for (var i=0; i<N; i++)
				similarities[i] = new Array(N);
				
			// calculate multimodal similarities
			multimodalSimilarities();
			
			// create tree
			T = Graph.mst(vertices, similarities);
			initialTree = new Graph.GTree(T);
			GT = initialTree;
			
			
			// create canvas
			$(ele).append("\
				<div id='drawing'>\
					<canvas id='mainCanvas'></canvas>\
				</div>\
				<div id='description'>\
					<div id='descImage'>Click an image on the left.</div>\
					<div id='descText'></div>\
				</div>\
			");
			canvas = $(ele + " #mainCanvas")[0];
			canvas.width = $(canvas).width();
			canvas.height = $(canvas).height();
			CanvasExtension.extend(canvas);
			canvasLeft = $(canvas).offset().left;
			canvasTop = $(canvas).offset().top;
			
			// setup event handlers
			canvas.onmousedown = mouseDown;
			canvas.onmouseup = mouseUp;
			canvas.onmousemove = null;
			canvas.onmousewheel = mouseWheel;
			canvas.addEventListener("DOMMouseScroll", mouseWheel);
			canvas.onmouseout = mouseUp;
			canvas.ondblclick = mouseDoubleClick;
			
			
			// create description element
			desc = $(ele + " #description")[0];
			
			// start main loop
			setInterval(loop, 20);
			//loop();
		};
		
		
		// calculate multimodal similarities
		var multimodalSimilarities = function() {
			
			for (var i=0; i<N; i++)
			{
				for (var j=i; j<N; j++)
				{
					if (i == j)
						similarities[i][j] = 1;
					else
						similarities[i][j] = similarities[j][i] = 
							imageWeight * imageSimilarities[i][j] + 
							textWeight * textSimilarities[i][j];
				}
			}
		};
		
		
		// returns the index of g's vertex group that is at position x, y,
		// or -1 if no vertex is there.
		// must be called from within the canvas object (see e.g. mouseDown)
		var indexAtPosition = function(g, x, y)
		{
			var index = -1;
			
			for (var i=0; i<g.groups.length; i++)
			{
				var reprVertex = g.groups[i].representative();
				var p = canvas.project(reprVertex.dynamics.x, reprVertex.dynamics.y);
			
				var dx = Math.abs(x - p.x);
				var dy = Math.abs(y - p.y);
				
				var s = reprVertex.appearance.initialSize/2;
				if (dx < s && dy < s)
				{
					index = i;
					break;
				}
			}
			
			return index;
		};
		
		
		
		var storeMouse = function(e) {
			mouseX = e.pageX - canvasLeft;
			mouseY = e.pageY - canvasTop;
		}
		
		var getMouse = function(e) {
			return {x: e.pageX - canvasLeft, y: e.pageY - canvasTop};
		}		
		
		var mouseDown = function(e) {
		
			var mouse = getMouse(e);
			mouseX = mouse.x;
			mouseY = mouse.y;
			
			clickedIndex = indexAtPosition(GT, mouse.x, mouse.y);
			
			if (clickedIndex >= 0)
			{
				// some object has been clicked, so move the object
				
				clickedObject = GT.groups[clickedIndex].representative();
				
				$(desc).find("#descImage").html("<img src='" + clickedObject.data.imageUrl + "'/>");
				$(desc).find("#descText").html(clickedObject.data.text);
				
				this.style.cursor = "default";
				
				this.onmousemove = mouseDragObject;
			}
			else
			{
				// the whitespace has been clicked, so move the canvas
				
				clickPoint.x = mouse.x;
				clickPoint.y = mouse.y;
				prevOrigin.x = this.view.x;
				prevOrigin.y = this.view.y;
				
				this.style.cursor = "-moz-grabbing";
				
				this.onmousemove = mouseDragCanvas;
			}
		};
		
		var mouseUp = function(e) {
			this.style.cursor = "-moz-grab";
			this.onmousemove = null;
			
			if (draggedObject) {
				
				// update similarities and create new tree
				// similarities[clickedIndex][nearestIndex] = 0.9;
				// similarities[nearestIndex][clickedIndex] = 0.9;				
				// T = Graph.mst(vertices, similarities);
				// GT = new Graph.GTree(T);
				
				var imageSim = imageSimilarities[clickedIndex][nearestIndex];
				var textSim = textSimilarities[clickedIndex][nearestIndex];
				
				var c = 0.3;
				if (imageSim > textSim)
				{
					imageWeight = imageWeight + c * (1 - imageWeight);
					textWeight = textWeight - c * textWeight;
				}
				else
				{
					imageWeight = imageWeight - c * imageWeight;
					textWeight = textWeight + c * (1 - textWeight);
				}
				
				multimodalSimilarities();
				T = Graph.mst(vertices, similarities);
				GT = new Graph.GTree(T);
				
				clickedIndex = -1;
				nearestIndex = -1;
				
				draggedObject.appearance.status = "normal";
				nearestObject.appearance.status = "normal";
				
				clickedObject = null;
				draggedObject = null;
				nearestObject = null;
			}
		};
		
		var mouseDragCanvas = function(e) {
		
			var mouse = getMouse(e);
		
			this.view.x = prevOrigin.x + this.view.w / this.width * (clickPoint.x - mouse.x);
			this.view.y = prevOrigin.y - this.view.h / this.height * (clickPoint.y - mouse.y);
		};
		
		var mouseDragObject = function(e) {
		
			if (!draggedObject) {
				draggedObject = clickedObject;
				draggedObject.appearance.status = "dragged";
			}
			
			var mouse = getMouse(e);
			
			mouseX = mouse.x;
			mouseY = mouse.y;
			
			var p = canvas.unproject(mouse.x, mouse.y);
			
			// find nearest object
			var minDist = 10000;
			var prevNearestIndex = nearestIndex;
			var currNearestIndex = -1;
			for (var i=0; i<GT.groups.length; i++)
			{
				if (i == clickedIndex) continue;
				
				var repr = GT.groups[i].representative();
				var dist = 
					(repr.dynamics.x - p.x) * (repr.dynamics.x - p.x) + 
					(repr.dynamics.y - p.y) * (repr.dynamics.y - p.y);
					
				if (dist < minDist) {
					minDist = dist;
					currNearestIndex = i;
				}
 			}
			
			if (!nearestObject) {
				
				nearestIndex = currNearestIndex;				
				nearestObject = GT.groups[nearestIndex].representative();				
				nearestObject.appearance.status = "nearest";
			}			
			else if (currNearestIndex != prevNearestIndex) {
				
				nearestObject.appearance.status = "normal";
				
				nearestIndex = currNearestIndex;				
				nearestObject = GT.groups[nearestIndex].representative();				
				nearestObject.appearance.status = "nearest";
			}
		};
		
		var mouseWheel = function(e) {
		
			var mouse = getMouse(e);
		
			var p = this.unproject(mouse.x, mouse.y);
			
			var ratio = 1;
			if (e.detail < 0)	// scroll up
			{
				ratio = 0.8;
				this.zoomLevel++;
			}
			else				// scroll down
			{
				ratio = 1.25;
				this.zoomLevel--;
			}
									
			this.view.x = p.x - ratio * (p.x - this.view.x);
			this.view.y = p.y - ratio * (p.y - this.view.y);
			this.view.w *= ratio;
			this.view.h *= ratio;
			
			
			// // handle clutter
			// var thres = 100 * canvas.view.w / canvas.width;
		
			// if (e.detail < 0)
				// GT = Graph.expand(GT);
			// else
				// GT = Graph.simplify(GT, thres);
		};
		
		var mouseDoubleClick = function(e) {
			
			
		};
		
		
		var zoomFit = function() {
		
			var minX;
			var maxX;
			var minY;
			var maxY;
			
			for (var i=0; i<GT.groups.length; i++)
			{
				var repr = GT.groups[i].representative();
				
				if (i == 0) {
					minX = repr.dynamics.x;
					maxX = repr.dynamics.y;
					minY = repr.dynamics.y;
					maxY = repr.dynamics.y;
				}
				else {
					minX = Math.min(minX, repr.dynamics.x);
					maxX = Math.max(maxX, repr.dynamics.x);
					minY = Math.min(minY, repr.dynamics.y);
					maxY = Math.max(maxY, repr.dynamics.y);
				}
			}
			
			var dX = maxX - minX;
			var dY = maxY - minY;
			
			var ratio = canvas.view.w / canvas.view.h;
			
			if (dX > dY) {
				canvas.view.w = dX * 1.5;
				canvas.view.h = canvas.view.w / ratio;
			}
			else {
				canvas.view.h = dY * 1.5;
				canvas.view.w = canvas.view.h * ratio;
			}
			
			canvas.view.x = (minX + maxX) / 2 - canvas.view.w / 2;
			canvas.view.y = (minY + maxY) / 2 - canvas.view.h / 2;
		};
		
		
		var simplify = function(tree) {
	
			var newVertices = [];
			var newEdges = [];
			
			// calculate degrees of vertices
			var degrees = new Array(tree.vertices.length);
			for (var i=0; i<degrees.length; i++)
				degrees[i] = 0;
			for (var i=0; i<tree.edges.length; i++)
			{
				degrees[tree.edges[i].v1]++;
				degrees[tree.edges[i].v2]++;
			}
			
			// find edge with maximum weight
			var maxSim = 0;
			var winner = -1;
			for (var i=0; i<tree.edges.length; i++)
			{
				if (tree.edges[i].w > maxSim)
				{
					maxSim = tree.edges[i].w;
					winner = i;
				}
			}
			
			// find which vertex will merge the other
			var vH;
			var vL;
			if (degrees[tree.edges[winner].v1] > degrees[tree.edges[winner].v2])
			{
				vH = tree.edges[winner].v1;
				vL = tree.edges[winner].v2;
			}
			else
			{
				vH = tree.edges[winner].v2;
				vL = tree.edges[winner].v1;
			}
			
			// calculate newVertices
			for (var i=0; i<tree.vertices.length; i++)
			{
				if (i == vL)
					continue;
					
				newVertices.push(tree.vertices[i]);
			}
			
			// calculate newEdges
			for (var i=0; i<tree.edges.length; i++)
			{
				if (i == winner)
					continue;
					
				var newV1;
				var newV2;
				var newW;
				
				if (tree.edges[i].v1 == vL)
				{			
					if (vH > vL)
						newV1 = vH - 1;
					else
						newV1 = vH;
					
					if (tree.edges[i].v2 > vL)
						newV2 = tree.edges[i].v2 - 1;
					else
						newV2 = tree.edges[i].v2;
				}		
				else if (tree.edges[i].v2 == vL)
				{			
					if (tree.edges[i].v1 > vL)
						newV1 = tree.edges[i].v1 - 1;
					else
						newV1 = tree.edges[i].v1;
						
					if (vH > vL)
						newV2 = vH - 1;
					else
						newV2 = vH;
				}
				else
				{
					if (tree.edges[i].v1 > vL)
						newV1 = tree.edges[i].v1 - 1;
					else
						newV1 = tree.edges[i].v1;
				
					if (tree.edges[i].v2 > vL)
						newV2 = tree.edges[i].v2 - 1;
					else
						newV2 = tree.edges[i].v2;
				}
				
				newW = tree.edges[i].w;
				
				newEdges.push({v1: newV1, v2: newV2, w: newW});
			}
			
			//console.log(newVertices);
			//console.log(newEdges);
			
			return new Graph(newVertices, newEdges);
		};
		
		var levels = function() {
	
			L[0] = T;
			for (var i=1; i<N; i++)
			{
				L[i] = simplify(L[i-1]);
			}
		};
		
		
		// // mouse click handler
		// var mouseDown = function(e, oldMouseDown)
		// {
			// var mouse = this.getMouse(e);
			
			// clickedIndex = indexAtPosition.call(this, GT, mouse.x, mouse.y);
			
			// if (clickedIndex >= 0)
			// {
				// var reprVertex = GT.groups[clickedIndex].representative();
				// $(desc).find("#descImage").html("<img src='" + reprVertex.data.imageUrl + "'/>");
				// $(desc).find("#descText").html(reprVertex.data.text);
			// }
			// else
			// {
				// oldMouseDown.call(this, e);
			// }
		// };
		
		
		// // mouse wheel handler
		// var mouseWheel = function(e, oldMouseWheel)
		// {
			// oldMouseWheel.call(this, e);
			
			// var thres = 100 * canvas.view.w / canvas.width;
		
			// if (e.detail < 0)
				// GT = Graph.expand(GT);
			// else
				// GT = Graph.simplify(GT, thres);
				
			// // also act as if the mouse was moved
			// mouseMove.call(this, e);
		// }
		
		
		// // mouse double click handler
		// var mouseDoubleClick = function(e)
		// {
			// var mouse = this.getMouse(e);
			
			// doubleClickedIndex = indexAtPosition.call(this, GT, mouse.x, mouse.y);
		// };
		
		
		// // mouse move handler (for hover effect)
		// var mouseMove = function(e)
		// {
			// var mouse = this.getMouse(e);
			
			// hoveredIndex = indexAtPosition.call(this, GT, mouse.x, mouse.y);
			
			// if (hoveredIndex >= 0)
				// canvas.style.cursor = "default";
			// else
				// canvas.style.cursor = "-moz-grab";
		// }
		
		
		// main loop
		var loop = function()
		{
			canvas.clear();
			
			// update vertices' positions
			if (clickedIndex < 0)
			//if (temperature > 0.001)
			{
				//for (var i=0; i<20; i++)
					temperature = Graph.applyForcesStep(T);
					if (temperature < 0.1)
						initializing = false;
			}
			
			if (initializing) {
			
				zoomFit();
			}
			
			if (draggedObject) {
				var p = canvas.unproject(mouseX, mouseY);
				draggedObject.dynamics.x = p.x;
				draggedObject.dynamics.y = p.y;
			}
			
			// update objects' masses
			for (var i=0; i<GT.groups.length; i++)
			{
				// normal mass is 1
				var repr = GT.groups[i].representative();
				massDif = 1 - repr.dynamics.m;
				repr.dynamics.m += massDif * 0.5;				
			}
			
			//else
			{
				// update vertices' size
				for (var i=0; i<GT.groups.length; i++)
				{
					var reprVertex = GT.groups[i].representative();
					if (doubleClickedIndex < 0 && i == hoveredIndex)
						reprVertex.appearance.targetSize = 130;
					else
						//reprVertex.appearance.targetSize = reprVertex.appearance.initialSize;
						reprVertex.appearance.targetSize = GT.groups[i].maxSize;
					var sizeAcc = 
						0.2 * (reprVertex.appearance.targetSize - reprVertex.appearance.size) -
						0.7 * (reprVertex.appearance.sizeVel);
					reprVertex.appearance.sizeVel += sizeAcc;
					reprVertex.appearance.size += reprVertex.appearance.sizeVel;
				}
				
				// draw tree's edges
				for (var i=0; i<GT.edges.length; i++)
				{
					var r1 = GT.groups[GT.edges[i].g1].representative();
					var r2 = GT.groups[GT.edges[i].g2].representative();
				
					canvas.drawLine(
						r1.dynamics.x,
						r1.dynamics.y,
						r2.dynamics.x,
						r2.dynamics.y,
						"lightgrey"
					);
				}
				
				// draw grouped tree's vertices
				for (var i=0; i<GT.groups.length; i++)
				{
					var reprVertex = GT.groups[i].representative();
					if (i != hoveredIndex)
					{
						if (i == doubleClickedIndex)
							//reprVertex.draw("doubleClicked");
							GT.groups[i].draw();
						else
							//reprVertex.draw("normal");
							GT.groups[i].draw();
					}
				}
				if (hoveredIndex >= 0)
				{
					var reprVertex = GT.groups[hoveredIndex].representative();
					if (hoveredIndex == doubleClickedIndex)
						//reprVertex.draw("doubleClicked");
						GT.groups[hoveredIndex].draw();
					else
						//reprVertex.draw("normal");
						GT.groups[hoveredIndex].draw();
				}
			}
			
			
			// draw mask
			canvas.drawMask(50, {r: 255, g: 255, b: 255});
			
			// print weights
			var context = canvas.getContext("2d");
			context.fillStyle = "black";
			context.font ="10pt Arial";
			context.fillText("Image: " + imageWeight.toFixed(2), canvas.width - 80, canvas.height - 30);
			context.fillText("Text: " + textWeight.toFixed(2), canvas.width - 80, canvas.height - 10);
		};
		
		
		// Vertex class
		function Vertex(doc)
		{
			// transforms a retrieved document to a vertex with all
			// information needed for its visualization
			
			// initialize general info
			this.info = {id: -1, score: -1};
			
			// extract data from doc
			var imageUrl = "";
			var previewImageUrl = "";
			var text = "";
			for (var i=0; i<doc.media.length; i++)
			{
				if (doc.media[i].type == "ImageType")
				{
					imageUrl = doc.media[i].url;
					previewImageUrl = doc.media[i].previews[0].url;
				}
				else if (doc.media[i].type == "Text")
				{
					text = doc.media[i].text;
				}
			}			
			this.data = {};
			//this.data.imageUrl = imageUrl;
			this.data.imageUrl = previewImageUrl;
			this.data.text = text;
			
			// setup preview
			this.preview = {img: new Image()};
			this.preview.img.src = previewImageUrl;
			
			// initialize dynamics
			this.dynamics = {
				x: Math.random(),
				y: Math.random(),
				vx: 0,
				vy: 0,
				fx: 0,
				fy: 0,
				m: 1
			};
			
			// initialize appearance information
			this.appearance = {
				initialSize: 70,
				size: 70,
				targetSize: 70,
				sizeVel: 0,
				opacity: 1,				
				status: "normal"
			};
		}
		
		Vertex.prototype.draw = function(mode)
		{
			var context = canvas.getContext("2d");
			context.globalAlpha = this.appearance.opacity;
			
			// draw surrounding frame
			var frameColor = "rgb(250, 250, 250)";
			if (this.appearance.status == "dragged")
				frameColor = "rgb(250, 250, 150)";
			else if (this.appearance.status == "nearest")
				frameColor = "rgb(150, 250, 150)";
			else
				frameColor = "rgb(250, 250, 250)";
				
			canvas.drawRectangle(
				this.dynamics.x,
				this.dynamics.y,
				this.appearance.size + 10,
				this.appearance.size + 10,
				/*"rgb(76, 60, 27)",*/
				/*"rgb(239, 238, 203)"*/
				"grey",
				/*"lightyellow"*/
				frameColor
			);
			
			// draw image
			canvas.drawImage(
				this.preview.img,
				this.dynamics.x,
				this.dynamics.y,
				this.appearance.size,
				0,
				0
			);
			
			context.globalAlpha = 1;
		};
		
		
		Graph.Group.prototype.draw = function()
		{
			var repr = this.representative();
		
			if (this.count > 1)
			{
				canvas.drawSquarePack(
					repr.dynamics.x,
					repr.dynamics.y,
					repr.appearance.size + 10,
					"grey",
					"rgb(250, 250, 250)"
				);
			}
					
			repr.draw("normal");
			//canvas.drawText(this.count, repr.dynamics.x, repr.dynamics.y, "black", 50, 50);
		};

		
		// module's public interface
		return {
			draw: draw
		};
	}
);
