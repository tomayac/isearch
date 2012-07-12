define(
	"mylibs/visualization/mstVisualizer/CanvasExtension",
	[],
	
	function()
	{
		// drawing functions --------------------------------------------------------------
		
		// clears the canvas
		var clear = function()
		{
			var context = this.getContext("2d");
			
			context.clearRect(0, 0, this.width, this.height);
		}
		
		
		// transforms the coordinates of a point in the view to screen coordinates
		var project = function(x, y)
		{
			var retX = (x - this.view.x) * (this.width / this.view.w);
			var retY = this.height - (y - this.view.y) * (this.height / this.view.h);

			return {x: retX, y: retY};
		};
		
		
		// transforms screen coordinates to the coordinates of a point in the view
		var unproject = function(x, y)
		{
			var retX = x * (this.view.w / this.width) + this.view.x;
			var retY = this.view.h - y * (this.view.h / this.height) + this.view.y;
			
			return {x: retX, y: retY};
		};
		

		// In the following drawing functions, the points given as arguments
		// are in view coordinates. Internally they are transformed to screen coordinates.
		
		// draws a line from (x1, y1) to (x2, y2), with a specific color
		var drawLine = function(x1, y1, x2, y2, color)
		{
			var p1 = this.project(x1, y1);
			var p2 = this.project(x2, y2);
			
			var context = this.getContext("2d");

			context.beginPath();
			context.moveTo(p1.x, p1.y);
			context.lineTo(p2.x, p2.y);
			context.strokeStyle = color;
			context.stroke();
		};
		
		
		// draws a circle centered at (x, y) with radius r, and specified stroke and fill colors
		// radius is in screen units (i.e. pixels) (it is not altered by view change)
		var drawCircle = function(x, y, r, strokeColor, fillColor)
		{
			var p = this.project(x, y);
			
			var context = this.getContext("2d");

			context.beginPath();
			context.arc(p.x, p.y, r, 0, 2 * Math.PI);
			context.fillStyle = fillColor;
			context.fill();
			context.strokeStyle = strokeColor;
			context.stroke();
		}
		
		
		// draws a rectangle centered at (x, y) with specified width, height and 
		// stroke and fill colors
		// width and height are in pixels (they are not altered by view changes)
		var drawRectangle = function(x, y, w, h, stroke, fill)
		{
			var p = this.project(x, y);
			
			var context = this.getContext("2d");

			context.beginPath();
			context.rect(p.x-w/2, p.y-h/2, w, h);
			context.fillStyle = fill;
			context.fill();
			context.strokeStyle = stroke;
			context.stroke();
		}
		
		
		// draws an image centered at (x, y) with specific size and offseted in x and y directions
		// size, xOffset and yOffset are in pixels, i.e. they are not altered by view changes
		var drawImage = function(image, x, y, size, xOffset, yOffset)
		{
			var p = this.project(x, y);
			
			var context = this.getContext("2d");
							
			context.drawImage(image, p.x-size/2+xOffset, p.y-size/2+yOffset, size, size);
		}
		

		// prints a specified text on the screen, with its bottom-left corner at (x, y), with specific color
		// and offseted in the x and y directions.
		// xOffset and yOffset are in pixels, i.e. they are not altered by view changes
		var drawText = function(text, x, y, color, xOffset, yOffset)
		{
			var p = this.project(x, y);
			
			var context = this.getContext("2d");

			context.fillStyle = color;
			context.font ="10pt Arial";
			context.fillText(text, p.x+xOffset, p.y+yOffset);
		}
		
		
		// draws a fuzzy border of specified width and color around canvas.
		// color must be as {r: 255, g: 255, b: 255}.
		var drawMask = function(width, color)
		{
			var context = this.getContext("2d");
			
			var grad = null;
			// left border
			context.beginPath();
			context.rect(0, 0, width, this.height);
			grad = context.createLinearGradient(0, 0, width, 0);
			grad.addColorStop(0, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 1)");
			grad.addColorStop(1, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0)");
			context.fillStyle = grad;
			context.fill();
			// right border
			context.beginPath();
			context.rect(this.width-width, 0, width, this.height);
			grad = context.createLinearGradient(this.width-width, 0, this.width, 0);
			grad.addColorStop(0, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0)");
			grad.addColorStop(1, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 1)");
			context.fillStyle = grad;
			context.fill();
			// top border
			context.beginPath();
			context.rect(0, 0, this.width, width);
			grad = context.createLinearGradient(0, 0, 0, width);
			grad.addColorStop(0, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 1)");
			grad.addColorStop(1, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0)");
			context.fillStyle = grad;
			context.fill();
			// bottom border
			context.beginPath();
			context.rect(0, this.height-width, this.width, width);
			grad = context.createLinearGradient(0, this.height-width, 0, this.height);
			grad.addColorStop(0, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 0)");
			grad.addColorStop(1, "rgba(" + color.r + ", " + color.g + ", " + color.b + ", 1)");
			context.fillStyle = grad;
			context.fill();
		};
		
		
		var drawSquarePack = function(x, y, size, stroke, fill)
		{
			var p = this.project(x, y);
		
			var context = this.getContext("2d");
			
			var angles = [0.1, -0.2];
			
			for (var i=0; i<angles.length; i++)
			{
				context.save();
				context.translate(p.x, p.y);
				context.rotate(angles[i]);
				
				context.beginPath();
				context.rect(-size/2, -size/2, size, size);
				context.fillStyle = fill;
				context.fill();
				context.strokeStyle = stroke;
				context.stroke();
				
				context.restore();
			}
		};
		
		
		// extend function ----------------------------------------------------------------------
		
		// extends a given canvas by adding all the above functionality
		var extend = function(canvas)
		{
			// desired view (this area will be shown on the screen, adjusted to fill it)
			canvas.view = {x: -1, y: -1, w: 2, h: 2};
			
			// initialize zoom level
			canvas.zoomLevel = 0;
			
			// adjust view to fit canvas
			var oldCenter = {
				x: canvas.view.x + canvas.view.w / 2,
				y: canvas.view.y + canvas.view.h / 2
			};
			var viewRatio = canvas.view.w / canvas.view.h;
			var canvasRatio = canvas.width / canvas.height;
			if (canvasRatio > viewRatio)
			{
				// canvas is more elongated in the horizontal direction than view
				
				canvas.view.w = canvas.view.h * canvasRatio;
				canvas.view.x = oldCenter.x - canvas.view.w / 2;
			}
			else
			{
				// canvas is more elongated in the vertical direction than 
				// view (or they have the same ratio)
				
				canvas.view.h = canvas.view.w / canvasRatio;
				canvas.view.y = oldCenter.y - canvas.view.h / 2;
			}
			
			// cursor
			canvas.style.cursor = "-moz-grab";
			
			// add functionality
			canvas.clear = clear;
			canvas.project = project;
			canvas.unproject = unproject;
			canvas.drawLine = drawLine;
			canvas.drawCircle = drawCircle;
			canvas.drawRectangle = drawRectangle;
			canvas.drawImage = drawImage;
			canvas.drawText = drawText;
			canvas.drawMask = drawMask;
			canvas.drawSquarePack = drawSquarePack;
		};
		
		
		// module's public interface
		return {
			extend: extend
		};
	}
);
