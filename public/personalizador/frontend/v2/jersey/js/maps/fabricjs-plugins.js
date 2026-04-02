/**
 *  @author Marcel Barbosa Pinto
 *  @email marcel.power@gmail.com
 */

(function(global){

	"use strict";
  
	var fabric = global.fabric || (global.fabric = { }),
		piBy2   = Math.PI * 2,
		extend = fabric.util.object.extend;
  
	if (fabric.TransformGroup) {
	  fabric.warn('fabric.TransformGroup is already defined.');
	  return;
	}

	fabric.TransformGroup = fabric.util.createClass(fabric.Group, /** @lends fabric.TransformGroup.prototype */ {

		render: function(ctx, noTransform) {
			// do not render if object is not visible
			if (!this.visible) return;
	  
			ctx.save();
			this.transform(ctx);

			var m = this.transformMatrix;
			if (m) {
				this.left = m[4];
				this.top = m[5];
				ctx.transform(m[0], m[1], m[2], m[3], 0, 0);
			}
			/*debug rect
			ctx.globalAlpha = .5;
			ctx.fillStyle = "#00ccFF";
			ctx.fillRect(
			  -this.width/2,
			  -this.height/2,
			  this.width,
			  this.height
			);
			*/
			ctx.globalAlpha = this.opacity;
			var groupScaleFactor = Math.max(this.scaleX, this.scaleY);
			
			this.clipTo && fabric.util.clipContext(this, ctx);
	  
			//The array is now sorted in order of highest first, so start from end.
			for (var i = 0, len = this._objects.length; i < len; i++) {
	  
			  var object = this._objects[i],
				  originalScaleFactor = object.borderScaleFactor,
				  originalHasRotatingPoint = object.hasRotatingPoint;
	  
			  // do not render if object is not visible
			  if (!object.visible) continue;
	  
			  object.borderScaleFactor = groupScaleFactor;
			  object.hasRotatingPoint = false;
	  
			  object.render(ctx);
	  
			  object.borderScaleFactor = originalScaleFactor;
			  object.hasRotatingPoint = originalHasRotatingPoint;
			}
			this.clipTo && ctx.restore();

			ctx.restore();
			ctx.save();

			this.transform(ctx);
			this.setCoords();

			if (!noTransform && this.active) {
			  this.drawBorders(ctx);
			  this.drawControls(ctx);
			}
			ctx.restore();
			
		  },
		  
		  toDataURL: function(options) {
				options || (options = { });
				this.setCoords();
				var el = fabric.util.createCanvasElement(),
					boundingRect = {height:620, width:620, left:0, top:0};//this.getBoundingRect();
				console.log(this.oCoords, this.getBoundingRect(), this.width, this.height);
				el.width = boundingRect.width;
				el.height = boundingRect.height;
		  
				fabric.util.wrapElement(el, 'div');
				var canvas = new fabric.Canvas(el);
		  
				// to avoid common confusion https://github.com/kangax/fabric.js/issues/806
				if (options.format === 'jpg') {
				  options.format = 'jpeg';
				}
		  
				if (options.format === 'jpeg') {
				  canvas.backgroundColor = '#fff';
				}
		  
				var origParams = {
				  active: this.get('active'),
				  left: this.getLeft(),
				  top: this.getTop()
				};
		  
				this.set('active', false);
				this.setPositionByOrigin(new fabric.Point(el.width / 2, el.height / 2), 'center', 'center');
		  
				canvas.add(this);
				var data = canvas.toDataURL(options);
		  
				this.set(origParams).setCoords();
		  
				canvas.dispose();
				canvas = null;
		  
				return data;
			  }
	});

})(typeof exports !== 'undefined' ? exports : this);

(function(global){

	"use strict";
  
	var fabric = global.fabric || (global.fabric = { }),
		piBy2   = Math.PI * 2,
		extend = fabric.util.object.extend;
  
	if (fabric.BitmapText) {
		fabric.warn('fabric.BitmapText is already defined.');
		return;
	}
  
	fabric.BitmapText = fabric.util.createClass(fabric.Object, /** @scope fabric.BitmapText.prototype */ {
		type: 'bitmap-char',
		
		initialize: function(element, color, options) {
			options = options || { };
			this.element = element;
			this.color = color;
			this.callSuper('initialize', options);
		},
	
		toObject: function(propertiesToInclude) {
			return extend(this.callSuper('toObject', propertiesToInclude), {
			});
		},
	
		toSVG: function() {
			var markup = [];
			return markup.join('');
		},
	  
		render: function(ctx, noTransform) {
			ctx.save();
	
			var m = this.transformMatrix;
			var isInPathGroup = this.group && this.group.type !== 'group';
	
			if (isInPathGroup) {
				ctx.translate(-this.group.width/2 + this.width/2, -this.group.height/2 + this.height/2);
			}
			if (m) {
				ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
			}
			if (!noTransform) {
				this.transform(ctx);
			}
			
			this._setShadow(ctx);
			this.clipTo && fabric.util.clipContext(this, ctx);
			this._render(ctx);
			this.clipTo && ctx.restore();
			this._removeShadow(ctx);
			/*
			if (this.fill) {
				ctx.fill();
			}
			if (this.stroke) {
				ctx.stroke();
			}
			*/
			if (this.active && !noTransform) {
				this.drawBorders(ctx);
				this.drawControls(ctx);
			}
			ctx.restore();
		},
		_getClosestValueFromArray: function(array, target) {
			var distance = _.map(array, function(val) {
				return Math.abs(val - target);
			});
			return array[_.lastIndexOf(distance, _.min(distance))];
		},
		_render: function(ctx) {
			
			var actualScale = 1;
			
			//get ascendants tranformMatrix to calc current scale	
			var g = this.group;
			while(g){
				var m = g.transformMatrix;
				if (m) {
					actualScale *= m[3];
				}
				g = g.group;
			}
			
			//get scale array
			var atlasRectScale = _.pluck(this.fontMap, "scale");
			var closestScaleAvailable = this._getClosestValueFromArray(atlasRectScale, actualScale);
			var atlasRect = this.fontMap[_.lastIndexOf(atlasRectScale, closestScaleAvailable)]["rect"].split(" ");
			
			//debug rect
			if(this.debugMode){
				ctx.globalAlpha = .3;
				ctx.fillStyle = "#CCCCFF";
				ctx.fillRect(
					-this.width/2,
					-this.height/2,
					this.width,
					this.height
				);
				ctx.globalAlpha = 1;
			}
			
			ctx.globalAlpha = this.group ? (ctx.globalAlpha * this.opacity) : this.opacity;
			ctx.translate(-this.width / 2, -this.height / 2);
			
			//letter canvas
			var imageCanvas = document.createElement('canvas');
			imageCanvas.width = this.width;
			imageCanvas.height = this.height;
  			var imageCtx = imageCanvas.getContext('2d');
			imageCtx.drawImage(
				this.element,
				this.sx * closestScaleAvailable + +atlasRect[0],
				this.sy * closestScaleAvailable + +atlasRect[1],
				this.sw * closestScaleAvailable,
				this.sh * closestScaleAvailable,
				0,
				this.charBaseline,
				this.width,
				this.height
			);
			
			if(this.color){
				var filter = new fabric.Image.filters.Tint({
					color: this.color
				});
				filter.applyTo(imageCanvas);
			}

			//position
			ctx.drawImage(imageCanvas, 0, this.charBaseline);
		},
		complexity: function() {
			return 1;
		}
	});

	fabric.BitmapText.ATTRIBUTE_NAMES = 'cx cy rx ry fill fill-opacity opacity stroke stroke-width transform'.split(' ');
	
	fabric.BitmapText.fromElement = function(element, options) {
	  return new fabric.BitmapText(element, null, options);
	};
	
	fabric.BitmapText.fromText = function(font, text, color, options) {
		var _t = this;
		var letters = [];
		if(!text && !font){
			return letters;
		}
		var fontMap = font.positionMap.Font["map"];
		var chars = font.positionMap.Font.Char;
		var charWidth = 0;
		var currentPosition = 0;
		var scale = 1;
		_.each(text, function(value){
			var charData = _.findWhere(chars, {"code" : value});
			
			if(charData){
				charWidth = Number(charData["width"]);						
				var charOffset = charData["offset"].split(" ");
				var charRect = charData["rect"].split(" ");
				
				var positionData = {
					sx: +charRect[0],
					sy: +charRect[1],
					sw: Math.max(1, +charRect[2]),
					sh: Math.max(1, +charRect[3]),
					dx: currentPosition + Number(charOffset[0]),
					dy: Number(charOffset[1]),
					dw: Math.max(1, +charRect[2]),
					dh: Math.max(1, +charRect[3]),
					fontMap: fontMap,
					charBaseline : charData["baseline"] ? +charData["baseline"] : 0
				};
				currentPosition += charWidth;

				//create char	
				var props = {
					originY: "bottom",
					originX: "center",
					width:positionData.dw,
					height:positionData.dh,
					scaleX:scale,
					scaleY:scale,
					charOffset: {x: Number(charOffset[0]), y: Number(charOffset[1])}
				};
				//for single line text
				if (options.setLetterPos) {
					props.originX = "left";
					props.left = positionData.dx * scale;
				}
				if(options.debugMode){
					positionData.debugMode = true;
				}
				var letter = new fabric.BitmapText(font.element, color, positionData);
				letter.set(props);
				
				letters.push(letter);
			}
		});
		return letters;
	};

})(typeof exports !== 'undefined' ? exports : this);