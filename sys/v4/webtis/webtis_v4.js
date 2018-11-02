/**
*
* DenshiKokudo Web API for OpenLayers
*
* Copyright 2012, Geospatial Information Authority of Japan, released under the FreeBSD
* license. Please see http://portal.cyberjapan.jp/sys/v4/webtis/license.txt
* for the full text of the license.
*
**/

/**
*
* Contains portions of OpenLayers.js <http://openlayers.org/>
*
* Copyright 2005-2011 OpenLayers Contributors
*
* Licensed under the FreeBSD license.
* Please see http://svn.openlayers.org/trunk/openlayers/license.txt
* for the full text of the license.
*
**/

/* ======================================================================
    header.js
   ====================================================================== */

var webtis = new Object();
webtis.Feature = new Object();
webtis.Geometry = new Object();
webtis.Format = new Object();
webtis.Handler = new Object();
webtis.Control = new Object();
webtis.Layer = new Object();
webtis.Renderer = new Object();
webtis.Popup = new Object();

webtis.SERVER_URL = {
		BASEMAP_TILE_SERVER : "http://cyberjapandata.gsi.go.jp/sqras/all",								//デフォルトのサーバ
		BASEMAP_TILE_SERVER2 : "http://cyberjapandata2.gsi.go.jp/sqras/all",							//特定のファイル群だけはこっちのサーバ
		BASEMAP_TILE_SERVER3 : "http://geolib.gsi.go.jp/tiles/thematicmap",								//地理空間情報ライブラリサーバ
		BASEMAP_TILE_SERVER4 : "http://cyberjapandata.gsi.go.jp.cdngc.net/sqras/all",					//新彩色地図用サーバ
		SEARCH_TILE_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/search-tile.php",
//		METADATA_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/get-metadata_test2.php",
//		AVAILABLE_MAP_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/get-available-maps_test2.php",
		METADATA_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/get-metadata.php",
		AVAILABLE_MAP_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/get-available-maps.php",
		GEOTIFF_TILE_SERVER : "http://gp.cyberjapan.jp/cjp4/service/get_geotiff_tile",
		CONVERT_TO_JSON_SERVER : 'http://gp.cyberjapan.jp/cjp4/service/convert_to_json',
		CONVERT_FROM_JSON_SERVER : 'http://gp.cyberjapan.jp/cjp4/service/convert_from_json',
		SHOW_MAP_SERVER : 'http://gp.cyberjapan.jp/cjp4/service/show_map',
		SAVE_JSON_SERVER : 'http://gp.cyberjapan.jp/cjp4/service/save_json',
		CREATE_PDF_SERVER : 'http://gp.cyberjapan.jp/cjp4/service/create_pdf',
		TRANSPARENT_FILE : 'http://cyberjapandata.gsi.go.jp/sqras/transparent.png',
//		VLCD_TILE_SERVER : 'http://cyberjapandata.gsi.go.jp/xyz/VLCD',							//火山土地条件図
//		VBM_TILE_SERVER : 'http://geolib.gsi.go.jp/tiles/thematicmap/VBM',								//火山基本図
		LUM4BL_TILE_SERVER : 'http://cyberjapandata.gsi.go.jp/xyz/LUM4BL',
		GEOLIB_TILE_SERVER : 'http://geolib.gsi.go.jp/tiles/thematicmap',
		GEOLIB_TILE_SERVER0 : 'http://geolib.gsi.go.jp/tiles/',
		GEOLIB_TILE_SERVER2 : 'http://geolib.gsi.go.jp/tiles2',
		SAIGAI_SERVER : 'http://saigai.gsi.go.jp/',
		XYZ_TILE_SERVER : 'http://cyberjapandata.gsi.go.jp/xyz',
		LIB_TILE_SERVER : 'http://cyberjapandata.gsi.go.jp/sqras/all'	// 英語版
};

webtis.ATTRIBUTE_TYPE = {
		NONE : "0",		// 凡例を表示しない
		MAP : "1",		// マップ
		OVERLAY : "2",	// オーバーレイ
		PHOTO : "3"		// 写真
};

webtis.TILE_URL = {
	TRANSPARENT : 'http://cyberjapandata.gsi.go.jp/sqras/transparent.png',	// 透過
	BLUE : 'http://cyberjapandata.gsi.go.jp/sqras/no_map.png',				// 青タイル
	NODATA : 'http://cyberjapandata.gsi.go.jp/sqras/white.png'				// NO DATA
};

// 初期表示時のタイルの1辺の長さ
webtis.TILE_SIDE = 256;
// 初期表示時のレゾリューション
webtis.TILE_BASE_RESOLUTIONS = [
	156543.03390625, 78271.516953125,
	39135.7584765625, 19567.87923828125,
	9783.939619140625, 4891.9698095703125,
	2445.9849047851562, 1222.9924523925781,
	611.4962261962891, 305.74811309814453,
	152.87405654907226, 76.43702827453613,
	38.218514137268066, 19.109257068634033,
	9.554628534317017, 4.777314267158508,
	2.388657133579254, 1.194328566789627,
	0.5971642833948135, 0.29858214169740677
];

/* ======================================================================
    Layer/Vector.js
   ====================================================================== */

/**
 * Class: webtis.Layer.Vector
 * 電子国土Webシステム APIで電子国土Webシステム用XMLデータの地物を表示するレイヤー
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
webtis.Layer.Vector = OpenLayers.Class(OpenLayers.Layer.Vector, {

	displayLevel: "all",

	initialize: function(name, options) {
		this.renderers = [webtis.Renderer.SVG, webtis.Renderer.VML, 'Canvas'];
		OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);
		/**
		if (window.console) {
			window.console.log(this.renderer.CLASS_NAME);
		}
		**/
	},

	insertFeatures: function(features, options) {
		if (!OpenLayers.Util.isArray(features)) {
			features = [features];
		}

		var notify = !options || !options.silent;
		if(notify) {
			var event = {features: features};
			var ret = this.events.triggerEvent("beforefeaturesadded", event);
			if(ret === false) {
				return;
			}
			features = event.features;
		}

		var featuresAdded = [];
		for (var i=0, len=features.length; i<len; i++) {
			if (i != (features.length - 1)) {
				this.renderer.locked = true;
			} else {
				this.renderer.locked = false;
			}
			var feature = features[i];

			if (this.geometryType &&
				!(feature.geometry instanceof this.geometryType)) {
				var throwStr = OpenLayers.i18n('componentShouldBe',
						{'geomType':this.geometryType.prototype.CLASS_NAME});
				throw throwStr;
			}

			feature.layer = this;

			if (!feature.style && this.style) {
				feature.style = OpenLayers.Util.extend({}, this.style);
			}

			if (notify) {
				if(this.events.triggerEvent("beforefeatureadded",
						{feature: feature}) === false) {
					continue;
				};
				this.preFeatureInsert(feature);
			}

			featuresAdded.push(feature);
			this.features.unshift(feature);
			this.drawFeature(feature);

			if (notify) {
				this.events.triggerEvent("featureadded", {
					feature: feature
				});
				this.onFeatureInsert(feature);
			}
		}

		if(notify) {
			this.events.triggerEvent("featuresadded", {features: featuresAdded});
		}
	},

	drawFeature: function(feature, style) {

		// don't try to draw the feature with the renderer if the layer is not
		// drawn itself
		if (!this.drawn) {
			return;
		}

		var orgStyle = style;

		// 線の選択の特別なロジック
		if ((this.styleType == "string" || this.styleType == "line") && orgStyle == "select") {
			style = "default";
		}

		if (typeof style != "object") {
			if(!style && feature.state === OpenLayers.State.DELETE) {
				style = "delete";
			}
			var renderIntent = style || feature.renderIntent;

			if (feature.style instanceof OpenLayers.Style) {
				style = feature.style.createSymbolizer(feature);
			} else if (feature.style instanceof OpenLayers.StyleMap) {
				style = feature.style.createSymbolizer(feature, renderIntent);
			} else {
				style = feature.style || this.style;
				if (!style) {
					style = this.styleMap.createSymbolizer(feature, renderIntent);
				}
			}
		} else if (style instanceof OpenLayers.StyleMap) {
			style = style.createSymbolizer(feature, "default");
		} else if (style instanceof OpenLayers.Style) {
			style = style.createSymbolizer(feature);
		}

		if (style) {
			style.orgStyle = orgStyle;
		}

		if (!this.renderer.drawFeature(feature, style)) {
			this.unrenderedFeatures[feature.id] = feature;
		} else {
			delete this.unrenderedFeatures[feature.id];
		};

		// 画像シンボルのセレクション描画
		var className = feature.geometry.CLASS_NAME;
		if (style.display != "none") {
			if (orgStyle == 'select') {

				var geometry = null;
				var sourceNode = null;
				if (this.styleType == "symbol") {
					sourceNode = OpenLayers.Util.getElement(feature.geometry.id);

					var imageWidth = (style.graphicWidth/* + 4*/) * this.renderer.resolution;
					var imageHeight = (style.graphicHeight/* + 4*/) * this.renderer.resolution;
					geometry = new OpenLayers.Geometry.Rectangle(
							feature.geometry.x - (imageWidth/2),
							feature.geometry.y + (imageHeight/2),
							imageWidth, imageHeight);
				} else if (this.styleType == "image") {
					sourceNode = OpenLayers.Util.getElement(feature.geometry.id);

					geometry = new OpenLayers.Geometry.Rectangle(
							feature.geometry.x,
							feature.geometry.y,
							feature.geometry.width,
							feature.geometry.height);
				} else if (this.styleType == "text") {
					geometry = new webtis.Geometry.TextRectangle(feature.geometry.x, feature.geometry.y, true);
					geometry.label = feature.geometry.label;
				} else if (this.styleType == "string" || this.styleType == "line") {
					sourceNode = OpenLayers.Util.getElement(feature.geometry.id);
					var maxx = -180000000000;
					var minx =  180000000000;
					var maxy = -180000000000;
					var miny =  180000000000;
					for (var i = 0; i < feature.geometry.components.length; i++) {
						var cc = feature.geometry.components[i];
						if (maxx < cc.x) {
							maxx = cc.x;
						}
						if (minx > cc.x) {
							minx = cc.x;
						}
						if (maxy < cc.y) {
							maxy = cc.y;
						}
						if (miny > cc.y) {
							miny = cc.y;
						}
					}

					var res = this.map.getResolution();

					var strokeWidthDegX = style.strokeWidth * res;
					var width = maxx - minx;
					if (width < strokeWidthDegX) {
						width = strokeWidthDegX;
					} else {
						width += strokeWidthDegX;
					}
					var strokeWidthDegY = style.strokeWidth * res;
					var height = maxy - miny;
					if (height < strokeWidthDegY) {
						height = strokeWidthDegY;
					} else {
						height += strokeWidthDegY;
					}

					geometry = new OpenLayers.Geometry.Rectangle(
							minx - (strokeWidthDegX/2),
							maxy + (strokeWidthDegY/2),
							width, height);
				}

				if (geometry) {

					var style = this.renderer.applyDefaultSymbolizer({
						strokeColor: "#0000ff",
						strokeWidth: 2,
						fill: false
					});

					if (this.styleType == "text") {
						var defaultStyle = this.styleMap.createSymbolizer(feature, "default");
						style.label = feature.geometry.label;
						style.labelAlign = defaultStyle.labelAlign;
						style.fontSizeNumber = defaultStyle.fontSizeNumber;
					}

					var node = this.renderer.nodeFactory(feature.geometry.id + "_sel", this.renderer.getNodeType(geometry, style));
					// Set the data for the node, then draw it.
					node._featureId = feature.id;
					node._boundsBottom = geometry.getBounds().bottom;
					node._geometryClass = geometry.CLASS_NAME;
					node._style = style;

					var drawResult = this.renderer.drawGeometryNode(node, geometry, style);
					if(drawResult === false) {
					} else {
						node = drawResult.node;
					}
					if (sourceNode)
						this.renderer.vectorRoot.insertBefore(node, sourceNode);
				}
			} else {
				// セレクション削除
				this.forceUnselect(feature);
			}
		}

	},

	forceUnselect: function(feature) {
		var node = OpenLayers.Util.getElement(feature.geometry.id + "_sel");
		if (node) {
			node.parentNode.removeChild(node);
			return true;
		}
		return false;
	},

	calculateInRange: function() {
		/**
		if (this.visibility != true) {
			return false;
		}
		**/
		var inRange = false;
		if (this.alwaysInRange) {
			inRange = true;
		} else {
			if (this.map.baseLayer.CLASS_NAME == "webtis.Layer.BaseMap") {
				if (this.displayLevel != undefined) {
					var levels = null;
					if (typeof this.displayLevel == "number") {
						levels = [("" + displayLevel)];
					} else if (typeof this.displayLevel == "string") {
						if (this.displayLevel == "all") {
							return true;
						}
						if (this.displayLevel.match(/ /)) {
							levels = this.displayLevel.split(' ');
						} else {
							levels = this.displayLevel.split(',');
						}
					}
					if (levels) {
						var zoom = this.map.getZoom();
						var jsgiLevel = parseInt(this.map.baseLayer.getJSGILevel());
						for (var i = 0; i<levels.length; i++) {
							var dl = parseInt(levels[i]);
							if (dl == jsgiLevel) {
								return true;
							}
						}
					}
					return false;
				} else {
					return true;
				}
			}
			return true;
		}
		return inRange;
	},

	setDisplayLevel: function(displayLevel) {
		if (!displayLevel) {
			displayLevel = 'all';
		}
		this.displayLevel = displayLevel;
		if (displayLevel == 'all') {
			this.alwaysInRange = true;
		} else {
			this.alwaysInRange = false;
		}
		if (this.affixStyle) {
			this.affixStyle.displaylevel = displayLevel;
		}
		if (this.map) {
			this.inRange = this.calculateInRange();
			this.moveTo(this.getExtent(), true, false);
		}
	},

	setGroupVisibility: function(groupName, visible) {
		for (var i = this.features.length - 1; i >= 0; i--) {
			if (groupName == this.features[i].groupName) {
				this.features[i].style.display = visible ? "visible" : "none";
			}
		}
	},

	removeGroup: function(groupName) {
		var toBeRemoved = new Array();
		for (var i = 0; i < this.features.length; i++) {
			if (groupName == this.features[i].groupName) {
				toBeRemoved.push(this.features[i]);
			}
		}
		if (toBeRemoved.length > 0) {
			this.removeFeatures(toBeRemoved);
		}
	},

	CLASS_NAME: "webtis.Layer.Vector"
});
/* ======================================================================
    Format/JSGIJSON.js
   ====================================================================== */

/**
 * Class: webtis.Format.JSGIJSON
 * 電子国土Webシステム APIの電子国土Webシステム用XMLデータから変換したJSON形式のデータを読み込むためのクラス
 *
 * Inherits from:
 *  - <OpenLayers.Format>
 */
webtis.Format.ParseJSON = {};
webtis.Format.Parse = {};

webtis.Format.ParseJSON.USE_GEODESTIC_CIRCLE = true;

webtis.Format.ParseJSON.Symbol = function(node) {

	this.uri = null;
	this.size = Number.NaN;
	this.dynamic = false;

	this.uri = node.uri;
	var sizeString = null;
	if (node.size) {
		sizeString = node.size;
	} else if (node.width) {
		sizeString = node.width;
	}
	if (sizeString) {
		var sizes = sizeString.split(",");
		this.size = parseInt(sizes[0]);
		if (sizes[1] == 'dynamic') {
			this.dynamic = true;
		}
	}
};

webtis.Format.ParseJSON.Style = function(node) {

	// 共通
	this.name = "設定されていない";
	this.type = "symbol";
	this.displayLevel = "all";
	this.display = false;
	this.transparent = false;
	this.selection = false;
	this.symbol = null;
	this.style = null;
	this.styleKind = "system";
	this.rgb = null;
	this.width = 1;
	this.dynamic = false;

	// polygon等
	this.brush = "solid";
	this.paint = true;
	this.brgb = null;
	this.hrgb = null;

	// text
	this.mode = "cm";
	this.fontFamily = null;
	this.fontSize = "12px";
	this.fontWeight = 'normal';
	this.fontSizeDynamic = false;

	// image
	this.plane = "overlay";

	function createRGB(rawrgb) {
		var ret = null;
		if (rawrgb) {
			ret = rawrgb.split(",");
			ret[0] = parseInt(ret[0]);
			ret[1] = parseInt(ret[1]);
			ret[2] = parseInt(ret[2]);
		}
		return ret;
	}

	this.isPolygonFill = function() {
		return (this.hrgb != null);
	};

	this.isBackgroundFill = function() {
		return (this.paint && this.brgb != null);
	};

	for (var key in node) {
		if (key == 'name') {
			this.name = node[key];
		} else if (key == 'type') {
			this.type = node[key].toLowerCase();
		} else if (key == 'displaylevel') {
			this.displayLevel = node[key];
		} else if (key == 'display') {
			this.display = (node[key].toLowerCase() == 'on');
		} else if (key == 'tranceparent' || key == 'transparent') {
			this.transparent = (node[key].toLowerCase() == 'on');
		} else if (key == 'selection') {
			this.selection = (node[key].toLowerCase() == 'on');
		} else if (key == 'style') {
			var s = node[key];
			if (s["kind"]=="SYSTEM") {
				this.style = s["value"].toLowerCase();
			} else {
				this.style = "solid";// USERには、非対応
			}
		} else if (key == 'symbol') {
			this.symbol = new webtis.Format.ParseJSON.Symbol(node[key]);
		} else if (key == 'width') {
			var sizeString = node[key];
			var sizes = sizeString.split(",");
			this.width = parseFloat(sizes[0]);
			if (sizes[1] == 'dynamic') {
				this.dynamic = true;
			}
		} else if (key == 'rgb') {
			this.rgb = createRGB(node[key]);
		} else if (key == 'brgb') {
			this.brgb = createRGB(node[key]);
		} else if (key == 'hrgb') {
			this.hrgb = createRGB(node[key]);
		} else if (key == 'paint') {
			this.paint = (node[key].toLowerCase() == 'on');
		} else if (key == 'brush') {
			this.brush = node[key];
		} else if (key == 'mode') {
			this.mode = webtis.Format.Parse.mapTextAlignment(node[key]);
			} else if (key == 'font') {
				var fontobj = node[key];
				for (var fontkey in fontobj) {
					if (fontkey == 'name') {
						this.fontFamily = fontobj[fontkey];
					} else if (fontkey == 'style') {
						this.fontWeight = webtis.Format.Parse.mapTextStyle(fontobj[fontkey]);
					} else if (fontkey == 'size') {
						var sizeString = fontobj[fontkey];
						var sizes = sizeString.split(",");
						this.fontSize = parseFloat(sizes[0]);
						if (sizes[1] == 'dynamic') {
							this.fontSizeDynamic = true;
						}
					}
				}
			} else if (key == 'plane') {
				this.plane = node[key];
			}
	}
};

webtis.Format.ParseJSON.Point = function(json, node) {

	this.id = null;
	this.name = node.name;
	this.description = node.description?node.description:"";

	var attrString = node.attribute;
	this.attributes = webtis.Format.ParseJSON.parseAttribute(attrString);

	this.crs = node.crs;
	this.geometry = json.readGeoJSON(node.geometry);
};

webtis.Format.ParseJSON.Curve = function(json, node) {

	this.id = null;
	this.name = node.name;
	this.description = node.description?node.description:"";

	var attrString = node.attribute;
	this.attributes = webtis.Format.ParseJSON.parseAttribute(attrString);

	this.crs = node.crs;
	var lineGeom = json.readGeoJSON(node.geometry);
	this.line = { 'segment' : lineGeom.components };

};

webtis.Format.ParseJSON.parseAttribute = function(attrString) {
	var attributes = new Array();
	if (attrString == null) {
		return attributes;
	}
	var index = -1;
	if (attrString.indexOf("=")==-1) {
		// v2の場合、属性名がない
		attributes.push({"name":"","value":attrString.replace(/,=/g,"\n")});
	} else if (attrString.indexOf("　=")==0) {
		// 簡易地図作成の場合
		attrString = attrString.substring(2);
		var tokens = attrString.split(",=");
		for (var i = 0; i < tokens.length;i++) {
			attributes.push({
				"name" : "",
				"value":tokens[i]});
		}
	} else {
		while ((index = attrString.indexOf("="))!=-1) {
			var key = attrString.substring(0,index);
			var startIndex = attrString.indexOf("\"");
			var endIndex = attrString.indexOf("\"",startIndex+1);
			var value;
			if (startIndex != -1 && endIndex !=-1) {
				value = attrString.substring(startIndex+1,endIndex);
				endIndex = attrString.indexOf(",",endIndex+1);
			} else {
				endIndex = attrString.indexOf(",",index);
				if (endIndex != -1) {
					value = attrString.substring(index+1,endIndex);
				} else {
					value = attrString.substring(index+1);
				}
			}
			if (endIndex != -1) {
				attrString = attrString.substring(endIndex+1);
			} else {
				attrString = "";
			}
			if (value.indexOf("\\")==value.length-1) {
				value = value.substring(0,value.length-1);
			}
			attributes.push({"name":key,"value":value.replace(/,=/g,"\n")});
		}
	}
	return attributes;
};

webtis.Format.ParseJSON.Surface = function(json, node) {

	this.id = "";
	this.name = node.name;
	this.description = node.description?node.description:"";
	var attrString = node.attribute;
	this.attributes = webtis.Format.ParseJSON.parseAttribute(attrString);

	this.crs = node.crs;
	this.polygon = json.readGeoJSON(node.geometry);
};

webtis.Format.ParseJSON.Circle = function(json, node) {

	this.name = node.name;
	this.description = node.description?node.description:"";

	var attrString = node.attribute;
	this.attributes = webtis.Format.ParseJSON.parseAttribute(attrString);

	this.center = json.readGeoJSON(node.geometry);
	this.crs = node.crs;

	this.radius = parseFloat(node.radius.value);
	this.radiusUnit = node.radius.unit;

	// ポイントですが、半径分の矩形を設定します。
	var centerLonLat = new OpenLayers.LonLat(this.center.x,this.center.y).transform(json.projection,json.resultProjection);
	var radiusm = this.radiusUnit == "km" ? this.radius * 1000:this.radius;
	var topLL = OpenLayers.Util.destinationVincenty(centerLonLat,0,radiusm).transform(json.resultProjection,json.projection);
	var rightLL = OpenLayers.Util.destinationVincenty(centerLonLat,90,radiusm).transform(json.resultProjection,json.projection);
	var bottomLL = OpenLayers.Util.destinationVincenty(centerLonLat,180,radiusm).transform(json.resultProjection,json.projection);
	var leftLL = OpenLayers.Util.destinationVincenty(centerLonLat,270,radiusm).transform(json.resultProjection,json.projection);
	var newBounds = new OpenLayers.Bounds(leftLL.lon,bottomLL.lat,rightLL.lon,topLL.lat);
	this.center.bounds = newBounds;

};

webtis.Format.ParseJSON.Annotation = function(json, node) {

	this.name = node.name;
	this.description = node.description?node.description:"";

	var attrString = node.attribute;
	this.attributes = webtis.Format.ParseJSON.parseAttribute(attrString);

	this.crs = node.crs;
	this.point = json.readGeoJSON(node.geometry);

};

webtis.Format.ParseJSON.Image = function(json, node) {

	this.name = node.name;
	this.description = node.description?node.description:"";

	var attrString = node.attribute;
	this.attributes = webtis.Format.ParseJSON.parseAttribute(attrString);

	this.crs = node.crs;
	this.lb = json.readGeoJSON(node.imageMapping.leftBottomCorner);
	this.lt = json.readGeoJSON(node.imageMapping.leftTopCorner);
	this.rb = json.readGeoJSON(node.imageMapping.rightBottomCorner);
	this.rt = json.readGeoJSON(node.imageMapping.rightTopCorner);
	this.type = node.type;
	this.src = node.src;

};

webtis.Format.ParseJSON.Layer = function(json, node) {

	this.name = null;
	this.description = null;
	this.style = null;
	this.features = [];

	if (node.name) {
		this.name = node.name;
		// 接頭辞を置換
		if (json.affix) {
			// 編集用のxmlを_affix_に置換
			this.name = this.name.replace(/^\xml./,"_affix_.");
		}
	}
	if (node.description) {
		this.description = node.description;
	}
	if (node.style) {
		this.style = new webtis.Format.ParseJSON.Style(node.style);
		// if (json.affix) {
			this.affixStyle = node.style;
		//}
	}
	if (node.data) {
		var rawFeatures = node.data;
		for (var i = 0; i < rawFeatures.length; i++) {
			if (this.style.type.toLowerCase() == 'string') {
				this.features.push(new webtis.Format.ParseJSON.Curve(json, rawFeatures[i]));
			} else if (this.style.type.toLowerCase() == 'polygon') {
				this.features.push(new webtis.Format.ParseJSON.Surface(json, rawFeatures[i]));
			} else if (this.style.type.toLowerCase() == 'circle') {
				this.features.push(new webtis.Format.ParseJSON.Circle(json, rawFeatures[i]));
			} else if (this.style.type.toLowerCase() == 'text') {
				this.features.push(new webtis.Format.ParseJSON.Annotation(json, rawFeatures[i]));
			} else if (this.style.type.toLowerCase() == 'symbol') {
				this.features.push(new webtis.Format.ParseJSON.Point(json, rawFeatures[i]));
			} else if (this.style.type.toLowerCase() == 'image') {
				this.features.push(new webtis.Format.ParseJSON.Image(json, rawFeatures[i]));
			}
		}
	}

};

webtis.Format.JSGIJSON = OpenLayers.Class(OpenLayers.Format, {

	layerName: "",
	layerDescription: "",

	extractAttributes: true,

	extractStyles: false,

	style: null,
	affix : false,
	geoJson : new OpenLayers.Format.GeoJSON(),
	projection : null,
	resultProjection : new OpenLayers.Projection("EPSG:4326"),

	initialize: function(options) {
		OpenLayers.Format.prototype.initialize.apply(this, [options]);
		if (options) {
			this.affix = options.affix;
			if (options.projection != undefined) {
				this.projection = options.projection;
			}
		}
	},

	read: function(data) {
		this.features = [];
		this.styles = {};

		this.regExes = {
			trimSpace: (/^\s*|\s*$/g),
			removeSpace: (/\s*/g)
		};

		var options = {};

		return this.parseData(data, options);
	},

	preprocessData: function(data) {
		return data.layer;
	},

	getLayerNodes: function(data) {
		return data;
	},

	createTemporaryLayerObject: function(rawNode) {
		return new webtis.Format.ParseJSON.Layer(this, rawNode);
	},

	readGeoJSON : function (data) {
		var geometry = this.geoJson.parseGeometry(data);
		if (this.projection) {
			geometry = geometry.transform(this.resultProjection,this.projection);
		}
		return geometry;
	},

	parseData: function(data, options) {
		data = this.preprocessData(data);

		if (!webtis.Format.JSGIJSON.baseProjection) {
			webtis.Format.JSGIJSON.baseProjection = new OpenLayers.Projection("EPSG:4326");
		}
		// 仮のレイヤオブジェクトを作成する
		var tempLayers = [];
		var nodes = this.getLayerNodes(data);

		for (var i=0; i<nodes.length; i++) {
			var layer = this.createTemporaryLayerObject(nodes[i]);
			if (tempLayers.length == 0) {
				tempLayers[0] = layer;
			} else {
				var layerFound = null;
				for (var j=0; j<tempLayers.length; j++) {
					if (tempLayers[j].name == layer.name) {
						if ((tempLayers[j].style != null && layer.style != null &&
									tempLayers[j].style.name == layer.style.name)||
								(tempLayers[j].style == null && layer.style == null)) {
							layerFound = tempLayers[j];
							break;
						}
					}
				}

				if (layerFound != null) {
					// レイヤ合併
					layerFound.features = layerFound.features.concat(layer.features);
				} else {
					tempLayers.push(layer);
				}
			}
		}

		var styles = {};
		var ret = [];

		for (var i=0; i<tempLayers.length; i++) {
			var tempLayer = tempLayers[i];
			var features = [];

			for (var j=0; j<tempLayer.features.length; j++) {
				var tempFeature = tempLayer.features[j];

				var style = undefined;
				var geometry = null;
				var attributes = {};
				attributes["name"] = tempFeature.name ? tempFeature.name : "";
				attributes["id"] = tempFeature.id ? tempFeature.id : "";
				attributes["uuid"] = tempFeature.uuid ? tempFeature.uuid : "";
				attributes["description"] = tempFeature.description ? tempFeature.description : "";
				attributes["attr"] = tempFeature.attributes;

				var pointRadius = Number.NaN;
				var featureStyleSize = Number.NaN;
				if (tempFeature instanceof webtis.Format.ParseJSON.Point) {
					// ポイント
					geometry = tempFeature.geometry;
					featureStyleSize = tempLayer.style.symbol.size;
				} else if (tempFeature instanceof webtis.Format.ParseJSON.Curve) {
					// 線
					geometry = new OpenLayers.Geometry.LineString(tempFeature.line.segment);
					featureStyleSize = tempLayer.style.width;
				} else if (tempFeature instanceof webtis.Format.ParseJSON.Surface) {
					// ポリゴン
					geometry = tempFeature.polygon;
					featureStyleSize = tempLayer.style.width;
				} else if (tempFeature instanceof webtis.Format.ParseJSON.Circle) {
					geometry = tempFeature.center;
					pointRadius = tempFeature.radius;
					// 1 layer -> 1 dynamic sized circle
					tempLayer.representativeRadius = tempFeature.radius;
					tempLayer.representativeRadiusUnit = tempFeature.radiusUnit;
					featureStyleSize = tempLayer.style.width;
				} else if (tempFeature instanceof webtis.Format.ParseJSON.Annotation) {
					geometry = new webtis.Geometry.TextRectangle(tempFeature.point.x, tempFeature.point.y);
					geometry.label = tempFeature.name;
					featureStyleSize = tempLayer.style.fontSize;
				} else if (tempFeature instanceof webtis.Format.ParseJSON.Image) {
					geometry = new webtis.Geometry.ImageRectangle(
							tempFeature.lt.x,
							tempFeature.lt.y,
							tempFeature.rt.x - tempFeature.lt.x,
							tempFeature.lt.y - tempFeature.lb.y);
					geometry.imageUrl = tempFeature.src;
					geometry.imageType = tempFeature.type;
					geometry.imageOpacity = tempLayer.style.transparent ? 0.5 : 1.0;
				}

				if (geometry) {
					var feature = new webtis.Feature.Vector(geometry, attributes, style);

					feature.styleSize = featureStyleSize; // 動的なスタイルの大きさの計算するため
					if (!isNaN(pointRadius)) {
						feature.pointRadius = pointRadius;
					}
					features.push(feature);
				}
			}

			// スタイル準備
			var defaultStyle = null;
			var selectStyle = null;
			var layerStyleMap = null;
			var layer = null;

			if (tempLayer.style.type == "symbol") {
				// アイコン
				if (tempLayer.style.symbol.dynamic) {
					// 縮尺によって動的に大きさがかわる
					defaultStyle = new OpenLayers.Style({
						'externalGraphic': tempLayer.style.symbol.uri,
						'graphicWidth': "${getSize}",
						'graphicHeight': "${getSize}",
						'graphicXOffset': "${getOffset}",
						'graphicYOffset': "${getOffset}",
						'graphicOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'JSGIDynamicSize' : true
					}, {
						context : {
							getSize : function(feature) {
								return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.styleSize));
							},
							getOffset : function(feature) {
								var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.styleSize));
								return -(Math.round(size/2));
							}
						}
					});
				} else {
					// 静的な大きさ
					defaultStyle = new OpenLayers.Style({
						'externalGraphic': tempLayer.style.symbol.uri,
						'graphicWidth': tempLayer.style.symbol.size,
						'graphicHeight': tempLayer.style.symbol.size,
						'graphicXOffset': -(tempLayer.style.symbol.size/2),
						'graphicYOffset': -(tempLayer.style.symbol.size/2),
						'graphicOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'JSGIDynamicSize' : false
					});
				}
			} else if (tempLayer.style.type == "circle") {
				// 円
				var strokeDynamic = false;
				if (tempLayer.representativeRadiusUnit == 'meter') {
					if (tempLayer.style.dynamic)
						strokeDynamic = true;
					tempLayer.style.dynamic = true;
				}

				if (tempLayer.style.dynamic) {
					defaultStyle = new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'strokeOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'strokeWidth' : strokeDynamic ? "${getSize}" : tempLayer.style.width,
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.hrgb[0], tempLayer.style.hrgb[1], tempLayer.style.hrgb[2]),
						'strokeLinecap' : "square",
						'fill' : true,
						'pointRadius' : "${getRadius}",
						'JSGIDynamicSize' : true
					}, {
						context : {
							getSize : function(feature) {
								if (strokeDynamic) {
									var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.styleSize));
									return (size < 1) ? 1 : size;
								} else {
									var strokeWidth = feature.styleSize;
									var radiusPixel;
									if (webtis.Format.ParseJSON.USE_GEODESTIC_CIRCLE) {
										var calcGeom = feature.geometry.clone();
										calcGeom = calcGeom.transform(feature.layer.map.getProjectionObject(),webtis.Format.JSGIJSON.baseProjection);
										var lonLat = new OpenLayers.LonLat(calcGeom.x,calcGeom.y);
										var horiLatLon = OpenLayers.Util.destinationVincenty(lonLat,90,feature.pointRadius);
										var pix = feature.layer.map.getPixelFromLonLat(lonLat.transform(webtis.Format.JSGIJSON.baseProjection,feature.layer.map.getProjectionObject()));
										horiPix = feature.layer.map.getPixelFromLonLat(horiLatLon.transform(webtis.Format.JSGIJSON.baseProjection,feature.layer.map.getProjectionObject()));
										radiusPixel = Math.round(horiPix.x - pix.x);
									} else {
										radiusPixel = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.pointRadius));
									}
									if (radiusPixel*2 > strokeWidth) {
										return strokeWidth;
									} else {
										return strokeWidth - (strokeWidth - radiusPixel*2);
									}
								}
							},
							getRadius : function(feature) {
								if (webtis.Format.ParseJSON.USE_GEODESTIC_CIRCLE) {
									var calcGeom = feature.geometry.clone();
									calcGeom = calcGeom.transform(feature.layer.map.getProjectionObject(),webtis.Format.JSGIJSON.baseProjection);
									var lonLat = new OpenLayers.LonLat(calcGeom.x,calcGeom.y);
									var horiLatLon = OpenLayers.Util.destinationVincenty(lonLat,90,feature.pointRadius);
									var pix = feature.layer.map.getPixelFromLonLat(lonLat.transform(webtis.Format.JSGIJSON.baseProjection,feature.layer.map.getProjectionObject()));
									var horiPix = feature.layer.map.getPixelFromLonLat(horiLatLon.transform(webtis.Format.JSGIJSON.baseProjection,feature.layer.map.getProjectionObject()));
									return Math.round(horiPix.x - pix.x);
								}
								return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.pointRadius));
							}
						}
					});
					selectStyle = new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : 'blue',
						'strokeOpacity' : 1,
						'strokeWidth' : 2,
						'strokeDashstyle' : 'solid',
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : "blue",
						'fill' : true,
						'pointRadius' : "${getRadius}",
						'JSGIDynamicSize' : true
					}, {
						context : {
							getRadius : function(feature) {
								if (webtis.Format.ParseJSON.USE_GEODESTIC_CIRCLE) {
									var calcGeom = feature.geometry.clone();
									calcGeom = calcGeom.transform(feature.layer.map.getProjectionObject(),webtis.Format.JSGIJSON.baseProjection);
									var lonLat = new OpenLayers.LonLat(calcGeom.x,calcGeom.y);
									var horiLatLon = OpenLayers.Util.destinationVincenty(lonLat,90,feature.pointRadius);
									var pix = feature.layer.map.getPixelFromLonLat(lonLat.transform(webtis.Format.JSGIJSON.baseProjection,feature.layer.map.getProjectionObject()));
									var horiPix = feature.layer.map.getPixelFromLonLat(horiLatLon.transform(webtis.Format.JSGIJSON.baseProjection,feature.layer.map.getProjectionObject()));
									return Math.round(horiPix.x - pix.x);
								}
								return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.pointRadius/* + (feature.pointRadius*0.2)*/));
							}
						}
					});
				} else {
					defaultStyle = new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'strokeOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'strokeWidth' : tempLayer.style.width,
						'strokeLinecap' : "square",
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.hrgb[0], tempLayer.style.hrgb[1], tempLayer.style.hrgb[2]),
						'fill' : true,
						'pointRadius' : tempLayer.representativeRadius,
						'JSGIDynamicSize' : false
					});
					selectStyle= new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : 'blue',
						'strokeOpacity' : 1,
						'strokeWidth' : 2,
						'strokeDashstyle' : 'solid',
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.hrgb[0], tempLayer.style.hrgb[1], tempLayer.style.hrgb[2]),
						'fill' : true,
						'pointRadius' : tempLayer.representativeRadius + 2,
						'JSGIDynamicSize' : false
					});
				}
			} else if (tempLayer.style.type == "string") {
				// 線
				if (tempLayer.style.dynamic) {
					defaultStyle = new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'strokeOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'strokeWidth' : "${getSize}",
						'strokeLinecap' : "square",
						'fill' : false,
						'JSGIDynamicSize' : true
					}, {
						context : {
							getSize : function(feature) {
								var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.styleSize));
								return size < 1?1:size;
							}
						}
					});
				} else {
					defaultStyle = new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'strokeOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'strokeWidth' : tempLayer.style.width,
						'strokeLinecap' : "square",
						'fill' : false,
						'JSGIDynamicSize' : false
					});

				}
			} else if (tempLayer.style.type == "polygon") {
				// ポリゴン
				if (tempLayer.style.dynamic) {
					defaultStyle = new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'strokeOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'strokeWidth' : "${getSize}",
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : tempLayer.style.isPolygonFill() ? webtis.Format.Parse.RGBToHexaColor(tempLayer.style.hrgb[0], tempLayer.style.hrgb[1], tempLayer.style.hrgb[2]) : 'white',
						'fill' : tempLayer.style.isPolygonFill(),
						'strokeLinecap' : "square",
						'JSGIDynamicSize' : true
					}, {
						context : {
							getSize : function(feature) {
								var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.styleSize));
								return size < 1 ? 1:size;
							}
						}
					});
				} else {
					defaultStyle = new OpenLayers.Style({
						'stroke' : true,
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'strokeOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'strokeWidth' : tempLayer.style.width,
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : tempLayer.style.isPolygonFill() ? webtis.Format.Parse.RGBToHexaColor(tempLayer.style.hrgb[0], tempLayer.style.hrgb[1], tempLayer.style.hrgb[2]) : 'white',
						'fill' : tempLayer.style.isPolygonFill(),
						'strokeLinecap' : "square",
						'JSGIDynamicSize' : false
					});
				}
			} else if (tempLayer.style.type == "text") {
				if (tempLayer.style.fontSizeDynamic) {
					defaultStyle = new OpenLayers.Style({
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'fontColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'fontFamily' : tempLayer.style.fontFamily,
						'fontWeight' : tempLayer.style.fontWeight,
						'fontSize' : "${getSize}",
						'fontSizeNumber' : "${getSizeNumber}",
						'labelAlign' : tempLayer.style.mode,
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : tempLayer.style.isBackgroundFill() ? webtis.Format.Parse.RGBToHexaColor(tempLayer.style.brgb[0], tempLayer.style.brgb[1], tempLayer.style.brgb[2]) : 'white',
						'fill' : tempLayer.style.isBackgroundFill(),
						'labelSelect' : true,
						'JSGIDynamicSize' : true
					}, {
						context : {
							getSize : function(feature) {
								return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.styleSize)) + "px";
							},
							getSizeNumber : function(feature) {
								return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.styleSize));
							}
						}
					});
				} else {
					defaultStyle = new OpenLayers.Style({
						'strokeColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'fontColor' : webtis.Format.Parse.RGBToHexaColor(tempLayer.style.rgb[0], tempLayer.style.rgb[1], tempLayer.style.rgb[2]),
						'fontFamily' : tempLayer.style.fontFamily,
						'fontWeight' : tempLayer.style.fontWeight,
						'fontSize' : tempLayer.style.fontSize + "px",
						'fontSizeNumber' : tempLayer.style.fontSize,
						'labelAlign' : tempLayer.style.mode,
						'fillOpacity' : tempLayer.style.transparent ? 0.5 : 1,
						'fillColor' : tempLayer.style.isBackgroundFill() ? webtis.Format.Parse.RGBToHexaColor(tempLayer.style.brgb[0], tempLayer.style.brgb[1], tempLayer.style.brgb[2]) : 'white',
						'fill' : tempLayer.style.isBackgroundFill(),
						'labelSelect' : true,
						'JSGIDynamicSize' : false
					});
				}
			} else if (tempLayer.style.type == "image") {
				// ピクセルサイズを取りに画像プリーロードする
			}

			if (!layer) {
				// レイヤ作成
				if (tempLayer.style.styleKind == "system" && tempLayer.style.style) {
					defaultStyle.defaultStyle.strokeDashstyle = tempLayer.style.style;
				}

				if (defaultStyle) {
					var _ds = { "default": defaultStyle };
					if (selectStyle) {
						_ds["select"] = selectStyle;
					}
					layerStyleMap = new OpenLayers.StyleMap(_ds);
				}

				layer = new webtis.Layer.Vector(tempLayer.name, layerStyleMap ? {
					styleMap: layerStyleMap
				} : null);
				layer.setDisplayLevel(tempLayer.style.displayLevel);
				layer.visibility = tempLayer.style.display;

				layer.styleName = tempLayer.style.name;
				layer.styleType = tempLayer.style.type;
				layer.description = tempLayer.description;
				layer.addFeatures(features);
				// 選択出来るか否かを設定
				layer.JSGISelection = tempLayer.style.selection;
				if (tempLayer.affixStyle) {
					layer.affixStyle = tempLayer.affixStyle;
				}
				ret.push(layer);
			}

		}
		return ret;
	},

	CLASS_NAME: "webtis.Format.JSGIJSON"
});


// レイヤーの配列をJSON化
webtis.Format.JSGIJSON.makeJSONString = function(layers,baseProjection) {
	var layerNode = [];
	var topNode = new Array({"layer":layerNode});
	var geoJSON = new OpenLayers.Format.GeoJSON();
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		var dataNode = [];
		var styleNode = null;
		var primidPrefix = null;
		styleNode = layer.affixStyle;
		if (layer.styleType == "string" || layer.styleType == "polygon") {
			primidPrefix = "cv";
		}
		var layerName = layer.name;
		var description = layer.description;
		if (layer.name.indexOf("_affix_.")==0) {
			layerName = layerName.substring(8);
		}
		layerNode[i] = {
			"name" : layerName,
			"description" : description,
			"style" : styleNode,
			"data" : dataNode
		};
		var primId = 1;
		for (var j = 0; j < layer.features.length; j++) {
			var feature = layer.features[j];
			var attributes = feature.attributes;
			var name = attributes["name"];
			var description = attributes["description"];

			var attr = attributes["attr"];
			var attrString = "";
			if (attr) {
				for (var k = 0; k < attr.length; k++) {
					var attrkey = attr[k].name;
					var value = attr[k].value;
					if (attrString.length > 0) {
						attrString += ",";
					}
					attrString += attrkey+"=\""+webtis.Format.JSGIJSON.escapeHTML(value,true)+"\"";
				}
			}
			var geometryJSON = null;
			var meter = null;
			var data = null;
			if (layer.styleType == "circle") {
				var geometry = feature.geometry.clone().transform(layer.map.getProjectionObject(),baseProjection);
				eval("geometryJSON = "+geoJSON.write(geometry)+";");
				meter = feature.pointRadius;
			} else if (layer.styleType == "text") {
					var geometry = feature.geometry.clone().components[0].transform(layer.map.getProjectionObject(),baseProjection);
					eval("geometryJSON = "+geoJSON.write(geometry)+";");
					meter = feature.pointRadius;
			} else if (layer.styleType == "image") {
				var geometry = feature.geometry.clone().transform(layer.map.getProjectionObject(),baseProjection);
				var imageMapping = {
						"leftBottomCorner" : {"type" : "Point" , "coordinates" :[geometry.x,geometry.y-geometry.height]},
						"rightTopCorner" : {"type" : "Point" , "coordinates" :[geometry.x+geometry.width,geometry.y]},
						"leftTopCorner" : {"type" : "Point" , "coordinates" :[geometry.x,geometry.y]},
						"rightBottomCorner" : {"type" : "Point" , "coordinates" :[geometry.x+geometry.width,geometry.y-geometry.height]}
				};
				data = {
				        "name": name,
				        "description":description,
				        "attribute": attrString,
				        "crs": "JGD2000 / (L, B)",
				        "type" : geometry.imageType,
				        "src" : geometry.imageUrl,
				        "imageMapping": imageMapping
					};
			} else {
				// window.console.log(layer.styleType+":"+feature.geometry.CLASS_NAME);
				var geometry = feature.geometry.clone().transform(layer.map.getProjectionObject(),baseProjection);
				eval("geometryJSON = "+geoJSON.write(geometry)+";");
			}
			if (!data) {
				data = {
			        "name": name,
			        "description":description,
			        "attribute": attrString,
			        "crs": "JGD2000 / (L, B)",
			        "geometry": geometryJSON
				};
			}
			if (primidPrefix) {
				data = OpenLayers.Util.extend(data,{"primitiveId":primidPrefix+webtis.Format.JSGIJSON.zeroPadDeci(primId,3)});
			}
			if (meter) {
				data = OpenLayers.Util.extend(data,{"radius":{
						unit:"meter",
						value : meter
					}
				});
			}
			dataNode[j] = data;
		}
	}
	var result = webtis.Format.JSGIJSON.stringify(topNode);
	result = result.substring(1,result.length-1);
	result = result.substring(result.indexOf("{"),result.lastIndexOf("}")+1);
	// window.console.log(result);
	return result;
};

webtis.Format.JSGIJSON.stringify = function(obj) {
	var json = new OpenLayers.Format.JSON();
	var result = json.write(obj);
	// var result = JSON.stringify(obj);
	return result;
};
//HTMLをエスケープ
webtis.Format.JSGIJSON.escapeHTML = function(str,forSend) {
	if (!str) {
		return str;
	}
	var result = str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	if (!forSend) {
		result = result.replace(/[\r]/g,"");
		result = result.replace(/[\n]/g,"<br/>");
		result = result.replace(/ /g,"&nbsp;");
	} else {
		result = result.replace(/[\r]/g,"");
		result = result.replace(/[\n]/g,",=");
	}
	return result;
};

//10進数 10より小さいときは、0を付加
webtis.Format.JSGIJSON.zeroPadDeci = function(deci,padLen) {
	var str = deci+"";
	while (str.length < padLen) {
		str = "0" + str;
	}
	return str;
};

webtis.Format.Parse.mapTextAlignment = function(textAlignment) {
	var ret = textAlignment.charAt(0).toLowerCase();
	if (textAlignment.charAt(1) == 'C') {
		ret += 'm';
	} else {
		ret += textAlignment.charAt(1).toLowerCase();
	}
	return ret;
};

webtis.Format.Parse.mapTextStyle = function(textStyle) {
	var ret = 'normal';
	if (textStyle.indexOf(',') > -1) {
		var textStyles = textStyle.split(',');
		textStyle = textStyles[0];
	}
	if (textStyle == '太' || textStyle == 'bold') {
		ret = '700';
	} else if (textStyle == '中太') {
		ret = '800';
	} else if (textStyle == '極太' || textStyle == 'bolder') {
		ret = '900';
	}
	return ret;
};

webtis.Format.Parse.metersToPixel = function(map, meters) {
	var res = map.getResolution();
	// assume constant resolution based on x-direction
	// -> only used for line width style, circle size
	var curMapUnits = map.getUnits();
	var inches = OpenLayers.INCHES_PER_UNIT;
	var size = meters * inches["m"];
	return size / (res * inches[curMapUnits]);
};

webtis.Format.Parse.RGBToHexaColor = function(r, g, b) {
	var nr = (typeof r == 'string') ? parseInt(r) : r;
	var ng = (typeof g == 'string') ? parseInt(g) : g;
	var nb = (typeof b == 'string') ? parseInt(b) : b;
	var sr = nr.toString(16); sr = sr.length == 1 ? "0" + sr : sr;
	var sg = ng.toString(16); sg = sg.length == 1 ? "0" + sg : sg;
	var sb = nb.toString(16); sb = sb.length == 1 ? "0" + sb : sb;
	return "#" + sr + sg + sb;
};
/* ======================================================================
    Handler/Box.js
   ====================================================================== */

/**
 * Class: webtis.Handler.Box
 * 電子国土Webシステム APIで矩形描画を行うハンドラー
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Box>
 */
webtis.Handler.Box = OpenLayers.Class(OpenLayers.Handler.Box, {

	deactivate: function () {
		if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
			if (this.dragHandler) {
				this.dragHandler.deactivate();
			}
			return true;
		} else {
			return false;
		}
	},

	CLASS_NAME: "webtis.Handler.Box"
});
/* ======================================================================
    Control/ScaleLine.js
   ====================================================================== */

/**
 * Class: webtis.Control.ScaleLine
 * 電子国土Webシステム APIの距離凡例を表示するコントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control.ScaleLine>
 */
webtis.Control.ScaleLine = OpenLayers.Class(OpenLayers.Control.ScaleLine, {

	initialize: function(options) {
		OpenLayers.Control.ScaleLine.prototype.initialize.apply(this, [options]);
		this.geodesic = true;
		var parentClassName = OpenLayers.Control.ScaleLine.prototype.CLASS_NAME;
		this.displayClass = parentClassName.replace("OpenLayers.", "ol").replace(/\./g, "");
	},

	update: function() {

		var mapSize = this.map.getSize();

		var res = this.map.getResolution();
		if (!res) {
			return;
		}

		var curMapUnits = this.map.getUnits();
		var inches = OpenLayers.INCHES_PER_UNIT;

		var maxSizeData = this.maxWidth * res * inches[curMapUnits];
		var geodesicRatio = 1;
		if(this.geodesic === true) {
			var maxSizeGeodesic = (this.map.getGeodesicPixelSize().w ||
					0.000001) * this.maxWidth;
			var maxSizeKilometers = maxSizeData / inches["km"];
			geodesicRatio = maxSizeGeodesic / maxSizeKilometers;
			maxSizeData *= geodesicRatio;
		}

		var topUnits;
		if(maxSizeData > 100000) {
			topUnits = this.topOutUnits;
		} else {
			topUnits = this.topInUnits;
		}

		// and to map units units
		var topMax = maxSizeData / inches[topUnits];

		// now trim this down to useful block length
		var topRounded = this.getBarLen(topMax);

		// and back to display units
		topMax = topRounded / inches[curMapUnits] * inches[topUnits];

		// and to pixel units
		var topPx = topMax / res / geodesicRatio;

		var rtopPx = Math.round(topPx);

		if (this.eTop.style.visibility == "visible"){
			this.eTop.style.width = rtopPx + "px";
			this.eTop.innerHTML = topRounded + " " + topUnits;
		}

		this.div.style.left = (mapSize.w - 10 - rtopPx) + "px";
		this.div.style.bottom = "10px";
	},

	destroy: function () {
		this.map.events.unregister('moveend', this, this.update);
		OpenLayers.Control.prototype.destroy.apply(this);
	},

	CLASS_NAME: "webtis.Control.ScaleLine"
});
/* ======================================================================
    Renderer/PixelVML.js
   ====================================================================== */

/**
 * Class: webtis.Renderer.PixelVML
 * 電子国土Webシステム APIでピクセル座標の電子国土Web システム用XMLデータをVMLで表示するための描画クラス
 *
 * Inherits from:
 *  - <OpenLayers.Renderer.VML>
 */
webtis.Renderer.PixelVML = OpenLayers.Class(OpenLayers.Renderer.VML, {

	setExtent: function(extent, resolutionChanged) {

		var left = 0;
		var top = 0;
		this.extent = new OpenLayers.Bounds(0, 0, this.size.w, this.size.h);

		var org = left + " " + top;
		this.root.coordorigin = org;
		var roots = [this.root, this.vectorRoot, this.textRoot];
		var root;
		for(var i=0, len=roots.length; i<len; ++i) {
			root = roots[i];

			var size = this.size.w + " " + this.size.h;
			root.coordsize = size;
		}
		// flip the VML display Y axis upside down so it
		// matches the display Y axis of the map
		//this.root.style.flip = "y";

		return true;
	},

	setStyle: function(node, style, options, geometry) {
		style = style  || node._style;
		options = options || node._options;
		var fillColor = style.fillColor;

		if (node._geometryClass === "OpenLayers.Geometry.Point") {
			if (style.externalGraphic) {
				if (style.graphicTitle) {
					node.title=style.graphicTitle;
				}
				var width = style.graphicWidth || style.graphicHeight;
				var height = style.graphicHeight || style.graphicWidth;
				width = width ? width : style.pointRadius*2;
				height = height ? height : style.pointRadius*2;

				var xOffset = (style.graphicXOffset != undefined) ?
						style.graphicXOffset : -(0.5 * width);
				var yOffset = (style.graphicYOffset != undefined) ?
						style.graphicYOffset : -(0.5 * height);

				node.style.left = ((geometry.x + xOffset) | 0) + "px";
				node.style.top = ((geometry.y - (yOffset + height)) | 0) + "px";
				node.style.width = width + "px";
				node.style.height = height + "px";
				node.style.flip = "y";

				// modify fillColor and options for stroke styling below
				fillColor = "none";
				options.isStroked = false;
			} else if (this.isComplexSymbol(style.graphicName)) {
				var cache = this.importSymbol(style.graphicName);
				node.path = cache.path;
				node.coordorigin = cache.left + "," + cache.bottom;
				var size = cache.size;
				node.coordsize = size + "," + size;
				this.drawCircle(node, geometry, style.pointRadius);
				node.style.flip = "y";
			} else {
				this.drawCircle(node, geometry, style.pointRadius);
			}
		}

		// fill
		if (options.isFilled) {
			node.fillcolor = fillColor;
		} else {
			node.filled = "false";
		}
		var fills = node.getElementsByTagName("fill");
		var fill = (fills.length == 0) ? null : fills[0];
		if (!options.isFilled) {
			if (fill) {
				node.removeChild(fill);
			}
		} else {
			if (!fill) {
				fill = this.createNode('olv:fill', node.id + "_fill");
			}
			fill.opacity = style.fillOpacity;

			if (node._geometryClass === "OpenLayers.Geometry.Point" &&
					style.externalGraphic) {

				// override fillOpacity
				if (style.graphicOpacity) {
					fill.opacity = style.graphicOpacity;
				}

				fill.src = style.externalGraphic;
				fill.type = "frame";

				if (!(style.graphicWidth && style.graphicHeight)) {
					fill.aspect = "atmost";
				}
			}
			if (fill.parentNode != node) {
				node.appendChild(fill);
			}
		}

		// additional rendering for rotated graphics or symbols
		var rotation = style.rotation;
		if ((rotation !== undefined || node._rotation !== undefined)) {
			node._rotation = rotation;
			if (style.externalGraphic) {
				this.graphicRotate(node, xOffset, yOffset, style);
				// make the fill fully transparent, because we now have
				// the graphic as imagedata element. We cannot just remove
				// the fill, because this is part of the hack described
				// in graphicRotate
				fill.opacity = 0;
			} else if(node._geometryClass === "OpenLayers.Geometry.Point") {
				node.style.rotation = rotation || 0;
			}
		}

		// stroke
		var strokes = node.getElementsByTagName("stroke");
		var stroke = (strokes.length == 0) ? null : strokes[0];
		if (!options.isStroked) {
			node.stroked = false;
			if (stroke) {
				stroke.on = false;
			}
		} else {
			if (!stroke) {
				stroke = this.createNode('olv:stroke', node.id + "_stroke");
				node.appendChild(stroke);
			}
			stroke.on = true;
			stroke.color = style.strokeColor;
			stroke.weight = style.strokeWidth + "px";
			stroke.opacity = style.strokeOpacity;
			stroke.endcap = style.strokeLinecap == 'butt' ? 'flat' :
				(style.strokeLinecap || 'round');
			if (style.strokeDashstyle) {
				stroke.dashstyle = this.dashStyle(style);
			}
		}

		if (style.cursor != "inherit" && style.cursor != null) {
			node.style.cursor = style.cursor;
		}
		return node;
	},

	setNodeDimension: function(node, geometry) {
		var bbox = geometry.getBounds();
		if(bbox) {
			// Set the internal coordinate system to draw the path
			node.style.left = bbox.left + "px";
			node.style.top = bbox.top + "px";
			node.style.width = bbox.getWidth() + "px";
			node.style.height = bbox.getHeight() + "px";

			node.coordorigin = bbox.left + " " + bbox.top;
			node.coordsize = bbox.getWidth()+ " " + bbox.getHeight();
		}
	},

	drawCircle: function(node, geometry, radius) {
		if(!isNaN(geometry.x)&& !isNaN(geometry.y)) {
			node.style.left = ((geometry.x | 0) - radius) + "px";
			node.style.top = ((geometry.y | 0) - radius) + "px";
			var diameter = radius * 2;
			node.style.width = diameter + "px";
			node.style.height = diameter + "px";
			return node;
		}
		return false;
	},

	drawLine: function(node, geometry, closeLine) {

		this.setNodeDimension(node, geometry);

		var numComponents = geometry.components.length;
		var parts = new Array(numComponents);

		var comp, x, y;
		for (var i = 0; i < numComponents; i++) {
			comp = geometry.components[i];
			x = comp.x | 0;
			y = comp.y | 0;
			parts[i] = " " + x + "," + y + " l ";
		}
		var end = (closeLine) ? " x e" : " e";
		node.path = "m" + parts.join("") + end;
		return node;
	},

	drawPolygon: function(node, geometry) {

		this.setNodeDimension(node, geometry);

		var path = [];
		var linearRing, i, j, len, ilen, comp, x, y;
		for (j = 0, len=geometry.components.length; j<len; j++) {
			linearRing = geometry.components[j];

			path.push("m");
			for (i=0, ilen=linearRing.components.length; i<ilen; i++) {
				comp = linearRing.components[i];
				x = comp.x | 0;
				y = comp.y | 0;
				path.push(" " + x + "," + y);
				if (i==0) {
					path.push(" l");
				}
			}
			path.push(" x ");
		}
		path.push("e");
		node.path = path.join("");
		return node;
	},

	drawRectangle: function(node, geometry) {

		node.style.left = (geometry.x | 0) + "px";
		node.style.top = (geometry.y | 0) + "px";
		node.style.width = (geometry.width | 0) + "px";
		node.style.height = (geometry.height | 0) + "px";

		return node;
	},

	drawImageRectangle: function(node, geometry) {

		var width = geometry.width;
		var height = geometry.height;

		node.style.left = (geometry.x | 0) + "px";
		node.style.top = (geometry.y | 0) + "px";
		node.style.width = width + "px";
		node.style.height = height + "px";
		//node.style.flip = "y";
		node.stroked = false;

		var fills = node.getElementsByTagName("fill");
		var fill = (fills.length == 0) ? null : fills[0];

		if (!fill) {
			fill = this.createNode('olv:fill', node.id + "_fill");
		}

		if (geometry.imageOpacity) {
			fill.opacity = geometry.imageOpacity;
		}
		fill.src = geometry.imageUrl;
		fill.type = "frame";

		if (fill.parentNode != node) {
			node.appendChild(fill);
		}

		return node;
	},

	drawText: function(featureId, style, location) {

		var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "olv:rect");
		var textbox = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_textbox", "olv:textbox");

		var labelText = style.label;
		var labelFontSize = 12;
		if (style.fontSize) {
			labelFontSize = parseInt(style.fontSize);
		}
		/*
		var labelWidth = (labelFontSize * (labelText.length + 0.5)) | 0;
		var labelHeight = ((labelFontSize * 1.5) | 0);
		*/

		var labelLeft = location.x | 0;
		var labelTop = location.y | 0;

		label.style.left = labelLeft + "px";
		label.style.top = labelTop + "px";
		/*
		label.style.width = labelWidth + "px";
		label.style.height = labelHeight + "px";
		*/
		//label.style.flip = "y";
		label.filled = false;
		label.stroked = false;

		textbox.innerText = labelText;

		textbox.style.fontSize = labelFontSize + "px";
		textbox.style.lineHeight = labelFontSize + "px";

		if (style.fontColor) {
			textbox.style.color = style.fontColor;
		}
		if (style.fontOpacity) {
			textbox.style.filter = 'alpha(opacity=' + (style.fontOpacity * 100) + ')';
		}
		if (style.fontFamily) {
			textbox.style.fontFamily = style.fontFamily;
		}
		if (style.fontWeight) {
			textbox.style.fontWeight = style.fontWeight;
		}

		textbox.style.whiteSpace = "nowrap";
		var inset = ((labelFontSize/4) | 0) + "px";
		textbox.inset = inset + "," + inset + "," + inset + "," + inset;

		if(!label.parentNode) {
			label.appendChild(textbox);
			this.textRoot.appendChild(label);
		}

		var align = style.labelAlign || "cm";
		if (align.length == 1) {
			align += "m";
		}
		var labelWidth = textbox.clientWidth;
		var labelHeight = textbox.clientHeight;
		var xshift = labelWidth * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(0,1)]);
		var yshift = labelHeight * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(1,1)]);
		label.style.left = ((labelLeft - xshift - 1) | 0) + "px";
		label.style.top = ((labelTop + yshift) | 0) + "px";

	},

	drawSurface: function(node, geometry) {

		this.setNodeDimension(node, geometry);

		var path = [];
		var comp, x, y;
		for (var i=0, len=geometry.components.length; i<len; i++) {
			comp = geometry.components[i];
			x = comp.x | 0;
			y = comp.y | 0;
			if ((i%3)==0 && (i/3)==0) {
				path.push("m");
			} else if ((i%3)==1) {
				path.push(" c");
			}
			path.push(" " + x + "," + y);
		}
		path.push(" x e");

		node.path = path.join("");
		return node;
	},

	CLASS_NAME: "webtis.Renderer.PixelVML"
});
/* ======================================================================
    Geometry/TextRectangle.js
   ====================================================================== */

/**
 * Class: webtis.Geometry.TextRectangle
 * 電子国土Webシステム APIの文字オブジェクトを表すGeometryオブジェクト
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.Point>
 */
webtis.Geometry.TextRectangle = OpenLayers.Class(OpenLayers.Geometry.Point, {

	selectDisplay: null,

	initialize: function(x, y, selectDisplay) {
		OpenLayers.Geometry.Point.prototype.initialize.apply(this, arguments);
		if (selectDisplay)
			this.selectDisplay = selectDisplay;
		this.components = [new OpenLayers.Geometry.Point(x, y)];
	},

	clone: function(obj) {
		if (obj == null) {
			obj = new webtis.Geometry.TextRectangle(this.x, this.y, this.selectDisplay);
		}
		if (this.label)
			obj.label = this.label;
		OpenLayers.Util.applyDefaults(obj, this);
		return obj;
	},


	calculateBounds: function() {
		this.bounds = new OpenLayers.Bounds(this.x, this.y,this.x, this.y);
		this.components = [new OpenLayers.Geometry.Point(this.x, this.y)];
	},

	CLASS_NAME: "webtis.Geometry.TextRectangle"
});
/* ======================================================================
    Layer/PixelVector.js
   ====================================================================== */

/**
 * Class: webtis.Layer.PixelVector
 * 電子国土Webシステム APIでピクセル座標で地物を表示するレイヤー
 *
 * Inherits from:
 *  - <webtis.Layer.Vector>
 */
webtis.Layer.PixelVector = OpenLayers.Class(webtis.Layer.Vector, {

	initialize: function(name, options) {
		this.renderers = [webtis.Renderer.PixelSVG, webtis.Renderer.PixelVML, 'Canvas'];
		OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);
	},

	CLASS_NAME: "webtis.Layer.PixelVector"
});
/* ======================================================================
    Handler/LeftRightDrag.js
   ====================================================================== */

/**
 * Class: webtis.Handler.LeftRightDrag
 * 電子国土Webシステム APIでマウスでのドラッグ行うハンドラー
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Drag>
 */
webtis.Handler.LeftRightDrag = OpenLayers.Class(OpenLayers.Handler.Drag, {

	/**
	 * Property: leftDrag
	 * {Boolean}
	 */
	leftDrag: false,

	/**
	 * Property: rightDrag
	 * {Boolean}
	 */
	rightDrag: false,

	mousedown: function (evt) {
		var propagate = true;
		this.dragging = false;
		this.leftDrag = OpenLayers.Event.isLeftClick(evt);
		this.rightDrag = OpenLayers.Event.isRightClick(evt);
		if (this.checkModifiers(evt) && (this.leftDrag||this.rightDrag)) {
			this.started = true;
			this.start = evt.xy;
			this.last = evt.xy;
			OpenLayers.Element.addClass(
				this.map.viewPortDiv, "olDragDown"
			);
			this.down(evt);
			this.callback("down", [evt.xy]);
			OpenLayers.Event.stop(evt);

			if(!this.oldOnselectstart) {
				this.oldOnselectstart = (document.onselectstart) ? document.onselectstart : OpenLayers.Function.True;
			}
			document.onselectstart = OpenLayers.Function.False;

			propagate = !this.stopDown;
		} else {
			this.started = false;
			this.start = null;
			this.last = null;
		}
		return propagate;
	},

	activate: function() {
		OpenLayers.Handler.Drag.prototype.activate.apply(this, []);
		// コンテキストメニューを無効にする。（しないと、右マウスのイベントの後
		// でコンテキストメニューが表示されてしまう）
		OpenLayers.Event.observe(document.body, "contextmenu",
			OpenLayers.Function.bindAsEventListener(function(evt) {
				OpenLayers.Event.stop(evt, false);
				return false;
			}, this));
	},

	deactivate: function() {
		OpenLayers.Handler.Drag.prototype.deactivate.apply(this, []);
		// コンテキストメニューを有効にする。
		OpenLayers.Event.observe(document.body, "contextmenu",
			OpenLayers.Function.bindAsEventListener(function(evt) {
				return true;
			}, this));
	},

	CLASS_NAME: "webtis.Handler.LeftRightDrag"
});
/* ======================================================================
    Control/MultiLayerDragFeature.js
   ====================================================================== */

/**
 * Class: webtis.Control.MultiLayerDragFeature
 * 電子国土Webシステム APIで複数のレイヤを透過的にドラッグできるようにするコントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control.DragFeature>
 */
webtis.Control.MultiLayerDragFeature = OpenLayers.Class(OpenLayers.Control.DragFeature, {

	initialize: function(layers, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);

		this.initLayer(layers);

		this.handlers = {
			drag: new OpenLayers.Handler.Drag(
				this, OpenLayers.Util.extend({
					down: this.downFeature,
					move: this.moveFeature,
					up: this.upFeature,
					out: this.cancel,
					done: this.doneDragging
				}, this.dragCallbacks), {
					documentDrag: this.documentDrag
				}
			),
			feature: new OpenLayers.Handler.Feature(
				this, this.layer, OpenLayers.Util.extend({
					over: this.overFeature,
					out: this.outFeature
				}, this.featureCallbacks),
				{geometryTypes: this.geometryTypes}
			)
		};
	},

	initLayer: function(layers) {
		if(OpenLayers.Util.isArray(layers)) {
			this.layers = layers;
			this.layer = new OpenLayers.Layer.Vector.RootContainer(
				this.id + "_container", {
					layers: layers
				}
			);
		} else {
			this.layer = layers;
		}
	},

	activate: function() {
		if (!this.active) {
			if(this.layers) {
				this.map.addLayer(this.layer);
			}
			this.handlers.feature.activate();
		}
		return OpenLayers.Control.prototype.activate.apply(this, arguments);
	},

	deactivate: function () {
		if (this.active) {
			if(this.layers) {
				this.map.removeLayer(this.layer);
			}
		}
		return OpenLayers.Control.DragFeature.prototype.deactivate.apply(
			this, arguments
		);
	},

	destroy: function() {
		if(this.active && this.layers) {
			this.map.removeLayer(this.layer);
		}
		OpenLayers.Control.prototype.destroy.apply(this, arguments);
		if(this.layers) {
			this.layer.destroy();
		}
	},

	moveFeature: function(pixel) {
		if (!this.feature.layer.JSGISelection) {
			return false;
		}
		var res = this.map.getResolution();
		this.feature.geometry.move(
				res * (pixel.x - this.lastPixel.x),
				res * (this.lastPixel.y - pixel.y));
		this.feature.layer.drawFeature(this.feature);
		this.lastPixel = pixel;
		this.onDrag(this.feature, pixel);
	},

	CLASS_NAME: "webtis.Control.MultiLayerDragFeature"
});
/* ======================================================================
    Handler/Polygon.js
   ====================================================================== */

/**
 * Class: webtis.Handler.Polygon
 * 電子国土Webシステム APIでポリゴンの描画を行うハンドラー
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Polygon>
 */
webtis.Handler.Polygon = OpenLayers.Class(OpenLayers.Handler.Polygon, {

	activate: function() {
		if(!OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
			return false;
		}
		var options = OpenLayers.Util.extend({
			displayInLayerSwitcher: false,
			calculateInRange: OpenLayers.Function.True
		}, this.layerOptions);
		this.layer = new webtis.Layer.Vector(this.CLASS_NAME, options);
		this.map.addLayer(this.layer);
		return true;
	},

	createFeature: function(pixel) {
		var lonlat = this.control.map.getLonLatFromPixel(pixel);
		this.point = new webtis.Feature.Vector(
			new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
		);
		this.line = new webtis.Feature.Vector(
			new OpenLayers.Geometry.LinearRing([this.point.geometry])
		);
		this.polygon = new webtis.Feature.Vector(
			new OpenLayers.Geometry.Polygon([this.line.geometry])
		);
		this.callback("create", [this.point.geometry, this.getSketch()]);
		this.point.geometry.clearBounds();
		this.layer.addFeatures([this.polygon, this.point], {silent: true});
	},

	CLASS_NAME: "webtis.Handler.Polygon"
});
/* ======================================================================
    Control/DenshiKokudoLinks.js
   ====================================================================== */

/**
 * Class: webtis.Control.DenshiKokudoLinks
 * 電子国土Webシステム APIで表示する使用許諾ページなどへのリンクを表すコントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
webtis.Control.DenshiKokudoLinks = OpenLayers.Class(OpenLayers.Control, {

	heightOffset: 42,

	initialize: function() {
		OpenLayers.Control.prototype.initialize.apply(this, arguments);
		if (OpenLayers.Util.getBrowserName() == "msie") {
			this.heightOffset = 79;
		} else {
			this.heightOffset = 42;
		}
	},

	createCtrlImage: function(url, left, handler) {
		var	image = document.createElement('img');
		image.src = url;
		image.style.position = "absolute";
		image.style.left = left + "px";
		image.style.width = '32px';
		image.style.height = '32px';
		if (handler) {
			// only handle click
			OpenLayers.Event.observe(image, "mousedown",
				OpenLayers.Function.bindAsEventListener(handler, this));
			OpenLayers.Event.observe(image, "click",
				OpenLayers.Function.bindAsEventListener(function(e) {
					OpenLayers.Event.stop(e);
					return false;
				}, this));
			OpenLayers.Event.observe(image, "dblclick",
				OpenLayers.Function.bindAsEventListener(function(e) {
					OpenLayers.Event.stop(e);
					return false;
				}, this));
		}
		this.div.appendChild(image);
	},

	draw: function (px) {
		if (this.div == null) {
			var mapSize = this.map.getSize();

			this.div = OpenLayers.Util.createDiv(this.id);
			this.div.style.position = "absolute";
			this.div.style.top = (mapSize.h - this.heightOffset) + "px";
			this.div.style.left = "10px";

			this.createCtrlImage("http://cyberjapan.jp/images/icon01.gif", 0, function(e) {
				window.open("http://portal.cyberjapan.jp/index.html");
				OpenLayers.Event.stop(e);
				return false;
			});
		}
		return this.div;
	},

	adjustPositionOnMapResize: function() {
		if (this.div != null) {
			var mapSize = this.map.getSize();
			this.div.style.top = (mapSize.h - 42) + "px";
		}
	},

	CLASS_NAME: "webtis.Control.DenshiKokudoLinks"
});
/* ======================================================================
    Feature/Vector.js
   ====================================================================== */

/**
 * Class: webtis.Feature.Vector
 * 電子国土Webシステム APIの地物を格納するためのレイヤー
 *
 * Inherits from:
 *  - <OpenLayers.Feature.Vector>
 */
webtis.Feature.Vector = OpenLayers.Class(OpenLayers.Feature.Vector, {

	initialize: function(geometry, attributes, style) {
		OpenLayers.Feature.Vector.prototype.initialize.apply(this, [geometry, attributes, style]);
		if (!webtis.gObjIDGen) {
			webtis.gObjIDGen = 0;
		}
		webtis.gObjIDGen++;
		this.objid = '' + webtis.gObjIDGen;
	},

	move: function(location) {
		if(!this.layer || !this.geometry.move){
			return;
		}
		var pixel;
		if (location.CLASS_NAME == "OpenLayers.LonLat") {
			pixel = this.layer.map.baseLayer.getViewPortPxFromLonLat(location);
		} else {
			pixel = location;
		}

		var centerLonLat = this.geometry.getBounds().getCenterLonLat();
		var lastPixel = this.layer.map.baseLayer.getViewPortPxFromLonLat(centerLonLat);
		var res = this.layer.map.getResolution();
		this.geometry.move(
				res * (pixel.x - lastPixel.x),
				res * (lastPixel.y - pixel.y));
		this.layer.drawFeature(this);
		return lastPixel;
	},

	clone: function () {
		var ret = new webtis.Feature.Vector(
			this.geometry ? this.geometry.clone() : null,
			this.attributes,
			this.style);
		/**
		if (this.objid) {
			ret.objid = this.objid;
		}
		**/
		webtis.gObjIDGen++;
		ret.objid = '' + webtis.gObjIDGen;

		if (this.styleSize) {
			ret.styleSize = this.styleSize;
		}
		if (this.pointRadius) {
			ret.pointRadius = this.pointRadius;
		}
		return ret;
	},

	toString : function() {
		return this.objid;
	},

	CLASS_NAME: "webtis.Feature.Vector"
});
/* ======================================================================
    Renderer/VML.js
   ====================================================================== */

/**
 * Class: webtis.Renderer.VML
 * 電子国土Webシステム APIで電子国土Web システム用XML データをVMLで表示するための描画クラス
 *
 * Inherits from:
 *  - <OpenLayers.Renderer.VML>
 */
webtis.Renderer.VML = OpenLayers.Class(OpenLayers.Renderer.VML, {

	// ========================================================================
	// OpenLayers.Renderer overrides
	// ========================================================================

	drawFeature: function(feature, style) {
		if(style == null) {
			style = feature.style;
		}
		if (feature.geometry) {
			var bounds = feature.geometry.getBounds();
			if(bounds) {
				if (!bounds.intersectsBounds(this.extent)) {
					style = {display: "none"};
				}
				var rendered = this.drawGeometry(feature.geometry, style, feature.id);
				if(style.display != "none" && (style.label || feature.geometry.label) && rendered !== false) {
					var location = feature.geometry.getCentroid();
					if(style.labelXOffset || style.labelYOffset) {
						xOffset = isNaN(style.labelXOffset) ? 0 : style.labelXOffset;
						yOffset = isNaN(style.labelYOffset) ? 0 : style.labelYOffset;
						var res = this.getResolution();

						location.move(xOffset*res, yOffset*res);
					}
					if (feature.geometry.label) {
						this._drawText(feature.id, style, location, feature.geometry.label);
					} else {
						this.drawText(feature.id, style, location);
					}
				} else {
					this.removeText(feature.id);
				}
				return rendered;
			}
		}
	},

	// ========================================================================
	// OpenLayers.Renderer.Elements overrides
	// ========================================================================

	drawGeometryNode: function(node, geometry, style) {
		var drawn;
		if (geometry.CLASS_NAME == "webtis.Geometry.ImageRectangle") {
			drawn = this.drawImageRectangle(node, geometry);
			if (drawn != false) {
				drawn = {
					node: node/*this.setStyle(node, style, { 'isFilled' : false, 'isStroked' : false }, geometry)*/,
					complete: drawn
				};
			}
		} else if (geometry.CLASS_NAME == "webtis.Geometry.TextRectangle") {
//			if (geometry.selectDisplay || style.orgStyle == 'select') {
//				drawn = this.drawTextRectangle(node, geometry, style);
//				if (drawn != false) {
//					drawn = {
//						node: node/*this.setStyle(node, style, {
//								'isFilled' : style.fill === undefined ? false : style.fill,
//								'isStroked' : false
//							}, geometry)*/,
//						complete: drawn
//					};
//				}
//			} else {
				return { node:node, complete:true };
//			}
		} else {
			drawn = OpenLayers.Renderer.Elements.prototype.drawGeometryNode.apply(this, arguments);
		}
		return drawn;
	},

	// ========================================================================
	// OpenLayers.Renderer.VML overrides
	// ========================================================================
	getNodeType: function(geometry, style) {
		var nodeType = OpenLayers.Renderer.VML.prototype.getNodeType.apply(this, arguments);
		if (!nodeType) {
			if (geometry.CLASS_NAME == "webtis.Geometry.ImageRectangle") {
				nodeType = "olv:rect";
			} else if (geometry.CLASS_NAME == "webtis.Geometry.TextRectangle") {
				nodeType = "olv:rect";
			}
		}
		return nodeType;
	},

	setStyle: function(node, style, options, geometry) {
		style = style  || node._style;
		options = options || node._options;
		var fillColor = style.fillColor;

		if (node._geometryClass === "OpenLayers.Geometry.Point") {
			if (style.externalGraphic) {
				if (style.graphicTitle) {
					node.title=style.graphicTitle;
				}
				var width = style.graphicWidth || style.graphicHeight;
				var height = style.graphicHeight || style.graphicWidth;
				width = width ? width : style.pointRadius*2;
				height = height ? height : style.pointRadius*2;

				var resolution = this.getResolution();

				var xOffset = (style.graphicXOffset != undefined) ?
						style.graphicXOffset : -(0.5 * width);
				var yOffset = (style.graphicYOffset != undefined) ?
						style.graphicYOffset : -(0.5 * height);

				node.style.left = (((geometry.x/resolution - this.offset.x)+xOffset) | 0) + "px";
				node.style.top = (((geometry.y/resolution - this.offset.y)-(yOffset+height)) | 0) + "px";

				node.style.width = width + "px";
				node.style.height = height + "px";
				node.style.flip = "y";

				// modify fillColor and options for stroke styling below
				fillColor = "none";
				options.isStroked = false;
			} else if (this.isComplexSymbol(style.graphicName)) {
				var cache = this.importSymbol(style.graphicName);
				node.path = cache.path;
				node.coordorigin = cache.left + "," + cache.bottom;
				var size = cache.size;
				node.coordsize = size + "," + size;
				this.drawCircle(node, geometry, style.pointRadius);
				node.style.flip = "y";
			} else {
				this.drawCircle(node, geometry, style.pointRadius);
			}
		}

		// fill
		if (options.isFilled) {
			node.fillcolor = fillColor;
		} else {
			node.filled = "false";
		}
		var fills = node.getElementsByTagName("fill");
		var fill = (fills.length == 0) ? null : fills[0];
		if (!options.isFilled) {
			if (fill) {
				node.removeChild(fill);
			}
		} else {
			if (!fill) {
				fill = this.createNode('olv:fill', node.id + "_fill");
			}
			fill.opacity = style.fillOpacity;

			if (node._geometryClass === "OpenLayers.Geometry.Point" &&
					style.externalGraphic) {

				// override fillOpacity
				if (style.graphicOpacity) {
					fill.opacity = style.graphicOpacity;
				}

				fill.src = style.externalGraphic;
				fill.type = "frame";

				if (!(style.graphicWidth && style.graphicHeight)) {
					fill.aspect = "atmost";
				}
			}
			if (fill.parentNode != node) {
				node.appendChild(fill);
			}
		}

		// additional rendering for rotated graphics or symbols
		var rotation = style.rotation;
		if ((rotation !== undefined || node._rotation !== undefined)) {
			node._rotation = rotation;
			if (style.externalGraphic) {
				this.graphicRotate(node, xOffset, yOffset, style);
				// make the fill fully transparent, because we now have
				// the graphic as imagedata element. We cannot just remove
				// the fill, because this is part of the hack described
				// in graphicRotate
				fill.opacity = 0;
			} else if(node._geometryClass === "OpenLayers.Geometry.Point") {
				node.style.rotation = rotation || 0;
			}
		}

		// stroke
		var strokes = node.getElementsByTagName("stroke");
		var stroke = (strokes.length == 0) ? null : strokes[0];
		if (!options.isStroked) {
			node.stroked = false;
			if (stroke) {
				stroke.on = false;
			}
		} else {
			if (!stroke) {
				stroke = this.createNode('olv:stroke', node.id + "_stroke");
				node.appendChild(stroke);
			}
			stroke.on = true;
			stroke.color = style.strokeColor;
			stroke.weight = style.strokeWidth + "px";
			stroke.opacity = style.strokeOpacity;
			stroke.endcap = style.strokeLinecap == 'butt' ? 'flat' :
				(style.strokeLinecap || 'round');
			if (style.strokeDashstyle) {
				stroke.dashstyle = this.dashStyle(style);
			}
		}

		if (style.cursor != "inherit" && style.cursor != null) {
			node.style.cursor = style.cursor;
		}
		return node;
	},
	drawRectangle: function(node, geometry) {
		var resolution = this.getResolution();

		var nodeWidth = ((geometry.width/resolution) | 0);
		var nodeHeight = ((geometry.height/resolution) | 0);
		var nodeTop = ((geometry.y/resolution - this.offset.y) | 0);
		nodeTop -= nodeHeight;

		node.style.left = ((geometry.x/resolution - this.offset.x) | 0) + "px";
		//node.style.top = ((geometry.y/resolution - this.offset.y) | 0) + "px";
		node.style.top = nodeTop + "px";
		node.style.width = nodeWidth + "px";
		node.style.height = nodeHeight + "px";
		node.style.flip = "y";

		return node;
	},

	drawImageRectangle: function(node, geometry) {

		var resolution = this.getResolution();

		var width = geometry.width / resolution;
		var height = geometry.height / resolution;
		var xOffset = 0/*-(0.5 * width)*/;
		var yOffset = 0/*-(0.5 * height)*/;

		node.style.left = (((geometry.x/resolution - this.offset.x) + xOffset) | 0) + "px";
		node.style.top = (((geometry.y/resolution - this.offset.y) - (yOffset + height)) | 0) + "px";
		node.style.width = width + "px";
		node.style.height = height + "px";
		node.style.flip = "y";
		node.stroked = false;

		var fills = node.getElementsByTagName("fill");
		var fill = (fills.length == 0) ? null : fills[0];

		if (!fill) {
			fill = this.createNode('olv:fill', node.id + "_fill");
		}

		if (geometry.imageOpacity) {
			fill.opacity = geometry.imageOpacity;
		}
		fill.src = geometry.imageUrl;
		fill.type = "frame";

		if (fill.parentNode != node) {
			node.appendChild(fill);
		}

		return node;
	},

	_calcLabelWidth : function(str,labelFontSize,bold) {
		var cw = parseFloat(labelFontSize);
		var half = cw /2;
		if (bold) {
			cw *= 1+(0.2*(10.0/labelFontSize));
			half = cw /2;
		}
		var w = 0;
		for (var i = 0; i < str.length; i++) {
			var c = str.charAt(i);
			var len = escape(c).length;
			if (len < 4) {
				w += half;
			} else {
				w += cw;
			}
		}
		return w;
	},
	_drawText: function(featureId, style, location, label) {
		var labelText = label;
		var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "olv:rect");
		var textbox = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_textbox", "olv:textbox");

		var labelFontSize = 12.0;
		if (style.fontSize) {
			labelFontSize = parseFloat(style.fontSize);
		}
		if (labelFontSize%2!=0) {
			labelFontSize+=1;
		}

		var labelWidth = this._calcLabelWidth(labelText,labelFontSize,style.fontWeight == "bold")+(labelFontSize/2);
		var labelHeight = ((labelFontSize * 1.5) | 0);

		var resolution = this.getResolution();

		var labelLeft = (location.x/resolution - this.offset.x) | 0;
		var labelTop = (location.y/resolution - this.offset.y) | 0;
		labelTop -= labelHeight;

		label.style.left = labelLeft + "px";
		label.style.top = labelTop + "px";
		label.style.width = labelWidth + "px";
		label.style.height = labelHeight + "px";
		label.style.flip = "y";

		if (style.orgStyle == 'select') {
			label.stroked = true;

			var strokes = label.getElementsByTagName("stroke");
			var stroke = (strokes.length == 0) ? null : strokes[0];
			if (!stroke) {
				stroke = this.createNode('olv:stroke', label.id + "_stroke");
				label.appendChild(stroke);
			}
			stroke.on = true;
			stroke.color = "#0000ff";//style.strokeColor;
			stroke.weight = "2px";//style.strokeWidth + "px";
			stroke.opacity = 1;
			stroke.endcap = 'round';
		} else {
			label.stroked = false;
		}

		if (style.fill) {
			label.filled = true;
			label.fillcolor = style.fillColor;
			var fill = fill = this.createNode('olv:fill', featureId + "_fill");;
			fill.opacity = style.fillOpacity;
			label.appendChild(fill);
		} else {
			label.filled = false;
		}

		textbox.innerText = labelText;
		textbox.style.fontFamily = "monospace";
		textbox.style.fontSize = labelFontSize + "px";
		textbox.style.lineHeight = labelFontSize + "px";
		if (style.fontColor) {
			textbox.style.color = style.fontColor;
		}
		if (style.fontOpacity) {
			textbox.style.filter = 'alpha(opacity=' + (style.fontOpacity * 100) + ')';
		}
		if (style.fontFamily) {
			textbox.style.fontFamily = style.fontFamily;
		}
		if (style.fontWeight) {
			textbox.style.fontWeight = style.fontWeight;
		}

		if(style.labelSelect === true) {
			label._featureId = featureId;
			textbox._featureId = featureId;
			textbox._geometry = location;
			textbox._geometryClass = location.CLASS_NAME;
		}

		textbox.style.whiteSpace = "nowrap";

		var inset = ((labelFontSize/4) | 0) + "px";
		textbox.inset = inset + "," + inset + "," + inset + "," + inset;
		//if(!label.parentNode) {
			label.appendChild(textbox);
			this.textRoot.appendChild(label);
		//}

		var align = style.labelAlign || "cm";
		if (align.length == 1) {
			align += "m";
		}
		textbox.style.textAlign="center";
		var labelHeight = textbox.clientHeight;
		var xshift = 0;
		if (align.indexOf("l") == 0) {
			xshift = 0;;
		} else if (align.indexOf("r") == 0) {
			xshift = (labelWidth+(labelFontSize/2));
		} else {
			xshift = (labelWidth+(labelFontSize/2))/2;
		}
		var yshift = (labelHeight+(labelFontSize/2))/2;

		labelLeft = labelLeft - xshift - 1;
		labelTop = labelTop + yshift;

		label.style.left = (labelLeft | 0) + "px";
		label.style.top = (labelTop | 0) + "px";

	},

	drawText: function(featureId, style, location) {
		this._drawText(featureId, style, location, style.label);
	},
	CLASS_NAME: "webtis.Renderer.VML"
});
/* ======================================================================
    Layer/JSGIXMLLayer.js
   ====================================================================== */

/**
 * Class: webtis.Layer.JSGIXMLLayer
 * 電子国土Webシステム APIで電子国土Webシステム用XMLデータを表示するためのレイヤー
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
var JSGIXMLRequest={};
setTimeout("JSGIXMLRequest.checkJsonRequest()",1000);
JSGIXMLRequest._sequenceNo = 0;
JSGIXMLRequest.checkJsonRequest = function() {
	if (JSGIXMLRequest.queue) {
		for (var key in JSGIXMLRequest.queue) {
			var item = JSGIXMLRequest.queue[key];
			var testVar;
			eval("testVar = JSGIXMLRequest.gJSGIDataList["+item.currentId+"];");
			var currentTime = new Date();
			if ((currentTime.getTime() - item.startTime.getTime())>10000) {
				eval("delete JSGIXMLRequest.queue['"+item.scriptElement.id+"']");
				var headElements = document.getElementsByTagName("head");
				headElements[0].removeChild(item.scriptElement);
				var failure = item['scope'] ? OpenLayers.Function.bind(item['failure'],item['scope']):item['failure'];
				failure(item);
				continue;
			} else {
				eval("testVar = JSGIXMLRequest.gJSGIDataList["+item.currentId+"];");
			}
			if (testVar != undefined) {
				var headElements = document.getElementsByTagName("head");
				eval("delete JSGIXMLRequest.queue['"+item.scriptElement.id+"'];");
				headElements[0].removeChild(item.scriptElement);
				eval("JSGIXMLRequest.gJSGIDataList["+item.currentId+"]=undefined;");
				testVar.sourceItemId = item.currentId;
				item['result']=testVar;
				var success = item['scope']?OpenLayers.Function.bind(item['success'],item['scope']):item['success'];
				success(item);
			}
		}
	}
	setTimeout("JSGIXMLRequest.checkJsonRequest()",2000);
};
JSGIXMLRequest.getJSON = function(params) {
	if (!JSGIXMLRequest.gJSGIDataList) {
		JSGIXMLRequest.gJSGIDataList = new Array();
	}
	if (!JSGIXMLRequest.queue) {
		JSGIXMLRequest.queue = new Array();
	}
	var currentId = JSGIXMLRequest._sequenceNo++;
	var requestUrl = params['url'];
	var url = webtis.SERVER_URL.CONVERT_TO_JSON_SERVER+"?inFmt=path&callback="+currentId+"&content="+escape(requestUrl);
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.setAttribute('charset', 'UTF-8');
	script.src = url;
	script.id = "jsgijson"+currentId;
	var headElements = document.getElementsByTagName("head");
	headElements[0].appendChild(script);
	var item = params;
	item.currentId = currentId;
	item.scriptElement = script;
	item.startTime = new Date();
	JSGIXMLRequest.queue[script.id]=item;
};

webtis.Layer.JSGIXMLLayer = OpenLayers.Class(OpenLayers.Layer.Vector, {

	loadFailed: false,
	displayLevel: "all",
	subLayers: [],
	description: "",
	affix : false,

	initialize: function(name, url, options) {
		var newArguments = [];
		newArguments.push(name, options);
		OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
		this.url = url;
		if (options) {
			if (options.formatOptions) {
				this.affix = options.formatOptions.affix;
			}
		}
	},

	setVisibility: function(visibility, noEvent) {
		OpenLayers.Layer.Vector.prototype.setVisibility.apply(this, arguments);
		if(this.visibility && !this.loaded){
			this.loadJSON();
		}
	},

	moveTo:function(bounds, zoomChanged, minor) {
		OpenLayers.Layer.Vector.prototype.moveTo.apply(this, arguments);
		if(this.visibility && !this.loaded){
			this.loadJSON();
		}
	},

	loadJSON: function() {
		if (!this.loaded) {
			this.events.triggerEvent("loadstart");
			JSGIXMLRequest.getJSON({
				url: this.url,
				success: this.requestSuccess,
				failure: this.requestFailure,
				scope: this
			});
			this.loaded = true;
		}
	},

	setUrl:function(url) {
		this.url = url;
		this.destroyFeatures();
		this.loaded = false;
		this.loadJSON();
	},

	requestSuccess:function(doc) {
		if (doc.result) {
			var options = {
					"affix" : this.affix,
					"projection" : this.map.getProjectionObject()
			};
			var json = new webtis.Format.JSGIJSON(options);
			this.subLayers = json.read(doc.result);

			this.loadFailed = false;
			if (this.events) {
				this.events.triggerEvent("loadend");
			}
		}
	},

	requestFailure: function(doc) {
		//OpenLayers.Console.userError(OpenLayers.i18n("errorLoadingGML", {'url':this.url}));
		this.events.triggerEvent("loadend");
	},

	CLASS_NAME: "webtis.Layer.JSGIXMLLayer"
});

var JSGIXMLLoader={};
JSGIXMLLoader.loadXML = function(url,option) {
  JSGIXMLRequest.getJSON({
	    url: url,
	    success: function(doc) {
	    	var jsonOption = {};
	    	if (option && option.projection) {
	    		jsonOption.projection = option.projection;
	    	}
			var json = new webtis.Format.JSGIJSON(jsonOption);
			var subLayers = json.read(doc.result);
			if (option && option.success) {
				option.success(subLayers);
			}
		},
	    failure: function() {
			if (option && option.failure) {
				option.failure();
			}
		}
	  });
};
/* ======================================================================
    Control/ZoomInOutButtons.js
   ====================================================================== */

/**
 * Class: webtis.Control.ZoomInOutButtons
 * 電子国土Webシステム APIの拡大・縮小ボタンを表すコントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
webtis.Control.ZoomInOutButtons = OpenLayers.Class(OpenLayers.Control, {

	initialize: function() {
		OpenLayers.Control.prototype.initialize.apply(this, arguments);
	},

	createCtrlImage: function(url, left, handler) {
		var	image = document.createElement('img');
		image.src = url;
		image.style.position = "absolute";
		image.style.left = left + "px";
		image.style.width = '16px';
		image.style.height = '16px';
		if (handler) {
			// only handle click
			OpenLayers.Event.observe(image, "mousedown",
				OpenLayers.Function.bindAsEventListener(handler, this));
			OpenLayers.Event.observe(image, "click",
				OpenLayers.Function.bindAsEventListener(function(e) {
					OpenLayers.Event.stop(e);
					return false;
				}, this));
			OpenLayers.Event.observe(image, "dblclick",
				OpenLayers.Function.bindAsEventListener(function(e) {
					OpenLayers.Event.stop(e);
					return false;
				}, this));
		}
		this.div.appendChild(image);
	},

	draw: function (px) {
		if (this.div == null) {
			var mapSize = this.map.getSize();

			this.div = OpenLayers.Util.createDiv(this.id);
			this.div.style.position = "absolute";
			this.div.style.top = "10px";
			this.div.style.left = (mapSize.w - 45) + "px";

			this.createCtrlImage("http://cyberjapan.jp/images/minus.gif", 0, function(e) {
				this.map.zoomOut();
				OpenLayers.Event.stop(e);
				return false;
			});
			this.createCtrlImage("http://cyberjapan.jp/images/plus.gif", 19, function(e) {
				this.map.zoomIn();
				OpenLayers.Event.stop(e);
				return false;
			});
		}
		return this.div;
	},

	adjustPositionOnMapResize: function() {
		if (this.div != null) {
			var mapSize = this.map.getSize();
			this.div.style.left = (mapSize.w - 45) + "px";
		}
	},

	CLASS_NAME: "webtis.Control.ZoomInOutButtons"
});
/* ======================================================================
    Control/SelectFeature.js
   ====================================================================== */

/**
 * Class: webtis.Control.SelectFeature
 * 電子国土Webシステム APIの地物を選択するコントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control.SelectFeature>
 */
webtis.Control.SelectFeature = OpenLayers.Class(OpenLayers.Control.SelectFeature, {

	initialize: function(layers, options) {

		if (OpenLayers.Control.SelectFeature.prototype.EVENT_TYPES && OpenLayers.Control.prototype.EVENT_TYPES) {
			this.EVENT_TYPES =
				OpenLayers.Control.SelectFeature.prototype.EVENT_TYPES.concat(OpenLayers.Control.prototype.EVENT_TYPES)
		}

		OpenLayers.Control.prototype.initialize.apply(this, [options]);

		if(this.scope === null) {
			this.scope = this;
		}
		this.initLayer(layers);
		var callbacks = {
			click: this.clickFeature,
			clickout: this.clickoutFeature
		};
		if (this.hover) {
			callbacks.over = this.overFeature;
			callbacks.out = this.outFeature;
		}

		this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);
		var featureHandler = new OpenLayers.Handler.Feature(
				this, this.layer, this.callbacks,
				{geometryTypes: this.geometryTypes}
			);
		this.handlers = {
				feature: featureHandler
			};
		if (this.box) {
			this.handlers.box = new webtis.Handler.Box(
				this, {done: this.selectBox},
				{boxDivClassName: "olHandlerBoxSelectFeature"}
			);
		}
	},

	_selectBox: function(position) {
		// if multiple is false, first deselect currently selected features
		if (!this.multipleSelect()) {
			this.unselectAll();
		}
		var bounds = null;
		var clickPoint = null;
		var clicked = false;
		if (position instanceof OpenLayers.Bounds) {
			var minXY = this.map.getLonLatFromPixel(
				new OpenLayers.Pixel(position.left, position.bottom)
			);
			var maxXY = this.map.getLonLatFromPixel(
				new OpenLayers.Pixel(position.right, position.top)
			);
			bounds = new OpenLayers.Bounds(
				minXY.lon, minXY.lat, maxXY.lon, maxXY.lat
			);
			bounds = bounds.toGeometry();
		} else if (position instanceof OpenLayers.Pixel) {
			clicked = true;
			var clickLatLon1 = this.map.getLonLatFromPixel(new OpenLayers.Pixel(position.x-4, position.y-4));
			var clickLatLon2 = this.map.getLonLatFromPixel(new OpenLayers.Pixel(position.x+4, position.y+4));
			bounds = new OpenLayers.Bounds(
					clickLatLon1.lon, clickLatLon1.lat, clickLatLon2.lon, clickLatLon2.lat
				);
			bounds = bounds.toGeometry();
		} else {
			return;
		}

		// because we're using a box, we consider we want multiple selection
		var prevMultiple = this.multiple;
		this.multiple = true;
		var layers = this.layers || [this.layer];
		var layer;
		for(var l=0; l<layers.length; ++l) {
			layer = layers[l];
			if (!layer.JSGISelection) {
				continue;
			}
			for(var i=0, len = layer.features.length; i<len; ++i) {
				var feature = layer.features[i];
				// check if the feature is displayed
				if (!feature.getVisibility()) {
					continue;
				}

				if (this.geometryTypes == null || OpenLayers.Util.indexOf(
						this.geometryTypes, feature.geometry.CLASS_NAME) > -1) {
					if (feature.layer.styleType == 'circle') {
						// check circle bound in pixel unit
						var cxy = this.map.getPixelFromLonLat(
								new OpenLayers.LonLat(
										feature.geometry.x,
										feature.geometry.y));

						var style = feature.style;
						if (!style && feature.layer) {
							style = feature.layer.style;
						}
						if (!style && feature.layer) {
							style = feature.layer.styleMap;
						}
						if (style instanceof OpenLayers.StyleMap) {
							style = style.createSymbolizer(feature, "default");
						} else if (style instanceof OpenLayers.Style) {
							style = style.createSymbolizer(feature);
						}

						var radius = style.pointRadius;
						var circlePixBounds = new OpenLayers.Bounds(
								cxy.x - radius,
								cxy.y + radius,
								cxy.x + radius,
								cxy.y - radius);
						var pixPoint;
						if (position instanceof OpenLayers.Pixel) {
							pixPoint = new OpenLayers.Geometry.Point(position.x,position.y);
							if (circlePixBounds.toGeometry().intersects(pixPoint)) {
								if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
									this.select(feature);
									if (clicked) {
										this.multiple = prevMultiple;
										return;
									}
								}
							}
						} else {
							if (circlePixBounds.toGeometry().intersects(position.toGeometry())) {
								if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
									this.select(feature);
									if (clicked) {
										this.multiple = prevMultiple;
										return;
									}
								}
							}
						}
					} else {
						if (bounds != null && bounds.intersects(feature.geometry)) {
							if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
								this.select(feature);
								if (clicked) {
									this.multiple = prevMultiple;
									return;
								}
							}
						}
					}
				}
			}
		}
		this.multiple = prevMultiple;
	},

	selectBox: function(position) {
		this._selectBox(position);
		if ("function" === typeof selectionNum) {
			var numSelected = selectionNum();
			this.didSelected = false;
			if (numSelected > 0) {
				var list = webtis._selectionList();
				if (numSelected == 1) {
					if (webtis.callEventProc) {
						webtis.callEventProc(webtis.EV_SELECTION, list.list[0].feature);
					}
					return;
				}
				this.didSelected = true;
				var objList = new Array();
				for (var i = 0; i < list.list.length;i++) {
					var feature = list.list[i].feature;
					var id = feature.id;
					var idx = id.lastIndexOf("_");
					if (idx > -1) {
						var nid = parseInt(id.substr(idx + 1));
						if (!isNaN(nid)) {
							objList.push(feature.objid);
						} else {
							alert("Unexpected feature ID: " + feature.id);
						}
					} else {
						alert("Unexpected feature ID: " + feature.id);
					}
				}
				if (webtis.callEventProc) {
					webtis.callEventProc(webtis.EV_MSELECTION, objList);
				}
			}
		}
	},

	addLayer: function(layer) {
		var isActive = this.active;
		if (!this.layers) {
			this.setLayer([layer]);
		} else {
			this.layers.push(layer);
			if (isActive) {
				this.activate();
			}
		}
	},

    clickFeature: function(feature) {
    	if(!this.hover) {
            var selected = (OpenLayers.Util.indexOf(
                feature.layer.selectedFeatures, feature) > -1);
            if(selected) {
                if(this.toggleSelect()) {
                    this.unselect(feature);
                } else if(!this.multipleSelect()) {
                	this.unselect(feature);
                    this.select(feature);
/*
                	if (this.didSelected) {
                	} else {
                		this.unselectAll({except: feature});
                	}
                	this.didSelected = false;
*/
                }
            } else {
                if(!this.multipleSelect()) {
                    this.unselectAll({except: feature});
                }
    			if (!feature.layer.JSGISelection) {
    				return;
    			}

                this.select(feature);
                //
				var id = feature.id;
				var idx = id.lastIndexOf("_");
				var nid = null;
				if (idx > -1) {
					nid = parseInt(id.substr(idx + 1));
					if (isNaN(nid)) {
						alert("Unexpected feature ID: " + feature.id);
					}
				} else {
					alert("Unexpected feature ID: " + feature.id);
				}
				if (webtis.callEventProc) {
					webtis.callEventProc(webtis.EV_SELECTION, feature);
				}
            }
        }
    },

	CLASS_NAME: "webtis.Control.SelectFeature"
});
/* ======================================================================
    Control/Navigation.js
   ====================================================================== */

/**
 * Class: webtis.Control.Navigation
 * 電子国土Webシステム APIのマウス操作に合わせたOpenLayers.Control.Navigationの拡張コントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control.Navigation>
 */
webtis.Control.Navigation = OpenLayers.Class(OpenLayers.Control.Navigation, {

	semiFixed: false, // mouse wheel only

	activate: function() {
		if (this.semiFixed) {
			if (this.zoomWheelEnabled) {
				this.handlers.wheel.activate();
			}
			return OpenLayers.Control.prototype.activate.apply(this,arguments);
		} else {
			this.dragPan.activate();
			if (this.zoomWheelEnabled) {
				this.handlers.wheel.activate();
			}
			this.handlers.click.activate();
			if (this.zoomBoxEnabled) {
				this.zoomBox.activate();
			}
			return OpenLayers.Control.prototype.activate.apply(this,arguments);
		}
	},

	wheelChange: function(evt, deltaZ) {
		var currentZoom = this.map.getZoom();
		var newZoom = this.map.getZoom() + Math.round(deltaZ);
		newZoom = Math.max(newZoom, 0);
		newZoom = Math.min(newZoom, this.map.getNumZoomLevels());
		if (newZoom === currentZoom) {
			return;
		}
		var size    = this.map.getSize();
		var deltaX  = size.w/2 - evt.xy.x;
		var deltaY  = evt.xy.y - size.h/2;
		var newRes  = this.map.baseLayer.getResolutionForZoom(newZoom);
		var zoomPoint = this.map.getLonLatFromPixel(evt.xy);

		var zoomPoint = this.map.getLonLatFromPixel(evt.xy);
		var newCenter = new OpenLayers.LonLat(
							zoomPoint.lon + deltaX * newRes,
							zoomPoint.lat + deltaY * newRes );
		this.map.setCenter( newCenter, newZoom );
	},

	CLASS_NAME: "webtis.Control.Navigation"
});
/* ======================================================================
    Layer/JSGIGeoTiffLayer.js
   ====================================================================== */

/**
 * Class: webtis.Layer.JSGIGeoTiffLayer
 * 電子国土Webシステム APIでGeoTiffを表示するためのレイヤー
 *
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */
webtis.Layer.JSGIGeoTiffLayer = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    name: "JSGIGeoTiff",

    sphericalMercator: true,
    wrapDateLine: false,
    geoTiffURL : null,
    url: webtis.SERVER_URL.GEOTIFF_TILE_SERVER+"?url=${url}&zoomLevel=${z}&tileId=${x}${y}",

    isBaseLayer:false,
    BASE_EXTENT: new OpenLayers.Bounds(
            -128 * 156543.03390625,
            -128 * 156543.03390625,
            128 * 156543.03390625,
            128 * 156543.03390625
    ),
    // 20段階分の解像度
    BASE_RESOLUTIONS : [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677],

    /**
     * 初期化
     * @param name
     * @param options
     */
    initialize: function(name, geoTiffURL) {
        this.geoTiffURL = geoTiffURL;
        this.name = name;
        this.projection = new OpenLayers.Projection("EPSG:900913");

        var newArguments = [this.name, this.url, {}, {}];
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
    },

    /**
     * Method: destroy
     */
    destroy: function() {
        OpenLayers.Layer.XYZ.prototype.destroy.apply(this, arguments);
    },


	clone: function(obj) {
        if (obj == null) {
            obj = new webtis.Layer.JSGIGeoTiffLayer(this.name, this.geoTiffURL);
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },

    /**
     * Method: setMap
     */
    setMap: function() {
        OpenLayers.Layer.XYZ.prototype.setMap.apply(this, arguments);
        // mapに追加した時に、ベースマップの情報で再初期化
        this.zoomOffset = this.map.baseLayer.options.minZoomLevel;
        this.addOptions(this.map.baseLayer.options,true);
        this.clearGrid();
    	this.redraw();
    },

    /**
     * Method: getXYZ
     * Calculates x, y and z for the given bounds.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {Object} - an object with x, y and z properties.
     */
    getXYZ: function(bounds) {
        var res = this.map.getResolution();
        // ベースレイヤが、webtis.Layer.BaseMapである必要があります。
        var zoomOffset = this.map.baseLayer.zoomOffset;
        var x = Math.round((bounds.left - this.BASE_EXTENT.left) /
            (res * this.tileSize.w));
        var y = Math.round((this.BASE_EXTENT.top - bounds.top) /
            (res * this.tileSize.h));
        var z = this.serverResolutions != null ?
            OpenLayers.Util.indexOf(this.serverResolutions, res) :
            this.map.getZoom() + zoomOffset;

        var limit = Math.pow(2, z);
        if (this.wrapDateLine)
        {
           x = ((x % limit) + limit) % limit;
        }

        return {'x': this.zeroPad(x,7), 'y': this.zeroPad(y,7), 'z': z};
    },

    zeroPad : function(num,len) {
    	var result = ""+num;
    	while (result.length < len) {
    		result = "0"+result;
    	}
    	return result;
    },

    /**
     * URLを作成
     */
    getURL: function (bounds) {
        var xyz = this.getXYZ(bounds);
        xyz.url = escape(this.geoTiffURL);
        var url = this.url;
        return OpenLayers.String.format(url, xyz);
    },

    getZoomForExtent :  function(bounds,closest) {
    	var zoom = OpenLayers.Layer.XYZ.prototype.getZoomForExtent.apply(this, arguments);
    	return zoom;
    },

    CLASS_NAME: "webtis.Layer.JSGIGeoTiffLayer"
});
/* ======================================================================
    Layer/BaseMap.js
   ====================================================================== */

/**
 * Class: webtis.Layer.BaseMap
 * 電子国土Webシステムの背景地図画像を表示するクラス
 *
 * 内部での投影法は、WebMercatorを指定しており、座標はメルカトルのメートルで管理されています。
 * 座標指定は、メートル座標で行う必要があります。詳しくは、
 * http://docs.openlayers.org/library/spherical_mercator.html
 * を参照ください。
 *
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 *
 * Examples:
 * (code)
 * 使用例
 * var webtisMap = new webtis.Layer.BaseMap();
 * var map = new OpenLayers.Map('map',{
 *   // 電子国土Webシステムの背景地図ががサポートする範囲に表示範囲を制限する
 *    restrictedExtent:
 *       new OpenLayers.Bounds(121.0, 16.0, 158.0, 48.0).transform(
 *           new OpenLayers.Projection("EPSG:4326"),webtis.projection)
 * });
 * // レイヤーを追加
 * map.addLayer(webtisMap);
 * // 中心座標を緯度経度で指定
 * map.setCenter(
 *    new OpenLayers.LonLat(139.7671653,35.68096937).transform(
 *        new OpenLayers.Projection("EPSG:4326"),webtis.projection), 0);
 *
 * (end)
 */
webtis.Layer.BaseMap = OpenLayers.Class(OpenLayers.Layer.XYZ,{
	name : "WEBTIS",
	attribution : "国土地理院　",
	attributionTemplate : '<span>${copyright} ${title}${legend}</span>',

	sphericalMercator : true,
	dataSet : null,
	wrapDateLine : false,
	zoomOffset : 0,
	side: webtis.TILE_SIDE,
	errorImagePath: null,
	is20130822 : null,

	url : webtis.SERVER_URL.BASEMAP_TILE_SERVER+"/${did}/latest/${z}${dir}/${x}${y}.${ext}",					//デフォルトのサーバ
	urlJpg : webtis.SERVER_URL.BASEMAP_TILE_SERVER+"/${did}/latest/${z}${dir}/${x}${y}.jpg",					//デフォルトのサーバ(jpg)
	url2 : webtis.SERVER_URL.BASEMAP_TILE_SERVER2+"/${did}/latest/${z}${dir}/${x}${y}.${ext}",					//特定のファイル群だけはこっちのサーバ
	url3 : webtis.SERVER_URL.BASEMAP_TILE_SERVER3+"/${did}/${z}/${x}/${x}-${y}-${z}.${ext}",							//地理空間情報ライブラリサーバ
	url4 : webtis.SERVER_URL.BASEMAP_TILE_SERVER4+"/${did}/latest/${z}${dir}/${x}${y}.${ext}",							//新彩色地図用サーバ
	urlDM : webtis.SERVER_URL.BASEMAP_TILE_SERVER2+"/DM/${did}/latest/${z}${dir}/${x}${y}.${ext}",					//DM（都市計画基図と砂防基盤図用）
	searchTileUrl : webtis.SERVER_URL.SEARCH_TILE_SERVER+"?did=${did}&zl=${z}&tid=${x}${y}&per=${per}",
	metaUrl : webtis.SERVER_URL.METADATA_SERVER,
	availableMapUrl : webtis.SERVER_URL.AVAILABLE_MAP_SERVER,
//	url_naibu_sar : webtis.SERVER_URL.BASEMAP_TILE_SERVER_NAIBU + "/tiles/20130919sar/${did}/${z}/${x}/${y}.${ext}",
	urlKIBANCHIZU : webtis.SERVER_URL.GEOLIB_TILE_SERVER2 + "/KIBANCHIZU/${did}/${z}/${x}/${y}.${ext}",
//	url_naibu_chijiki : webtis.SERVER_URL.BASEMAP_TILE_SERVER_NAIBU2 + "/${did}/${z}/${x}/${y}.${ext}",
//	urlJIKIZU : webtis.SERVER_URL.GEOLIB_TILE_SERVER2 + "/JIKIZU/${did}/${z}/${x}/${y}.${ext}",
//	urlVLCD : webtis.SERVER_URL.VLCD_TILE_SERVER + "/${did}/${z}/${x}/${y}.${ext}",							//火山土地条件図
//	urlVBM : webtis.SERVER_URL.VBM_TILE_SERVER + "/${did}/${z}/${x}/${x}-${y}-${z}.${ext}",								//火山基本図
	urlLUM4BL : webtis.SERVER_URL.LUM4BL_TILE_SERVER + "/${did}/${z}/${x}/${y}.${ext}",
	urlGEOLIB : webtis.SERVER_URL.GEOLIB_TILE_SERVER + "/${did}/${z}/${x}/${x}-${y}-${z}.${ext}",
//	urlGEOLIBizuoshima : webtis.SERVER_URL.GEOLIB_TILE_SERVER0 + "izuoshima/${did}/${z}/${x}/${x}-${y}-${z}.${ext}",			//台風26号（2013年）伊豆大島タイル
	urlXYZTile : webtis.SERVER_URL.XYZ_TILE_SERVER + "/${did}/${z}/${x}/${y}.${ext}",
	urlXYZTileJpg : webtis.SERVER_URL.XYZ_TILE_SERVER + "/${did}/${z}/${x}/${y}.jpg",
	urlSAIGAI20130717yama : webtis.SERVER_URL.XYZ_TILE_SERVER + "/test_20130717yama/${z}/${x}/${y}.png",
//	url2013Typhoon26 : webtis.SERVER_URL.SAIGAI_SERVER + "1/20131017/o/${did}/${z}/${x}/${y}.png",					//台風26号（2013年）伊豆大島垂直写真タイル
//	urlLibGMLD : webtis.SERVER_URL.LIB_TILE_SERVER + "/${did}/${z}/${x}/${x}-${y}-${z}.${ext}",
	urlOldScheme: webtis.SERVER_URL.BASEMAP_TILE_SERVER+"/${did}/${z}${dir}/${x}${y}.${ext}",			//地理院独自従来版タイルスキーム
	urlSAR : webtis.SERVER_URL.GEOLIB_TILE_SERVER2 + "/${did}/${z}/${x}/${y}.${ext}",
	urlThematic :  webtis.SERVER_URL.BASEMAP_TILE_SERVER3 + "/${did}/${z}/${x}/${y}.${ext}",

	/////////////////////			20150203
	urlCCM :   webtis.SERVER_URL.XYZ_TILE_SERVER + "/${did}/${z}/${x}/${y}.${ext}",
	urlVLCD :  webtis.SERVER_URL.XYZ_TILE_SERVER + "/VLCD/${did}/${z}/${x}/${y}.${ext}",							//火山土地条件図
	urlVBM :   webtis.SERVER_URL.XYZ_TILE_SERVER + "/VBM/${did}/${z}/${x}/${y}.${ext}",								//火山基本図
	urlLibGMLD : 			webtis.SERVER_URL.XYZ_TILE_SERVER + "/${did}/${z}/${x}/${y}.${ext}",						//	地球地図．地球地図全体版．土地被覆(GLCNMO)	||	地球地図．地球地図全体版．植生(樹木被覆率)
	urlLUM200kTile :   		webtis.SERVER_URL.XYZ_TILE_SERVER + "/LUM200K/${z}/${x}/${y}.${ext}",								//火山基本図
	urlGEOLIBizuoshima :	webtis.SERVER_URL.XYZ_TILE_SERVER + "/izuoshima/${did}/${z}/${x}/${y}.${ext}",			//台風26号（2013年）伊豆大島タイル
	url2013Typhoon26 : 		webtis.SERVER_URL.XYZ_TILE_SERVER + "/${did}/${z}/${x}/${y}.png",					//台風26号（2013年）伊豆大島垂直写真タイル
	urlJIKIZU : 			webtis.SERVER_URL.XYZ_TILE_SERVER + "/JIKIZU/${did}/${z}/${x}/${y}.${ext}",
	/////////////////////			20150203



	BASE_EXTENT : new OpenLayers.Bounds(-128 * 156543.03390625,
			-128 * 156543.03390625, 128 * 156543.03390625,
			128 * 156543.03390625),
	// 20段階分の解像度
    BASE_RESOLUTIONS : [
    	webtis.TILE_BASE_RESOLUTIONS[0] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[1] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[2] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[3] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[4] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[5] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[6] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[7] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[8] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[9] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[10] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[11] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[12] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[13] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[14] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[15] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[16] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[17] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[18] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[19] * (256 / webtis.TILE_SIDE)
    ],

    /**
     * Constructor: webtis.Layer.BaseMap
     * 電子国土Webシステムの背景地図画像を表示するレイヤーを生成します。
     *
     * Parameters:
     * name - {String} レイヤー名。未指定の場合は、"WEBTIS"が使用されます。
     * options - {Object} オプションを指定。未指定の場合は、デフォルトの状態で動作します。
     * 			dataset : 初期状態で使用するデータセットを指定。サンプルを参照。
     *
     * Returns:
     * {<webtis.Layer.BaseMap>} 生成された電子国土Webシステムの背景地図画像を表示するレイヤー
     *
     * Examples:
     * (code)
     * 使用する背景地図データの定義方法は、以下の通りです。
     * ※検索期間を設定できるデータIDは、限定されています。
     * var dataset = {
     *  【縮尺番号1】: {
     *          "dataId" : 【使用するデータID】,
     *          "beginUse" : 【データを検索する期間の開始年月日を指定するか否か(true | false)】,
     *          "begin" : 【データを検索する期間の開始年月日を指定(yyyyMMdd)】,
     *          "endUse" : 【データを検索する期間の終了年月日を指定するか否か(true | false)】,
     *          "end" : 【データを検索する期間の終了年月日を指定(yyyyMMdd)】
     *    },
     *    .........
     *   【縮尺番号n】: {
     *          "dataId" : 【使用するデータID】,
     *          "beginUse" : 【データを検索する期間の年月日を指定するか否か(true | false)】,
     *          "begin" : 【データを検索する期間の開始年月日を指定(yyyyMMdd)】,
     *          "endUse" : 【データを検索する期間の終了年月日を指定するか否か(true | false)】,
     *          "end" : 【データを検索する期間の終了年月日を指定(yyyyMMdd)】
     *          }
     *   };
     * (end)
     */
	initialize : function(name, options) {
		var url = url || this.url;
		name = name || this.name;
		this.projection = new OpenLayers.Projection("EPSG:900913");

		// タイルサイズ設定
		if (typeof options != "undefined" && options.tileSide) {
			this.side = options.tileSide;
			for (var i = 0; i < 20; i++) {
				this.BASE_RESOLUTIONS[i] = webtis.TILE_BASE_RESOLUTIONS[0] * (256 / this.side);
			}
		}

		// データセット設定
		var dataSet;
		if (options && options.dataSet) {
			dataSet = options.dataSet;
		} else {
			dataSet = this.defaultDataSet;
		}
		options = this._createOptionFromDataSet(dataSet,options);
		this.dataSet = dataSet;
		this.zoomOffset = options.minZoomLevel;

		var newArguments = [ name, url, {}, options ];
		OpenLayers.Layer.Grid.prototype.initialize.apply(this,newArguments);

		// メタデータを取得
		var metaJS = document.createElement("script");
		metaJS.setAttribute("type","text/javascript");
		var key = "j"+webtis.Layer.BaseMap.j_c;
		var that = this;
		webtis.Layer.BaseMap[key] = function(ev) {
			metaJS.parentNode.removeChild(metaJS);
			delete webtis.Layer.BaseMap[key];
			that.metaData = ev.items;
			if (that.map) {
				that.updateAttribution();
				that.redraw();
			}
		};

		// OLバージョン判定
		this.is20130822 = this.getServerResolution == null;

		// タイルサイズの設定
		this.tileSize = new OpenLayers.Size(this.side, this.side),

		// タイルの表示エラー
		this.events.register('tileerror', this, this.imageLoadError);

//		metaJS.setAttribute("src", this.availableMapUrl+"?callback=webtis.Layer.BaseMap.j"+webtis.Layer.BaseMap.j_c);
		webtis.Layer.BaseMap.j_c++;
		document.getElementsByTagName("head")[0].appendChild(metaJS);
		this.metaJS = metaJS;
	},

	/**
	 * Method: destroy
	 */
	destroy : function() {
		this.map&& this.map.events.unregister("moveend", this,this.updateAttribution);
		this.events.unregister('tileerror', this, this.imageLoadError);
		OpenLayers.Layer.XYZ.prototype.destroy.apply(this,arguments);
	},

	clone : function(obj) {
		if (obj == null) {
			obj = new webtis.Layer.BaseMap(this.name, this.getOptions());
			//obj = new webtis.Layer.BaseMap(this.name, this.url,this.getOptions());
		}
		obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this,[ obj ]);
		return obj;
	},

	/**
	 * Method: getXYZ Calculates x, y and z for the given
	 * bounds.
	 *
	 * Parameters: bounds - {<OpenLayers.Bounds>}
	 *
	 * Returns: {Object} - an object with x, y and z properties.
	 */
	getXYZ : function(bounds) {
		if (!this.is20130822) {
			var res = this.map.getResolution();
			var z = this.serverResolutions != null ? OpenLayers.Util
					.indexOf(this.serverResolutions, res)
					: this.map.getZoom() + this.zoomOffset;

			var newTileSize = this.tileSize;

			var extZL = this.getTileExtentZL(z, this.dataSet[z]["dataId"]);
			if (extZL != z) {
				newTileSize = this.getExtentImageSize(this.tileSize, z, extZL);
			}

			var x = Math
					.round((bounds.left - this.BASE_EXTENT.left)
							/ (res * newTileSize.w));
			var y = Math.round((this.BASE_EXTENT.top - bounds.top)
					/ (res * newTileSize.h));

			var limit = Math.pow(2, z);
			if (this.wrapDateLine) {
				x = ((x % limit) + limit) % limit;
			}

			return {
				'x' : this.zeroPad(x, 7),
				'y' : this.zeroPad(y, 7),
				'z' : z
			};
		}
		else {
			var res = this.map.getResolution();
			var x = Math
					.round((bounds.left - this.BASE_EXTENT.left)
							/ (res * this.tileSize.w));
			var y = Math.round((this.BASE_EXTENT.top - bounds.top)
					/ (res * this.tileSize.h));
			var z = this.serverResolutions != null ? OpenLayers.Util
					.indexOf(this.serverResolutions, res)
					: this.map.getZoom() + this.zoomOffset;

			var limit = Math.pow(2, z);
			if (this.wrapDateLine) {
				x = ((x % limit) + limit) % limit;
			}

			var newTileSize = this.tileSize;
			//特定のズームレベルでかつ特定のデータIDのときは、1つ小さいズームレベルのタイルを表示させるための処理
			if((z==18)&&(
				(this.dataSet[z]["dataId"]=="DJBMO")||
				(this.dataSet[z]["dataId"]=="ort")||
				(this.dataSet[z]["dataId"].indexOf("NLII")!=-1)||
				(this.dataSet[z]["dataId"].indexOf("TOHO1")!=-1)||
				(this.dataSet[z]["dataId"].indexOf("toho1")!=-1)))	{
				newTileSize = new OpenLayers.Size(this.side * 2, this.side * 2);
			}else{
				newTileSize = new OpenLayers.Size(this.side, this.side);
			}

			if (this.dataSet[z]["dataId"] == "RELIEF" || this.dataSet[z]["dataId"] == "relief" ) {
				switch(z){
				case 16:
					newTileSize = new OpenLayers.Size(this.side * 2, this.side * 2);
					break;

				case 17:
					newTileSize = new OpenLayers.Size(this.side * 4, this.side * 4);
					break;

				case 18:
					newTileSize = new OpenLayers.Size(this.side * 8, this.side * 8);
					break;

				default:
					newTileSize = new OpenLayers.Size(this.side, this.side);
					break;
				}
			}

			if (this.tileSize != newTileSize) {
				this.tileSize = newTileSize;
			}

			return {
				'x' : this.zeroPad(x, 7),
				'y' : this.zeroPad(y, 7),
				'z' : z
			};
		}
	},

	zeroPad : function(num, len) {
		var result = "" + num;
		while (result.length < len) {
			result = "0" + result;
		}
		return result;
	},

	/**
	 * URLを作成
	 */
	getURL : function(bounds) {
		var xyz = this.getXYZ(bounds);
		if (!this.dataSet[xyz.z]) {
			return "";
		}
		xyz.did = this.dataSet[xyz.z]["dataId"];
		
		//旧版データIDを新版データIDに変更する
		if(xyz.did == "RELIEF") xyz.did = "relief";
		if(xyz.did == "JAIS") xyz.did = "std";
		if(xyz.did == "BAFD1000K") xyz.did = "std";
		if(xyz.did == "BAFD200K") xyz.did = "std";
		if(xyz.did == "DJBMM") xyz.did = "std";
		if(xyz.did == "DJBMO") xyz.did = "ort";
		if(xyz.did == "NLII1") xyz.did = "gazo1";
		if(xyz.did == "NLII2") xyz.did = "gazo2";
		if(xyz.did == "NLII3") xyz.did = "gazo3";
		if(xyz.did == "NLII4") xyz.did = "gazo4";
		if(xyz.did == "TOHO1") xyz.did = "toho1";
		if(xyz.did == "TOHO2") xyz.did = "toho2";
		
		if (xyz.did == 'TRANSPARENT') {
			return webtis.SERVER_URL.TRANSPARENT_FILE;
		}

		//特定のズームレベルでかつ特定のデータIDのときは、1つ小さいズームレベルのタイルを表示させるための処理
		if((xyz.z==18)&&(
			(xyz.did=="DJBMO")||
			(xyz.did=="ort")||
			(xyz.did.indexOf("NLII")!=-1)||
			(xyz.did.indexOf("TOHO1")!=-1)||
			(xyz.did.indexOf("toho1")!=-1))) {
			xyz.z = xyz.z -1;
		}

		if(xyz.z > 15 && (xyz.did == "RELIEF" || xyz.did == "relief") ){
			xyz.z = 15;
		}

////////////////////////////////////////////////////////////////////////
//		//特定のズームレベルかつ特定のデータIDのとき、エラータイルを表示する
//		if((xyz.z==18)&&((xyz.did=="pale")||(xyz.did=="D2500"))) {
//			return this.errorImagePath;
//		}
		//特定のズームレベルかつ特定のデータIDのとき、エラータイルを表示する
		if((xyz.z==18)&&((xyz.did=="D2500")))
		{
			return this.errorImagePath;
		}
////////////////////////////////////////////////////////////////////////


		var url;
		var currentData = this.getCurrentData();
		if (currentData.endUse) {
			url = this.searchTileUrl;
			var per = "";
			if (currentData.beginUse) {
				per += currentData.begin;
			}
			per += "_";
			if (currentData.endUse) {
				per += currentData.end;
			}
			xyz.per = per;
		}
		else
		{
			var ext = "png";
/*
			if((xyz.did.match(/^SAR_/))
					|| xyz.did.match(/^NDVI_250m/)
					|| xyz.did.match(/^BUILD_/)
				)
			{		//サーバのメタデータを取りに行かないようにする
			}
			else
			{
				var curMetaData = this.getCurrentMetaData();
				if (!curMetaData)
				{
					return "";
				}
				var imageFormat = curMetaData.imageFormat.toLowerCase();
				if (imageFormat == "png") {
					ext = "png";
				} else if (imageFormat == "jpeg" || imageFormat == "jpg") {
					ext = "jpg";
				}
			}
*/
			/////////////////////////////////////////-------------------------------------------

			xyz.ext = ext;
			// 静的なファイルを使う場合

			//データIDにより、タイル配信サーバを変える
			if((xyz.did=='JAIS2')||(xyz.did=='JAISG')||(xyz.did=='BLANK')||(xyz.did=='BLANKM')||(xyz.did=='BLANKC')||(xyz.did=='SPRING')||(xyz.did=='SUMMER')||(xyz.did=='AUTUMN')||(xyz.did=='WINTER')||(xyz.did=='GRAY')||(xyz.did=='BAFD1000K2')||(xyz.did=='BAFD200K2')||(xyz.did=='BAFD1000KG')||(xyz.did=='BAFD200KG'))
			{
				url = this.url2;
			}
			/////////////////////////////////////////////////////////////
			else if( xyz.did.match(/^BUILD_/) )
			{
				var aStr = xyz.did.split( "__" );

				var sURL	=	aStr[1]  + "/${z}/${x}/${y}.${ext}";
				xyz.x 		= 	Number(xyz.x);
				xyz.y 		= 	Number(xyz.y);

				if( aStr.length >= 3 )
				{
					xyz.ext		=	aStr[2];
				}
				else
				{
					xyz.ext		=	"png";
				}
				var sResult	=	 OpenLayers.String.format( sURL, xyz );
				return sResult;
			}
			//////////////////////////////////////////////////////////////
			else if((xyz.did.match(/^[0-4][0-9]SABO$/))||(xyz.did.match(/^[0-4][0-9][0-9][0-9][0-9]DM$/)))	{		//DM（都市計画基図、砂防基盤図）の判定
				url = this.urlDM;
			}else if((xyz.did=='CCM1')||(xyz.did=='CCM2'))	{
				url = this.urlCCM;
			}else if((xyz.did=='D200K')||(xyz.did=='D25K2BRWN')||(xyz.did=='D25K2')||(xyz.did=='D2500')||(xyz.did=='D200KBRWN')||(xyz.did=='D200KGRN')||(xyz.did=='D200KG')||(xyz.did=='D25K2GRN')||(xyz.did=='D25KG')||(xyz.did=='D2500G'))	{
				url = this.url4;
			}else if((xyz.did=='16akandake')||(xyz.did=='02tokachidake')||(xyz.did=='10tarumaesan')||(xyz.did=='09usuzan')||(xyz.did=='05komagatake')||(xyz.did=='00iwatesan')||(xyz.did=='00kurikomayama')||(xyz.did=='14adatarayama')||(xyz.did=='11bandaisan')||(xyz.did=='13izuoshima')||(xyz.did=='06miyakezima')||(xyz.did=='03kusatsushiranesan')||(xyz.did=='12fujisan')||(xyz.did=='00ontakesan')||(xyz.did=='15kujirenzan')||(xyz.did=='04asosan')||(xyz.did=='07unzendake')||(xyz.did=='08kirishimayama')||(xyz.did=='01sakurazima')||(xyz.did=='17satsumaiojima')){
				url = this.urlVLCD;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}else if((xyz.did.match(/(capital|chubu|kinki)[0-9][0-9][0-9][0-9]/))){
				url = this.urlLUM4BL;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}else if((xyz.did.match(/^vbm[0-9][0-9]/))){
				url = this.urlVBM;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}else if(
//					(xyz.did=='LAKE1')||(xyz.did=='LAKE2')


					(xyz.did=='FM')

//					||(xyz.did=='lum200k')
					||(xyz.did=='LCMFC'))
			{
				url = this.urlGEOLIB;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}
			///////////////////////////		20150203
			else if( xyz.did == 'lum200k' )
			{
				url = this.urlLUM200kTile;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}
			else if((xyz.did=='LAKE1')||(xyz.did=='LAKE2') )
			{
				url = this.urlXYZTile;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}
			///////////////////////////		20150203

			else if((xyz.did=='vbm2_izuoshima_chocolate')||(xyz.did=='laserortho')){
				url = this.urlGEOLIBizuoshima;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}else if((xyz.did=='20131017dol')){
				url = this.url2013Typhoon26;
				xyz.x = Number(xyz.x);
//				xyz.y = Math.pow(2, xyz.z) - Number(xyz.y) - 1;		//		20150205
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}else if((xyz.did.match(/^20130717/))||(xyz.did=='20130902dol')||(xyz.did=='20130902doh')||(xyz.did=='std')||(xyz.did=='std2012')||
			         (xyz.did=='pale')||(xyz.did=='blank')||(xyz.did=='20131017dol2')||(xyz.did=='20131204doh')||(xyz.did=='20131204doh2')||
			         (xyz.did=='20131217doh')||(xyz.did=='20131217doh2')||(xyz.did=='20140216doh')||(xyz.did=='20140216doh2')||(xyz.did=='20131224lsi')||
			         (xyz.did=='brownshade2012')||(xyz.did=='greenshade2012')||(xyz.did=='transparent2012')||(xyz.did=='monotoneshade2012')||
//			         (xyz.did=='monotone2012')||(xyz.did=='ort')||(xyz.did=='english')||(xyz.did=='photoarea')||(xyz.did=='airphoto')||
			         (xyz.did=='monotone2012')||(xyz.did=='english')||(xyz.did=='photoarea')||(xyz.did=='airphoto')||
			         (xyz.did=='20140226lsi')||(xyz.did=='fukkokizu')||(xyz.did=='fgd')||(xyz.did=='20140330lsi')||(xyz.did=='20140322dol')||(xyz.did=='20140322dol2')||


			         (xyz.did=='20140517lsi')||
			         (xyz.did=='20130903lsi')||
			         (xyz.did=='20140602lsi')||
			         (xyz.did=='20140704lsi')||
					(xyz.did=='LCMFC01')||
					(xyz.did=='LCMFC02')||
					(xyz.did=='swale')||
					(xyz.did=='20140820dol')||
					(xyz.did=='20140820dol2')||
					(xyz.did=='20140820dol3')||
					(xyz.did == '20140819dol') ||
					(xyz.did=='gmjpn_airp')||
					(xyz.did=='gmjpn_rstatp')||
					(xyz.did=='gmjpn_raill')||
					(xyz.did=='gmjpn_roadl')||
					(xyz.did=='gmjpn_ferryl')||
					(xyz.did=='gmjpn_portp')||
					(xyz.did=='gmjpn_polbndl')||
					(xyz.did=='gmjpn_polbnda')||
					(xyz.did=='gmjpn_coastl')||
					(xyz.did=='gmjpn_riverl')||
					(xyz.did=='gmjpn_inwatera')||
					(xyz.did=='gmjpn_builtupa')||
					(xyz.did=='gmjpn_builtupp')||
					(xyz.did=='20140711dol')||
					(xyz.did=='20140704dol')||
					(xyz.did == '20140704dol2')||
					(xyz.did == 'fgd2500_area')||
					(xyz.did == '20140813dol') ||
					(xyz.did == '20140813doh') ||					//		Gyousei
					(xyz.did == '20140819doh') ||
					(xyz.did == '20140821lsi') ||
					(xyz.did == '19480000dol') ||
					(xyz.did == '19620000dol') ||
					(xyz.did == '20140828dol') ||
					(xyz.did == '20140830dol') ||
					(xyz.did == '20140831dol') ||
					(xyz.did == '20140906lsi') ||
					(xyz.did == '20140928dol') ||
					(xyz.did == '20140927d_vlcd_t_ontake') ||
					(xyz.did == '20140929dol') ||
					(xyz.did == '20140929dol2') ||
					(xyz.did == '20140930dol') ||
//					(xyz.did == '20140818-0929d_sar_ontake') ||
//					(xyz.did == '20140818d_mag_ontake') ||
//					(xyz.did == '20140929d_mag_ontake') ||


					(xyz.did == '20140818-0929d_sar_ontake') ||
					(xyz.did == '20140822_1003d_sar_ontake') ||
					(xyz.did == '20140818d_mag_ontake') ||
					(xyz.did == '20140929d_mag_ontake') ||
					(xyz.did == '20141008lsi') ||


//			         (xyz.did=='toho1')||(xyz.did=='toho2')||(xyz.did=='toho3')||(xyz.did=='toho1area')||(xyz.did=='toho2area')||(xyz.did=='toho3area')||
//			         (xyz.did=='gazo1')||(xyz.did=='gazo2')||(xyz.did=='gazo3')||(xyz.did=='gazo4')||(xyz.did=='relief')||
			         (xyz.did=='toho1area')||(xyz.did=='toho2area')||(xyz.did=='toho3area')||(xyz.did=='relief')||
			         (xyz.did=='LCM25K')||(xyz.did=='LCM25K_2011')||(xyz.did=='LCM25K_2012'))
			{
				url = this.urlXYZTile;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}
			else if(
				(xyz.did == 'toho1') || (xyz.did == 'toho2') || (xyz.did == 'toho3') || (xyz.did == 'ort') ||
				(xyz.did == 'gazo1') || (xyz.did == 'gazo2') || (xyz.did == 'gazo3') || (xyz.did == 'gazo4')
			) {
				url = this.urlXYZTileJpg;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}
			else if(
				(xyz.did == 'gazo1area') ||
				(xyz.did == 'gazo2area') ||
				(xyz.did == 'gazo3area') ||
				(xyz.did == 'gazo4area') )
			{
				var sURL = this.urlXYZTile;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);


				xyz.ext	=	"png";

				var sResult	=	 OpenLayers.String.format( sURL, xyz );
				return sResult;
			}
			else if( xyz.did=='AFM' )
			{
				url = this.urlXYZTile;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				var sResult	=	 OpenLayers.String.format(url, xyz);
				return sResult;
			}

			else if((xyz.did=='GMLD_glcnmo2')||(xyz.did=='GMLD_ptc2'))
			{
				url = this.urlLibGMLD;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}
			else if(xyz.did.match(/^CHIJIKI/))	{
				url = this.urlJIKIZU;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				xyz.z = Number(xyz.z);
//				if(!(xyz.did=='CHIJIKID' && xyz.z>=8))	{
//					xyz.y = Math.pow(2, xyz.z) - xyz.y -1;
//				}
				return OpenLayers.String.format(url, xyz);
			}else if(xyz.did=='test_20130717yama'){
				url = this.urlSAIGAI20130717yama;
				xyz.x = Number(xyz.x);
				xyz.y = Math.pow(2, xyz.z) - Number(xyz.y) - 1;
				return OpenLayers.String.format(url, xyz);
			}else if(xyz.did=='PHOTOAREA'){				// 写真2007～インデックス
				url = this.urlOldScheme;
			}else if(xyz.did.match(/^SAR_/))	{		// 干渉SAR
				url = this.urlSAR;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				xyz.z = Number(xyz.z);
				xyz.y = Math.pow(2, xyz.z) - xyz.y -1;
				var didPathArray = xyz.did.split("_");
				xyz.did = didPathArray[0] + "/" + didPathArray[1] + "/" + didPathArray[2] + "/" + didPathArray[3];
				return OpenLayers.String.format(url, xyz);
			}else if(xyz.did.match(/^NDVI_250m/)){		//植生（250m）
//				var didPathArray = xyz.did.split("-");
				url = this.urlThematic;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			}else if(xyz.did=='NLII' ||xyz.did=='NLII1'||xyz.did=='NLII2'||xyz.did=='NLII3'||xyz.did=='NLII4'||
					 xyz.did=='TOHO1'||xyz.did=='TOHO2'||xyz.did=='DJBMO') {
				url = this.urlJpg;
			}else{							//デフォルトのサーバ
				url = this.url;
			}

			var dir = "";
			var xi;
			var yi;
			for (var i = 0; i < 6; i++) {
				xi = xyz.x.substr(i, 1);
				yi = xyz.y.substr(i, 1);

				dir += "/"+xi+yi;
			}
			xyz.dir = dir;

			if((xyz.did=='CCM1')||(xyz.did=='CCM2'))	{
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
			}
		}
		return OpenLayers.String.format(url, xyz);
	},

	// タイルを拡大して表示するZLを返す
	getTileExtentZL: function(z, id) {

		// 写真(ZL18) → ZL17を拡大する
		if((z==18)&&(
			(this.dataSet[z]["dataId"]=="DJBMO")||
			(this.dataSet[z]["dataId"]=="ort")||
			(this.dataSet[z]["dataId"].indexOf("NLII")!=-1)||
			(this.dataSet[z]["dataId"].indexOf("TOHO1")!=-1)||
			(this.dataSet[z]["dataId"].indexOf("toho1")!=-1))) {
			return 17;
		}

		// 色別標高図(ZL16-18) → ZL15を拡大する
		if (16 <= z && z <=18 && (this.dataSet[z]["dataId"] == "RELIEF" || this.dataSet[z]["dataId"] == "relief")) {
			return 15;
		}

		return z;
	},

	// レベル17より上は17を拡大表示するので、メソッドをオーバーライド
    getImageSize: function(bounds) {
		var xyz = this.getXYZ(bounds);

		var extZL = this.getTileExtentZL(xyz.z, this.dataSet[xyz.z]["dataId"]);
		if (!this.is20130822 && extZL != xyz.z) {
			return this.getExtentImageSize(this.tileSize, xyz.z, extZL);
		}
		else{
			// Layer.js original
	        return (this.imageSize || this.tileSize);
		}
    },

	getExtentImageSize: function(tileSize, z, extZL) {
		return new OpenLayers.Size(tileSize.w * Math.pow(2, (z - extZL)), tileSize.h * Math.pow(2, (z - extZL)));
	},

	// レベル17より上は17を拡大表示するので、メソッドをオーバーライド
    /**
     * Method: initGriddedTiles
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     */
    initGriddedTiles:function(bounds) {

    	if (!this.is20130822) {

	        this.events.triggerEvent("retile");

			// レベル17より上は17を拡大表示するので、その分タイル画像の幅高さが大きくなる
	        // 一時的にthis.tileSize.w、this.tileSize.hを書き変える
			var xyz = this.getXYZ(bounds);
			var orgTileSizeW = this.tileSize.w;
			var orgTileSizeH = this.tileSize.h;

			var extZL = this.getTileExtentZL(xyz.z, this.dataSet[xyz.z]["dataId"]);
			if (extZL != xyz.z) {
				this.tileSize = this.getExtentImageSize(this.tileSize, xyz.z, extZL);
			}

			// Grid.js original

	        // work out mininum number of rows and columns; this is the number of
	        // tiles required to cover the viewport plus at least one for panning

	        var viewSize = this.map.getSize();

	        var origin = this.getTileOrigin();
	        var resolution = this.map.getResolution(),
	            serverResolution = this.getServerResolution(),
	            ratio = resolution / serverResolution,
	            tileSize = {
	                w: this.tileSize.w / ratio,
	                h: this.tileSize.h / ratio
	            };

	        var minRows = Math.ceil(viewSize.h/tileSize.h) +
	                      2 * this.buffer + 1;
	        var minCols = Math.ceil(viewSize.w/tileSize.w) +
	                      2 * this.buffer + 1;

	        var tileLayout = this.calculateGridLayout(bounds, origin, serverResolution);
	        this.gridLayout = tileLayout;

	        var tilelon = tileLayout.tilelon;
	        var tilelat = tileLayout.tilelat;

	        var layerContainerDivLeft = this.map.layerContainerOriginPx.x;
	        var layerContainerDivTop = this.map.layerContainerOriginPx.y;

	        var tileBounds = this.getTileBoundsForGridIndex(0, 0);
	        var startPx = this.map.getViewPortPxFromLonLat(
	            new OpenLayers.LonLat(tileBounds.left, tileBounds.top)
	        );
	        startPx.x = Math.round(startPx.x) - layerContainerDivLeft;
	        startPx.y = Math.round(startPx.y) - layerContainerDivTop;

	        var tileData = [], center = this.map.getCenter();

	        var rowidx = 0;
	        do {
	            var row = this.grid[rowidx];
	            if (!row) {
	                row = [];
	                this.grid.push(row);
	            }

	            var colidx = 0;
	            do {
	                tileBounds = this.getTileBoundsForGridIndex(rowidx, colidx);
	                var px = startPx.clone();
	                px.x = px.x + colidx * Math.round(tileSize.w);
	                px.y = px.y + rowidx * Math.round(tileSize.h);
	                var tile = row[colidx];
	                if (!tile) {
	                    tile = this.addTile(tileBounds, px);
	                    this.addTileMonitoringHooks(tile);
	                    row.push(tile);
	                } else {
	                    tile.moveTo(tileBounds, px, false);
	                }
	                var tileCenter = tileBounds.getCenterLonLat();
	                tileData.push({
	                    tile: tile,
	                    distance: Math.pow(tileCenter.lon - center.lon, 2) +
	                        Math.pow(tileCenter.lat - center.lat, 2)
	                });

	                colidx += 1;
	            } while ((tileBounds.right <= bounds.right + tilelon * this.buffer)
	                     || colidx < minCols);

	            rowidx += 1;
	        } while((tileBounds.bottom >= bounds.bottom - tilelat * this.buffer)
	                || rowidx < minRows);

	        //shave off exceess rows and colums
	        this.removeExcessTiles(rowidx, colidx);

	        var resolution = this.getServerResolution();
	        // store the resolution of the grid
	        this.gridResolution = resolution;

	        //now actually draw the tiles
	        tileData.sort(function(a, b) {
	            return a.distance - b.distance;
	        });
	        for (var i=0, ii=tileData.length; i<ii; ++i) {
	            tileData[i].tile.draw();
	        }

	        // 一時的に書き変えたthis.tileSize.w、this.tileSize.hをを戻す
			this.tileSize.w = orgTileSizeW;
			this.tileSize.h = orgTileSizeH;
		}
		else {
			// OL2.11対応
	        var viewSize = this.map.getSize();
	        var minRows = Math.ceil(viewSize.h/this.tileSize.h) +
	                      Math.max(1, 2 * this.buffer);
	        var minCols = Math.ceil(viewSize.w/this.tileSize.w) +
	                      Math.max(1, 2 * this.buffer);

	        var origin = this.getTileOrigin();
	        var resolution = this.map.getResolution();

	        var tileLayout = this.calculateGridLayout(bounds, origin, resolution);

	        var tileoffsetx = Math.round(tileLayout.tileoffsetx); // heaven help us
	        var tileoffsety = Math.round(tileLayout.tileoffsety);

	        var tileoffsetlon = tileLayout.tileoffsetlon;
	        var tileoffsetlat = tileLayout.tileoffsetlat;

	        var tilelon = tileLayout.tilelon;
	        var tilelat = tileLayout.tilelat;

	        this.origin = new OpenLayers.Pixel(tileoffsetx, tileoffsety);

	        var startX = tileoffsetx;
	        var startLon = tileoffsetlon;

	        var rowidx = 0;

	        var layerContainerDivLeft = parseInt(this.map.layerContainerDiv.style.left);
	        var layerContainerDivTop = parseInt(this.map.layerContainerDiv.style.top);


	        do {
	            var row = this.grid[rowidx++];
	            if (!row) {
	                row = [];
	                this.grid.push(row);
	            }

	            tileoffsetlon = startLon;
	            tileoffsetx = startX;
	            var colidx = 0;

	            do {
	                var tileBounds =
	                    new OpenLayers.Bounds(tileoffsetlon,
	                                          tileoffsetlat,
	                                          tileoffsetlon + tilelon,
	                                          tileoffsetlat + tilelat);

	                var x = tileoffsetx;
	                x -= layerContainerDivLeft;

	                var y = tileoffsety;
	                y -= layerContainerDivTop;

	                var px = new OpenLayers.Pixel(x, y);
	                var tile = row[colidx++];
	                if (!tile) {
	                    tile = this.addTile(tileBounds, px);
	                    this.addTileMonitoringHooks(tile);
	                    row.push(tile);
	                } else {
	                    tile.moveTo(tileBounds, px, false);
	                }

	                tileoffsetlon += tilelon;
	                tileoffsetx += this.tileSize.w;
	            } while ((tileoffsetlon <= bounds.right + tilelon * this.buffer)
	                     || colidx < minCols);

	            tileoffsetlat -= tilelat;
	            tileoffsety += this.tileSize.h;
	        } while((tileoffsetlat >= bounds.bottom - tilelat * this.buffer)
	                || rowidx < minRows);

	        //shave off exceess rows and colums
	        this.removeExcessTiles(rowidx, colidx);

	        //now actually draw the tiles
	        this.spiralTileLoad();
		}
    },

	// レベル17より上は17を拡大表示するので、メソッドをオーバーライド
    /**
     * Method: moveGriddedTiles
     *
     * Parameter:
     * deferred - {Boolean} true if this is a deferred call that should not
     * be delayed.
     */
    moveGriddedTiles: function(deferred) {

		if (!this.is20130822) {

			// レベル17より上は17を拡大表示するので、その分タイル画像の幅高さが大きくなる
	        // 一時的にthis.tileSizeを書き変える
			var z = this.map.getZoom() + this.zoomOffset;
			var orgTileSizeW = this.tileSize.w;
			var orgTileSizeH = this.tileSize.h;

			var extZL = this.getTileExtentZL(z, this.dataSet[z]["dataId"]);
			if (extZL != z) {
				this.tileSize = this.getExtentImageSize(this.tileSize, z, extZL);
			}

			// Grid.js original
	        var buffer = this.buffer + 1;
	        while(true) {
	            var tlTile = this.grid[0][0];
	            var tlViewPort = {
	                x: tlTile.position.x +
	                    this.map.layerContainerOriginPx.x,
	                y: tlTile.position.y +
	                    this.map.layerContainerOriginPx.y
	            };
	            var ratio = this.getServerResolution() / this.map.getResolution();
	            var tileSize = {
	                w: Math.round(this.tileSize.w * ratio),
	                h: Math.round(this.tileSize.h * ratio)
	            };
	            if (tlViewPort.x > -tileSize.w * (buffer - 1)) {
	                this.shiftColumn(true, tileSize);
	            } else if (tlViewPort.x < -tileSize.w * buffer) {
	                this.shiftColumn(false, tileSize);
	            } else if (tlViewPort.y > -tileSize.h * (buffer - 1)) {
	                this.shiftRow(true, tileSize);
	            } else if (tlViewPort.y < -tileSize.h * buffer) {
	                this.shiftRow(false, tileSize);
	            } else {
	                break;
	            }
	        }

	        // 一時的に書き変えたthis.tileSize.w、this.tileSize.hをを戻す
			this.tileSize.w = orgTileSizeW;
			this.tileSize.h = orgTileSizeH;
		}
		else {
			// OL2.11対応
	        var shifted = true;
	        var buffer = this.buffer || 1;
	        var tlLayer = this.grid[0][0].position;
	        var offsetX = parseInt(this.map.layerContainerDiv.style.left);
	        var offsetY = parseInt(this.map.layerContainerDiv.style.top);
	        var tlViewPort = tlLayer.add(offsetX, offsetY);
	        if (tlViewPort.x > -this.tileSize.w * (buffer - 1)) {
	            this.shiftColumn(true);
	        } else if (tlViewPort.x < -this.tileSize.w * buffer) {
	            this.shiftColumn(false);
	        } else if (tlViewPort.y > -this.tileSize.h * (buffer - 1)) {
	            this.shiftRow(true);
	        } else if (tlViewPort.y < -this.tileSize.h * buffer) {
	            this.shiftRow(false);
	        } else {
	            shifted = false;
	        }
	        if (shifted) {
	            // we may have other row or columns to shift, schedule it
	            // with a setTimeout, to give the user a chance to sneak
	            // in moveTo's
	            this.timerId = window.setTimeout(this._moveGriddedTiles, 0);
	        }
		}
    },

	/**
	 * コピーライト等を更新
	 */
	updateAttribution : function() {

		if (this.map) {

			// 決め打ち対応
			this.attribution = OpenLayers.String.format(
			this.attributionTemplate, {
				//copyright : "<font color='#555555'>国土地理院<font>",
				copyright: "<span title='本Webサイト管理者様へ\n・本地図サイトは旧電子国土Webドメイン「cyberjapan.jp」のファイルを利用して地図を表示いただいておりますが、当該ドメインは平成31年3月4日（月）14時をもちまして運用を停止する予定です。\n・引き続き国土地理院の地図をご利用いただくための情報をhttp://www.gsi.go.jp/johofukyu/johofukyu40060.htmlに記載しておりますので、ご覧ください。'>　本Webサイト管理者への国土地理院からの重要なお知らせ</span>",
				title : "",
				legend : ""
			});
			return;
		
			// IE7以前は旧仕様で表示
			var msie=navigator.appVersion.toLowerCase();
			msie=(msie.indexOf('msie')>-1)?parseInt(msie.replace(/.*msie[ ]/,'').match(/^[0-9]+/)):0;
			if (msie <= 7 && msie != 0){
				this.updateAttributionIE7();
				return;
			}

			var curMetaData = this.getCurrentMetaData();
			if (!curMetaData || curMetaData.mapType == webtis.ATTRIBUTE_TYPE.NONE) {
				this.attribution = null;
				return;
			}

			var label = curMetaData.label;
			var copyright = curMetaData.owner;
			var legendURL = curMetaData.legendURL;

			var currentData = this.getCurrentData();
			var dataId = currentData == null ? "" : currentData.dataId;
			var zoom = this.map.getZoom();

			if (((dataId=='SPRING')||(dataId=='SUMMER')||(dataId=='AUTUMN')||(dataId=='WINTER')||(dataId=='GRAY'))) {
				// 彩色地図20万・100万の凡例をつける
				if (zoom>=12 && zoom<=14)
				{
					legendURL = "http://cyberjapan.jp/legend/200000c-legend.pdf";
					label += "20万";
				}
				else if (zoom>=9 && zoom<=11)
				{
					legendURL = "http://cyberjapan.jp/legend/1000000c-legend.pdf";
					label += "100万";
				}
			}
			else if ((dataId=='std')) {
				if (zoom>=0 && zoom<=4){
					legendURL = "http://cyberjapan.jp/legend/globalmaphyoko-legend.pdf";
					label = "地球地図（標高）";
				}
				else if (zoom>=5 && zoom<=8) {
					legendURL = "http://cyberjapan.jp/legend/5000000-legend.pdf";
					label = "日本周辺図（500万）";
				}
				else if (zoom>=9 && zoom<=11) {
					legendURL = "http://cyberjapan.jp/legend/std1000000_legend.pdf";
					label = "標準地図（100万）";
				}
				else if (zoom>=12 && zoom<=14) {
					legendURL = "http://cyberjapan.jp/legend/std_200000_legend.pdf";
					label = label + "（20万）";
				}
				else if (zoom>=15 && zoom<=17) {
					legendURL = "http://cyberjapan.jp/legend/std_25000_legend.pdf";
					label = label + "（25000）";
				}
				else if (zoom==18) {
					legendURL = "http://cyberjapan.jp/legend/std_2500_legend.pdf";
					label = label + "（2500）";
				}
			}
			else if ((dataId=='pale')) {
				if (zoom>=12 && zoom<=14) {
					legendURL = "http://cyberjapan.jp/legend/pale_200000_legend.pdf";
					label = label + "（20万）";
				}
				else if (zoom>=15 && zoom<=17) {
					legendURL = "http://cyberjapan.jp/legend/pale_25000_legend.pdf";
					label = label + "（25000）";
				}
////////////////////////////////////	Add
				else if (zoom==18) {
					legendURL = "http://cyberjapan.jp/legend/pale_2500_legend.pdf";
					label = label + "（2500）";
				}
////////////////////////////////////	Add

			}
			else if ((dataId=='english')){
				if (zoom>=5 && zoom <=8) {
					label = "Japan And Its Surroundings";
				}
				else if (zoom>=9 && zoom <=11) {
					legendURL = "http://cyberjapan.jp/legend/hyoujyun1000000e_legend.pdf";
					label = "1:1,000,000 INTERNATIONAL MAP"
				}
			}
			else if((dataId=='std2012')){
				if (zoom>=12 && zoom <=14) {
					legendURL = "http://cyberjapan.jp/legend/200000-legend.pdf";
					label = label + "（20万）";
				}
				else if (zoom>=15 && zoom <=17) {
					legendURL = "http://cyberjapan.jp/legend/std2012_25000_legend.pdf";
					label = label + "（25000）";
				}
				else if (zoom==18) {
					legendURL = "http://cyberjapan.jp/legend/fgd_2500_legend.pdf";
					label = label + "（2500）";
				}
			}
			else if ((dataId=='brownshade2012')||(dataId=='greenshade2012')){
				if (zoom>=9 && zoom <=11) {
					legendURL = "http://cyberjapan.jp/legend/1000000c-legend.pdf";
					label = label + "（100万）";
				}
				else if (zoom>=12 && zoom <=14) {
					legendURL = "http://cyberjapan.jp/legend/200000c-legend.pdf";
					label = label + "（20万）";
				}
			}
			else if ((dataId=='monotoneshade2012')){
				if (zoom>=9 && zoom <=11) {
					legendURL = "http://cyberjapan.jp/legend/1000000g-legend.pdf";
					label = label + "（100万）";
				}
				else if (zoom>=12 && zoom <=14) {
					legendURL = "http://cyberjapan.jp/legend/200000g-legend.pdf";
					label = label + "（20万）";
				}
			}
			else if ((dataId=='monotone2012')){
				if (zoom>=5 && zoom <=8) {
					legendURL = "http://cyberjapan.jp/legend/5000000-legend_G.pdf";
					label = label + "（500万）";
				}
				else {
					this.attribution = null;
					return;
				}
			}
			else if ((dataId=='JAIS')||(dataId=='JAIS2')) {
				if (zoom>=5 && zoom <=6) {
					legendURL = "http://cyberjapan.jp/legend/5000000-legend-zl56.pdf";
				}
			}
			else if ((dataId=='JAISG')) {
				if (zoom>=5 && zoom <=6) {
					legendURL = "http://cyberjapan.jp/legend/5000000-legend-zl56_G.pdf";
				}
			}

			// 表記文字列
			var copyrightString = this.isBaseLayer ? copyright : "";

			// 凡例
			var legendString = "";
			if (webtis.Layer.BaseMap.isShowLegend && legendURL) {
				switch (curMetaData.mapType){
					case webtis.ATTRIBUTE_TYPE.MAP:		// 地図
					case webtis.ATTRIBUTE_TYPE.OVERLAY:	// オーバーレイ
						legendString = "<div class=\"legendattr\" style=\"display:inline\">" + this.createLegendString("凡例", legendURL) + "</div>";
						break;

					case webtis.ATTRIBUTE_TYPE.PHOTO:	// 写真
						legendString = "<div class=\"legendattr\" style=\"display:inline\">" + this.createLegendString("関連情報", legendURL) + "</div>";
						break;
				}
			}

			this.attribution = OpenLayers.String.format(
				this.attributionTemplate, {
					copyright : copyrightString,
					title : label,
					legend: legendString
				});

			this.map
					&& this.map.events.triggerEvent(
							"changelayer", {
								layer : this,
								property : "attribution"
							});
		}
	},

	/**
	 * コピーライト等を更新(IE7)
	 */
	updateAttributionIE7 : function() {
		var curMetaData = this.getCurrentMetaData();
		var title = curMetaData ? this.createLegendString(curMetaData.label, curMetaData.legendURL) : "";

		var copyright = curMetaData ? curMetaData.owner : "国土地理院";
		var currentData = this.getCurrentData();
		// 20130220
		var dataId = currentData == null ? "" : currentData.dataId;
		var zoom = this.map.getZoom();

		// 彩色地図20万・100万の凡例をつける
		if (((dataId=='SPRING')||(dataId=='SUMMER')||(dataId=='AUTUMN')||(dataId=='WINTER')||(dataId=='GRAY'))&&(zoom>=12)&&(zoom<=14))
		{
			title += this.createLegendString("20万", "http://cyberjapan.jp/legend/200000c-legend.pdf");
		}
		if (((dataId=='SPRING')||(dataId=='SUMMER')||(dataId=='AUTUMN')||(dataId=='WINTER')||(dataId=='GRAY'))&&(zoom>=9)&&(zoom<=11))
		{
			title += this.createLegendString("100万", "http://cyberjapan.jp/legend/1000000c-legend.pdf");
		}

		//上載せレイヤのattributionは載せない
		if (curMetaData && curMetaData.mapType != null && curMetaData.mapType == webtis.ATTRIBUTE_TYPE.NONE) {
			this.attribution = null;
		} else {
			this.attribution = OpenLayers.String.format(
				this.attributionTemplate, {
					copyright : copyright,
					title : title,
					legend : ""
				});
		}

		this.map && this.map.events.triggerEvent(
			"changelayer", {
				layer : this,
				property : "attribution"
			});
	},


	createLegendString: function(label, url) {

		var ret = "";
//		ret += "<div class=\"legendattr\" border=\"1\">";
		ret += "<a href=\"" + url + "\" ";
		ret += "onClick=\"window.open('" + url + "', 'win', 'width=500, height=400, menubar=no, status=yes, scrollbars=yes, resizable=yes'); return false; \" ";
		ret += ">";
		ret += label;
		ret += "</a>";
//		ret += "</div>";

		return ret;
	},

	/**
	 * APIMethod: getDefaultDataSet
	 * デフォルトデータセットを取得します。
	 *
	 * 初期状態でオプションが未指定の場合は、このデータセットが使用されます。
	 * 取得したデータセットをsetDataSetメソッドを用いて設定する事で、背景地図がオルソ画像の背景地図に変更されます。
	 *
     * Returns:
     * <Object> データセットの情報が格納されたObject
	 */
	getDefaultDataSet : function() {
		return this.defaultDataSet;
	},

	/**
	 * APIMethod: getOrthoDataSet
	 * オルソデータセットを取得します。
	 *
	 * 取得したデータセットをsetDataSetメソッドを用いて設定する事で、背景地図がオルソ画像の背景地図に変更されます。
	 *
     * Returns:
     * <Object> データセットの情報が格納されたObject
	 */
	getOrthoDataSet : function() {
		return this.orthoDataSet;
	},

	setMap : function() {
		OpenLayers.Layer.XYZ.prototype.setMap.apply(this,
				arguments);
		this.updateAttribution();
		this.map.events.register("moveend", this,
				this.updateAttribution);
	},

	getZoomForExtent : function(bounds, closest) {
		var zoom = OpenLayers.Layer.XYZ.prototype.getZoomForExtent
				.apply(this, arguments);
		return zoom;
	},

	/**
	 * データセットの情報から、Optionを生成します。
	 *
	 * @param dataSet
	 */
	_createOptionFromDataSet : function(dataSet, options) {
		// 縮尺数を設定
		var minZoomLevel;
		var maxZoomLevel;
		for ( var key in dataSet) {
			key = parseInt(key, 10);
			if (minZoomLevel === undefined) {
				minZoomLevel = key;
			} else if (key < minZoomLevel) {
				minZoomLevel = key;
			}
			if (maxZoomLevel === undefined) {
				maxZoomLevel = key;
			} else if (key > maxZoomLevel) {
				maxZoomLevel = key;
			}
		}
		var limitTotalNum = Math.pow(2, minZoomLevel);
		var limitResolution = this.BASE_RESOLUTIONS[minZoomLevel];
		var newOptions = OpenLayers.Util.extend({
			maxExtent : new OpenLayers.Bounds(
				(this.side / -2 * limitTotalNum) * limitResolution,
				(this.side / -2 * limitTotalNum) * limitResolution,
				(this.side /  2 * limitTotalNum) * limitResolution,
				(this.side /  2 * limitTotalNum) * limitResolution
			),
			maxResolution : limitResolution,
			numZoomLevels : maxZoomLevel - minZoomLevel + 1,
			minZoomLevel : minZoomLevel,
			maxZoomLevel : maxZoomLevel,
			units : "m",
			projection : "EPSG:900913"
		}, options);
		return newOptions;
	},

	/** 電子国土APIでの縮尺レベルを取得 * */
	getJSGILevel : function() {
		var actualZoomLevel = this.map.getZoom()
				+ this.zoomOffset;
		var level = null;
		if (actualZoomLevel <= 8) {
			level = "10000";
		} else if (actualZoomLevel <= 11) {
			level = "3000";
		} else if (actualZoomLevel <= 13) {
			level = "200";
		} else if (actualZoomLevel <= 14) {
			level = "50";
		} else if (actualZoomLevel <= 17) {
			level = "25";
		} else { // if (actualZoomLevel <= 19) {
			level = "0.5";
		}
		return level;
	},

	/**
	 * Method: getCurrentData
	 * 現在表示中の地図データの情報を取得します。
	 *
     * Returns:
     * <Object> 地図データの情報が格納されたObject
	 */
	getCurrentData : function() {
		if (this.map == null) {
			return null;
		}
		return this.dataSet[this.map.getZoom() + this.zoomOffset];
	},

	/**
	 * APIMethod: getDataSet
	 * 現在設定されているデータセットを取得します。
	 *
	 * 取得したデータセットの内容を変更することで、表示される背景地図の状態が変更されます。
	 *
     * Returns:
     * <Object> 減税設定されているデータセットの情報が格納されたObject
	 */
	getDataSet : function() {
		return this.dataSet;
	},

	/**
	 * APIMethod: getCurrentMetaData
	 *
	 * 現在表示中の地図データのメタデータを取得します。
	 *
	 * 取得したオブジェクトから、表示中の地図の発行者やライセンスの情報を参照できます。
	 *
     * Returns:
     * <Object> 現在表示中の地図データのメタ情報が格納されたObject
	 */
	getCurrentMetaData : function() {
		var curData = this.getCurrentData();
		if (!curData) {
			return null;
		}
		var curMetaData = null;
		if (this.metaData) {
			curMetaData = this.metaData[curData.dataId];
		}
		return curMetaData;
	},
	/**
	 * APIMethod: setDataSet
	 * データセットを切り替えます。
	 *
	 * 引数のデータセットが定義されたObjectの情報で、背景地図のデータセットを切り替えます。データセットの初期値は、Constructorのサンプルを参照ください。
	 *
     * Parameters:
     * dataset - {Object} データセットが定義されたObject
	 */
	setDataSet : function(dataSet) {
		var newOptions = this._createOptionFromDataSet(dataSet);
		this.dataSet = dataSet;
		this.zoomOffset = newOptions.minZoomLevel;
		this.addOptions(newOptions, true);
		this.clearGrid();
		this.redraw();
	},

	/**
	 * APIMethod: setMapMeta
	 * 特定の縮尺レベルのデータセットの背景地図を差し替えます。
	 *
	 * 引数の背景地図が定義されたObjectの情報で、特定の縮尺の背景地図を切り替えます。
	 *
     * Parameters:
     * zoomLevel - {int} 縮尺番号
     * mapMeta - {Object} 背景地図が定義されたObject
	 */
	setMapMeta : function(zoomLevel, mapMeta) {
		var newDataSet = new Array();
		for (var key in this.dataSet) {
			if (key == zoomLevel) {
				newDataSet[key] = mapMeta;
			} else {
				newDataSet[key] = this.dataSet[key];
			}
		}
		// もともと無い場合もある。
		if (newDataSet[key] == null) {
			newDataSet[key] = mapMeta;
		}
		this.setDataSet(newDataSet);
	},
	/** OpenLayers zoomLevel<=> 電子国土縮尺変換用テーブル **/
	getJSGIScale: function(scale) {
		for (var key in this.JSGI_SCALE_MAP) {
			var scaleInfo = this.JSGI_SCALE_MAP[key];
			if (scale >= scaleInfo.scaleRange.lower && scale <= scaleInfo.scaleRange.upper) {
				return scaleInfo.scale;
			}
		}
		return null;
	},

	jsgiScaleToZoomLevel: function(scale) {
		for (var key in this.JSGI_SCALE_MAP) {
			var scaleInfo = this.JSGI_SCALE_MAP[key];
			if (scale >= scaleInfo.scaleRange.lower && scale <= scaleInfo.scaleRange.upper) {
				return parseInt(key,10)-this.zoomOffset;
			}
		}
		return null;
	},

	zoomLevelToJSGIScale : function(zoomLevel) {
		var scaleInfo = this.JSGI_SCALE_MAP[zoomLevel+this.zoomOffset];
		if (scaleInfo) {
			return scaleInfo.scale;
		}
		return null;
	},

	// タイル読込みエラー時の処理
	imageLoadError: function() {

		// ZL≦17で標準/淡色/英語/写真のとき、背景色を水色にする
		var zl = this.map.getZoom();
		if (this.dataSet[zl] && (
				this.dataSet[zl].dataId == "std" ||
				this.dataSet[zl].dataId == "pale" ||
				this.dataSet[zl].dataId == "english"
			)){
			if (12 <= zl && zl <= 17) {
				var replaceImageUrl = "url(" + webtis.TILE_URL.BLUE + ")";
				$("div#" + this.div.id + " .olImageLoadError").css("background-image", replaceImageUrl);
				return;
			}
		}

		// 代替画像が指定されていれば、それを表示する
		if (this.errorImagePath) {
			var replaceImageUrl = "url(" + this.errorImagePath + ")";
			$("div#" + this.div.id + " .olImageLoadError").css("background-image", replaceImageUrl);
		}
		else {
			$("div#" + this.div.id + " .olImageLoadError").css("display", "none");
		}
	},

	// デフォルトセット
	defaultDataSet : {
		0: { "dataId" : "TRANSPARENT" },
		1: { "dataId" : "TRANSPARENT" },
		2: { "dataId" : "std" },
		3: { "dataId" : "std" },
		4: { "dataId" : "std" },
		5: { "dataId" : "std" },
		6: { "dataId" : "std" },
		7: { "dataId" : "std" },
		8: { "dataId" : "std" },
		9: { "dataId" : "std" },
		10: { "dataId" : "std" },
		11: { "dataId" : "std" },
		12: { "dataId" : "std" },
		13: { "dataId" : "std" },
		14: { "dataId" : "std" },
		15: { "dataId" : "std" },
		16: { "dataId" : "std" },
		17: { "dataId" : "std" },
		18: { "dataId" : "std" }
	},
	// オルソセット
	orthoDataSet : {
		0: {dataId : "TRANSPARENT"},
		1: {dataId : "TRANSPARENT"},
		2: { "dataId" : "std" },
		3: { "dataId" : "std" },
		4: { "dataId" : "std" },
		5: { "dataId" : "std" },
		6: { "dataId" : "std" },
		7: { "dataId" : "std" },
		8: { "dataId" : "std" },
		9: { "dataId" : "std" },
		10: { "dataId" : "std" },
		11: { "dataId" : "std" },
		12: { "dataId" : "std" },
		13: { "dataId" : "std" },
		14: { "dataId" : "std" },
		15: { "dataId" : "ort" },
		16: { "dataId" : "ort" },
		17: { "dataId" : "ort" },
		18: { "dataId" : "std" }
	},

	/** 縮尺範囲テーブル　**/
	JSGI_SCALE_MAP : {
		6 : {
			scale : 10000000,
			scaleRange : {
				lower : 7000000,
				upper : Number.NaN
			}
		},
		7 : {
			scale : 5000000,
			scaleRange : {
				lower : 3500000,
				upper : 6999999
			}
		},
		8 : {
			scale : 2400000,
			scaleRange : {
				lower : 1800000,
				upper : 3499999
			}
		},
		9 : {
			scale : 1200000,
			scaleRange : {
				lower : 800000,
				upper : 1799999
			}
		},
		10 : {
			scale : 600000,
			scaleRange : {
				lower : 400000,
				upper : 799999
			}
		},
		11 : {
			scale : 300000,
			scaleRange : {
				lower : 200000,
				upper : 399999
			}
		},
		12 : {
			scale : 150000,
			scaleRange : {
				lower : 100000,
				upper : 199999
			}
		},
		13 : {
			scale : 75000,
			scaleRange : {
				lower : 50000,
				upper : 99999
			}
		},
		14 : {
			scale : 36000,
			scaleRange : {
				lower : 24000,
				upper : 49999
			}
		},
		15 : {
			scale : 18000,
			scaleRange : {
				lower : 12000,
				upper : 23999
			}
		},
		16 : {
			scale : 9000,
			scaleRange : {
				lower : 7000,
				upper : 11999
			}
		},
		17 : {
			scale : 4500,
			scaleRange : {
				lower : 3000,
				upper : 6999
			}
		},
		18 : {
			scale : 2500,
			scaleRange : {
				lower : 1500,
				upper : 2999
			}
		},
		19 : {
			scale : 1000,
			scaleRange : {
				lower : 0,
				upper : 1499
			}
		}
	},

	CLASS_NAME : "webtis.Layer.BaseMap"
});
webtis.Layer.BaseMap.j_c = 0;
webtis.Layer.BaseMap.isShowLegend = true;
/* ======================================================================
    Handler/LeftRightBox.js
   ====================================================================== */

/**
 * Class: webtis.Handler.LeftRightBox
 * 電子国土Webシステム APIでマウスによる矩形描画を行うハンドラー
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Box>
 */
webtis.Handler.LeftRightBox = OpenLayers.Class(OpenLayers.Handler.Box, {

	initialize: function(control, callbacks, options) {
		OpenLayers.Handler.prototype.initialize.apply(this, arguments);
		var callbacks = {
			"down": this.startBox,
			"move": this.moveBox,
			"out":  this.removeBox,
			"up":   this.endBox
		};
		this.dragHandler = new webtis.Handler.LeftRightDrag(
				this, callbacks, {keyMask: this.keyMask});
	},

	deactivate: function () {
		if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
			if (this.dragHandler)
				this.dragHandler.deactivate();
			return true;
		} else {
			return false;
		}
	},

	CLASS_NAME: "webtis.Handler.LeftRightBox"
});
/* ======================================================================
    Handler/CircleFixedRadius.js
   ====================================================================== */

/**
 * Class: webtis.Handler.CircleFixedRadius
 * 電子国土Webシステム APIで指定半径による円の描画を行うハンドラー
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Point>
 */
webtis.Handler.CircleFixedRadius = OpenLayers.Class(OpenLayers.Handler.Point, {
	radiusMeter : 0,
	basePorjection : null,
    activate: function() {
        if(!OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            return false;
        }
        var options = OpenLayers.Util.extend({
            displayInLayerSwitcher: false,
            calculateInRange: OpenLayers.Function.True
        }, this.layerOptions);
        this.layer = new webtis.Layer.Vector(this.CLASS_NAME, options);
        this.map.addLayer(this.layer);
        return true;
    },



    createFeature: function() {
		var maploc = this.map.getLonLatFromPixel(this.origin);
		this.point = new webtis.Feature.Vector();
		this.originLatLon = new OpenLayers.Geometry.Point(maploc.lon, maploc.lat);
		this.point.geometry = this.originLatLon.clone();
		this.point.style = OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], {});

		this.layer.addFeatures([this.point]);
	},

	move : function(evt) {

		this.origin = evt.xy.clone();
		this.modifyFeature(evt.xy);

		if (this.baseProjection == null) {
			this.baseProjection = new OpenLayers.Projection("EPSG:4326");
		}

		var calcGeom = this.point.geometry.clone();
		calcGeom = calcGeom.transform(this.map.getProjectionObject(),this.baseProjection);
		var lonLat = new OpenLayers.LonLat(calcGeom.x,calcGeom.y);
		var horiLatLon = OpenLayers.Util.destinationVincenty(lonLat,90,this.radiusMeter);
		var pix = this.map.getPixelFromLonLat(lonLat.transform(this.baseProjection,this.map.getProjectionObject()));
		var horiPix = this.map.getPixelFromLonLat(horiLatLon.transform(this.baseProjection,this.map.getProjectionObject()));
		this.point.style.pointRadius = horiPix.x - pix.x;
		this.layer.drawFeature(this.point, this.style);
	},

	CLASS_NAME: "webtis.Handler.CircleFixedRadius"
});
/* ======================================================================
    Renderer/SVG.js
   ====================================================================== */

/**
 * Class: webtis.Renderer.SVG
 * 電子国土Webシステム APIで電子国土Web システム用XML データをSVGで表示するための描画クラス
 *
 * Inherits from:
 *  - <OpenLayers.Renderer.SVG>
 */
webtis.Renderer.SVG = OpenLayers.Class(OpenLayers.Renderer.SVG, {
	// ========================================================================
	// OpenLayers.Renderer overrides
	// ========================================================================

	drawFeature: function(feature, style) {
		if(style == null) {
			style = feature.style;
		}
		if (feature.geometry) {
			var bounds = feature.geometry.getBounds();
			if(bounds) {
				if (!bounds.intersectsBounds(this.extent)) {
					style = {display: "none"};
				}
				var rendered = this.drawGeometry(feature.geometry, style, feature.id);
				if (style.display != "none" && (style.label || feature.geometry.label) && rendered !== false) {
					var location = feature.geometry.getCentroid();
					if(style.labelXOffset || style.labelYOffset) {
						xOffset = isNaN(style.labelXOffset) ? 0 : style.labelXOffset;
						yOffset = isNaN(style.labelYOffset) ? 0 : style.labelYOffset;
						var res = this.getResolution();
						location.move(xOffset*res, yOffset*res);
					}
					if (feature.geometry.label) {
						this._drawText(feature.id, style, location, feature.geometry.label,feature.geometry._bbox);
					} else {
						this.drawText(feature.id, style, location);
					}
				} else {
					this.removeText(feature.id);
				}
				return rendered;
			}
		}
	},

	// ========================================================================
	// OpenLayers.Renderer.Elements overrides
	// ========================================================================

	drawGeometryNode: function(node, geometry, style) {
		var drawn;
		if (geometry.CLASS_NAME == "webtis.Geometry.ImageRectangle") {
			drawn = this.drawImageRectangle(node, geometry);
			if (drawn != false) {
				drawn = {
					node: this.setStyle(node, style, { 'isFilled' : true, 'isStroked' : false }, geometry),
					complete: drawn
				};
			}
		} else if (geometry.CLASS_NAME == "webtis.Geometry.TextRectangle") {
			// くくり線描画用にgeometryに保存。
			geometry._bbox = node;
			drawn = this.drawTextRectangle(node, geometry, style);
			if (drawn != false) {
				drawn = {
					node: this.setStyle(node, style, {
							'isFilled' : style.fill === undefined ? false : style.fill,
							'isStroked' : (geometry.selectDisplay || style.orgStyle == 'select') ? true : false
						}, geometry),
					complete: drawn
				};
			}
		} else {
			drawn = OpenLayers.Renderer.Elements.prototype.drawGeometryNode.apply(this, arguments);
		}
		return drawn;
	},

	// ========================================================================
	// OpenLayers.Renderer.SVG overrides
	// ========================================================================
	getNodeType: function(geometry, style) {
		var nodeType = OpenLayers.Renderer.SVG.prototype.getNodeType.apply(this, arguments);
		if (!nodeType) {
			if (geometry.CLASS_NAME == "webtis.Geometry.ImageRectangle") {
				nodeType = "image";
			} else if (geometry.CLASS_NAME == "webtis.Geometry.TextRectangle") {
				nodeType = "rect";
			}
		}
		return nodeType;
	},

	setStyle: function(node, style, options, geometry) {
		style = style  || node._style;
		options = options || node._options;
		if (node._geometryClass == "webtis.Geometry.TextRectangle") {
			this.setTextRectangleStyle(node, style, options, geometry);
		} else {
			OpenLayers.Renderer.SVG.prototype.setStyle.apply(this, arguments);
		}
		return node;
	},

	setTextRectangleStyle: function(node, style, options, geometry) {
		if (geometry.selectDisplay || style.orgStyle == 'select') {
			node.setAttributeNS(null, "stroke", "#0000ff");
			node.setAttributeNS(null, "stroke-opacity", 1);
			node.setAttributeNS(null, "stroke-width", "2");
			node.setAttributeNS(null, "stroke-linecap", "round");
			if (options.isFilled) {
				node.setAttributeNS(null, "fill", style.fillColor);
				node.setAttributeNS(null, "fill-opacity", style.fillOpacity);
			} else {
				node.setAttributeNS(null, "fill", "none");
			}
		} else {
			if (options.isFilled) {
				node.setAttributeNS(null, "fill", style.fillColor);
				node.setAttributeNS(null, "fill-opacity", style.fillOpacity);
			} else {
				node.setAttributeNS(null, "fill", "none");
			}
			node.setAttributeNS(null, "stroke", "none");
		}
	},
	drawImageRectangle: function(node, geometry) {

		var resolution = this.getResolution();

		var x = (geometry.x / resolution + this.left);
		var y = (this.top - geometry.y / resolution);
		var width = geometry.width / resolution;
		var height = geometry.height / resolution;

		if (this.inValidRange(x, y)) {
			node.setAttributeNS(null, "x", x);
			node.setAttributeNS(null, "y", y);
			node.setAttributeNS(null, "width", width);
			node.setAttributeNS(null, "height", height);
			node.setAttributeNS(this.xlinkns, "href", geometry.imageUrl);
			node.setAttributeNS(null, "style", "opacity: "+geometry.imageOpacity);
			node.setAttributeNS(null, "preserveAspectRatio", "none");
			return node;
		} else {
			return false;
		}

	},

	drawTextRectangle: function(node, geometry, style) {
		var resolution = this.getResolution();

		var x = (geometry.x / resolution + this.left);
		var y = (this.top - geometry.y / resolution);

		if (this.inValidRange(x, y)) {
			node.setAttributeNS(null, "x", x);
			node.setAttributeNS(null, "y", y);
			node.setAttributeNS(null, "width", 0);
			node.setAttributeNS(null, "height", 0);
			return node;
		} else {
			return false;
		}
	},

	_drawText: function(featureId, style, location, _label, _bbox) {
		var resolution = this.getResolution();

		var x = (location.x / resolution + this.left);
		var y = (location.y / resolution - this.top);

		var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "text");
		var tspan = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_tspan", "tspan");

		label.setAttributeNS(null, "x", x);
		label.setAttributeNS(null, "y", -y);

		if (style.fontColor) {
			label.setAttributeNS(null, "fill", style.fontColor);
		}
		if (style.fontOpacity) {
			label.setAttributeNS(null, "opacity", style.fontOpacity);
		}
		if (style.fontFamily) {
			label.setAttributeNS(null, "font-family", style.fontFamily);
		}
		if (style.fontSize) {
			label.setAttributeNS(null, "font-size", style.fontSize);
			label.setAttributeNS(null,"style","line-height:1em;");
		}
		if (style.fontWeight) {
			label.setAttributeNS(null, "font-weight", style.fontWeight);
		}
		if(style.labelSelect === true) {
			label.setAttributeNS(null, "pointer-events", "visible");
			label._featureId = featureId;
			tspan._featureId = featureId;
			tspan._geometry = location;
			tspan._geometryClass = location.CLASS_NAME;
		} else {
			label.setAttributeNS(null, "pointer-events", "none");
		}
		var align = style.labelAlign || "cm";
		label.setAttributeNS(null, "text-anchor",
				OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");
		if (OpenLayers.IS_GECKO === true) {
			label.setAttributeNS(null, "dominant-baseline",
				OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
		}
		if (OpenLayers.IS_GECKO === false) {
			if (OpenLayers.BROWSER_NAME != "msie") {
				tspan.setAttributeNS(null, "baseline-shift",
					OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
			}
		}
		tspan.textContent = _label;
		if(!label.parentNode) {
			label.appendChild(tspan);
			this.textRoot.appendChild(label);
		}
		var textBbox = label.getBBox();
		if(OpenLayers.BROWSER_NAME == "msie") {
			var ratio = 0;
			if (align[1] == "t") {
				ratio = 0.85;// 微調整済み
			} else if (align[1] == "b") {
				ratio = 0;
			} else {
				ratio = 0.35;
			}
			label.setAttributeNS(null, "y", -y+(textBbox.height*ratio));
			textBbox = label.getBBox();
		}

		// くくり線を設定。
		if (_bbox) {
			_bbox.setAttributeNS(null,"x",textBbox.x-5);
			_bbox.setAttributeNS(null,"y",textBbox.y);
			_bbox.setAttributeNS(null,"width",textBbox.width+10);
			_bbox.setAttributeNS(null,"height",textBbox.height);
		}
	},

	drawText: function(featureId, style, location) {
		this._drawText(featureId, style, location, style.label);
	},
	CLASS_NAME: "webtis.Renderer.SVG"
});
/* ======================================================================
    Geometry/ImageRectangle.js
   ====================================================================== */

/**
 * Class: webtis.Geometry.ImageRectangle
 * 電子国土Webシステム APIの画像オブジェクトを表すGeometryオブジェクト
 *
 * Inherits from:
 *  - <OpenLayers.Geometry.Rectangle>
 */
webtis.Geometry.ImageRectangle = OpenLayers.Class(OpenLayers.Geometry.Rectangle, {

	imageUrl: null,
	imageOpacity: 1.0,
	imageType: null,

	initialize: function(x, y, width, height) {
		OpenLayers.Geometry.Rectangle.prototype.initialize.apply(this, arguments);
	},

	calculateBounds: function() {
		this.bounds = new OpenLayers.Bounds(this.x, this.y - this.height,
												this.x + this.width,
												this.y);
		this.components = [this.bounds.toGeometry()];
	},

	move: function(x, y) {
		this.x = this.x + x;
		this.y = this.y + y;
		this.calculateBounds();
	},

	clone: function(obj) {
		if (obj == null) {
			obj = new webtis.Geometry.ImageRectangle(this.x, this.y, this.width, this.height);
		}
		obj.imageUrl = this.imageUrl;
		obj.imageOpacity = this.imageOpacity;
		obj.imageType = this.imageType;
		return obj;
	},

    transform: function(source, dest) {
        if ((source && dest)) {
        	var p1 = new OpenLayers.LonLat(this.x,this.y);
        	var p2 = new OpenLayers.LonLat(this.x+this.width,this.y+this.height);
        	p1.transform(source,dest);
        	p2.transform(source,dest);
        	this.x = p1.lon;
        	this.y = p1.lat;
        	this.width = p2.lon - p1.lon;
        	this.height = p2.lat - p1.lat;
        	this.calculateBounds();
        }
        return this;
    },

	CLASS_NAME: "webtis.Geometry.ImageRectangle"
});
/* ======================================================================
    Control/MeasureDisplay.js
   ====================================================================== */

/**
 * Class: webtis.Control.MeasureDisplay
 * 電子国土Webシステム APIで表示する距離、面積計算用をUIを表すコントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
webtis.Control.MeasureDisplay = OpenLayers.Class(OpenLayers.Control, {

	onCloseButton: null,

	initialize: function(options) {
		OpenLayers.Control.prototype.initialize.apply(this, arguments);
	},

	createDiv : function(id, left, top, width, height, color, background, parent) {
		var div = document.createElement('div');

		if (id) div.id = id;
		if (parent)
			parent.appendChild(div);

		div.style.margin = '0px';
		div.style.padding = '0px';
		div.style.position = 'absolute';

		if (left)
			div.style.left = left + "px";
		if (top)
			div.style.top = top + "px";
		if (width)
			div.style.width = width + "px";
		if (height)
			div.style.height = height + "px";

		if (color)
			div.style.color = color;
		if (background)
			div.style.background = background;

		div.style.overflow = 'hidden';
		return div;
	},

	activate: function () {
		OpenLayers.Control.prototype.activate.apply(this, arguments);
		this.map.addControl(this.pathMeasureCtrl);
		this.map.addControl(this.areaMeasureCtrl);
		this.rb1.checked = "checked";
		this.pathMeasureCtrl.activate();
	},

	deactivate: function () {
		this.map.removeControl(this.pathMeasureCtrl);
		this.map.removeControl(this.areaMeasureCtrl);
		this.pathMeasureCtrl.deactivate();
		this.areaMeasureCtrl.deactivate();

		var parent = this.div.parentNode;
		if (parent)
			parent.removeChild(this.div);
		delete this.div;
		this.div = null;
	},

	draw: function() {
		var width = 275;
		var height = 100;
		var formPadding = 5;
		var	formWidth = width-(formPadding*2);
		var	formHeight = height-(formPadding*2);

		var ret = this.createDiv(
				null, 5, 5, null, null,
				'#000000', '#FFFFFF', null);
		ret.style.borderWidth = '1px';
		ret.style.borderColor = '#000000';
		ret.style.borderStyle = 'solid';
		ret.style.fontSize = '12px';
		ret.obj = this;
        if (ret.addEventListener) {
    		ret.addEventListener('mousedown',function(ev){
    			this.obj.pathMeasureCtrl.cancel();
    			this.obj.areaMeasureCtrl.cancel();
    			OpenLayers.Event.stop(ev);
    		},false);
    		ret.addEventListener('mouseup',function(ev){
    			this.obj.pathMeasureCtrl.cancel();
    			this.obj.areaMeasureCtrl.cancel();
    			OpenLayers.Event.stop(ev);
    		},false);
        } else if (ret.attachEvent) {
    		ret.attachEvent('onmousedown',OpenLayers.Function.bindAsEventListener(function(ev){
    			this.obj.pathMeasureCtrl.cancel();
    			this.obj.areaMeasureCtrl.cancel();
    			OpenLayers.Event.stop(ev);
    		},ret),false);
    		ret.attachEvent('onmouseup',OpenLayers.Function.bindAsEventListener(function(ev){
    			this.obj.pathMeasureCtrl.cancel();
    			this.obj.areaMeasureCtrl.cancel();
    			OpenLayers.Event.stop(ev);
    		},ret),false);
        }

		var	form = document.createElement('form');
		form.style.position = 'relative';
		form.style.margin = '0px';
		form.style.padding = formPadding + 'px';
		form.style.left = "0px";
		form.style.top = "0px";
		form.style.width = formWidth + "px";
		form.style.height = formHeight + "px";
		ret.appendChild(form);

		this.rb1 = document.createElement('input');
		this.rb1.type = "radio";
		this.rb1.name = "webtisRB_measure";
		this.rb1.value = "1";
		this.rb1.ctrl = this;

		form.appendChild(this.rb1);

		this.rb1.onmouseup = function(ev) {
			this.ctrl.areaMeasureCtrl.deactivate();
			this.ctrl.pathMeasureCtrl.activate();
			this.ctrl.rb2.checked = false;
			this.checked = "checked";
			this.ctrl.input1.value = "";
			this.ctrl.input2.value = "";
			return true;
		};

		var	text = document.createElement('span');
		text.innerHTML = '距離';
		text.style.marginRight = "20px";
		form.appendChild(text);

		this.input1 = document.createElement('input');
		this.input1.id = "webtisTXT_pathMeasurement";
		this.input1.type = 'text';
		this.input1.size = 14;
		this.input1.value = '';
		this.input1.style.fontSize = '12px';
		form.appendChild(this.input1);

		this.select1 = document.createElement('select');
		this.select1.name = 'distance';
		this.select1.id = "webtisSELECT_1";
		var	option = document.createElement('option');
		option.appendChild(document.createTextNode('m'));
		option.value = 'm';
		this.select1.appendChild(option);
		option = document.createElement('option');
		option.appendChild(document.createTextNode('km'));
		option.value = 'km';
		this.select1.appendChild(option);
		this.select1.onclick = function() {
			return false;
		};
		this.currentPathUnit = "m";
		this.select1.obj = this;
		this.select1.onchange = function() {
			var val = document.getElementById("webtisTXT_pathMeasurement").value;
			var units = document.getElementById("webtisSELECT_1").value;
			webtis.Control.MeasureDisplay.applyPathValue(units,this.obj.currentPathUnit,val);
			this.obj.currentPathUnit = units;
			return false;
		};
		//this.select1.onchange = LT_P.Bind( this, this.UpdateDist );
		form.appendChild(this.select1);

		form.appendChild(document.createElement('br'));

		this.rb2 = document.createElement('input');
		this.rb2.type = "radio";
		this.rb2.name = "webtisRB_measure";
		this.rb2.value = "2";
		this.rb2.ctrl = this;

		this.rb2.onmouseup = function(ev) {
			this.ctrl.pathMeasureCtrl.deactivate();
			this.ctrl.areaMeasureCtrl.activate();
			this.ctrl.rb1.checked = false;
			this.checked = "checked";
			this.ctrl.input1.value = "";
			this.ctrl.input2.value = "";
			return true;
		};
		form.appendChild(this.rb2);

		text = document.createElement('span');
		text.innerHTML = '面積';
		text.style.marginRight = "20px";
		form.appendChild(text);

		this.input2 = document.createElement('input');
		this.input2.id = "webtisTXT_areaMeasurement";
		this.input2.type = 'text';
		this.input2.size = 14;
		this.input2.value = '';
		this.input2.style.fontSize = '12px';
		form.appendChild(this.input2);

		this.select2 = document.createElement('select');
		this.select2.name = 'area';
		this.select2.id = "webtisSELECT_2";
		var	option = document.createElement('option');
		option.appendChild(document.createTextNode('m2'));
		option.value = 'm2';
		this.select2.appendChild(option);
		option = document.createElement('option');
		option.appendChild(document.createTextNode('km2'));
		option.value = 'km2';
		this.select2.appendChild(option);
		option = document.createElement('option');
		option.appendChild(document.createTextNode('a'));
		option.value = 'a';
		this.select2.appendChild(option);
		option = document.createElement('option');
		option.appendChild(document.createTextNode('ha'));
		option.value = 'ha';
		this.currentAreaUnit = "m2";
		this.select2.appendChild(option);
		form.appendChild(this.select2);
		this.select2.obj = this;
		this.select2.onchange = function() {
			var val = document.getElementById("webtisTXT_areaMeasurement").value;
			var units = document.getElementById("webtisSELECT_2").value;
			webtis.Control.MeasureDisplay.applyAreaValue(units,this.obj.currentAreaUnit,val);
			this.obj.currentAreaUnit = units;
			return false;
		};

		var butdiv = document.createElement('div');
		butdiv.style.margin = '0px';
		butdiv.style.padding = '0px';
		butdiv.style.textAlign = 'right';
		butdiv.style.width = formWidth;
		butdiv.style.height = "24px";
		form.appendChild(butdiv);

		var button = document.createElement('input');
		button.type = 'button';
		button.value = 'リセット';
		button.style.fontSize = '12px';
		button.style.marginTop = '4px';
		button.obj = this;
		button.onclick = function() {
			button.obj.pathMeasureCtrl.cancel();
			button.obj.areaMeasureCtrl.cancel();
			button.obj.input1.value = "";
			button.obj.input2.value = "";
		};
		butdiv.appendChild(button);

		button = document.createElement('input');
		button.type = 'button';
		button.value = '閉じる';
		button.style.fontSize = '12px';
		button.style.marginTop = '4px';
		button.obj = this;
		button.onclick = function() {
			if (button.obj.onCloseButton) {
				button.obj.onCloseButton();
			}
		};
		butdiv.appendChild(button);

		this.div = ret;
		return this.div;
	},

	handlePathMeasurements : function(event) {
		var val = event.measure;
		var units = document.getElementById("webtisSELECT_1").value;
		webtis.Control.MeasureDisplay.applyPathValue(units,event.units,val);
		this.currentPathUnit = units;
	},

	handleAreaMeasurements : function(event) {
		var val = event.measure;
		var units = document.getElementById("webtisSELECT_2").value;
		webtis.Control.MeasureDisplay.applyAreaValue(units,event.units, val);
		this.currentAreaUnit = units;
	},

	CLASS_NAME: "webtis.Control.MeasureDisplay"
});

webtis.Control.MeasureDisplay.applyPathValue = function(currentUnit,targetUnits,val) {
	if (targetUnits == 'km') {
		if (currentUnit == 'm') {
			val = val*1000;
		}
	} else if (targetUnits == 'm') {
		if (currentUnit == 'km') {
			val = val/1000;
		}
	}
	document.getElementById("webtisTXT_pathMeasurement").value = val;
};

webtis.Control.MeasureDisplay.applyAreaValue = function(currentUnit,targetUnits,val) {
	if (targetUnits == 'km'||targetUnits == 'km2') {
		if (currentUnit == 'm2') {
			val = val*1000000;
		} else if (currentUnit == 'a') {
			val = val*10000;
		} else if (currentUnit == 'ha') {
			val = val*100;
		}
	} else if (targetUnits == 'm'||targetUnits == 'm2') {
		if (currentUnit == 'km2') {
			val = val/1000000;
		} else if (currentUnit == 'a') {
			val = val/100;
		} else if (currentUnit == 'ha') {
			val = val/10000;
		}
	} else if (targetUnits == 'a') {
		if (currentUnit == 'km2') {
			val = val/10000;
		} else if (currentUnit == 'm2') {
			val = val*100;
		} else if (currentUnit == 'ha') {
			val = val/100;
		}
	} else if (targetUnits == 'ha') {
		if (currentUnit == 'km2') {
			val = val/100;
		} else if (currentUnit == 'm2') {
			val = val*10000;
		} else if (currentUnit == 'a') {
			val = val*100;
		}
	}
	document.getElementById("webtisTXT_areaMeasurement").value = val;
};


/* ======================================================================
    Handler/Path.js
   ====================================================================== */

/**
 * Class: webtis.Handler.Path
 * 電子国土Webシステム APIで線分の描画を行うハンドラー
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Path>
 */
webtis.Handler.Path = OpenLayers.Class(OpenLayers.Handler.Path, {

	activate: function() {
		if(!OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
			return false;
		}
		var options = OpenLayers.Util.extend({
			displayInLayerSwitcher: false,
			calculateInRange: OpenLayers.Function.True
		}, this.layerOptions);
		this.layer = new webtis.Layer.Vector(this.CLASS_NAME, options);
		this.map.addLayer(this.layer);
		return true;
	},

	createFeature: function(pixel) {
		var lonlat = this.control.map.getLonLatFromPixel(pixel);
		this.point = new webtis.Feature.Vector(
			new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
		);
		this.line = new webtis.Feature.Vector(
			new OpenLayers.Geometry.LineString([this.point.geometry])
		);
		this.callback("create", [this.point.geometry, this.getSketch()]);
		this.point.geometry.clearBounds();
		this.layer.addFeatures([this.line, this.point], {silent: true});
	},

	addPoint: function(pixel) {
		this.layer.removeFeatures([this.point]);
		var lonlat = this.control.map.getLonLatFromPixel(pixel);
		this.point = new webtis.Feature.Vector(
			new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
		);
		this.line.geometry.addComponent(
			this.point.geometry, this.line.geometry.components.length
		);
		this.callback("point", [this.point.geometry, this.getGeometry()]);
		this.callback("modify", [this.point.geometry, this.getSketch()]);
		this.drawFeature();
	},

	CLASS_NAME: "webtis.Handler.Path"
});
/* ======================================================================
    Handler/Circle.js
   ====================================================================== */

/**
 * Class: webtis.Handler.Circle
 * 電子国土Webシステム APIでドラッグによる円の描画を行うハンドラー
 *
 * Inherits from:
 *  - <OpenLayers.Handler.Drag>
 */
webtis.Handler.Circle = OpenLayers.Class(OpenLayers.Handler.Drag, {
	radius: null,
	layerOptions: null,
	feature: null,
	layer: null,
	origin: null,

	initialize: function(control, callbacks, options) {
		if(!(options && options.layerOptions && options.layerOptions.styleMap)) {
			this.style = OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], {});
		}

		OpenLayers.Handler.prototype.initialize.apply(this, [control, callbacks, options]);
		this.options = (options) ? options : {};
	},

	setOptions: function (newOptions) {
		OpenLayers.Util.extend(this.options, newOptions);
		OpenLayers.Util.extend(this, newOptions);
	},

	activate: function() {
		var activated = false;
		if(OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
			var options = OpenLayers.Util.extend({
				displayInLayerSwitcher: false,
				calculateInRange: OpenLayers.Function.True
			}, this.layerOptions);
			this.layer = new webtis.Layer.Vector(this.CLASS_NAME, options);
			this.map.addLayer(this.layer);
			activated = true;
		}
		return activated;
	},

	deactivate: function() {
		var deactivated = false;
		if(OpenLayers.Handler.Drag.prototype.deactivate.apply(this, arguments)) {
			if(this.dragging) {
				this.cancel();
			}
			if (this.layer.map != null) {
				this.layer.destroy(false);
				if (this.feature) {
					this.feature.destroy();
				}
			}
			this.layer = null;
			this.feature = null;
			deactivated = true;
		}
		return deactivated;
	},

	down: function(evt) {
		this.origin = evt.xy.clone();
		this.radius = 1;
		this.feature = new webtis.Feature.Vector();
		this.createGeometry();
		this.callback("create", [this.origin, this.feature]);
		this.layer.addFeatures([this.feature], {silent: true});
		this.layer.drawFeature(this.feature, this.style);
	},

	move: function(evt) {
		this.radius = Math.max(Math.round(Math.sqrt(Math.pow(this.origin.x - evt.xy.x, 2) + Math.pow(this.origin.y - evt.xy.y, 2))), 1);
		this.modifyGeometry();
		this.layer.drawFeature(this.feature, this.style);
	},

	up: function(evt) {
		this.radiusLatLon = this.map.getLonLatFromPixel(new OpenLayers.Pixel(this.origin.x+this.radius,this.origin.y));
		this.finalize();
		if (this.start == this.last) {

			this.originLatLon.radius = this.radius;
			// 左下と右上の座標を埋め込んでおく
			this.callback("done", null);
		}
	},

	out: function(evt) {
		this.finalize();
	},

	createGeometry: function() {
		var maploc = this.map.getLonLatFromPixel(this.origin);
		this.originLatLon = new OpenLayers.Geometry.Point(maploc.lon, maploc.lat);
		this.feature.geometry = this.originLatLon.clone();
		this.feature.style = OpenLayers.Util.extend(OpenLayers.Feature.Vector.style['default'], {});
		this.feature.style.pointRadius = this.radius;
	},

	modifyGeometry: function() {
		this.feature.style.pointRadius = this.radius;
	},

	cancel: function() {
		// the polygon geometry gets cloned in the callback method
		this.callback("cancel", null);
		this.finalize();
	},

	finalize: function() {
		this.origin = null;
	},

	clear: function() {
		if (this.layer) {
			this.layer.renderer.clear();
			this.layer.destroyFeatures();
		}
	},

	callback: function (name, args) {
		if (this.callbacks[name]) {
			this.callbacks[name].apply(this.control, [this.feature.geometry.clone(), this.radius,this.radiusLatLon]);
		}
		if(!this.persist && (name == "done" || name == "cancel")) {
			this.clear();
		}
	},

	CLASS_NAME: "webtis.Handler.Circle"
});
/* ======================================================================
    Popup/JSGIPopup.js
   ====================================================================== */

/**
 * Class: webtis.Popup.JSGIPopup
 * 電子国土Webシステム APIでポップアップを表示するためのクラス
 *
 */
webtis.Popup.JSGIPopup_popupId = 0;
webtis.Popup.JSGIPopup = OpenLayers.Class({
	map : null,
	feature : null,
	onClose : null,
	initialize:function(map,onClose) {
		this.map = map;
		this.onClose = onClose;
		// マップをクリックしたら、ポップアップは消える。
		this.map.events.register("mouseup",this.map,this.removeEvent =
				OpenLayers.Function.bindAsEventListener(function(evt) {
					if (this.feature && this.feature.popup) {
						this.map.removePopup(this.feature.popup);
//						this.feature.popup.destroy();
						this.feature.popup = null;
						this.feature = null;
					}
				}, this)
		);
		this.map.events.register("moveend",this.map,this.moveEndEvent =
			OpenLayers.Function.bindAsEventListener(function(evt) {
				if (this.feature && this.feature.popup) {
					this.map.removePopup(this.feature.popup);
//					this.feature.popup.destroy();
					this.feature.popup = null;
					this.feature = null;
				}
			}, this)
	);
	},

	destroy : function() {
		this.map.events.unregister("mouseup",this.map,this.removeEvent);
		this.map.events.unregister("moveend",this.map,this.moveEndEvent);
	},
	/** Featureをポップアップしたときの動き **/
	onFeatureSelectPopup : function (evt) {
		var feature = evt.feature;
		if (feature.popup) return;

		var proceed = false;
		var attributes = feature.attributes['attr'];
		if ((feature.attributes.name == null || feature.attributes.name.length == 0)&&(attributes == null || attributes.length == 0)) {		//20121210「タイトル」「項目名」「値」のどれかに入力があれば、ポップアップを出すように変更
			proceed = false;
		} else {
			if (attributes) {
				proceed = true;
			}
		}
		if (!proceed) return;

		var attrs = "";
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			var attrkey = attribute.name;
			var valueStr = webtis.Format.JSGIJSON.escapeHTML(attribute.value);
			if (attrkey.charAt(0) == '@') {
				continue;
			}
			attrs += '<tr><td style="width:80px;vertical-align:top;word-wrap: break-word;color:rgb(0, 0, 255);">' + attrkey + '</td>';
			attrs += '<td style="vertical-align:top;word-wrap: break-word;" >' + valueStr + '</td></tr>';
		}
		attrs = '<table style="margin:0px;padding:0px;table-layout:auto;width: 290px;"><tr><td colspan="2" style="word-wrap: break-word;color:rgb(255, 0, 0);">' +webtis.Format.JSGIJSON.escapeHTML(feature.attributes.name)+"</td></tr>"+ attrs + '</table>';
		var popup = new OpenLayers.Popup.FramedCloud(
				"featurePopup_" + (++webtis.Popup.JSGIPopup_popupId),
				feature.geometry.getBounds().getCenterLonLat(),
				new OpenLayers.Size(300,300),
				attrs,
				null,
				false,this.onPopupClose);
		feature.popup = popup;
		popup.feature = feature;
		// popup.autoResize = false;

		if (this.feature && this.feature.popup) {
			this.map.removePopup(this.feature.popup);
//			this.feature.popup.destroy();
			this.feature.popup = null;
		}
		this.feature = feature;
		this.map.addPopup(popup,true);
	},

	onFeatureUnselectPopup : function(evt) {
		var feature = evt.feature;
		if (feature.popup) {
			/**
			this.map.removePopup(feature.popup);
			feature.popup.destroy();
			feature.popup = null;
			**/
		}
	},

	onPopupClose : function(evt) {
		if (onClose) {
			onClose(this.feature);
		}
		// this.feature = null;
	},

	removePopup : function() {
		if (this.feature && this.feature.popup) {
			this.map.removePopup(this.feature.popup);
			this.feature.popup = null;
			this.feature = null;
		}
	//	this.map.removePopup(this.feature.popup);
	},
	CLASS_NAME : "webtis.Popup.JSGIPopup"
});
/* ======================================================================
    Control/ZoomInOutBox.js
   ====================================================================== */

/**
 * Class: webtis.Control.ZoomInOutBox
 * 電子国土Webシステム APIの拡大・縮小の機能を表すコントロール
 *
 * Inherits from:
 *  - <OpenLayers.Control.ZoomBox>
 */
webtis.Control.ZoomInOutBox = OpenLayers.Class(OpenLayers.Control.ZoomBox, {

	draw: function() {
		this.handler = new webtis.Handler.LeftRightBox(this,
				{done: this.zoomBox}, {keyMask: this.keyMask});
	},

	zoomBox: function(position) {
		if (this.handler.dragHandler.leftDrag) {
			this.out = false;
		} else {
			this.out = true;
		}
		OpenLayers.Control.ZoomBox.prototype.zoomBox.apply(this, arguments);
	},

	CLASS_NAME: "webtis.Control.ZoomInOutBox"
});
/* ======================================================================
    Renderer/PixelSVG.js
   ====================================================================== */

/**
 * Class: webtis.Renderer.PixelSVG
 * 電子国土Webシステム APIでピクセル座標の電子国土Web システム用XML データをSVGで表示するための描画クラス
 * Inherits from:
 *  - <OpenLayers.Renderer.SVG>
 */
webtis.Renderer.PixelSVG = OpenLayers.Class(OpenLayers.Renderer.SVG, {

	setExtent: function(extent, resolutionChanged) {

		//OpenLayers.Renderer.Elements.prototype.setExtent.apply(this, arguments);
		/*
		var left = -extent.left;
		var top = extent.top;
		*/

		if (resolutionChanged) {
			this.resolution = null;
		}

		var left = 0;
		var top = 0;
		this.extent = new OpenLayers.Bounds(0, 0, this.size.w, this.size.h);

		// If the resolution has changed, start over changing the corner, because
		// the features will redraw.
		if (resolutionChanged) {
			this.left = left;
			this.top = top;
			// Set the viewbox
			var extentString = "0 0 " + this.size.w + " " + this.size.h;

			this.rendererRoot.setAttributeNS(null, "viewBox", extentString);
			this.translate(0, 0);
			return true;
		} else {
			var inRange = this.translate(left - this.left, top - this.top);
			if (!inRange) {
				// recenter the coordinate system
				this.setExtent(extent, true);
			}
			return inRange;
		}
	},

	drawCircle: function(node, geometry, radius) {
		var x = geometry.x + this.left;
		//var y = (this.top - geometry.y);
		var y = geometry.y + this.top;

		if (this.inValidRange(x, y)) {
			node.setAttributeNS(null, "cx", x);
			node.setAttributeNS(null, "cy", y);
			node.setAttributeNS(null, "r", radius);
			return node;
		} else {
			return false;
		}
	},

	drawRectangle: function(node, geometry) {
		var x = geometry.x + this.left;
		//var y = (this.top - geometry.y);
		var y = geometry.y + this.top;

		if (this.inValidRange(x, y)) {
			node.setAttributeNS(null, "x", x);
			node.setAttributeNS(null, "y", y);
			node.setAttributeNS(null, "width", geometry.width);
			node.setAttributeNS(null, "height", geometry.height);
			return node;
		} else {
			return false;
		}
	},

	drawText: function(featureId, style, location) {
		var x = location.x + this.left;
		var y = this.top - location.y;

		var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "text");
		var tspan = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_tspan", "tspan");

		label.setAttributeNS(null, "x", x);
		label.setAttributeNS(null, "y", -y);

		if (style.fontColor) {
			label.setAttributeNS(null, "fill", style.fontColor);
		}
		if (style.fontOpacity) {
			label.setAttributeNS(null, "opacity", style.fontOpacity);
		}
		if (style.fontFamily) {
			label.setAttributeNS(null, "font-family", style.fontFamily);
		}
		if (style.fontSize) {
			label.setAttributeNS(null, "font-size", style.fontSize);
			label.setAttributeNS(null,"style","line-height:1em;");
		}
		if (style.fontWeight) {
			label.setAttributeNS(null, "font-weight", style.fontWeight);
		}
		if(style.labelSelect === true) {
			label.setAttributeNS(null, "pointer-events", "visible");
			label._featureId = featureId;
			tspan._featureId = featureId;
			tspan._geometry = location;
			tspan._geometryClass = location.CLASS_NAME;
		} else {
			label.setAttributeNS(null, "pointer-events", "none");
		}
		var align = style.labelAlign || "cm";
		label.setAttributeNS(null, "text-anchor",
				OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");
		if (OpenLayers.IS_GECKO === true) {
			label.setAttributeNS(null, "dominant-baseline",OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
		}
		if (OpenLayers.IS_GECKO === false) {
			if (OpenLayers.BROWSER_NAME != "msie") {
				tspan.setAttributeNS(null, "baseline-shift",OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
			}
		}

		tspan.textContent = style.label;

		if(!label.parentNode) {
			label.appendChild(tspan);
			this.textRoot.appendChild(label);
		}
		if(OpenLayers.BROWSER_NAME == "msie") {
			// baseline-shiftのかわり
			var textBbox = label.getBBox();
			var ratio = 0;
			if (align[1] == "t") {
				ratio = 0.85;// 微調整済み
			} else if (align[1] == "b") {
				ratio = 0;
			} else {
				ratio = 0.35;
			}
			label.setAttributeNS(null, "y", -y+(textBbox.height*ratio));
		}
	},

	clipLine: function(badComponent, goodComponent) {
		if (goodComponent.equals(badComponent)) {
			return "";
		}
		var maxX = this.MAX_PIXEL - this.translationParameters.x;
		var maxY = this.MAX_PIXEL - this.translationParameters.y;
		var x1 = goodComponent.x + this.left;
		//var y1 = this.top - goodComponent.y;
		var y1 = goodComponent.y + this.top;
		var x2 = badComponent.x + this.left;
		//var y2 = this.top - badComponent.y;
		var y2 = badComponent.y + this.top;
		var k;
		if (x2 < -maxX || x2 > maxX) {
			k = (y2 - y1) / (x2 - x1);
			x2 = x2 < 0 ? -maxX : maxX;
			y2 = y1 + (x2 - x1) * k;
		}
		if (y2 < -maxY || y2 > maxY) {
			k = (x2 - x1) / (y2 - y1);
			y2 = y2 < 0 ? -maxY : maxY;
			x2 = x1 + (y2 - y1) * k;
		}
		return x2 + "," + y2;
	},

	getShortString: function(point) {
		var x = point.x + this.left;
		//var y = (this.top - point.y);
		var y = point.y + this.top;

		if (this.inValidRange(x, y)) {
			return x + "," + y;
		} else {
			return false;
		}
	},

	CLASS_NAME: "webtis.Renderer.PixelSVG"
});

webtis.Control.PanZoomBar = OpenLayers.Class(OpenLayers.Control.PanZoomBar, {
	minZoomLevel: 0,
	maxZoomLevel: 18,
	shukushakuDiv: null,
	zoomInDiv: null,
	zoomOutDiv: null,

    /**
    * Method: draw
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>}
    */
    draw: function(px) {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = this.position.clone();

        // place the controls
        this.buttons = [];

        var sz = new OpenLayers.Size(18,18);
        if (this.panIcons) {
            var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);
            var wposition = sz.w;

            if (this.zoomWorldIcon) {
                centered = new OpenLayers.Pixel(px.x+sz.w, px.y);
            }

            this._addButton("panup", "north-mini.png", centered, sz);
            px.y = centered.y+sz.h;
            this._addButton("panleft", "west-mini.png", px, sz);
            if (this.zoomWorldIcon) {
                this._addButton("zoomworld", "zoom-world-mini.png", px.add(sz.w, 0), sz);

                wposition *= 2;
            }
            this._addButton("panright", "east-mini.png", px.add(wposition, 0), sz);
            this._addButton("pandown", "south-mini.png", centered.add(0, sz.h*2), sz);
            this.zoomInDiv = this._addButton("zoomin", "zoom-plus-mini.png", centered.add(0, sz.h*3+5), sz);
            centered = this._addZoomBar(centered.add(0, sz.h*4 + 5));
            this.zoomOutDiv = this._addButton("zoomout", "zoom-minus-mini.png", centered, sz);
        }
        else {
            this.zoomInDiv = this._addButton("zoomin", "zoom-plus-mini.png", px, sz);
            centered = this._addZoomBar(px.add(0, sz.h));
            this.zoomOutDiv = this._addButton("zoomout", "zoom-minus-mini.png", centered, sz);
            if (this.zoomWorldIcon) {
                centered = centered.add(0, sz.h+3);
                this._addButton("zoomworld", "zoom-world-mini.png", centered, sz);
            }
        }

        this.zoomInEvents = new OpenLayers.Events(this, this.zoomInDiv, null, true, {includeXY: true});
        this.zoomInEvents.on({
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });
        this.zoomOutEvents = new OpenLayers.Events(this, this.zoomOutDiv, null, true, {includeXY: true});
        this.zoomOutEvents.on({
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });

        return this.div;
    },

    _addZoomBar:function(centered) {
        var imgLocation = OpenLayers.Util.getImagesLocation();

        var id = this.id + "_" + this.map.id;
//      var zoomsToEnd = this.map.getNumZoomLevels() - 1 - this.map.getZoom();
        var zoomsToEnd = this.map.getNumZoomLevels() - 1 - Math.max(this.map.getZoom(), this.minZoomLevel);
        var slider = OpenLayers.Util.createAlphaImageDiv(id,
                       centered.add(-1, zoomsToEnd * this.zoomStopHeight),
                       new OpenLayers.Size(20,9),
                       imgLocation+"slider.png",
                       "absolute");
        slider.style.cursor = "move";
        this.slider = slider;

        this.sliderEvents = new OpenLayers.Events(this, slider, null, true,
                                            {includeXY: true});
        this.sliderEvents.on({
            "touchstart": this.zoomBarDown,
            "touchmove": this.zoomBarDrag,
            "touchend": this.zoomBarUp,
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp,
            "dblclick": this.doubleClick,
            "click": this.doubleClick,
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });

        var sz = new OpenLayers.Size();
//      sz.h = this.zoomStopHeight * this.map.getNumZoomLevels();
        sz.h = this.zoomStopHeight * this.getNumZoomLevels();
        sz.w = this.zoomStopWidth;
        var div = null;

        if (OpenLayers.Util.alphaHack()) {
            var id = this.id + "_" + this.map.id;
            div = OpenLayers.Util.createAlphaImageDiv(id, centered,
                                      new OpenLayers.Size(sz.w,
                                              this.zoomStopHeight),
                                      imgLocation + "zoombar.png",
                                      "absolute", null, "crop");
            div.style.height = sz.h + "px";
        } else {
            div = OpenLayers.Util.createDiv(
                        'OpenLayers_Control_PanZoomBar_Zoombar' + this.map.id,
                        centered,
                        sz,
                        imgLocation+"zoombar.png");
        }
        div.style.cursor = "pointer";
        this.zoombarDiv = div;

        this.divEvents = new OpenLayers.Events(this, div, null, true,
                                                {includeXY: true});
        this.divEvents.on({
            "touchmove": this.passEventToSlider,
            "mousedown": this.divClick,
            "mousemove": this.passEventToSlider,
            "dblclick": this.doubleClick,
            "click": this.doubleClick,
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });

        this.div.appendChild(div);

        this.startTop = parseInt(div.style.top);
        this.div.appendChild(slider);

        this.map.events.register("zoomend", this, this.moveZoomBar);

        centered = centered.add(0,
//          this.zoomStopHeight * this.map.getNumZoomLevels());
            this.zoomStopHeight * this.getNumZoomLevels());
        return centered;
    },

	_removeZoomBar: function (){
        this.sliderEvents.un({
            "touchmove": this.zoomBarDrag,
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp,
            "dblclick": this.doubleClick,
            "click": this.doubleClick,
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });
        this.sliderEvents.destroy();

        this.divEvents.un({
            "touchmove": this.passEventToSlider,
            "mousedown": this.divClick,
            "mousemove": this.passEventToSlider,
            "dblclick": this.doubleClick,
            "click": this.doubleClick,
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });
        this.divEvents.destroy();

        this.zoomInEvents.un({
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });
        this.zoomInEvents.destroy();

        this.zoomOutEvents.un({
            "mouseover": this.showShukushaku,
            "mouseout": this.hideShukushaku
        });
        this.zoomOutEvents.destroy();

        this.div.removeChild(this.zoombarDiv);
        this.zoombarDiv = null;
        this.div.removeChild(this.slider);
        this.slider = null;

        this.map.events.unregister("zoomend", this, this.moveZoomBar);
	},

    divClick: function (evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }
        var levels = evt.xy.y / this.zoomStopHeight;
        if(this.forceFixedZoomLevel || !this.map.fractionalZoom) {
            levels = Math.floor(levels);
        }
//      var zoom = (this.map.getNumZoomLevels() - 1) - levels;
//      zoom = Math.min(Math.max(zoom, 0), this.map.getNumZoomLevels() - 1);
        var zoom = (this.maxZoomLevel) - levels;
        zoom = Math.min(Math.max(zoom, 0), this.maxZoomLevel);
        this.map.zoomTo(zoom);
        OpenLayers.Event.stop(evt);
    },

    zoomBarUp:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt) && evt.type !== "touchend") {
            return;
        }
        if (this.mouseDragStart) {
            this.div.style.cursor="";
            this.map.events.un({
                "touchmove": this.passEventToSlider,
                "mouseup": this.passEventToSlider,
                "mousemove": this.passEventToSlider,
                scope: this
            });
            var zoomLevel = this.map.zoom;
            if (!this.forceFixedZoomLevel && this.map.fractionalZoom) {
                zoomLevel += this.deltaY/this.zoomStopHeight;
                zoomLevel = Math.min(Math.max(zoomLevel, 0),
//                                   this.map.getNumZoomLevels() - 1);
                                     this.maxZoomLevel - 1);
            } else {
                zoomLevel += this.deltaY/this.zoomStopHeight;
                zoomLevel = Math.max(Math.round(zoomLevel), 0);
            }
            this.map.zoomTo(zoomLevel);
            this.mouseDragStart = null;
            this.zoomStart = null;
            this.deltaY = 0;
            OpenLayers.Event.stop(evt);
        }
    },

    moveZoomBar:function() {
        var newTop =
//          ((this.map.getNumZoomLevels()-1) - this.map.getZoom()) *
            ((this.maxZoomLevel) - this.map.getZoom()) *
            this.zoomStopHeight + this.startTop + 1;
        this.slider.style.top = newTop + "px";
    },

    getNumZoomLevels: function() {
		return this.maxZoomLevel - this.minZoomLevel + 1;
	},

	showShukushaku: function() {
		var h = 198;
		var w = 67;

		if (!this.shukushakuDiv) {
            var id = this.id + "_" + this.map.id;
            this.shukushakuDiv =
                OpenLayers.Util.createAlphaImageDiv(id, new OpenLayers.Pixel(35, 80),
                    new OpenLayers.Size(w, h),
                    "http://portal.cyberjapan.jp/sys/v4/image/scale3.png",
                    "absolute", null, "scale");

	        this.div.appendChild(this.shukushakuDiv);
		}

		this.shukushakuDiv.style.display = "block";
	},

	hideShukushaku: function() {
		if (this.shukushakuDiv) {
			this.shukushakuDiv.style.display = "none";
		}
	},

    CLASS_NAME: "webtis.Control.PanZoomBar"
});

/**
 * Class: webtis.Layer.TileLayer
 * 電子国土Webシステム APIでタイルマップを表示するためのレイヤー
 *
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */
webtis.Layer.TileLayer = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    name: "TileLayer",

    sphericalMercator: true,
    wrapDateLine: false,
    url : null,
    side: webtis.TILE_SIDE,
    isBaseLayer:false,
    BASE_EXTENT: new OpenLayers.Bounds(
            -128 * 156543.03390625,
            -128 * 156543.03390625,
            128 * 156543.03390625,
            128 * 156543.03390625
    ),
    // 20段階分の解像度
    BASE_RESOLUTIONS : [
    	webtis.TILE_BASE_RESOLUTIONS[0] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[1] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[2] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[3] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[4] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[5] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[6] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[7] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[8] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[9] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[10] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[11] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[12] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[13] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[14] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[15] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[16] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[17] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[18] * (256 / webtis.TILE_SIDE),
    	webtis.TILE_BASE_RESOLUTIONS[19] * (256 / webtis.TILE_SIDE)
    ],

    /**
     * 初期化
     * @param name
     * @param options
     */
    initialize: function(name, url, maxzoom, minzoom, tileside) {
        this.url = url;
        this.name = name;
        this.projection = new OpenLayers.Projection("EPSG:900913");
		this.maxzoom = maxzoom;
		this.minzoom = minzoom;
		if (tileside) {
			this.side = tileside;
			for (var i = 0; i < 20; i++) {
				this.BASE_RESOLUTIONS[i] = webtis.TILE_BASE_RESOLUTIONS[0] * (256 / tileside);
			}
		}

		var options = {
			maxResolution: this.BASE_RESOLUTIONS[minzoom],
			minResolution: this.BASE_RESOLUTIONS[maxzoom],
			numZoomLevels: maxzoom - minzoom + 1
		};

		this.tileSize = new OpenLayers.Size(this.side, this.side);

//        var newArguments = [this.name, this.url, {}, {}];
        var newArguments = [this.name, this.url, {}, options];
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
    },

    /**
     * Method: destroy
     */
    destroy: function() {
        OpenLayers.Layer.XYZ.prototype.destroy.apply(this, arguments);
    },


	clone: function(obj) {
        if (obj == null) {
            obj = new webtis.Layer.TileLayer(this.name, this.url);
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },

    /**
     * Method: setMap
     */
    setMap: function() {
        OpenLayers.Layer.XYZ.prototype.setMap.apply(this, arguments);
        // mapに追加した時に、ベースマップの情報で再初期化
        this.zoomOffset = this.map.baseLayer.options.minZoomLevel;
        this.addOptions(this.map.baseLayer.options,true);
        this.clearGrid();
    	this.redraw();
    },

    /**
     * Method: getXYZ
     * Calculates x, y and z for the given bounds.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {Object} - an object with x, y and z properties.
     */
    getXYZ: function(bounds) {
        var res = this.map.getResolution();
        // ベースレイヤが、webtis.Layer.BaseMapである必要があります。
        var zoomOffset = this.map.baseLayer.zoomOffset;
        var x = Math.round((bounds.left - this.BASE_EXTENT.left) /
            (res * this.tileSize.w));
        var y = Math.round((this.BASE_EXTENT.top - bounds.top) /
            (res * this.tileSize.h));
        var z = this.serverResolutions != null ?
            OpenLayers.Util.indexOf(this.serverResolutions, res) :
            this.map.getZoom() + zoomOffset;

        var limit = Math.pow(2, z);
        if (this.wrapDateLine)
        {
           x = ((x % limit) + limit) % limit;
        }

        return {'x': x, 'y': y, 'z': z};
    },

    /**
     * URLを作成
     */
    getURL: function (bounds) {
        var xyz = this.getXYZ(bounds);
        var url = this.url;
        return OpenLayers.String.format(url, xyz);
    },

    getZoomForExtent :  function(bounds,closest) {
    	var zoom = OpenLayers.Layer.XYZ.prototype.getZoomForExtent.apply(this, arguments);
    	return zoom;
    },

    CLASS_NAME: "webtis.Layer.TileLayer"
});

OpenLayers.Util.onImageLoadError = function(){
	//20120911 地図IDによる判定を追加
	var currentZoomLevel= this.map.getZoom();				//ズームレベルを取得

	var overlayMapIds = ['lcm25k', 'lcm25k_2011', 'ccm1', 'ccm2', 'meijiswale', 'akandake', 'tokachidake', 'tarumaesan', 'usuzan', 'komagatake', 'iwatesan', 'kurikomayama', 'adatarayama', 'bandaisan', 'izuoshima', 'miyakezima', 'kusatsushiranesan', 'fujisan', 'ontakesan', 'kujirenzan', 'asosan', 'unzendake', 'kirishimayama', 'sakurazima', 'satsumaiojima',
						 'vbm01meakan','vbm02tokachi','vbm03tarumae','vbm04usu','vbm05hokkaidokoma','vbm06iwaki','vbm07akitayake','vbm08iwate','vbm09kurikoma','vbm10akitakoma','vbm11chokai','vbm12zao','vbm13azuma','vbm14adatara','vbm15bandai','vbm16nasu','vbm17kusatsushirane','vbm18asama','vbm19hakone','vbm20fuji','vbm21eastizu','vbm22izuoshima','vbm23miyake','vbm24yakedake','vbm25ontake','vbm26tsurumi','vbm27kujyu','vbm28aso','vbm29unzen','vbm30kirishima','vbm31sakurajima','vbm32satsumatakesima','vbm33satsumaiojima','vbm34suwanosejima',
						 'capital2005','capital2000','capital1994','capital1989','capital1984','capital1979','capital1974',
						 'chubu2003','chubu1997','chubu1991','chubu1987','chubu1982','chubu1977',
						 'kinki2008','kinki2001','kinki1996','kinki1991','kinki1985','kinki1979','kinki1974','lake1','lake2', 'seisya1307yamaguchi', 'seisya1307yamaguchi2',
						 'lum200k','LCMFC','LCM25K_2012',

						 'gazo1area',
						 'gazo2area',
						 'gazo3area',
						 'gazo4area'

						 ];

	for (var i in overlayMapIds){
		var mapId = overlayMapIds[i];
		var dataId;
		if(this.map.getLayersByName(mapId)[0] && this.map.getLayersByName(mapId)[0].getVisibility() == true) {
			dataId = this.map.getLayersByName(mapId)[0].dataSet[currentZoomLevel].dataId;
		}
		else {
			continue;
		}

		if((dataId=='LCM25K')||(dataId=='LCM25K_2011')||(dataId=='CCM1')||(dataId=='CCM2')||(dataId=='SWALE')




				||(dataId=='16akandake')||
		   (dataId=='02tokachidake')||(dataId=='10tarumaesan')||(dataId=='09usuzan')||(dataId=='05komagatake')||(dataId=='00kurikomayama')||
		   (dataId=='14adatarayama')||(dataId=='11bandaisan')||(dataId=='13izuoshima')||(dataId=='06miyakezima')||(dataId=='03kusatsushiranesan')||
		   (dataId=='12fujisan')||(dataId=='00ontakesan')||(dataId=='15kujirenzan')||(dataId=='04asosan')||(dataId=='07unzendake')||
		   (dataId=='08kirishimayama')||(dataId=='01sakurazima')||(dataId=='17satsumaiojima')||(dataId.match(/(capital|chubu|kinki)[0-9][0-9][0-9][0-9]/))||
		   (dataId=='LAKE1')||(dataId=='LAKE2')||(dataId=='20130717dol')||(dataId=='20130717dol2')||(dataId.match(/^vbm/))||(dataId=='pale')
		   ||(dataId.match(/^SAR_/))||(dataId.match(/^NDVI_250m/))

		   ////////////////////////////////////////////////
		   || dataId.match(/^BUILD_/)
		   ////////////////////////////////////////////////
		   )
		{
			// オーバーレイを重ね合わせた場合は背景地図を隠さないよう透過pngを表示
			this.src = 'http://cyberjapandata.gsi.go.jp/sqras/transparent.png';
			return;
		}
	}

	var mapId = this.map.baseLayer.dataSet[currentZoomLevel].dataId;		//地図IDを取得

	if(mapId == "GLMD") { //ベースが地球地図の場合は透過pngを返す(500万のとき地球地図を隠さないため)
		this.src = 'http://cyberjapandata.gsi.go.jp/sqras/transparent.png';
	}else if(mapId == "GRAY" || mapId == "SPRING" || mapId == "SUMMER" || mapId == "AUTUMN" || mapId == "WINTER" || mapId == ""){
		this.src='http://cyberjapandata.gsi.go.jp/sqras/transparent.png';//オーバーレイしている場合軽量な透過PNG
	}else if(mapId=="DJBMM"){	//電子国土基本図（地図情報）は青タイル
		this.src='http://cyberjapandata.gsi.go.jp/sqras/no_map.png';
	}else{ //NODATAタイル
		this.src='http://cyberjapandata.gsi.go.jp/sqras/white.png';
	}
};

// OpenLayers.Tile.Image.useBlankTile=false;
webtis.readyToGo = true;
