define(
	"mylibs/visualization/mstVisualizer/Graph",
	[],
	
	function()
	{
		// Tree class
		var Tree = function(vertices, edges)
		{
			this.vertices = vertices;
			this.edges = edges;
		};
		
		
		// minimum spanning tree
		var mst = function(vertices, similarities)
		{
			var N = vertices.length;
	
			var edges = [];

			// define accessory arrays
			var traversed = new Array(N);
			var bucketVertex = new Array(N);
			var bucketWeight = new Array(N);
			for (var i=0; i<N; i++)
			{
				traversed[i] = false;
				bucketVertex[i] = -1;
				bucketWeight[i] = 0;
			}

			// start with first vertex
			traversed[0] = true;
			var currentVertex = 0;

			var iter = 0;
			while (true)
			{	
				for (var i=0; i<N; i++)
				{
					var w = similarities[currentVertex][i];

					if (!traversed[i])
					{
						if (bucketVertex[i] == -1 || bucketWeight[i] < w)
						{
							bucketVertex[i] = currentVertex;
							bucketWeight[i] = w;
						}
					}
				}

				// sequential search for heaviest bucket
				var maxWeight = 0;
				var bestNextVertex = -1;
				for (var i=0; i<N; i++)
				{
					if (!traversed[i] && bucketWeight[i] > maxWeight)
					{
						maxWeight = bucketWeight[i];
						bestNextVertex = i;
					}
				}

				if (bestNextVertex == -1) break;
				
				edges.push({v1: bestNextVertex, v2: bucketVertex[bestNextVertex], w: maxWeight});
				
				// add vertex to tree
				traversed[bestNextVertex] = true;
				currentVertex = bestNextVertex;

				iter++;
			}

			// create resulting tree
			var result = new Tree(vertices, edges);
			
			return result;
		};
		
		
		// force-directed placement of a tree
		var applyForcesStep = function(T)
		{
			// time
			//var timeStep = 0.3;		// time step for the simulation (in ms)
			var timeStep = 0.1;

			// simulation parameters
			var charge = 0.5;		// repulsive charge
			var spring = 0.5;				// attractive spring constant
			//var friction = 0.8;
			var friction = 0.8;
			var gravity = 0.1;
			
			var vMax = 100;		// maximum velocity


			var N = T.vertices.length;

			// clear forces
			for (var i=0; i<N; i++)
			{
				T.vertices[i].dynamics.fx = 0;
				T.vertices[i].dynamics.fy = 0;
			}
			
			// calculate repulsive forces among objects
			for (var i=0; i<N; i++)
			{				
				for (var j=i+1; j<N; j++)
				{					
					var dx = T.vertices[j].dynamics.x - T.vertices[i].dynamics.x;
					var dy = T.vertices[j].dynamics.y - T.vertices[i].dynamics.y;
					var d = Math.sqrt(dx*dx + dy*dy);
					if (d < 0.1) d = 0.1;
					
					// repulsive forces			
					T.vertices[i].dynamics.fx -= charge * dx / (d*d*d);
					T.vertices[i].dynamics.fy -= charge * dy / (d*d*d);			
					T.vertices[j].dynamics.fx += charge * dx / (d*d*d);
					T.vertices[j].dynamics.fy += charge * dy / (d*d*d);
					
					// // attractive forces
					// if (W[i][j] > 0)
					// {
						// particles[i].fx += spring * W[i][j] * dx;
						// particles[i].fy += spring * W[i][j] * dy;			
						// particles[j].fx -= spring * W[i][j] * dx;
						// particles[j].fy -= spring * W[i][j] * dy;
					// }
				}
			}
			
			// calculate attractive forces
			for (var i=0; i<T.edges.length; i++)
			{
				var dx = T.vertices[T.edges[i].v2].dynamics.x - T.vertices[T.edges[i].v1].dynamics.x;
				var dy = T.vertices[T.edges[i].v2].dynamics.y - T.vertices[T.edges[i].v1].dynamics.y;
			
				// T.vertices[T.edges[i].v1].dynamics.fx += spring * T.edges[i].w * dx;
				// T.vertices[T.edges[i].v1].dynamics.fy += spring * T.edges[i].w * dy;
				// T.vertices[T.edges[i].v2].dynamics.fx -= spring * T.edges[i].w * dx;
				// T.vertices[T.edges[i].v2].dynamics.fy -= spring * T.edges[i].w * dy;
				
				T.vertices[T.edges[i].v1].dynamics.fx += spring * dx;
				T.vertices[T.edges[i].v1].dynamics.fy += spring * dy;
				T.vertices[T.edges[i].v2].dynamics.fx -= spring * dx;
				T.vertices[T.edges[i].v2].dynamics.fy -= spring * dy;
			}
			
			// calculate general forces, velocities and positions
			var temperature = 0;
			var maxF = 0;
			for (var i=0; i<N; i++)
			{
				// add gravity
				var dx = T.vertices[i].dynamics.x;
				var dy = T.vertices[i].dynamics.y;
				//var d = Math.sqrt(dx*dx + dy*dy);
				T.vertices[i].dynamics.fx -= gravity * dx;
				T.vertices[i].dynamics.fy -= gravity * dy;
				
				// add friction
				T.vertices[i].dynamics.fx -= friction * T.vertices[i].dynamics.vx;
				T.vertices[i].dynamics.fy -= friction * T.vertices[i].dynamics.vy;
				
				
				if (Math.abs(T.vertices[i].dynamics.fx) > maxF) maxF = T.vertices[i].dynamics.fx;
				if (Math.abs(T.vertices[i].dynamics.fy) > maxF) maxF = T.vertices[i].dynamics.fy;
				
			
				// calculate velocities
				T.vertices[i].dynamics.vx += T.vertices[i].dynamics.fx / T.vertices[i].dynamics.m * timeStep;
				T.vertices[i].dynamics.vy += T.vertices[i].dynamics.fy / T.vertices[i].dynamics.m * timeStep;
				
				// limit velocities
				var v_squared =
						T.vertices[i].dynamics.vx * T.vertices[i].dynamics.vx +
						T.vertices[i].dynamics.vy * T.vertices[i].dynamics.vy;
				var v = Math.sqrt(v_squared);
				if (v > vMax)
				{
					var ratio = vMax / v;
					T.vertices[i].dynamics.vx *= ratio;
					T.vertices[i].dynamics.vy *= ratio;
				}
				
				// calculate positions
				T.vertices[i].dynamics.x += T.vertices[i].dynamics.vx * timeStep;
				T.vertices[i].dynamics.y += T.vertices[i].dynamics.vy * timeStep;
				
				// calculate temperature
				temperature += v_squared;
			}
			
			//console.log(T.vertices);
			//console.log(maxF);
			
			return temperature;
		};
		
		
		// a1 and a2 are the ending points of the first line segment
		// b1 and b2 are the ending points of the second line segment
		var crossing = function(a1, a2, b1, b2)
		{
			// ca is negative if b crosses the line of a
			var ca =	((a1.y-a2.y) * (b1.x-a1.x) + (a2.x-a1.x) * (b1.y-a1.y)) *
						((a1.y-a2.y) * (b2.x-a1.x) + (a2.x-a1.x) * (b2.y-a1.y));
						
			// cb is negative if a crosses the line of b
			var cb =	((b1.y-b2.y) * (a1.x-b1.x) + (b2.x-b1.x) * (a1.y-b1.y)) *
						((b1.y-b2.y) * (a2.x-b1.x) + (b2.x-b1.x) * (a2.y-b1.y));
						
			// if both b crosses the line of a and a crosses the line of b, then a crosses b
			if (ca < 0 && cb < 0)
				return true;
			else
				return false;
		};
		
		
		// Group class
		var Group = function(data)
		{
			this.data = data;
			this.subgroups = [];
			this.subedges = [];
			this.count = 1;
			if (data)
				this.maxSize = data.appearance.initialSize;
			else
				this.maxSize = 0;
		};
		Group.prototype.representative = function()
		{
			if (this.subgroups.length == 0)
				return this.data;
			else
				return this.subgroups[0].representative();
		};
		
		// Grouped tree class
		var GTree = function(tree)
		{
			this.groups = [];			
			if (tree != null)
			{
				for (var i=0; i<tree.vertices.length; i++)
				{
					this.groups.push(new Group(tree.vertices[i]));
				}
			}
			
			this.edges = [];
			if (tree != null)
			{
				for (var i=0; i<tree.edges.length; i++)
				{
					this.edges.push({
						g1: tree.edges[i].v1,
						g2: tree.edges[i].v2,
						w: tree.edges[i].w
					});
				}
			}
		};
		
		
		// simplifies a grouped tree
		var simplify = function(gtree, threshold)
		{			
			var newGroups = [];
			var newEdges = [];
			
			// calculate new groups
			
			var N = gtree.groups.length;
			
			// gather groups' info
			var groupInfo = new Array(N);
			// initialize groups' info
			for (var i=0; i<N; i++)
			{
				groupInfo[i] = {};
				groupInfo[i].degree = 0;
				groupInfo[i].neigh = [];
				groupInfo[i].status = 0;	// 0: normal, 1: under process, 2: deleted
			}
			// gather info
			for (var i=0; i<gtree.edges.length; i++)
			{
				// edge's associated groups
				var g1 = gtree.edges[i].g1;
				var g2 = gtree.edges[i].g2;
				
				// groups' representative vertices
				var r1 = gtree.groups[g1].representative();
				var r2 = gtree.groups[g2].representative();
				
				// euclidean distance between representative vertices
				var dist = 0;
				dist += (r1.dynamics.x - r2.dynamics.x) * (r1.dynamics.x - r2.dynamics.x);
				dist += (r1.dynamics.y - r2.dynamics.y) * (r1.dynamics.y - r2.dynamics.y);
				dist = Math.sqrt(dist);
				
				// increment groups' degrees
				groupInfo[g1].degree++;
				groupInfo[g2].degree++;
				
				// add each group to each other's neighborhood list
				// as long as their distance is below the threshold
				if (dist < threshold)
				{
					groupInfo[g1].neigh.push(g2);
					groupInfo[g2].neigh.push(g1);
				}
			}
			
			// console.log("gtree: ", gtree);
			// console.log("groupInfo: ", groupInfo);
			
			
			while (true)
			{
				// find group with maximum degree (from the non-deleted ones)
				var maxDegree = -1;
				var winnerIndex = -1;
				for (var i=0; i<N; i++)
				{
					if (groupInfo[i].status == 0)
					{
						if (groupInfo[i].degree > maxDegree)
						{
							maxDegree = groupInfo[i].degree;
							winnerIndex = i;
						}
					}
				}
				
				// if no winner is found (i.e. all groups have been deleted), stop
				if (winnerIndex < 0)
					break;
				
				// create a new group for the winner and
				// put inside it all the winner's neighbors
				// also mark the winner and its neighbors as under process
				var g = new Group(null);
				g.count = 0;
				g.subgroups.push(gtree.groups[winnerIndex]);
				g.count += gtree.groups[winnerIndex].count;
				g.maxSize = gtree.groups[winnerIndex].maxSize;
				groupInfo[winnerIndex].status = 1;
				for (var i=0; i<groupInfo[winnerIndex].neigh.length; i++)
				{
					var neighborIndex = groupInfo[winnerIndex].neigh[i];
					if (groupInfo[neighborIndex].status == 0)
					{
						g.subgroups.push(gtree.groups[neighborIndex]);
						g.count += gtree.groups[neighborIndex].count;
						g.maxSize = Math.max(g.maxSize, gtree.groups[neighborIndex].maxSize);
						groupInfo[neighborIndex].status = 1;
					}
				}
				
				// scan all groups and decrement the degrees of
				// those that have the groups under process as their neighbors.
				for (var i=0; i<N; i++)
				{
					for (var j=0; j<groupInfo[i].neigh.length; j++)
					{
						var neighborIndex = groupInfo[i].neigh[j];
						if (groupInfo[neighborIndex].status == 1)
						{
							groupInfo[i].degree--;
						}
					}
				}
				
				// mark the groups under process as deleted
				for (var i=0; i<N; i++)
				{
					if (groupInfo[i].status == 1)
						groupInfo[i].status = 2;
				}
				
				// calculate new group's subedges
				for (var i=1; i<g.subgroups.length; i++)
				{
					g.subedges.push({g1: 0, g2: i, w: 0.5});		// TODO: find correct weight
				}
				
				// add the new group to the set of new groups
				newGroups.push(g);
			}
			
			// calculate new edges
			// first enhance each element of gtree by adding a 
			// membership variable denoting in which group it belongs to
			for (var i=0; i<newGroups.length; i++)
			{
				for (var j=0; j<newGroups[i].subgroups.length; j++)
				{
					newGroups[i].subgroups[j].membership = i;
				}
			}
			// now take each edge of gtree and add it to the newEdges if it
			// connects two different groups
			for (var i=0; i<gtree.edges.length; i++)
			{
				var g1 = gtree.edges[i].g1;
				var g2 = gtree.edges[i].g2;
				var w = gtree.edges[i].w;
				
				var m1 = gtree.groups[g1].membership;
				var m2 = gtree.groups[g2].membership;
				
				if (m1 != m2)
				{
					newEdges.push({g1: m1, g2: m2, w: w});
				}
			}
			// delete membership information
			for (var i=0; i<newGroups.length; i++)
			{
				for (var j=0; j<newGroups[i].subgroups.length; j++)
				{
					delete newGroups[i].subgroups[j].membership;
				}
			}			
			//console.log(gtree);
			
			
			// return result
			var result = new GTree(null);
			result.groups = newGroups;
			result.edges = newEdges;			
			return result;
		};
		
		
		var expand = function(gtree)
		{
			var newGroups = [];
			var newEdges = [];
			
			
			// copy gtree's groups and edges to the new ones
			for (var i=0; i<gtree.groups.length; i++)
			{
				if (gtree.groups[i].subgroups.length > 0)
					newGroups.push(gtree.groups[i].subgroups[0]);
				else
					newGroups.push(new Group(gtree.groups[i].data));
			}
			for (var i=0; i<gtree.edges.length; i++)
			{
				newEdges.push(gtree.edges[i]);
			}
			
			// expand each group
			var index = gtree.groups.length;
			for (var i=0; i<gtree.groups.length; i++)
			{
				for (var j=1; j<gtree.groups[i].subgroups.length; j++)
				{
					newGroups.push(gtree.groups[i].subgroups[j]);
					newEdges.push({g1: i, g2: index, w: 0.5});		// TODO: find the correct weight
					index++;
				}
			}
			
			
			// return result
			var result = new GTree(null);
			result.groups = newGroups;
			result.edges = newEdges;			
			return result;
		};
		
		
		// public interface
		return {
			Tree: Tree,
			Group: Group,
			GTree: GTree,
			mst: mst,
			applyForcesStep: applyForcesStep,
			simplify: simplify,
			expand: expand
		};
	}
);

