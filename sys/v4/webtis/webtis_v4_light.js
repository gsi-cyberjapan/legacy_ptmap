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
webtis.Layer = new Object();
webtis.Control = new Object();

webtis.SERVER_URL = {
		BASEMAP_TILE_SERVER : "http://cyberjapandata.gsi.go.jp/sqras/all",								//デフォルトのサーバ
		BASEMAP_TILE_SERVER2 : "http://cyberjapandata2.gsi.go.jp/sqras/all",							//特定のファイル群だけはこっちのサーバ
		XYZ_TILE_SERVER : 'http://cyberjapandata.gsi.go.jp/xyz',
		TRANSPARENT_FILE : 'http://cyberjapandata.gsi.go.jp/sqras/transparent.png',
		SEARCH_TILE_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/search-tile.php",
		METADATA_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/get-metadata.php",
		AVAILABLE_MAP_SERVER : "http://cyberjapandata.gsi.go.jp/cgi-bin/get-available-maps.php"
};

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
	attributionTemplate : '<span>${title}${copyright}</span>',

	sphericalMercator : true,
	dataSet : null,
	wrapDateLine : false,
	zoomOffset : 0,

	url : webtis.SERVER_URL.BASEMAP_TILE_SERVER+"/${did}/latest/${z}${dir}/${x}${y}.${ext}",					//デフォルトのサーバ
	url2 : webtis.SERVER_URL.BASEMAP_TILE_SERVER2+"/${did}/latest/${z}${dir}/${x}${y}.${ext}",					//特定のファイル群だけはこっちのサーバ
	url3 : webtis.SERVER_URL.XYZ_TILE_SERVER + "/${did}/${z}/${x}/${y}.${ext}",
	searchTileUrl : webtis.SERVER_URL.SEARCH_TILE_SERVER+"?did=${did}&zl=${z}&tid=${x}${y}&per=${per}",
	metaUrl : webtis.SERVER_URL.METADATA_SERVER,
	availableMapUrl : webtis.SERVER_URL.AVAILABLE_MAP_SERVER,

	BASE_EXTENT : new OpenLayers.Bounds(-128 * 156543.03390625,
			-128 * 156543.03390625, 128 * 156543.03390625,
			128 * 156543.03390625),
	// 20段階分の解像度
	BASE_RESOLUTIONS : [ 156543.03390625, 78271.516953125,
			39135.7584765625, 19567.87923828125,
			9783.939619140625, 4891.9698095703125,
			2445.9849047851562, 1222.9924523925781,
			611.4962261962891, 305.74811309814453,
			152.87405654907226, 76.43702827453613,
			38.218514137268066, 19.109257068634033,
			9.554628534317017, 4.777314267158508,
			2.388657133579254, 1.194328566789627,
			0.5971642833948135, 0.29858214169740677 ],
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
		metaJS.setAttribute("src", this.availableMapUrl+"?callback=webtis.Layer.BaseMap.j"+webtis.Layer.BaseMap.j_c);
		webtis.Layer.BaseMap.j_c++;
		document.getElementsByTagName("head")[0].appendChild(metaJS);
		this.metaJS = metaJS;
	},

	/**
	 * Method: destroy
	 */
	destroy : function() {
		this.map&& this.map.events.unregister("moveend", this,this.updateAttribution);
		OpenLayers.Layer.XYZ.prototype.destroy.apply(this,arguments);
	},

	clone : function(obj) {
		if (obj == null) {
			obj = new webtis.Layer.BaseMap(this.name, this.url,this.getOptions());
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

		return {
			'x' : this.zeroPad(x, 7),
			'y' : this.zeroPad(y, 7),
			'z' : z
		};
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
			return null;
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
		} else {
			var curMetaData = this.getCurrentMetaData();
			if (curMetaData == null) {
				return null;
			}
			var imageFormat = curMetaData.imageFormat.toLowerCase();
			var ext = "png";
			if (imageFormat == "png") {
				ext = "png";
			} else if (imageFormat == "jpeg") {
				ext = "jpg";
			}
			xyz.ext = ext;
			// 静的なファイルを使う場合
			
			//データIDにより、タイル配信サーバを変える
			if((xyz.did=='JAIS2')||(xyz.did=='BAFD1000K2')||(xyz.did=='BAFD200K2')||(xyz.did=='D25K2')||(xyz.did=='JAISG')||(xyz.did=='BAFD1000KG')||(xyz.did=='BAFD200KG')||(xyz.did=='D25KG')||(xyz.did=='BLANK')||(xyz.did=='BLANKM')||(xyz.did=='BLANKC')||(xyz.did=='D2500')||(xyz.did=='D2500G'))	{
				url = this.url2;
			} else if ((xyz.did=='relief')||(xyz.did=='std')||(xyz.did=='ort')||(xyz.did=='gazo1')||(xyz.did=='gazo2')||(xyz.did=='gazo3')||(xyz.did=='gazo4')||(xyz.did=='toho1')||(xyz.did=='toho2')){
				url = this.url3;
				xyz.x = Number(xyz.x);
				xyz.y = Number(xyz.y);
				return OpenLayers.String.format(url, xyz);
			} else { //デフォルトのサーバ
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
		}
		return OpenLayers.String.format(url, xyz);
	},

	/**
	 * コピーライト等を更新
	 */
	updateAttribution : function() {
		if (this.map) {
			var res = this.map.getResolution();
			var z = this.serverResolutions != null ? OpenLayers.Util.indexOf(this.serverResolutions, res): this.map.getZoom() + this.zoomOffset;
			var curMetaData = this.getCurrentMetaData();
			var title = curMetaData?curMetaData.title:"";
			var copyright = curMetaData?curMetaData.owner:"国土地理院";
			this.attribution = OpenLayers.String.format(
					this.attributionTemplate, {
						title : title,
						copyright : copyright.length > 0 ? ","+copyright:""
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
					(-128 * limitTotalNum) * limitResolution,
					(-128 * limitTotalNum) * limitResolution,
					(128 * limitTotalNum) * limitResolution,
					(128 * limitTotalNum) * limitResolution),
			maxResolution : limitResolution,
			numZoomLevels : maxZoomLevel - minZoomLevel + 1,
			minZoomLevel : minZoomLevel,
			maxZoomLevel : maxZoomLevel,
			units : "m",
			projection : "EPSG:900913"
		}, options);
		return newOptions;
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
	
	// デフォルトセット
	defaultDataSet : {
		0 : {dataId : "TRANSPARENT"},
		1 : {dataId : "TRANSPARENT"},
		2 : {dataId : "std"},
		3 : {dataId : "std"},
		4 : {dataId : "std"},
		5 : {dataId : "std"},
		6 : {dataId : "std"},
		7 : {dataId : "std"},
		8 : {dataId : "std"},
		9 : {dataId : "std"},
		10 : {dataId : "std"},
		11 : {dataId : "std"},
		12 : {dataId : "std"},
		13 : {dataId : "std"},
		14 : {dataId : "std"},
		15 : {dataId : "std"},
		16 : {dataId : "std"},
		17 : {dataId : "std"},
		18 : {dataId : "std"}
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

	CLASS_NAME : "webtis.Layer.BaseMap"
});
webtis.Layer.BaseMap.j_c = 0;

/* ======================================================================
    footer.js
   ====================================================================== */
OpenLayers.Util.onImageLoadError =function(){
	//20120911 地図IDによる判定を追加
	var currentZoomLevel= this.map.getZoom();				//ズームレベルを取得
	var mapId;
	if(this.map.baseLayer.dataSet[currentZoomLevel]) {
		mapId = this.map.baseLayer.dataSet[currentZoomLevel].dataId;		//地図IDを取得
	}

	if(mapId=="DJBMM")	{		//電子国土基本図（地図情報）は青タイル
		this.src='http://cyberjapandata.gsi.go.jp/sqras/no_map.png';
	}else{						//真っ白なタイル
		this.src='http://cyberjapandata.gsi.go.jp/sqras/white.png';
	}
};
OpenLayers.Tile.Image.useBlankTile=false;
webtis.readyToGo = true;
