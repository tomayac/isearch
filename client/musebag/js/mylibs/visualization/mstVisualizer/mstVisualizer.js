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
		var similarities = null;
		var T = null;
		var initialTree = null;
		var GT = null;
		var canvas = null;
		var hoveredIndex = -1;
		var clickedIndex = -1;
		var doubleClickedIndex = -1;
		var desc = null;
		var temperature = 1000;

		
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
							
			// create similarites
			var S = results.clusters.S;
			similarities = new Array(N);
			for (var i=0; i<N; i++)
				similarities[i] = new Array(N);
			var index = 0;
			for (var i=0; i<N; i++)
			{
				for (var j=i; j<N; j++)
				{
					if (i == j)
						similarities[i][j] = 1;
					else
						similarities[i][j] = similarities[j][i] = S[index++];
				}
			}
			
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
			
			// setup any other canvas handlers
			canvas.onmousemove = mouseMove;
			canvas.prevMouseMove = mouseMove;
			var oldMouseDown = canvas.onmousedown;
			canvas.onmousedown = function(e) {mouseDown.call(canvas, e, oldMouseDown);};
			//canvas.ondblclick = mouseDoubleClick;
			var oldMouseWheel = canvas.onmousewheel;
			canvas.removeEventListener("DOMMouseScroll", oldMouseWheel);
			canvas.addEventListener("DOMMouseScroll", function(e) {mouseWheel.call(canvas, e, oldMouseWheel)});
			
			
			// create description element
			desc = $(ele + " #description")[0];
			
			// start main loop
			setInterval(loop, 20);
			//loop();
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
				var p = this.project(reprVertex.dynamics.x, reprVertex.dynamics.y);
			
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
		
		
		// mouse click handler
		var mouseDown = function(e, oldMouseDown)
		{
			var mouse = this.getMouse(e);
			
			clickedIndex = indexAtPosition.call(this, GT, mouse.x, mouse.y);
			
			if (clickedIndex >= 0)
			{
				var reprVertex = GT.groups[clickedIndex].representative();
				$(desc).find("#descImage").html("<img src='" + reprVertex.data.imageUrl + "'/>");
				$(desc).find("#descText").html(reprVertex.data.text);
			}
			else
			{
				oldMouseDown.call(this, e);
			}
		};
		
		
		// mouse wheel handler
		var mouseWheel = function(e, oldMouseWheel)
		{
			oldMouseWheel.call(this, e);
			
			var thres = 100 * canvas.view.w / canvas.width;
		
			if (e.detail < 0)
				GT = Graph.expand(GT);
			else
				GT = Graph.simplify(GT, thres);
				
			// also act as if the mouse was moved
			mouseMove.call(this, e);
		}
		
		
		// mouse double click handler
		var mouseDoubleClick = function(e)
		{
			var mouse = this.getMouse(e);
			
			doubleClickedIndex = indexAtPosition.call(this, GT, mouse.x, mouse.y);
		};
		
		
		// mouse move handler (for hover effect)
		var mouseMove = function(e)
		{
			var mouse = this.getMouse(e);
			
			hoveredIndex = indexAtPosition.call(this, GT, mouse.x, mouse.y);
			
			if (hoveredIndex >= 0)
				canvas.style.cursor = "default";
			else
				canvas.style.cursor = "-moz-grab";
		}
		
		
		// main loop
		var loop = function()
		{
			canvas.clear();
			
			// update vertices' positions
			if (temperature > 0.001)
			{
				for (var i=0; i<20; i++)
					temperature = Graph.applyForcesStep(T);
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
			this.dynamics = {x: Math.random(), y: Math.random(), vx: 0, vy: 0, fx: 0, fy: 0};
			
			// initialize appearance information
			this.appearance = {
				initialSize: 70,
				size: 70,
				targetSize: 70,
				sizeVel: 0,
				opacity: 1
			};
		}
		
		Vertex.prototype.draw = function(mode)
		{
			var context = canvas.getContext("2d");
			context.globalAlpha = this.appearance.opacity;
			
			if (mode == "normal")
			{
				canvas.drawRectangle(
					this.dynamics.x,
					this.dynamics.y,
					this.appearance.size + 10,
					this.appearance.size + 10,
					/*"rgb(76, 60, 27)",*/
					/*"rgb(239, 238, 203)"*/
					"grey",
					/*"lightyellow"*/
					"rgb(250, 250, 250)"
				);
			}
			else if (mode == "doubleClicked")
			{
				canvas.drawRectangle(
					this.dynamics.x,
					this.dynamics.y,
					this.appearance.size + 7,
					this.appearance.size + 7,
					"green",
					"lightgreen"
				);
			}
			
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
