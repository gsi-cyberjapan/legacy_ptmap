/** 作図用 JQueryプラグイン実装 **/
var Sakuzu= {};
Sakuzu.SERVER_ROOT = "http://portal.cyberjapan.jp";

// アイコン
Sakuzu.SymbolTable = {
		baseURL: Sakuzu.SERVER_ROOT+'/sys/v4/symbols/',
		files:
			[
				'001.png', '002.png', '003.png', '004.png', '005.png', '006.png', '007.png', '008.png', '009.png', '010.png',
				'011.png', '012.png', '013.png', '014.png', '015.png', '016.png', '017.png', '018.png', '019.png', '020.png',
				'021.png', '022.png', '023.png', '024.png', '025.png', '026.png', '027.png', '028.png', '029.png', '030.png',
				'031.png', '032.png', '033.png', '034.png', '035.png', '036.png', '037.png', '038.png', '039.png', '040.png',
				'041.png', '042.png', '043.png', '044.png', '045.png', '046.png', '047.png', '048.png', '049.png', '050.png',
				'051.png', '052.png', '053.png', '054.png', '055.png', '056.png', '057.png', '058.png', '059.png', '060.png',
				'061.png', '062.png', '063.png', '064.png', '065.png', '066.png', '067.png', '068.png', '069.png', '070.png',
				'071.png', '072.png', '073.png', '074.png', '075.png', '076.png', '077.png', '078.png', '079.png', '080.png',
				'081.png', '082.png', '083.png', '084.png', '085.png', '086.png', '087.png', '088.png', '089.png', '090.png',
				'091.png', '092.png', '093.png', '094.png', '095.png', '096.png', '097.png', '098.png', '099.png', '100.png',
				'101.png', '102.png', '103.png', '104.png', '105.png', '106.png', '107.png', '108.png', '109.png', '110.png',
				'111.png', '112.png', '113.png', '114.png', '115.png', '116.png', '117.png', '118.png', '119.png', '120.png',
				'121.png', '122.png', '123.png', '124.png', '125.png', '126.png', '127.png', '128.png', '129.png', '130.png',
				'131.png', '132.png', '133.png', '134.png', '135.png', '136.png', '137.png', '138.png', '139.png', '140.png',
				'141.png', '142.png', '143.png', '144.png', '145.png', '146.png', '147.png', '148.png', '149.png', '150.png',
				'151.png', '152.png', '153.png', '154.png', '155.png', '156.png', '157.png', '158.png', '159.png', '160.png',
				'161.png', '162.png', '163.png', '164.png', '165.png', '166.png', '167.png', '168.png', '169.png', '170.png',
				'171.png', /*'172.GIF', '173.GIF', '174.GIF', '175.GIF', '176.GIF', '177.GIF', '178.GIF', '179.GIF',*/ '180.png',
				'181.png', '182.png', '183.png', '184.png', '185.png', '186.png', '187.png', '188.png'//, '189.png', '190.png', 
				// 最後にコンマがあるとエラーになる。
			]
};
// カラーパレット
Sakuzu.ColorTable = [[[255,255,255],[255,216,216],[255,255,216],[255,255,216],[255,255,216],[255,255,216],[216,255,216],[216,255,255],[216,255,255],[216,255,255],[216,255,255],[216,216,255],[255,216,255],[255,216,255],[255,216,255],[255,216,255]],
[[238,238,238],[255,192,192],[255,255,192],[255,255,192],[255,255,192],[255,255,192],[192,255,192],[192,255,255],[192,255,255],[192,255,255],[192,255,255],[192,192,255],[255,192,255],[255,192,255],[255,192,255],[255,192,255]],
[[221,221,221],[255,168,168],[255,243,168],[255,255,168],[255,255,168],[255,255,168],[168,255,168],[168,255,243],[168,255,255],[168,255,255],[168,255,255],[168,168,255],[243,168,255],[255,168,255],[255,168,255],[255,168,255]],
[[204,204,204],[255,144,144],[255,219,144],[255,246,144],[255,255,144],[232,255,144],[144,255,144],[144,255,219],[144,255,246],[144,255,255],[144,232,255],[144,144,255],[219,144,255],[246,144,255],[255,144,255],[255,144,232]],
[[187,187,187],[255,120,120],[255,195,120],[255,222,120],[255,255,120],[208,255,120],[120,255,120],[120,255,195],[120,255,222],[120,255,255],[120,208,255],[120,120,255],[195,120,255],[222,120,255],[255,120,255],[255,120,208]],
[[170,170,170],[255, 96, 96],[255,171, 96],[255,198, 96],[255,255, 96],[184,255, 96],[ 96,255, 96],[ 96,255,171],[ 96,255,198],[ 96,255,255],[ 96,184,255],[ 96, 96,255],[171, 96,255],[198, 96,255],[255, 96,255],[255, 96,184]],
[[153,153,153],[255, 72, 72],[255,147, 72],[255,174, 72],[255,255, 72],[160,255, 72],[ 72,255, 72],[ 72,255,147],[ 72,255,174],[ 72,255,255],[ 72,160,255],[ 72, 72,255],[147, 72,255],[174, 72,255],[255, 72,255],[255, 72,160]],
[[136,136,136],[255, 48, 48],[255,123, 48],[255,150, 48],[255,255, 48],[136,255, 48],[ 48,255, 48],[ 48,255,123],[ 48,255,150],[ 48,255,255],[ 48,136,255],[ 48, 48,255],[123, 48,255],[150, 48,255],[255, 48,255],[255, 48,136]],
[[119,119,119],[255, 24, 24],[255, 99, 24],[255,126, 24],[255,255, 24],[112,255, 24],[ 24,255, 24],[ 24,255, 99],[ 24,255,126],[ 24,255,255],[ 24,112,255],[ 24, 24,255],[ 99, 24,255],[126, 24,255],[255, 24,255],[255, 24,112]],
[[102,102,102],[255,  0,  0],[255, 75,  0],[255,102,  0],[255,255,  0],[ 88,255,  0],[  0,255,  0],[  0,255, 75],[  0,255,102],[  0,255,255],[  0, 88,255],[  0,  0,255],[ 75,  0,255],[102,  0,255],[255,  0,255],[255,  0, 88]],
[[ 85, 85, 85],[226,  0,  0],[226, 67,  0],[226, 94,  0],[226,226,  0],[ 80,226,  0],[  0,226,  0],[  0,226, 67],[  0,226, 94],[  0,226,226],[  0, 80,226],[  0,  0,226],[ 67,  0,226],[ 94,  0,226],[226,  0,226],[226,  0, 80]],
[[ 68, 68, 68],[197,  0,  0],[197, 59,  0],[197, 86,  0],[197,197,  0],[ 72,197,  0],[  0,197,  0],[  0,197, 59],[  0,197, 86],[  0,197,197],[  0, 72,197],[  0,  0,197],[ 59,  0,197],[ 86,  0,197],[197,  0,197],[197,  0, 72]],
[[ 51, 51, 51],[168,  0,  0],[168, 51,  0],[168, 78,  0],[168,168,  0],[ 64,168,  0],[  0,168,  0],[  0,168, 51],[  0,168, 78],[  0,168,168],[  0, 64,168],[  0,  0,168],[ 51,  0,168],[ 78,  0,168],[168,  0,168],[168,  0, 64]],
[[ 34, 34, 34],[139,  0,  0],[139, 43,  0],[139, 70,  0],[139,139,  0],[ 56,139,  0],[  0,139,  0],[  0,139, 43],[  0,139, 70],[  0,139,139],[  0, 56,139],[  0,  0,139],[ 43,  0,139],[ 70,  0,139],[139,  0,139],[139,  0, 56]],
[[ 17, 17, 17],[110,  0,  0],[110, 35,  0],[110, 62,  0],[110,110,  0],[ 48,110,  0],[  0,110,  0],[  0,110, 35],[  0,110, 62],[  0,110,110],[  0, 48,110],[  0,  0,110],[ 35,  0,110],[ 62,  0,110],[110,  0,110],[110,  0, 48]],
[[  0,  0,  0],[ 81,  0,  0],[ 81, 27,  0],[ 81, 54,  0],[ 81, 81,  0],[ 40, 81,  0],[  0, 81,  0],[  0, 81, 27],[  0, 81, 54],[  0, 81, 81],[  0, 40, 81],[  0,  0, 81],[ 27,  0, 81],[ 54,  0, 81],[ 81,  0, 81],[ 81,  0, 40]]] ;


(function(){
jQuery.fn.Sakuzu = function(config) {
	var that = this;
	that.config = config;
	// 作図が行われた処理に対しての委譲先
	that.mapEventHandler = that.config.mapEventHandler;
	if (that.config.inFrame != false) {
		that.config.inFrame = true;
	}
	// Undo/Redo用スタック
	that.operationHistory = new Sakuzu.OperationHistory(that);

	// 関数を登録
	that.getMapObject = $.proxy(getMapObject,that);
	that.getWebtis = $.proxy(getWebtis,that);
	that.getOpenLayers = $.proxy(getOpenLayers,that);
	that.enablePopupLayer = $.proxy(enablePopupLayer,that);
	that.disablePopupLayer = $.proxy(disablePopupLayer,that);
	that.init_ctrl = $.proxy(sakuzuInit,that);
	that.updateDrawControls = $.proxy(updateDrawControls,that);
	that.unselectFeature = $.proxy(unselectFeature,that);
	that.getLayers = $.proxy(getLayers,that);
	that.deleteLayer = $.proxy(deleteLayer,that);
	that.deleteAllLayers = $.proxy(deleteAllLayers,that);
	that.addLayer = $.proxy(addLayer,that);
	that.changeLayerName = $.proxy(changeLayerName,that);
	that.convertToOLStyle = $.proxy(convertToOLStyle,that);
	
	// タブのコンテンツを生成
	var tabBody = "\
		<div id=\"sz_main\" class=\"ui-widget-content ui-corner-all\" >\
			<div id=\"sz_tabs\">\
				<ul>";
	if (that.mapEventHandler.useStateSave) {
		tabBody +="\
						<li><a href=\"#tab-xml\" style=\"text-align:center;width:75px;\">読込保存</a></li>\
						<li><a href=\"#tab-operation\" style=\"text-align:center;width:75px;\">操作</a></li>\
						<li><a href=\"#tab-map\" style=\"text-align:center;width:75px;\">表示状態を保存</a></li>";
	} else {
		tabBody +="\
			<li><a href=\"#tab-xml\" style=\"text-align:center;width:120px;\">読込保存</a></li>\
			<li><a href=\"#tab-operation\" style=\"text-align:center;width:120px;\">操作</a></li>";
	}
	tabBody +="\
					<li><a href=\"#tab-point\" style=\"text-align:center;width:40px;\">点</a></li>\
					<li><a href=\"#tab-line\" style=\"text-align:center;width:40px;\">線</a></li>\
					<li><a href=\"#tab-polygon\" style=\"text-align:center;width:40px;\">面</a></li>\
					<li><a href=\"#tab-circle\" style=\"text-align:center;width:40px;\">円</a></li>\
					<li><a href=\"#tab-text\" style=\"text-align:center;width:40px;\">文字</a></li>\
				</ul>\
				<div id=\"tab-operation\" class=\"sz_tab\"></div>\
				<div id=\"tab-point\" class=\"sz_tab\"></div>\
				<div id=\"tab-line\" class=\"sz_tab\"></div>\
				<div id=\"tab-polygon\" class=\"sz_tab\"></div>\
				<div id=\"tab-circle\" class=\"sz_tab\"></div>\
				<div id=\"tab-text\" class=\"sz_tab\"></div>\
				<div id=\"tab-xml\" class=\"sz_tab\"></div>";
	if (that.mapEventHandler.useStateSave) {
		tabBody +="<div id=\"tab-map\" class=\"sz_tab\"></div>";
	}
	tabBody +="</div></div>";

	that.append(that.mainPanel = $(tabBody));
	that.css("overflow-x","hidden");
	that.css("overflow-y","auto");
	// タブの初期化
	var tabs = $('#sz_tabs').tabs();
	this.tabObjs = [];
	// XMLパネル
	this.tabObjs.TAB_XML = this.tabObjs.length;
	this.tabObjs.push(new Sakuzu.XmlTab(that,tabs.find("#tab-xml")));
	//操作パネル
	this.tabObjs.TAB_OPERATION = this.tabObjs.length;
	this.tabObjs.push(new Sakuzu.OperationTab(that,tabs.find("#tab-operation")));	
	if (that.mapEventHandler.useStateSave) {
		// 地図パネル
		this.tabObjs.TAB_XML = this.tabObjs.length;
		this.tabObjs.push(new Sakuzu.MapTab(that,tabs.find("#tab-map")));
	}
	// 点パネル
	this.tabObjs.TAB_POINT = this.tabObjs.length;
	this.tabObjs.push(new Sakuzu.PointTab(that,tabs.find("#tab-point")));
	// 線パネル
	this.tabObjs.TAB_LINE = this.tabObjs.length;
	this.tabObjs.push(new Sakuzu.LineTab(that,tabs.find("#tab-line")));
	// 面パネル
	this.tabObjs.TAB_POLYGON = this.tabObjs.length;
	this.tabObjs.push(new Sakuzu.PolygonTab(that,tabs.find("#tab-polygon")));
	// 円パネル
	this.tabObjs.TAB_CIRCLE = this.tabObjs.length;
	this.tabObjs.push(new Sakuzu.CircleTab(that,tabs.find("#tab-circle")));
	// 文字パネル
	this.tabObjs.TAB_TEXT = this.tabObjs.length;
	this.tabObjs.push(new Sakuzu.TextTab(that,tabs.find("#tab-text")));
	
	// タブのイベント登録
	$(tabs).bind( "tabsselect", function(event, ui) {
		// タブが切り替わったときのイベント
		var tab = $(ui).tabs('option', 'selected');
		var newControls = that.tabObjs[tab[0].index].selected();
		that.updateDrawControls(newControls);
		if (that.tabObjs[tab[0].index].isPopupEnabled()) {
			// ポップアップを許可する。
			that.enablePopupLayer();
		} else {
			that.disablePopupLayer();
		}
	});	

	// 初期状態
	//********* 関数 *************//
	function sakuzuInit() {
		// 地図オブジェクトが読み込まれた時点で呼び出します。
		var webtis = this.getWebtis();
		this.affixLayer = new webtis.Layer.Vector("_affix_layer");
		this.affixLayer.affixStyle = {};
		this.getMapObject().addLayer(this.affixLayer);
		var OpenLayers = this.getOpenLayers();
		Sakuzu.baseProjection = new OpenLayers.Projection("EPSG:4326");
		return;
	}
	
	// 作図対象のレイヤーを取得
	function getLayers() {
		return that.mapEventHandler.getLayers();
	}
	
	// 作図レイヤを削除
	function deleteLayer(sakuzuLayer) {
		return that.mapEventHandler.removeLayer(sakuzuLayer);
	}

	// 作図レイヤを全て削除
	function deleteAllLayers() {
		var drawLayers = $.merge([], this.getLayers());
		for (var j = 0; j < drawLayers.length; j++) {
			that.deleteLayer(drawLayers[j]);
		}
	}
	
	// 作図レイヤを追加
	function addLayer(sakuzuLayer) {
		// 新しい描画用レイヤを反映
		return that.mapEventHandler.addLayer(sakuzuLayer);
	}

	// 描画用Controlを更新
	function updateDrawControls(newControls) {
		// マウス操作をリセット
		that.mapEventHandler.discardMouseMode();
		
		if (this.currentControls) {
			for (var i = 0; i < this.currentControls.length;i++) {
				var currentControl = this.currentControls[i];
				if (currentControl.CLASS_NAME == "OpenLayers.Control.SelectFeature" || currentControl.CLASS_NAME == "webtis.Control.SelectFeature") {
					// 選択中のオブジェクトを選択解除にする
					currentControl.unselectAll();
				}
				this.getMapObject().removeControl(currentControl);
				currentControl.deactivate();
				currentControl.destroy();
			}
			delete this.currentControls;
		}
		if (newControls) {
			for (var i = 0; i < newControls.length; i++) {
				var newControl = newControls[i];
				that.getMapObject().addControl(newControl);
				newControl.activate();
			}
			this.currentControls = newControls;
		}
	}
	
	// 選択中のFeatureを解除
	function unselectFeature(feature) {
		if (feature && feature.layer) {
			this.tabObjs[this.tabObjs.TAB_OPERATION].selectCtrl.unselect(feature);
		} else {
			this.tabObjs[this.tabObjs.TAB_OPERATION].selectCtrl.unselectAll();
		}
	}
	
	// 地図オブジェクトを取得する
	function getMapObject() {
		return that.mapEventHandler.getMapObject();
	}
	
	// WEBTISを取得する
	function getWebtis() {
		return that.mapEventHandler.getWebtis();
	}

	// OpenLayersを取得する
	function getOpenLayers() {
		return that.mapEventHandler.getOpenLayers();
	}
	
	// レイヤー名変更
	function changeLayerName(feature,newLayerName,withoutRedraw) {
		this.unselectFeature(feature);
		var targetLayer = feature.layer;
		// 同じレイヤー名でかつ同じ種別のレイヤーがあるかを調べる
		var sameNameLayers = new Array();
		var drawLayers = this.getLayers();
		for (var i = 0; i < drawLayers.length; i++) {
			var curLayer = drawLayers[i];
			if (curLayer == targetLayer) {
				continue;
			}
			if (curLayer.name == newLayerName && curLayer.affixStyle.type == targetLayer.affixStyle.type) {
				sameNameLayers.push(curLayer);
			} else if (curLayer.name == newLayerName) {
				// 同じ名前で違う種別は、エラーを表示。
				alert("違う種別の同じレイヤー名が存在します。");
				return false;
			}
		}
		if (sameNameLayers.length == 0) {
			if (targetLayer.features.length == 1) {
				// 同じ名前はなくて、一件だけなので、そのまま変更処理。
				targetLayer.name = newLayerName;
				return true;
			} else {
				// 他にも存在するので、新レイヤを作成
				var webtis = this.getWebtis();
				var newLayer = new webtis.Layer.Vector(newLayerName,{
					styleMap : targetLayer.styleMap
				});
				newLayer.styleType = targetLayer.styleType;
				newLayer.styleName = targetLayer.styleName;
				newLayer.affixStyle = targetLayer.affixStyle;
				newLayer.JSGISelection = targetLayer.JSGISelection;
				// featureを新しいレイヤに移動
				targetLayer.removeFeatures(feature);
				if (targetLayer.features.length == 0) {
					this.deleteLayer(targetLayer);
				}
				newLayer.addFeatures(feature);
				this.addLayer(newLayer);
				// レイヤの構造が変わったので、更新
				this.updateDrawControls(this.tabObjs[this.tabObjs.TAB_OPERATION].selected());
				if (!withoutRedraw) {
					newLayer.redraw();
				}
				return true;
			}
		}
		// 同じスタイルのレイヤはあるか？
		var destinationLayer = null;
		for (var i = 0; i < sameNameLayers.length; i++) {
			var curLayer = sameNameLayers[i];
			if (curLayer.affixStyle.name == targetLayer.affixStyle.name) {
				// 同じスタイル名がある場合は、それを採用
				destinationLayer = curLayer;
				break;
			}
		}
		if (destinationLayer == null) {
			// 同じスタイル名は、存在しない。
			targetLayer.name = newLayerName;
			return true;
		}
		
		// コピー元からfeatureを移動
		targetLayer.removeFeatures(feature);
		destinationLayer.addFeatures(feature);
		// 移動した結果レイヤが空ならば、削除
		if (targetLayer.features.length == 0) {
			this.deleteLayer(targetLayer);
		} else {
			targetLayer.redraw();
		}
		if (!withoutRedraw) {
			destinationLayer.redraw();
		}
		return true;
	}
	
	// ポップアップを有効にする
	function enablePopupLayer(layer) {
		that.mapEventHandler.enablePopupLayer(layer);
	}
	
	// ポップアップを解除します。
	function disablePopupLayer() {
		that.mapEventHandler.disablePopupLayer();
	}
	
	// affixStyleをOpenLayersのスタイルに変換
	function convertToOLStyle(affixStyle) {
		var styleType = affixStyle.type.toLowerCase();
		var webtis = this.getWebtis();
		var OpenLayers = this.getOpenLayers();
		var style = null;
		if (styleType == "symbol") {
			// シンボル
			var symbol = affixStyle['symbol'];
			var widthParam = symbol["size"].split(",");
			var strokeWidth = widthParam[0];
			var dynamic = widthParam[1]=="dynamic";

			var defaultStyle = new OpenLayers.Style({
				'externalGraphic': affixStyle.symbol.uri,
				'graphicWidth': "${getSize}",
				'graphicHeight': "${getSize}",
				'graphicXOffset': "${getOffset}",
				'graphicYOffset': "${getOffset}",
				'graphicOpacity' : affixStyle.transparent ? 1 : 1,	//20120925非透過に変更
				'JSGIDynamicSize' : dynamic
			}, {
				context : {
					getSize : function(feature) {
						if (dynamic) {
							return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, strokeWidth));
						} else {
							return strokeWidth;
						}
					},
					getOffset : function(feature) {
						if (dynamic) {
							var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, strokeWidth));
							return -(Math.round(size/2));
						} else {
							return -(Math.round(strokeWidth/2));
						}
					}
				}
			});
			style = new OpenLayers.StyleMap({"default":defaultStyle});			
		} else if (styleType == "string") {
			// 線
			var widthParam = affixStyle["width"].split(",");
			var strokeWidth = widthParam[0];
			var dynamic = widthParam[1]=="dynamic";
			var defaultStyle = new OpenLayers.Style({
				'strokeColor': Sakuzu.deciColorToCSSHex(affixStyle['rgb']),
				'strokeWidth': '${getSize}',
				'strokeDashstyle': affixStyle['style'].value,
				'strokeOpacity' : affixStyle['transparent']=="ON" ? 0.5 : 1,
				'strokeLinecap' : "square",
				'JSGIDynamicSize' : dynamic
			},
			{
				context : {
					getSize : function(feature) {
						if (dynamic) {
							var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, strokeWidth));
							return (size < 1) ? 1 : size;
						} else {
							return strokeWidth;
						}
					}
				}
			});
			style = new OpenLayers.StyleMap({"default":defaultStyle});			
		} else if (styleType == "polygon") {
			// ポリゴン
			var widthParam = affixStyle["width"].split(",");
			var strokeWidth = widthParam[0];
			var dynamic = widthParam[1]=="dynamic";

			var defaultStyle = new OpenLayers.Style({
				'stroke' : true,
				'strokeColor': Sakuzu.deciColorToCSSHex(affixStyle['rgb']),
				'strokeWidth': '${getSize}',
				'strokeDashstyle': affixStyle["style"].value,
				'strokeOpacity' : affixStyle['transparent']=="ON" ? 0.5 : 1,
				'fillOpacity' : affixStyle['transparent']=="ON" ? 0.5 : 1,
				'fillColor' : Sakuzu.deciColorToCSSHex(affixStyle['hrgb']),
				'brush' : affixStyle['paint'],
				'fill' : true,
				'strokeLinecap' : "square",
				'JSGIDynamicSize' : dynamic
			},
			{
				context : {
					getSize : function(feature) {
						if (dynamic) {
							var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, strokeWidth));
							return (size < 1) ? 1 : size;
						} else {
							return strokeWidth;
						}
					}
				}
			});
			// 選択した時のスタイル　ポリゴンはここで設定
			var selectStyle = new OpenLayers.Style({
				'stroke' : true,
				'strokeColor': "#0000FF",
				'strokeWidth': '${getSize}',
				'strokeDashstyle': "solid",
				'strokeOpacity' : 0.7,
				'fillOpacity' : 0.7,
				'fillColor' : "#0000FF",
				'brush' : "solid",
				'fill' : true
			},
			{
				context : {
					getSize : function(feature) {
						if (dynamic) {
							var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, strokeWidth));
							return (size < 1) ? 1 : size;
						} else {
							return strokeWidth;
						}
					}
				}
			});
			style = new OpenLayers.StyleMap({"default":defaultStyle, "select":selectStyle});
		} else if (styleType == "circle") {
			// 円
			var widthParam = affixStyle["width"].split(",");
			var strokeWidth = widthParam[0];
			var dynamic = widthParam[1]=="dynamic";

			var defaultStyle = new OpenLayers.Style({
				'stroke' : true,
				'strokeColor': Sakuzu.deciColorToCSSHex(affixStyle['rgb']),
				'strokeWidth': '${getSize}',
				'strokeDashstyle': affixStyle["style"].value,
				'strokeOpacity' : affixStyle['transparent']=="ON" ? 0.5 : 1,
				'fillOpacity' : affixStyle['transparent']=="ON" ? 0.5 : 1,
				'fillColor' : Sakuzu.deciColorToCSSHex(affixStyle['hrgb']),
				'brush' : affixStyle['paint'],
				'fill' : true,
				'strokeLinecap' : "square",
				'pointRadius' : "${getRadius}",
				'JSGIDynamicSize' : dynamic
			},
			{
				context : {
					getSize : function(feature) {
						if (dynamic) {
							var size = Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, strokeWidth));
							return (size < 1) ? 1 : size;
						} else {
							var calcGeom = feature.geometry.clone();
							calcGeom = calcGeom.transform(feature.layer.map.getProjectionObject(),Sakuzu.baseProjection);
							var lonLat = new OpenLayers.LonLat(calcGeom.x,calcGeom.y);
							var horiLatLon = OpenLayers.Util.destinationVincenty(lonLat,90,feature.pointRadius);
							var pix = feature.layer.map.getPixelFromLonLat(lonLat.transform(Sakuzu.baseProjection,feature.layer.map.getProjectionObject()));
							var horiPix = feature.layer.map.getPixelFromLonLat(horiLatLon.transform(Sakuzu.baseProjection,feature.layer.map.getProjectionObject()));
							var radiusPixel = Math.round(horiPix.x - pix.x);
							if (radiusPixel*2 > strokeWidth) {
								return strokeWidth;
							} else {
								return strokeWidth - (strokeWidth - radiusPixel*2);
							}
						}
					},
					getRadius : function(feature) {
						var calcGeom = feature.geometry.clone();
						calcGeom = calcGeom.transform(feature.layer.map.getProjectionObject(),Sakuzu.baseProjection);
						var lonLat = new OpenLayers.LonLat(calcGeom.x,calcGeom.y);
						var horiLatLon = OpenLayers.Util.destinationVincenty(lonLat,90,feature.pointRadius);
						var pix = feature.layer.map.getPixelFromLonLat(lonLat.transform(Sakuzu.baseProjection,feature.layer.map.getProjectionObject()));
						var horiPix = feature.layer.map.getPixelFromLonLat(horiLatLon.transform(Sakuzu.baseProjection,feature.layer.map.getProjectionObject()));
						return Math.round(horiPix.x - pix.x);
						// メルカトルに関係なくやるのならこちら
						// return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.pointRadius));
					}
				}
			});
			// 選択した時のスタイル　ポリゴンはここで設定
			var selectStyle = new OpenLayers.Style({
				'stroke' : true,
				'strokeColor': "#0000FF",
				'strokeWidth': '${getSize}',
				'strokeDashstyle': "solid",
				'strokeOpacity' : 0.7,
				'fillOpacity' : 0.7,
				'fillColor' : "#0000FF",
				'brush' : "solid",
				'pointRadius' : "${getRadius}",
				'fill' : true
			},
			{
				context : {
					getRadius : function(feature) {
						var calcGeom = feature.geometry.clone();
						calcGeom = calcGeom.transform(feature.layer.map.getProjectionObject(),Sakuzu.baseProjection);
						var lonLat = new OpenLayers.LonLat(calcGeom.x,calcGeom.y);
						var horiLatLon = OpenLayers.Util.destinationVincenty(lonLat,90,feature.pointRadius);
						var pix = feature.layer.map.getPixelFromLonLat(lonLat.transform(Sakuzu.baseProjection,feature.layer.map.getProjectionObject()));
						var horiPix = feature.layer.map.getPixelFromLonLat(horiLatLon.transform(Sakuzu.baseProjection,feature.layer.map.getProjectionObject()));
						return Math.round(horiPix.x - pix.x);
						// メルカトルに関係なくやるのならこちら
						// return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.pointRadius));
					}
				}
			
			});
			style = new OpenLayers.StyleMap({"default":defaultStyle, "select":selectStyle});
		} else if (styleType == "text") {
			// 文字
			var textSize = affixStyle['font'].size;
			var textParam = textSize.split(",");
			var fontSize = textParam[0];
			var dynamic = textParam[1]=="dynamic";

			var defaultStyle = new OpenLayers.Style({
				'strokeColor' : Sakuzu.deciColorToCSSHex(affixStyle["rgb"]),
				'fontColor' : Sakuzu.deciColorToCSSHex(affixStyle["rgb"]),
				'fontFamily' : affixStyle['font'].name,
				'fontWeight' : affixStyle['font'].style.indexOf("極太")!=-1?"bold":"normal",
				'fontSize' : "${getSize}",
				'inputFontSizeNumber':fontSize,
				'fontSizeNumber' : "${getSizeNumber}",
				'labelAlign' : "cm",
				'fillOpacity' : 1,	//20120925非透過に変更
				'fillColor' : Sakuzu.deciColorToCSSHex(affixStyle["brgb"]),
				'fill' : true,
				'labelSelect' : true,
				'JSGIDynamicSize' : dynamic
			},{
				context : {
					getSize : function(feature) {
						if (dynamic) {
							return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, fontSize)) + "px";
						} else {
							return fontSize+"px";
						}
					},
					getSizeNumber : function(feature) {
						if (dynamic) {
							return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, fontSize));
						} else {
							return fontSize;
						}
					}
				}
			});
			var selectStyle = new OpenLayers.Style({
				'fillOpacity' : 0.5,
				'fillColor' : 'blue',
				'fill' : true
			});
			style = new OpenLayers.StyleMap({"default":defaultStyle, "select":selectStyle});			
		}
		return style;
	}	
	
	return this;
};
})(jQuery);



/** OpenLayersのクラスの簡易版 **/
Sakuzu.Class = function() {
    var Class = function() {
        if (arguments) {
            this.initialize.apply(this, arguments);
        }
    };
    var extended = {};
    var parent, initialize, Type;
    for (var i=0, len=arguments.length; i<len; ++i) {
        Type = arguments[i];
        if(typeof Type == "function") {
            if(i == 0 && len > 1) {
                initialize = Type.prototype.initialize;
                Type.prototype.initialize = function() {};
                extended = new Type();
                if(initialize === undefined) {
                    delete Type.prototype.initialize;
                } else {
                    Type.prototype.initialize = initialize;
                }
            }
            parent = Type.prototype;
        } else {
            parent = Type;
        }
        Sakuzu.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};

Sakuzu.extend = function(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if(value !== undefined) {
                destination[property] = value;
            }
        }
        var sourceIsEvt = typeof window.Event == "function" && source instanceof window.Event;

        if(!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty('toString')) {
            destination.toString = source.toString;
        }
    }
    return destination;
};

/**************************/
/* 抽象タブ                  */
/**************************/
Sakuzu.AbstractTab = Sakuzu.Class({
	initialize: function(sakuzu,tabPanel) {
		this.sakuzu = sakuzu;
		this.stylePanel = this.createStylePanel();
		tabPanel.append(this.stylePanel);
	},
	isPopupEnabled : function() {
		return false;
	},	
	/** 選択された時に呼び出される。**/
	selected : function() {
	},
	// スタイルパネルの下に追加で表示するパネル
	createAdditionalPanel : function() {
		return null;
	},
	// スタイルパネル
	createStylePanel : function() {
	},
	/** 属性編集用パネル **/
	createAttributePanel : function(feature) {
		var attributePanel = $("<div style=\"border:1px solid gray;padding:2px;margin-top:15px;\">\
						<div style=\"position:relative;top:-10px;background-color:#eeeeee;display:inline;padding:5px;font-size:15px;font-weight:bold;\">属性情報</div>\
						<div style=\"position:relative;top:-10px;\">\
						<table><tr class=\"sz_title\"><td>タイトル</td><td>&nbsp;<input type=\"text\" id=\"sz_popupattr_title\" style=\"width:150px;\"></td></tr></table>\
						</div></div>");
		var attributeTableParent = $("<div style=\"position:relative;top:-14px;margin-top:5px;\"><button id=\"sz_popupattr_add\"style=\"font-size:12px;\">属性を追加</button><table id=\"sz_attribute_table\">\
		</table></div>");
		var attributeTable = attributeTableParent.find("#sz_attribute_table");
		if (feature) {
			var attributes = feature.attributes;
			var titleElement = attributePanel.find("#sz_popupattr_title")[0];
			titleElement.value = attributes["name"];
			var attr = attributes['attr'];
			if (attr) {
				for (var i = 0; i < attr.length; i++) {
					var attrkey = attr[i].name;
					var value = attr[i].value;
					if (attrkey.charAt(0) == '@') {
						continue;
					}
					addRow(attrkey,value);
				}
			}
		}
		attributePanel.append(attributeTableParent);
		attributePanel.find("#sz_popupattr_add").click(
				$.proxy(addRow,this)
			);
		function addRow(key,value) {
			if (attributeTable.find("#sz_popupattr_delete").length == 0) {
				var lineElement = $("<tr id=\"sz_popupattr_header\"><th>項目名</th><th>値</th><th>&nbsp;</th></tr>");
				attributeTable.append(lineElement);
			}

			// 属性を追加します。
			var lineElement = $("<tr id=\"sz_attr_row\"><td style=\"vertical-align:top;\"><input id=\"sz_attr_col_key\" type=\"text\" style=\"height:22px;padding:0px;margin:0px;width:74px;\" value=\""+(value?key:"")+"\"></td><td style=\"vertical-align:top;\"><textarea id=\"sz_attr_col_value\" rows=1>"+(value?value:"")+"</textarea></td><td><button id=\"sz_popupattr_delete\"style=\"font-size:12px;\">削除</button></td></tr>");
			lineElement.find("#sz_popupattr_delete").click(function(){
				lineElement.remove();
				// 最後の一行なら、ヘッダを消す
				if (attributeTable.find("#sz_popupattr_delete").length == 0) {
					attributeTable.find("#sz_popupattr_header").remove();
				}
			});
			attributeTable.append(lineElement);
		};
		return attributePanel;
	}	
});
/**************************/
/* 抽象スタイルタブ                  */
/**************************/
Sakuzu.AbstractStyleTab = Sakuzu.Class(Sakuzu.AbstractTab,{
	initialize: function(sakuzu,tabPanel) {
		Sakuzu.AbstractTab.prototype.initialize.apply(this, arguments);
		this.additionalPanel = this.createAdditionalPanel();
		if (this.additionalPanel) {
			this.stylePanel.append(this.additionalPanel);
		}
		var popupAttributePanel = this.createAttributePanel();
		this.stylePanel.append(popupAttributePanel);
	},
	isPopupEnabled : function() {
		return true;
	},	
	/** 選択されているスタイルを取得 **/
	retrieveAttributes : function(panel) {
		if (!panel) {
			panel = this.stylePanel; 
		}
		var titleElement = panel.find("#sz_popupattr_title")[0];
		var title= titleElement.value;
		var rows = panel.find("#sz_attr_row");
		var result = {
				'name':title
			};
		var attributes = new Array();
		for (var i = 0; i < rows.length; i++) {
			var key = $(rows[i]).find("#sz_attr_col_key").val();
			var value = $(rows[i]).find("#sz_attr_col_value").val();
			key = key.replace(",","","g");
			val = value.replace("=","","g");

			if (key.length == 0 && value.length == 0) {
				continue;
			}
			attributes.push({
				"name":key,
				"value":value
			});
			eval("var newAttr = {'"+key+"':value};");
			jQuery.extend(result, newAttr);
		}
		jQuery.extend(result, {"attr":attributes});		
		return result;
	},
	/** 色選択ダイアログを表示 **/
	showColorPickerDialog : function(resultElement) {
		var palette = $("<div></div>");
		var t = $("<table/>");
		for (var i = 0; i < Sakuzu.ColorTable.length; i++) {
			var r = $("<tr/>");
			for (var j = 0; j < Sakuzu.ColorTable[i].length; j++) {
				var d = $("<td style=\"width:14px;height:14px;\"/>");
				var color = Sakuzu.ColorTable[i][j];
				var hexColor = "#"+Sakuzu.makeHex(color[0])+Sakuzu.makeHex(color[1])+Sakuzu.makeHex(color[2]);
				var paletteColor = $("<div class=\"sz_color\" style='background-color:"+hexColor+"'></div>");
				paletteColor.attr("_rgb",Sakuzu.padDeci(color[0],3)+","+Sakuzu.padDeci(color[1],3)+","+Sakuzu.padDeci(color[2],3));
				if (Sakuzu.isBasicColor(color)) {
					paletteColor.append("<div style=\"border:1px solid black;width:12px;height:12px;\"></div>");
				}
				d.append(paletteColor);
				r.append(d);
			}
			t.append(r);
		}
		palette.append(t);
		var colorInfo = $("<div style=\"padding:2px;font-size:12px;\">RGB=0,0,0</div>");
		palette.append(colorInfo);
		t.find(".sz_color").mouseover(
			function(ev) {
				colorInfo.text("RGB="+$(ev.currentTarget).attr("_rgb"));
			}
		);
		t.find(".sz_color").click(
			function(ev) {
				colorInfo.text("RGB="+$(ev.currentTarget).attr("_rgb"));
				resultElement.css("backgroundColor",$(ev.currentTarget).css("backgroundColor"));
				palette.dialog("destroy");
			}
		);
		
		palette.dialog({
			dialogClass:'sz_color_palette_dialog',
			title: "色を選択してください",
			width: 224,
			height: 270,
			resizable: false,
			draggable: false,
			modal:true
		});
	},
	/** スタイルをUIに反映 **/
	setDrawStyle : function(affixStyle,panel) {
	}
});

/**************************/
/* 操作タブ                  */
/**************************/
Sakuzu.OperationTab = Sakuzu.Class(Sakuzu.AbstractTab,{
	/** 選択された時に呼び出される。**/
	selected : function() {
		var webtis = this.sakuzu.getWebtis();
		var OpenLayers = this.sakuzu.getOpenLayers();
		// 基本的に常にBox選択モード
		var selectCtrl = new webtis.Control.SelectFeature(this.sakuzu.getLayers(), {
			box : true,
			onUnselect : function() {
				$("#sz_edit_dialog").remove();				
			}
		});
		this.selectCtrl = selectCtrl;
		var activeCtrl = new webtis.Control.MultiLayerDragFeature(this.sakuzu.getLayers(), {
			onStart: $.proxy( function(feature, pixel) {
				if (!feature.layer.JSGISelection) {
					return;
				}
				this.sakuzu.operationHistory.add('move', { "feature" : feature, "center" : feature.geometry.getBounds().getCenterLonLat()});
			},this),
			onComplete: function(feature, pixel) {
				//
			}
		});
		return [selectCtrl,activeCtrl];
	},
	// 選択中のオブジェクトを取得
	getSelectedFeatures :  function() {
    	var selected = [];
    	var drawLayers = this.sakuzu.getLayers();
    	for (var oi=0; oi < drawLayers.length; oi++) {
    		var layer = drawLayers[oi];
    		if (!layer.JSGISelection) {
    			continue;
    		}

    		for (var j=0; j < layer.selectedFeatures.length; j++) {
    			var feature = layer.selectedFeatures[j];
    			if (feature.popup) {
    				this.sakuzu.getMapObject().removePopup(feature.popup);
    				feature.popup.destroy();
    				feature.popup = null;
    			}
    			feature._layer = layer;
    			selected.push(feature);
    		}
    	}
		return selected;
	},
	// 操作スタイルパネル
	createStylePanel : function() {
		var stylePanel = $("\
			<h2 style=\"margin-top:5px;\">図形を選択</h2>\
			<div class=\"sz_tab_block\">\
				<p style=\"font-size:12px;\">(図形を選択してからボタンを押して下さい)</p>\
				<p style=\"font-size:12px;padding-bottom:4px;color:red;\">※図形上でマウスをドラッグさせることで図形を選択できます。</p>\
				<button id=\"editObjectsButton\">図形を編集</button><br>\
				<button id=\"deleteObjectsButton\">図形を削除</button>\
			</div>\
			\
			<h2>その他</h2>\
			<div class=\"sz_tab_block\">\
				<p style=\"font-size:12px;padding-bottom:4px;\">一つ前の操作について</p>\
				<button id=\"sz_operation_undo_button\">取り消す</button>&nbsp;<button id=\"sz_operation_redo_button\">やり直す</button>\
				<p style=\"font-size:12px;color:red;\">※取り消す,やり直すが出来ない操作もあります。</p>\
				<button id=\"sz_operation_clear_button\">クリア</button>\
			</div>\
			\
			<h2>図形の計測</h2>\
			<div class=\"sz_tab_block\">\
				<p style=\"font-size:12px;padding-bottom:4px;\">図形を選択し計測を実行してください。</p>\
				<select id=\"sz_calcunit\"><option value=\"1\">(平方)メートル</option><option value=\"0.001\">(平方)キロメートル</option></select>\
				<button id=\"calcObjectsButton\">計測</button><br>\
				<input type=\"text\" id=\"calcObjectsResult\" style=\"width:230px;\"/><br>\
				<p style=\"font-size:12px;color:red;\">※線および面データのみ計測可能です。</p>\
			</div>\
		");
		// 図形を編集
		var editButtonElement = stylePanel.find("#editObjectsButton")[0];
		$(editButtonElement).click(
			$.proxy(function(ev) {
				// 図形を編集
		    	var selectedFeatures = this.getSelectedFeatures(true);
		    	// 編集画面を表示
		    	this.showEditDialog(selectedFeatures);
			},this) 
		);

		// 図形を削除
		var deleteButtonElement = stylePanel.find("#deleteObjectsButton")[0];
		$(deleteButtonElement).click(
			$.proxy(function(ev) {
				// 図形を削除
		    	var deleted = this.getSelectedFeatures(true);
		    	for (var i = 0; i < deleted.length; i++) {
		    		this.selectCtrl.unselect(deleted[i]);
		    		var lastLayer =deleted[i].layer; 
		    		deleted[i].layer.removeFeatures(deleted[i]);
		    		if (lastLayer.features.length == 0) {
		    			this.sakuzu.deleteLayer(lastLayer);
		    		}
		    	}
		    	// 削除されたオブジェクト UNDO用に残す
		    	this.sakuzu.operationHistory.add('del', deleted);
			},this) 
		);
		
		// 取り消す
		var undoButtonElement = stylePanel.find("#sz_operation_undo_button")[0];
		$(undoButtonElement).click(
				$.proxy(function(ev) {				
					// 取り消し
					this.sakuzu.operationHistory.undo();
				},this) 
			);

		// やり直す
		var redoButtonElement = stylePanel.find("#sz_operation_redo_button")[0];
		$(redoButtonElement).click(
				$.proxy(function(ev) {				
					// 取り消し
					this.sakuzu.operationHistory.redo();
				},this) 
			);
		
		// クリア
		var clearButtonElement = stylePanel.find("#sz_operation_clear_button")[0];
		$(clearButtonElement).click(
				$.proxy(function(ev) {				
					// クリア
					this.sakuzu.operationHistory.removeAllStacks();
					this.sakuzu.disablePopupLayer();
					this.sakuzu.deleteAllLayers();
					var newControls = this.selected();
					this.sakuzu.updateDrawControls(newControls);
				},this) 
			);
		
		
		// 図形を計測
		var calcButtonElement = stylePanel.find("#calcObjectsButton")[0];
		var calcResultElement = stylePanel.find("#calcObjectsResult")[0];
		$(calcButtonElement).click(
			$.proxy(function(ev) {
				// 
				var calcUnitElement = stylePanel.find("#sz_calcunit")[0];
				var unitValue = calcUnitElement.options[calcUnitElement.selectedIndex].value;
				// 図形を計測
		    	var selected = this.getSelectedFeatures();
		    	if (!selected || selected.length == 0) {
		    		return;
		    	}
		    	var mode;
		    	if (selected[0].geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
		    		mode = "area";
		    	} else if (selected[0].geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {
		    		mode = "distance";
		    	} else {
		    		calcResultElement.value = "";
		    		alert("対応していない形状種別が含まれています。");
		    		return;
		    	}
		    	var geometries = [];
		    	for (var i = 0; i < selected.length; i++) {
		    		if ((mode == "area" && selected[i].geometry.CLASS_NAME != "OpenLayers.Geometry.Polygon")||
		    			(mode == "distance" && selected[i].geometry.CLASS_NAME != "OpenLayers.Geometry.LineString")) {
			    		calcResultElement.value = "";
			    		alert("同じ形状種別のオブジェクトを選択してください。");
			    		return;
		    		}
		    		geometries.push(selected[i].geometry);
		    	}
		    	var OpenLayers = this.sakuzu.getOpenLayers();
		    	// var result = Sakuzu.calcGeo(geometries,unitValue,this.sakuzu.getMapObject().getProjectionObject(),Sakuzu.baseProjection);
		    	// $(calcResultElement).val(result.toFixed(6));
		    	var result2 = Sakuzu.calcGeo2(geometries,unitValue,this.sakuzu.getMapObject().getProjectionObject(),Sakuzu.baseProjection,OpenLayers);
		    	//window.console.log("result1="+result);
		    	//window.console.log("result2="+result2);
		    	$(calcResultElement).val(result2.toFixed(6));
			},this) 
		);
		
		return stylePanel;
	},
	
	/** レイヤ名変更用パネル **/
	createLayerTitlePanel : function(feature) {
		var dialogStr = "<div style='margin-top:5px;'>";
		dialogStr += "<table><tr class=\"sz_title\"><td>レイヤ名</td><td><input type=\"text\" style=\"width:175px;\" id=\"sz_layer_name_text\"></td></tr></table>";
		dialogStr += "</div>";
		
		var d = $(dialogStr);
		if (feature) {
			var layerName = feature.layer.name;
			if (layerName.indexOf("_affix_.")==0) {
				layerName = layerName.substring(8);
			}
	
			d.find("#sz_layer_name_text")[0].value = layerName;
		}
		return d;
	},
	
	
	/** 編集用ダイアログを表示 **/
	showEditDialog : function(selectedFeatures) {
		if (selectedFeatures.length == 0) {
			return;
		}
		var styleType = null;
		// ダイアログを作成
		var dialogStr = "<div id=\"sz_edit_dialog\" class=\"sz_tab\">";
		if (this.sakuzu.config.inFrame) {
			// インフレームの場合は、タイトルがないので、表示
			dialogStr += "<h2 id=\"sz_edit_title\" style=\"margin-top:5px;\">編集</h2>";
		}
		dialogStr += "</div>";
		var editDialog = $(dialogStr);		
		editDialog.addClass("ui-widget-content ui-corner-all");

		if (selectedFeatures.length == 1) {
			// 1つだけの単一の場合は、全部編集可
			var feature = selectedFeatures[0];
			styleType = feature.layer.styleType;
			styleType = styleType.toLowerCase();
			// レイヤタイトルパネル
			var layerTitlePanel = this.createLayerTitlePanel(feature);
			// 属性値設定画面
			var attributePanel = this.createAttributePanel(feature);
			editDialog.feature = feature;

			// スタイル設定画面
			var currentTab = null;
			var stylePanel = null;
			if (styleType == "symbol") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_POINT];
			} else if (styleType == "string") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_LINE];
			} else if (styleType == "polygon") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_POLYGON];
			} else if (styleType == "circle") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_CIRCLE];
			} else if (styleType == "text") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_TEXT];
			}
			if (currentTab != null) {
				stylePanel = currentTab.createStylePanel();
				currentTab.setDrawStyle(feature.layer.affixStyle,stylePanel);
				editDialog.append(stylePanel);
			}
			editDialog.append(layerTitlePanel);
			editDialog.append(attributePanel);
			
			var controlPanel = $("<div style=\"margin:5px;text-align:center;width:100%;\"><button id=\"sz_edit_applybutton\">設定</button><button id=\"sz_edit_closebutton\">キャンセル</button></div>");
			editDialog.append(controlPanel);
			// 設定ボタンの処理
			controlPanel.find("#sz_edit_applybutton").click(
					$.proxy(function(ev) {
						if (currentTab) {
							var attributes = currentTab.retrieveAttributes(attributePanel);							
							if (styleType == "text") {
								if (jQuery.trim(attributes.name).length == 0) {
									alert("文字属性のオブジェクトは、タイトルが必要です。");
									return;
								}
							}
						}
						var newLayerName = jQuery.trim(layerTitlePanel.find("#sz_layer_name_text")[0].value);
						if (newLayerName.length == 0) {
							alert("レイヤ名を指定して下さい。");
							return;
						}
						// 取り消しように保存
						var targetFeatures = jQuery.extend([],this.editDialog.feature.layer.features);
						this.sakuzu.operationHistory.add('edit', { "feature":this.editDialog.feature,"features":targetFeatures, "style" : this.editDialog.feature.style,"affixStyle" : this.editDialog.feature.layer.affixStyle, "attributes" : this.editDialog.feature.attributes});

						// レイヤ名の変更
						if (newLayerName != this.editDialog.feature.layer.name.substring(8)) {
							// レイヤ名の変更処理が必要
							if (!this.sakuzu.changeLayerName(this.editDialog.feature,"_affix_."+newLayerName)) {
								// エラー
								if (window.console) {
									window.console.log("fail to changeLayerName");
								}
								return;
							}
							this.sakuzu.operationHistory.removeAllStacks();
						} else {
							this.sakuzu.unselectFeature(this.editDialog.feature);
						}
						// レイヤのスタイルを変更
						if (currentTab) {
							var attributes = currentTab.retrieveAttributes(attributePanel);							
							if (styleType == "text") {
								this.editDialog.feature.geometry.label = jQuery.trim(attributes.name);
							}
							// スタイルを取得
							var affixStyle = currentTab.retrieveDrawStyle(stylePanel);
							this.editDialog.feature.layer.affixStyle = affixStyle;
							// this.editDialog.feature.affixStyle = affixStyle;
							this.editDialog.feature.attributes = attributes;
							var style = this.sakuzu.convertToOLStyle(affixStyle);
							// 同じレイヤのfeatureのスタイルは、すべて変わります。
							this.editDialog.feature.layer.styleMap = style;
							for (var i = 0; i < this.editDialog.feature.layer.features.length; i++) {
								// スタイルを取得して、featureのスタイルに設定
								 this.editDialog.feature.layer.features[i].style = style;
							}
							this.editDialog.feature.layer.redraw();
						}
						editDialog.dialog("destroy");
						$("#sz_edit_dialog").remove();
					},this)
				);
			// キャンセルボタンの処理
			controlPanel.find("#sz_edit_closebutton").click(
				$.proxy(function(ev) {
					editDialog.dialog("destroy");
					$("#sz_edit_dialog").remove();
					this.sakuzu.unselectFeature(this.editDialog.feature);
				},this)
			);
		} else {
			// 共通項目だけ編集できる画面を表示
			var baseFeature = selectedFeatures[0];
			styleType = baseFeature.layer.styleType;
			styleType = styleType.toLowerCase();
			var isLayerSame = true;
			var commonLayer = selectedFeatures[0].layer;
			for (var i = 1; i < selectedFeatures.length; i++ ) {
				var feature = selectedFeatures[i];
				// 形状種別をチェックして同じじゃない場合は、編集不可
				if (feature.layer.styleType.toLowerCase() != styleType) {
					// 編集不可
					alert("形状種別の異なる図形を同時に編集することは出来ません。");
					this.sakuzu.unselectFeature();
					return;
				}
				if (commonLayer != selectedFeatures[i].layer) {
					isLayerSame = false;
				}
				
			}
			// 共通のスタイルの編集が可能
			// スタイル設定画面
			var currentTab = null;
			var stylePanel = null;
			if (styleType == "symbol") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_POINT];
			} else if (styleType == "string") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_LINE];
			} else if (styleType == "polygon") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_POLYGON];
			} else if (styleType == "circle") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_CIRCLE];
			} else if (styleType == "text") {
				currentTab = this.sakuzu.tabObjs[this.sakuzu.tabObjs.TAB_TEXT];
			}
			if (currentTab != null) {
				stylePanel = currentTab.createStylePanel();
				// 一つ目のFeatureのスタイルを表示
				currentTab.setDrawStyle(selectedFeatures[0].layer.affixStyle,stylePanel);
				editDialog.append(stylePanel);
			}

			// レイヤタイトルパネル
			var layerTitlePanel = null;
			// 選択したレイヤすべて同じ場合は、レイヤ名を表示
			layerTitlePanel = this.createLayerTitlePanel(isLayerSame?baseFeature:undefined);
			editDialog.append(layerTitlePanel);

			// 変更前のレイヤ名を保存
			var keepLayerTitle = "";
			if (isLayerSame) {
				if (baseFeature.layer.name.indexOf("_affix_.")==0) {
					keepLayerTitle = baseFeature.layer.name.substring(8);
				} else {
					keepLayerTitle = baseFeature.layer.name;
				}
			}
			var controlPanel = $("<div style=\"margin:5px;text-align:center;width:100%;\"><button id=\"sz_edit_applybutton\">設定</button><button id=\"sz_edit_closebutton\">キャンセル</button></div>");
			editDialog.append(controlPanel);
			controlPanel.find("#sz_edit_applybutton").click(
					$.proxy(function(ev) {
						var newLayerName = jQuery.trim(layerTitlePanel.find("#sz_layer_name_text")[0].value);
						var oldName = selectedFeatures[0].layer.name;
						// 違う種別で同一レイヤ名のレイヤがないかを確認
						
						if (newLayerName.length > 0) {
							// レイヤ名が変更されている。
							if (newLayerName != keepLayerTitle) {
								// レイヤ名変換の処理を実行
								for (var i = 0 ; i < selectedFeatures.length; i++) {
									if (selectedFeatures[i].layer.name != "_affix_."+newLayerName) {
										if (!this.sakuzu.changeLayerName(selectedFeatures[i],"_affix_."+newLayerName,true)) {
											if (window.console) {
												window.console.log("fail to changeLayerName");
											}
											this.sakuzu.unselectFeature();
											return;
										}
									}
								}
							}
						} else {
							alert("レイヤ名を指定して下さい。");
							return;
						}
						// 取り消しように保存
						var targetFeatures = jQuery.extend([],selectedFeatures[0].layer.features);
						this.sakuzu.operationHistory.add('edit', { "features":targetFeatures, "style" : selectedFeatures[0].style,"affixStyle" : selectedFeatures[0].layer.affixStyle});
						// この時点で、選択したFeatureは、すべて同じレイヤに格納されている。
						// スタイルを取得して、featureのスタイルに設定
						var affixStyle = currentTab.retrieveDrawStyle(stylePanel);
						var style = this.sakuzu.convertToOLStyle(affixStyle);
						var newLayer = selectedFeatures[0].layer;
						newLayer.affixStyle = affixStyle;
						// 選択されているFeatureのスタイルを設定
						if (newLayerName == keepLayerTitle) {
							newLayer.styleMap = style;
							for (var i = 0 ; i < newLayer.features.length; i++) {
								newLayer.features[i].style = style;
							}
						} else {
							this.sakuzu.operationHistory.removeAllStacks();
							// レイヤ名が変わったので、新しいレイヤの中のFeatureを更新する必要がある。
							newLayer.styleMap = style;
							for (var i = 0 ; i < newLayer.features.length; i++) {
								newLayer.features[i].style = style;
							}
						}
						newLayer.redraw();
						this.sakuzu.unselectFeature();
						editDialog.dialog("destroy");
						$("#sz_edit_dialog").remove();
					},this)
				);
			controlPanel.find("#sz_edit_closebutton").click(
				$.proxy(function(ev) {
					editDialog.dialog("destroy");
					$("#sz_edit_dialog").remove();
					this.sakuzu.unselectFeature();
				},this)
			);
		}
		this.editDialog = editDialog;
		// this.sakuzu.mainPanel.append(editDialog);
		$('#sz_tabs').append(editDialog);
		var dialogTitle = "編集";
		if (styleType) {
			if (styleType == "symbol") {
				dialogTitle += "(点)";
			} else if (styleType == "string") {
				dialogTitle += "(線)";
			} else if (styleType == "polygon") {
				dialogTitle += "(面)";
			} else if (styleType == "circle") {
				dialogTitle += "(円)";
			} else if (styleType == "text") {
				dialogTitle += "(文字)";
			}
		}
		if (this.sakuzu.config.inFrame) {
			if (styleType) {
				$("#sz_edit_title").html(dialogTitle);
			}
			// Inframeの場合は、アニメーション表示
			this.editDialog.css({
				"opacity":"0",
				"top":"0px",
				"left":"0px",
				"width":"96%",
				"overflow-x":"hidden",
				"position":"absolute",
				"padding":"5px"
			});
			editDialog.animate({
				"opacity":"1"
			});
		} else {
			this.editDialog.dialog({
				title:dialogTitle,
				modal:true,
				width:310,
				height:440
			});
		}
	}
});

/**************************/
/* 点タブ                  */
/**************************/
Sakuzu.PointTab = Sakuzu.Class(Sakuzu.AbstractStyleTab,{
	/** 選択された時に呼び出される。**/
	selected : function() {
		//  点の描画モード
		var webtis = this.sakuzu.getWebtis();
		var OpenLayers = this.sakuzu.getOpenLayers();
		var drawControl = new OpenLayers.Control.DrawFeature(this.sakuzu.affixLayer, OpenLayers.Handler.Point, {
			"callbacks": {
				"done" : function(geometry) {
					// 属性を取得
					var attributes = this._currentTab.retrieveAttributes();
					// スタイルを取得
					var affixStyle = this._currentTab.retrieveDrawStyle();
					var style = this._currentTab.sakuzu.convertToOLStyle(affixStyle);
					// 新たにレイヤーを作成して、そこに追加。
					var newLayer = new webtis.Layer.Vector("_affix_."+Sakuzu.generateLayerId("symbol",webtis),{
						styleMap : style
					});
					var feature = new webtis.Feature.Vector(geometry, attributes, style);
					newLayer.styleType = "symbol";
					newLayer.styleName = affixStyle.name;
					newLayer.affixStyle = affixStyle;
					feature.attributes = attributes;
					newLayer.JSGISelection = true;
					newLayer.addFeatures(feature);
					this._currentTab.sakuzu.addLayer(newLayer);
					this._currentTab.sakuzu.enablePopupLayer(newLayer);
					// undoに登録
					this._currentTab.sakuzu.operationHistory.add('new', { "feature" : feature});
				}
			}
		});
		drawControl._currentTab = this;
		this.drawControl = drawControl;
		return [this.drawControl];
	},
	// 点スタイルパネル
	createStylePanel : function() {
		var stylePanel = $("\
				<div><div class=\"sz_stylebox\" style=\"margin-top:15px;\">\
					<div style=\"position:relative;top:-10px;background-color:#eeeeee;display:inline;padding:5px;font-size:15px;font-weight:bold;\">スタイル</div>\
					<div style=\"position:relative;top:-10px;\">\
						<table>\
							<tr class=\"sz_title\">\
								<td>現在の画像</td>\
								<td>\
									<img id=\"sz_symbol_icon\" style=\"vertical-align:bottom;\" src=\""+Sakuzu.SymbolTable.baseURL+"071.png\">\
								</td>\
							</tr>\
							<tr class=\"sz_title\">\
								<td>サイズ</td>\
								<td>\
									<select id=\"sz_symbol_size\"><option value=\"50\">最大</option><option value=\"40\">大</option><option value=\"30\">中</option><option value=\"20\" selected>小</option><option value=\"10\">最小</option></select>\
								</td>\
							</tr>\
						</table>\
						<div class=\"sz_title_alt\">\
							<div>サイズの基準</div>\
							<div><select id=\"sz_symbol_stype\"><option value=\"static\" selected>画面上の大きさを固定(ピクセル)</option><option value=\"dynamic\" >実世界の大きさを固定(メートル)</option></select></div>\
						</div>\
					</div>\
				</div>\
			");
		var iconTablesElement = $("<div id=\"sz_icon_tables\"></div>");
		for (var i = 0; i < Sakuzu.SymbolTable.files.length; i++) {
			var iconElement = $("<div class=\"sz_icon\"><img src=\""+Sakuzu.SymbolTable.baseURL+Sakuzu.SymbolTable.files[i]+"\"></div>");
			$(iconTablesElement).append(iconElement);
			$(iconElement).click(
					function(ev) {
						stylePanel.find("#sz_symbol_icon")[0].src = ev.target.src;
					}
			);
		}
		stylePanel.append(iconTablesElement);
		return stylePanel;
	},
	/** 選択されているスタイルを取得 **/
	retrieveDrawStyle : function(panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var size = panel.find("#sz_symbol_size").val();
		var symbolElement = panel.find("#sz_symbol_icon")[0];
		var symbolURL = symbolElement.src;
		var stype = panel.find("#sz_symbol_stype").val();
		var affixStyle = {
				"name" : "symbolStyle",
				"type" : "SYMBOL",
				"symbol" : {
					"size":size+","+stype,
					"uri":symbolURL
				},
				"display" : "ON",
				"displaylevel" : "all",
				"selection" : "ON",
				"transparent" : "OFF"	//20120925非透過に変更
		};
		return affixStyle;
	},
	/** スタイルをUIに反映 **/
	setDrawStyle : function(affixStyle,panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var widthParam = affixStyle.symbol.size.split(",");
		var size = widthParam[0];
		var stype = widthParam[1];
		panel.find("#sz_symbol_size").val(size);
		panel.find("#sz_symbol_stype").val(stype);
		
		var symbolURL = affixStyle.symbol.uri;
		var symbolElement = panel.find("#sz_symbol_icon")[0];
		symbolElement.src = symbolURL; 
	}
});

/**************************/
/* 線タブ                  */
/**************************/
Sakuzu.LineTab = Sakuzu.Class(Sakuzu.AbstractStyleTab,{
	/** 選択された時に呼び出される。**/
	selected : function() {
		//  線の描画モード
		var webtis = this.sakuzu.getWebtis();
		var OpenLayers = this.sakuzu.getOpenLayers();
		var drawControl = new OpenLayers.Control.DrawFeature(this.sakuzu.affixLayer, OpenLayers.Handler.Path, {
			"callbacks": {
				"done" : function(geometry) {
					if (geometry.components.length <= 1) {
						return;
					}
					geometry.calculateBounds();
					if (geometry.bounds == null || geometry.bounds.getWidth() == 0) {
						return;
					}
					// 新たにレイヤーを作成して、そこに追加。
					// 属性を取得
					var attributes = this._currentTab.retrieveAttributes();
					// ここでスタイルを取得
					var affixStyle = this._currentTab.retrieveDrawStyle();
					var style = this._currentTab.sakuzu.convertToOLStyle(affixStyle);
					var newLayer = new webtis.Layer.Vector("_affix_."+Sakuzu.generateLayerId("string",webtis),{
						styleMap : style
					});
					var feature = new webtis.Feature.Vector(geometry, attributes, style);
					newLayer.styleType = "string";
					newLayer.styleName = affixStyle.name;
					newLayer.affixStyle = affixStyle;
					newLayer.JSGISelection = true;
					newLayer.addFeatures(feature);
					this._currentTab.sakuzu.addLayer(newLayer);
					this._currentTab.sakuzu.enablePopupLayer(newLayer);
					// undoに登録
					this._currentTab.sakuzu.operationHistory.add('new', { "feature" : feature});
				}
			}
		});
		drawControl._currentTab = this;
		this.drawControl = drawControl;
		return [this.drawControl];
	},
	// 線スタイルパネル
	createStylePanel : function() {
		var stylePanel = $("\
				<div><div class=\"sz_stylebox\" style=\"margin-top:15px;\">\
					<div style=\"position:relative;top:-10px;background-color:#eeeeee;display:inline;padding:5px;font-size:15px;font-weight:bold;\">スタイル</div>\
					<div style=\"position:relative;top:-10px;\">\
					<table><tr class=\"sz_title\"><td>線幅</td>\
						<td><select id=\"sz_line_width\">\
							<option value=\"75\">最大</option>\
							<option value=\"25\">大</option>\
							<option value=\"17.5\">中</option>\
							<option value=\"10\">小</option>\
							<option value=\"2.5\" selected>最小</option>\
						</select></td>\
					</tr></table>\
					<table><tr class=\"sz_title\"><td>線種</td>\
						<td><select id=\"sz_line_type\">\
							<option value=\"solid\" selected>実線</option>\
							<option value=\"dot\">点線</option>\
							<option value=\"dash\">破線</option>\
							<option value=\"dashdot\">一点破線</option>\
						</select></td>\
					</tr></table>\
					<table><tr class=\"sz_title\">\<td>線色</td>\
						<td><p id=\"sz_line_color\" class=\"sz_color_palette\" style=\"background-color:#FF0000\"></p></td>\
					</tr></table>\
					<div class=\"sz_title_alt\">\
						<div>線の太さの基準</div>\
						<div><select id=\"sz_line_stype\"><option value=\"static\" selected>画面上の太さを固定(ピクセル)</option><option value=\"dynamic\">実世界の太さを固定(メートル)</option></select></div>\
					</div>\
				</div></div>\
			");
		var lineColor = stylePanel.find("#sz_line_color");
		lineColor.click(
			$.proxy(function() {
				this.showColorPickerDialog(lineColor);
			},this)
		);
		return stylePanel;
	},
	/** 選択されているスタイルを取得 **/
	retrieveDrawStyle : function(panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var strokeWidth = panel.find("#sz_line_width").val();
		var typeElement = panel.find("#sz_line_type")[0];
		var strokeType = typeElement.options[typeElement.selectedIndex].value;
		var stype = panel.find("#sz_line_stype").val();
		
		var colorElement = panel.find("#sz_line_color")[0];
		var backgroundColor = $(colorElement).css("backgroundColor");
		var strokeColor = backgroundColor;
		var affixStyle = {
			"name" : "lineStringStyle",
			"type" : "STRING",
			'width':strokeWidth+","+stype,
			"style" : {
				"value":strokeType,
				"kind":"SYSTEM"
			},
			"rgb" : Sakuzu.cssColorToDeci(strokeColor),
			"display" : "ON",
			"displaylevel" : "all",
			"selection" : "ON",
			"transparent" : "ON"
		};
		return affixStyle;
	},
	/** スタイルをUIに反映 **/
	setDrawStyle : function(affixStyle,panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var widthParam = affixStyle["width"].split(",");
		var strokeWidth = widthParam[0];
		var stype = widthParam[1];
		panel.find("#sz_line_width").val(strokeWidth);
		panel.find("#sz_line_stype").val(stype);
		panel.find("#sz_line_type").val(affixStyle['style'].value.toLowerCase());
		panel.find("#sz_line_color").css("backgroundColor",Sakuzu.deciColorToCSSHex(affixStyle["rgb"]));
	}
});

/**************************/
/* 面タブ                  */
/**************************/
Sakuzu.PolygonTab = Sakuzu.Class(Sakuzu.AbstractStyleTab,{
	/** 選択された時に呼び出される。**/
	selected : function() {
		//  面の描画モード
		var webtis = this.sakuzu.getWebtis();
		var OpenLayers = this.sakuzu.getOpenLayers();
		var drawControl = new OpenLayers.Control.DrawFeature(this.sakuzu.affixLayer, OpenLayers.Handler.Polygon, {
			"callbacks": {
				"done" : function(geometry) {
					if (geometry.components[0].components.length <= 3) {
						return;
					}
					// ここでスタイルを取得
					var affixStyle = this._currentTab.retrieveDrawStyle();
					var style = this._currentTab.sakuzu.convertToOLStyle(affixStyle);
					// 新たにレイヤーを作成して、そこに追加。
					var newLayer = new webtis.Layer.Vector("_affix_."+Sakuzu.generateLayerId("poly",webtis),{
						styleMap : style
					});
					// 属性を取得
					var attributes = this._currentTab.retrieveAttributes();
					var feature = new webtis.Feature.Vector(geometry, attributes, style);
					newLayer.styleType = "polygon";
					newLayer.styleName = affixStyle.name;
					newLayer.JSGISelection = true;
					newLayer.affixStyle = affixStyle;
					newLayer.addFeatures(feature);
					this._currentTab.sakuzu.addLayer(newLayer);
					this._currentTab.sakuzu.enablePopupLayer(newLayer);
					// undoに登録
					this._currentTab.sakuzu.operationHistory.add('new', { "feature" : feature});
				}
			}
		});
		drawControl._currentTab = this;
		this.drawControl = drawControl;
		return [this.drawControl];
	},
	// 面スタイルパネル
	createStylePanel : function() {
		var stylePanel = $("\
				<div><div class=\"sz_stylebox\" style=\"margin-top:15px;\">\
					<div style=\"position:relative;top:-10px;background-color:#eeeeee;display:inline;padding:5px;font-size:15px;font-weight:bold;\">スタイル</div>\
					<div style=\"position:relative;top:-10px;\">\
				<table><tr class=\"sz_title\"><td>線幅</td>\
					<td>\
						<select id=\"sz_polygon_line_width\">\
							<option value=\"75\">最大</option>\
							<option value=\"25\">大</option>\
							<option value=\"17.5\">中</option>\
							<option value=\"10\">小</option>\
							<option value=\"2.5\" selected>最小</option>\
						</select>\
					</td>\
				</tr></table>\
				<table><tr class=\"sz_title\"><td>線種</td>\
					<td>\
						<select id=\"sz_polygon_line_type\">\
							<option value=\"solid\">実線</option>\
							<option value=\"dot\">点線</option>\
							<option value=\"dash\">破線</option>\
							<option value=\"dashdot\">一点破線</option>\
						</select>\
					</td>\
				</tr></table>\
				<table><tr class=\"sz_title\"><td>線色</td>\
					<td>\
						<p id=\"sz_polygon_line_color\" class=\"sz_color_palette\" style=\"background-color:#FF0000\"></p>\
					</td>\
				</tr></table>\
				<table><tr class=\"sz_title\"><td>塗色</td>\
					<td>\
						<p id=\"sz_polygon_fill_color\" class=\"sz_color_palette\" style=\"background-color:#00FF00\" ></p>\
					</td>\
				</tr></table>\
				<div class=\"sz_title_alt\">\
					<div>線の太さの基準</div>\
					<div><select id=\"sz_polygon_stype\"><option value=\"static\" selected>画面上の太さを固定(ピクセル)</option><option value=\"dynamic\" >実世界の太さを固定(メートル)</option></select></div>\
				</div>\
			</div></div>\
		");
		var lineColor = stylePanel.find("#sz_polygon_line_color");
		lineColor.click(
			$.proxy(function() {
				this.showColorPickerDialog(lineColor);
			},this)
		);
		var fillColor = stylePanel.find("#sz_polygon_fill_color");
		fillColor.click(
			$.proxy(function() {
				this.showColorPickerDialog(fillColor);
			},this)
		);
		return stylePanel;
	},
	/** 選択されているスタイルを取得 **/
	retrieveDrawStyle : function(panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var strokeWidth = panel.find("#sz_polygon_line_width").val();
		var typeElement = panel.find("#sz_polygon_line_type")[0];
		var strokeType = typeElement.options[typeElement.selectedIndex].value;
		var stype = panel.find("#sz_polygon_stype").val();

		var fillType = "solid";

		var colorElement = panel.find("#sz_polygon_line_color")[0];
		var strokeColor = $(colorElement).css("backgroundColor");
		var fillColorElement = panel.find("#sz_polygon_fill_color")[0];
		var fillColor = $(fillColorElement).css("backgroundColor");

		var affixStyle = {
			"name" : "polygonStyle",
			"type" : "POLYGON",
			"display" : "ON",
			"displaylevel" : "all",
			"selection" : "ON",
			"transparent" : "ON",
			"width" : strokeWidth + ","+stype,
			"brgb" : Sakuzu.cssColorToDeci(strokeColor),
			"brush" : fillType,
			"rgb" : Sakuzu.cssColorToDeci(strokeColor),
			"hrgb" : Sakuzu.cssColorToDeci(fillColor),
			"style" : {
				"value":strokeType,
				"kind":"SYSTEM"
			},
			"paint":"ON"
		};
		return affixStyle;
	},
	/** スタイルをUIに反映 **/
	setDrawStyle : function(affixStyle,panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var widthParam = affixStyle["width"].split(",");
		var strokeWidth = widthParam[0];
		var stype = widthParam[1];
		panel.find("#sz_polygon_line_width").val(strokeWidth);
		panel.find("#sz_polygon_stype").val(stype);
		panel.find("#sz_polygon_line_type").val(affixStyle["style"].value);
		panel.find("#sz_polygon_line_color").css("backgroundColor",Sakuzu.deciColorToCSSHex(affixStyle["rgb"]));
		panel.find("#sz_polygon_fill_color").css("backgroundColor",Sakuzu.deciColorToCSSHex(affixStyle["hrgb"]));
	}
});

/**************************/
/* 円タブ                  */
/**************************/
Sakuzu.CircleTab = Sakuzu.Class(Sakuzu.AbstractStyleTab,{
	/** 選択された時に呼び出される。**/
	selected : function() {
		//  円の描画モード
		this.drawControl = this.createDrawControl();
		return [this.drawControl];
	},
	// 描画用Controlを選定
	createDrawControl : function() {
		var webtis = this.sakuzu.getWebtis();
		var OpenLayers = this.sakuzu.getOpenLayers();
		var drawMode = this.stylePanel.find("input[name='sz_circle_drawmode']:checked").val();
		var drawControl;
		if (drawMode == "drag") {
			drawControl = new OpenLayers.Control.DrawFeature(this.sakuzu.affixLayer, webtis.Handler.Circle, {
				"callbacks": {
					"done" : function(geometry, radius,targetLonLat) {
						// ここでスタイルを取得
						var affixStyle = this._currentTab.retrieveDrawStyle();
						var style = this._currentTab.sakuzu.convertToOLStyle(affixStyle);
						// 新たにレイヤーを作成して、そこに追加。
						var newLayer = new webtis.Layer.Vector("_affix_."+Sakuzu.generateLayerId("circle",webtis),{
							styleMap:style
						});
						// 属性を取得
						var attributes = this._currentTab.retrieveAttributes();
						var feature = new webtis.Feature.Vector(geometry, attributes, style);
						newLayer.JSGISelection = true;
						newLayer.styleType = "circle";
						newLayer.styleName = affixStyle.name;
						newLayer.affixStyle = affixStyle;
						
						var centerLonLat = new OpenLayers.LonLat(geometry.x,geometry.y);
						centerLonLat = centerLonLat.transform(this._currentTab.sakuzu.getMapObject().getProjectionObject(),Sakuzu.baseProjection);
						targetLonLat = targetLonLat.transform(this._currentTab.sakuzu.getMapObject().getProjectionObject(),Sakuzu.baseProjection);
						
						var radiusm = OpenLayers.Util.distVincenty(centerLonLat,targetLonLat)*1000;

						// boundsを計算
						// ポイントですが、半径分の矩形を設定します。
						var topLL = OpenLayers.Util.destinationVincenty(centerLonLat,0,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var rightLL = OpenLayers.Util.destinationVincenty(centerLonLat,90,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var bottomLL = OpenLayers.Util.destinationVincenty(centerLonLat,180,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var leftLL = OpenLayers.Util.destinationVincenty(centerLonLat,270,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var newBounds = new OpenLayers.Bounds(leftLL.lon,bottomLL.lat,rightLL.lon,topLL.lat);
						geometry.bounds = newBounds;

						feature.pointRadius = radiusm;
						feature.styleSize = affixStyle['width'].split()[0];
						newLayer.addFeatures(feature);
						this._currentTab.sakuzu.addLayer(newLayer);
						this._currentTab.sakuzu.enablePopupLayer(newLayer);
						// undoに登録
						this._currentTab.sakuzu.operationHistory.add('new', { "feature" : feature});
					}
				}
			});
		} else {
			drawControl = new OpenLayers.Control.DrawFeature(this.sakuzu.affixLayer, webtis.Handler.CircleFixedRadius, {
				"callbacks": {
					"done" : function(geometry) {
						var radiusm = this._currentTab.fixedRadiusMeter;
						if ($.isNaN(radiusm)) {
							return;
						}
						// ここでスタイルを取得
						var affixStyle = this._currentTab.retrieveDrawStyle();
						var style = this._currentTab.sakuzu.convertToOLStyle(affixStyle);
						// 新たにレイヤーを作成して、そこに追加。
						var newLayer = new webtis.Layer.Vector("_affix_."+Sakuzu.generateLayerId("circle",webtis),{
							styleMap : style
						});
						// 属性を取得
						var attributes = this._currentTab.retrieveAttributes();
						var feature = new webtis.Feature.Vector(geometry, attributes, style);
						
						// ポイントですが、半径分の矩形を設定します。
						var centerLonLat = new OpenLayers.LonLat(geometry.x,geometry.y);
						centerLonLat = centerLonLat.transform(this._currentTab.sakuzu.getMapObject().getProjectionObject(),Sakuzu.baseProjection);
						var topLL = OpenLayers.Util.destinationVincenty(centerLonLat,0,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var rightLL = OpenLayers.Util.destinationVincenty(centerLonLat,90,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var bottomLL = OpenLayers.Util.destinationVincenty(centerLonLat,180,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var leftLL = OpenLayers.Util.destinationVincenty(centerLonLat,270,radiusm).transform(Sakuzu.baseProjection,this._currentTab.sakuzu.getMapObject().getProjectionObject());
						var newBounds = new OpenLayers.Bounds(leftLL.lon,bottomLL.lat,rightLL.lon,topLL.lat);
						geometry.bounds = newBounds;
						
						feature.pointRadius = radiusm;
						newLayer.styleType = "circle";
						newLayer.styleName = affixStyle.name;
						newLayer.affixStyle = affixStyle;
						newLayer.JSGISelection = true;
						feature.styleSize = affixStyle['width'].split(",")[0];
						newLayer.addFeatures(feature);
						this._currentTab.sakuzu.addLayer(newLayer);
						this._currentTab.sakuzu.enablePopupLayer(newLayer);
						// undoに登録
						this._currentTab.sakuzu.operationHistory.add('new', { "feature" : feature});
					}
				}
			});
			// 半径を取得
			var radius = this.additionalPanel.find("#sz_circle_raius").val();
			if (!$.isNaN(radius)) {
				var unitMode = this.additionalPanel.find("#sz_circle_raius_unit option:selected").val();
				var radiusm = radius;
				if (unitMode == "km") {
					radiusm = radiusm * 1000;
				}
				this.fixedRadiusMeter = radiusm;
				drawControl.handler.radiusMeter = this.fixedRadiusMeter;
			}
		}
		drawControl._currentTab = this;
		return drawControl;
	},
	// スタイルパネルの下に追加で表示するパネル
	createAdditionalPanel : function() {
		var panel = $("<div id=\"sz_popup_attr\" style=\"height:80px;\">\
		<div style=\"position:relative;top:-10px;background-color:#eeeeee;display:inline;padding:5px;\">描画方法</div>\
		<div style=\"position:relative;top:-10px;font-size:14px;\"><div><label><input type=\"radio\" name=\"sz_circle_drawmode\" value=\"drag\" checked style=\"margin-bottom:5px;\">ドラッグで円を指定</label><br>\
				<label ><input type=\"radio\" name=\"sz_circle_drawmode\" value=\"point\" style=\"margin-bottom:5px;\">半径を指定</label>\
				<div style=\"margin-left:20px;\"><input id=\"sz_circle_raius\" type=\"text\" value=\"\" size=\"4\" style=\"margin-right:5px;\"><select id=\"sz_circle_raius_unit\"><option value=\"m\">メートル</option><option value=\"km\">キロメートル</option></select><button id=\"sz_circle_radius_button\" >決定</button></div>\
				</div></div>\
				<input type=\"hidden\" id=\"sz_circle_radiusm\" value=\"\"/></div>");
		panel.find("input[name='sz_circle_drawmode']:radio").change(
			$.proxy(function(ev) {
				// 描画方法の変更
				var newControl = this.createDrawControl();
				this.drawControl = newControl;
				this.sakuzu.updateDrawControls([newControl]);
				var drawMode = this.stylePanel.find("input[name='sz_circle_drawmode']:checked").val();
				if (drawMode != "drag") {
					if ($.isNaN(this.fixedRadiusMeter)) {
						this.drawControl.handler.radiusMeter = 0;
					} else {
						this.drawControl.handler.radiusMeter = this.fixedRadiusMeter;
					}
				}
			},this)
		);
		panel.find("#sz_circle_radius_button").click(				
				$.proxy(function(ev) {
					if (this.updateRadius()) {
						this.drawControl.handler.radiusMeter = this.fixedRadiusMeter;
					} else {
						this.drawControl.handler.radiusMeter = 0;
					}
				},this)
			);
		return panel;
	},
	updateRadius : function() {
		var radius = this.additionalPanel.find("#sz_circle_raius").val();
		if ($.isNaN(radius)) {
			alert("半径には、数字を入力してください。");
			return false;
		}
		var unitMode = this.additionalPanel.find("#sz_circle_raius_unit option:selected").val();
		var radiusm = radius;
		if (unitMode == "km") {
			radiusm = radiusm * 1000;
		}
		this.fixedRadiusMeter = radiusm;
		return true;
		// panel.find("#sz_circle_radiusm").val(radiusm);
	},

	// 円スタイルパネル
	createStylePanel : function() {
		var stylePanel = $("\
				<div><div class=\"sz_stylebox\" style=\"margin-top:15px;\">\
					<div style=\"position:relative;top:-10px;background-color:#eeeeee;display:inline;padding:5px;font-size:15px;font-weight:bold;\">スタイル</div>\
					<div style=\"position:relative;top:-10px;\">\
				<table><tr class=\"sz_title\"><td>線幅</td>\
					<td>\
						<select id=\"sz_circle_line_width\">\
							<option value=\"75\">最大</option>\
							<option value=\"25\">大</option>\
							<option value=\"17.5\">中</option>\
							<option value=\"10\">小</option>\
							<option value=\"2.5\" selected>最小</option>\
						</select>\
					</td>\
				</tr></table>\
				<table><tr class=\"sz_title\"><td>線種</td>\
					<td>\
						<select id=\"sz_circle_line_type\">\
							<option value=\"solid\" selected>実線</option>\
							<option value=\"dot\">点線</option>\
							<option value=\"dash\">破線</option>\
							<option value=\"dashdot\">一点破線</option>\
						</select>\
					</td>\
				</tr></table>\
				<table><tr class=\"sz_title\"><td>線色</td>\
					<td>\
						<p id=\"sz_circle_line_color\" class=\"sz_color_palette\" style=\"background-color:#FF0000\"></p>\
					</td>\
				</tr></table>\
				<table><tr class=\"sz_title\"><td>塗色</td>\
					<td>\
						<p id=\"sz_circle_fill_color\" class=\"sz_color_palette\" style=\"background-color:#00FF00\"></p>\
					</td>\
				</tr></table>\
				<div class=\"sz_title_alt\">\
					<div>線の太さの基準</div>\
					<div><select id=\"sz_circle_stype\"><option value=\"static\" selected>画面上の太さを固定(ピクセル)</option><option value=\"dynamic\" >実世界の太さを固定(メートル)</option></select></div>\
				</div>\
			</div></div>\
		");
		var lineColor = stylePanel.find("#sz_circle_line_color");
		lineColor.click(
			$.proxy(function() {
				this.showColorPickerDialog(lineColor);
			},this)
		);
		var fillColor = stylePanel.find("#sz_circle_fill_color");
		fillColor.click(
			$.proxy(function() {
				this.showColorPickerDialog(fillColor);
			},this)
		);
		return stylePanel;
	},
	/** 選択されているスタイルを取得 **/
	retrieveDrawStyle : function(panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var strokeWidth =  panel.find("#sz_circle_line_width").val();
		var stype =  panel.find("#sz_circle_stype").val();
		var strokeType = panel.find("#sz_circle_line_type").val();

		var fillType = "solid";
		
		var colorElement = panel.find("#sz_circle_line_color")[0];
		var strokeColor = $(colorElement).css("backgroundColor");
		var fillColorElement = panel.find("#sz_circle_fill_color")[0];
		var fillColor = $(fillColorElement).css("backgroundColor");

		var affixStyle = {
				"name" : "circleStyle",
				"type" : "CIRCLE",
				"display" : "ON",
				"displaylevel" : "all",
				"selection" : "ON",
				"transparent" : "ON",
				"width" : strokeWidth + ","+stype,
				"brgb" : Sakuzu.cssColorToDeci(strokeColor),
				"brush" : fillType,
				"rgb" : Sakuzu.cssColorToDeci(strokeColor),
				"hrgb" : Sakuzu.cssColorToDeci(fillColor),
				"style" : {
					"value":strokeType,
					"kind":"SYSTEM"
				},
				"paint":"ON"
			};
		return affixStyle;
	},
	/** スタイルをUIに反映 **/
	setDrawStyle : function(affixStyle,panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var widthParams = affixStyle["width"].split(",");
		panel.find("#sz_circle_line_width").val(widthParams[0]);
		panel.find("#sz_circle_stype").val(widthParams[1]);
		panel.find("#sz_circle_line_type").val(affixStyle["style"].value);
		panel.find("#sz_circle_line_color").css("backgroundColor",Sakuzu.deciColorToCSSHex(affixStyle["rgb"]));
		panel.find("#sz_circle_fill_color").css("backgroundColor",Sakuzu.deciColorToCSSHex(affixStyle["hrgb"]));
		
	}
});
	
/**************************/
/* 文字タブ                  */
/**************************/
Sakuzu.TextTab = Sakuzu.Class(Sakuzu.AbstractStyleTab,{
	/** 選択された時に呼び出される。**/
	selected : function() {
		//  文字の描画モード
		var webtis = this.sakuzu.getWebtis();
		var OpenLayers = this.sakuzu.getOpenLayers();
		var drawControl = new OpenLayers.Control.DrawFeature(this.sakuzu.affixLayer, OpenLayers.Handler.Point, {
			"callbacks": {
				"done" : function(point) {
					// 属性を取得
					var attributes = this._currentTab.retrieveAttributes();
					if (jQuery.trim(attributes.name).length == 0) {
						// タイトル未入力
						return;
					}
					attributes.name = jQuery.trim(attributes.name);
					// ここでスタイルを取得
					var affixStyle = this._currentTab.retrieveDrawStyle();
					var style = this._currentTab.sakuzu.convertToOLStyle(affixStyle);
					var geometry = new webtis.Geometry.TextRectangle(point.x, point.y);
					geometry.label = attributes.name;
					
					// 新たにレイヤーを作成して、そこに追加。
					var newLayer = new webtis.Layer.Vector("_affix_."+Sakuzu.generateLayerId("text",webtis),{
						styleMap : style
					});
					var feature = new webtis.Feature.Vector(geometry, attributes, style);
					newLayer.styleType = "text";
					newLayer.styleName = affixStyle.name;
					newLayer.JSGISelection = true;
					newLayer.affixStyle = affixStyle;
					// フォントの大きさをFeatureに埋め込み
					var textSize = affixStyle['font'].size;
					var textParam = textSize.split(",");
					var fontSize = textParam[0];
					var dynamic = textParam[1]=="dynamic";
					var inputFontSizeNumber = Sakuzu.calcFontSizeNumber(fontSize,dynamic);
					feature.styleSize = inputFontSizeNumber;
					newLayer.addFeatures(feature);
					this._currentTab.sakuzu.addLayer(newLayer);
					this._currentTab.sakuzu.enablePopupLayer(newLayer);
					
					// undoに登録
					this._currentTab.sakuzu.operationHistory.add('new', { "feature" : feature});
				}

			}
		});
		drawControl._currentTab = this;
		this.drawControl = drawControl;
		return [this.drawControl];
	},
	
	// スタイルパネルの下に追加で表示するパネル
	createAdditionalPanel : function() {
		return $("<div style=\"font-size:0.8em;line-height:14px;margin-top:6px;margin-bottom:6px;\">文字型データでは「タイトル」が文字列の値になります。</div>");
	},
	
	// テキストスタイルパネル
	createStylePanel : function() {
		var stylePanel = $("\
				<div><div class=\"sz_stylebox\" style=\"margin-top:15px;\">\
					<div style=\"position:relative;top:-10px;background-color:#eeeeee;display:inline;padding:5px;font-size:15px;font-weight:bold;\">スタイル</div>\
					<div style=\"position:relative;top:-10px;\">\
					<table><tr class=\"sz_title\"><td>文字サイズ</td>\
						<td>\
							<form><select name=\"text_size\" id=\"sz_text_size\">\
								<option value=\"biggest\">最大</option>\
								<option value=\"big\">大</option>\
								<option value=\"medium\" selected>中</option>\
								<option value=\"small\">小</option>\
								<option value=\"smallest\">最小</option>\
							</select><br>\
							<label><input id=\"sz_text_bold\" type=\"checkbox\" >極太</label></form>\
						</td>\
					</table>\
					<table><tr class=\"sz_title\"><td>文字色</td>\
						<td>\
							<p id=\"sz_text_color\" class=\"sz_color_palette\" style=\"background-color:#000000\"></p>\
						</td>\
					</tr></table>\
					<table><tr class=\"sz_title\"><td>背景色</td>\
						<td>\
							<p id=\"sz_back_color\" class=\"sz_color_palette\" style=\"background-color:#FF0000\"></p>\
						</td>\
					</tr></table>\
					<div class=\"sz_title_alt\">\
						<div>サイズの基準</div>\
						<div><select id=\"sz_text_dynamic\"><option value=\"static\" selected>画面上の大きさを固定(ピクセル)</option><option value=\"dynamic\" >実世界の大きさを固定(メートル)</option></select></div>\
					</div>\
				</form>\
				</div></div>\
			");
		var textColor = stylePanel.find("#sz_text_color");
		textColor.click(
			$.proxy(function() {
				this.showColorPickerDialog(textColor);
			},this)
		);
		var backColor = stylePanel.find("#sz_back_color");
		backColor.click(
			$.proxy(function() {
				this.showColorPickerDialog(backColor);
			},this)
		);
		return stylePanel;
	},
	/** 選択されているスタイルを取得 **/
	retrieveDrawStyle : function(panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var textDynamic = panel.find("#sz_text_dynamic").val() == "dynamic";
		var textSizeElement = panel.find("#sz_text_size")[0];
		var textSize = textSizeElement.options[textSizeElement.selectedIndex].value;
		var textBold = panel.find("#sz_text_bold")[0].checked;
		var textColorElement = panel.find("#sz_text_color")[0];
		var textColor = $(textColorElement).css("backgroundColor");
		var backColorElement = panel.find("#sz_back_color")[0];
		var backColor = $(backColorElement).css("backgroundColor");

		var affixStyle = {
			'name' : 'textStyle',
			'type' : 'TEXT',
			"display" : "ON",
			"displaylevel" : "all",
			"selection" : "ON",
			"transparent" : "OFF",	//20120925非透過に変更
			'rgb' : Sakuzu.cssColorToDeci(textColor),
			'brgb' : Sakuzu.cssColorToDeci(backColor),
			'paint' : 'ON',
			'mode':'CC',
			'font' : {
				"name" : "ＭＳ ゴシック",
				"style" : textBold?"極太":"標準",
				"size" : Sakuzu.calcFontSizeNumber(textSize,textDynamic)+","+(textDynamic?"dynamic":"static")
			}
		};
		return affixStyle;
	},
	/** スタイルをUIに反映 **/
	setDrawStyle : function(affixStyle,panel) {
		if (!panel) {
			panel = this.stylePanel;
		}
		var textSize = affixStyle["font"].size;
		var textParam = textSize.split(",");
		panel.find("#sz_text_size").val(Sakuzu.getFontSizeString(textParam[0],textParam[1]=="dynamic"));
		panel.find("#sz_text_dynamic").val(textParam[1]=="dynamic"?"dynamic":"static");
		panel.find("#sz_text_bold")[0].checked = (affixStyle["font"].style=="極太");
		panel.find("#sz_text_color").css("backgroundColor",Sakuzu.deciColorToCSSHex(affixStyle["rgb"]));
		panel.find("#sz_back_color").css("backgroundColor",Sakuzu.deciColorToCSSHex(affixStyle["brgb"]));
	}
});

/**************************/
/* 読込保存タブ                  */
/**************************/
Sakuzu.XmlTab = Sakuzu.Class(Sakuzu.AbstractTab,{
	/** 選択された時に呼び出される。**/
	isPopupEnabled : function() {
		return true;
	},
	// XMLパネル
	createStylePanel : function() {
		var xmlPanel = $("\
			<div class=\"sz_stylebox\">\
				<div class=\"sz_xml_block\" style=\"border-bottom:1px solid gray;\">\
					<h2>図形ファイル読込(KML形式)</h2>\
					<div style=\"margin-top:5px;font-size:10px;color:red;line-height:12px;\">※読込可能ファイルは本作図機能により作成したものに限られます。</div>\
					<form method=\"post\" enctype=\"multipart/form-data\" id=\"sz_xml_uploadform\" target=\"sz_xml_uploadframe\">\
					<div id=\"fields\" class=\"sz_xml_files\">\
						<input type=\"hidden\" id=\"sz_xml_file_type\" name=\"inFmt\" value=\"xml\" />\
						<input type=\"hidden\" id=\"sz_xml_file_did\" name=\"did\" value=\"\" />\
						<input type=\"hidden\" name=\"op\" value=\"ticket\" />\
						<input type=\"file\" id=\"sz_xml_file1\" name=\"file1\" style=\"width:200px;\">\
					</div>\
					<label><input type=\"checkbox\" id=\"sz_xml_removeall\">上乗せ情報を消してから読込</label><br>\
					<div class=\"sz_xml_controls\"><button id=\"sz_xml_upload_button\">読込</button></form></div>\
					<iframe id=\"sz_xml_uploadframe\" name=\"sz_xml_uploadframe\" style=\"display:none;height:0px;\" src=\"about:blank\"></iframe>\
				</div>\
				<div class=\"sz_xml_block\" >\
					<h2>図形ファイル保存(KML形式)</h2>\
					<div class=\"sz_xml_controls\"><button id=\"sz_xml_button\">保存</button></div>\
				</div>\
			</div>\
		");
		
		// XMLアップロード時に使用するForm
		var xmlUploadButton = xmlPanel.find("#sz_xml_upload_button");
		xmlUploadButton.click(
				$.proxy(function() {
					// ファイルが選択されていない場合は、無視。
					if (xmlPanel.find("#sz_xml_file1")[0].value.length == 0) {
						return false;
					}
					// op=ticket_pub ticketを発行
					var parameter = {
							op : "ticket_pub"
					};
					var webtis = this.sakuzu.getWebtis();
					$.ajax({
						type: "POST",
						url: webtis.SERVER_URL.CONVERT_TO_JSON_SERVER,
						data: parameter,
						dataType: "jsonp",
						success: $.proxy(function(data,status) {
							var genid = data;
							var uploadForm = $(xmlPanel.find("#sz_xml_uploadform")[0]);
							uploadForm.find("#sz_xml_file_did").val(genid);
							uploadForm.attr("action",webtis.SERVER_URL.CONVERT_TO_JSON_SERVER);
							uploadForm.submit();
						}),
						error : function(e) {
							if (window.console) {
								window.console.log(e);
							}
							alert("読み込めませんでした。");
						}
					});
			},this)
		);
		// ファイルを選択したときに拡張子をチェック
		var xmlFileElement = xmlPanel.find("#sz_xml_file1");
		xmlFileElement.change(
				function(e) {
					// 拡張子は、xml,kml,kmzのみ
					var fileName = e.target.value.toLowerCase();
					if (!fileName.match(/\.(xml|kml|kmz)$/i)) {
						e.target.value = null;
						alert("対応していないフォーマットです。");
						return;
					}
					var fmt = fileName.substring(fileName.length-3);
					xmlPanel.find("#sz_xml_file_type").val(fmt);
				}
		);
		var uploadFrame = xmlPanel.find("#sz_xml_uploadframe");
		uploadFrame.load($.proxy(function(a){
			// JSONを取得
			// op=ticket_pub ticketを発行
			var uploadForm = $(xmlPanel.find("#sz_xml_uploadform")[0]);
			var genid = uploadForm.find("#sz_xml_file_did").val();
			if (genid.length > 0) {
				var that = this;
				function loadJSON(result) {
					var removeAllCheck = $("#sz_xml_removeall").attr("checked");
					if (removeAllCheck) {
						// 読み込み前に全て削除
						that.sakuzu.deleteAllLayers();
					}
					that.sakuzu.operationHistory.removeAllStacks();
					var webtis = that.sakuzu.getWebtis();
					var options = {
							"affix" : true,
							"projection" : that.sakuzu.getMapObject().getProjectionObject()
					};
					var json = new webtis.Format.JSGIJSON(options);
					var subLayers = json.read(result);
					var bounds = null;
					var OpenLayers = that.sakuzu.getOpenLayers();
					for (var i = 0; i < subLayers.length; i++) {
						var newLayer = subLayers[i];
						that.sakuzu.addLayer(newLayer);
						var layerBounds = newLayer.getDataExtent();
						if (layerBounds) {
							if (!bounds) {
								bounds = new OpenLayers.Bounds(layerBounds.left, layerBounds.bottom, layerBounds.right, layerBounds.top);
							} else {
								bounds.extend(layerBounds);
							}
						}
					}
					that.sakuzu.enablePopupLayer();
					if (bounds) {
						that.sakuzu.getMapObject().zoomToExtent(bounds,false);
					}
				}
				var parameter = {
						op : "ticket_use",
						did : genid
				};
				var webtis = that.sakuzu.getWebtis();
				$.ajax({
					type: "POST",
					url: webtis.SERVER_URL.CONVERT_TO_JSON_SERVER,
					data: parameter,
					dataType: "jsonp",
					success: $.proxy(function(data,status) {
						if (data == null) {
							alert("読み込めませんでした。");
							return;
						}
						loadJSON(data);
					}),
					error : function() {
						alert("読み込めませんでした。");
					}
				});
			}
		},this));
		// XML保存時に使用するForm
		var requestForm = "<form method=\"post\" id=\"sz_xml_form\">";
		requestForm += "<input type=\"hidden\" name=\"content\" value=\"\" id=\"sz_xml_content\">";
		requestForm += "<input type=\"hidden\" name=\"outFmt\" value=\"xml\" id=\"sz_xml_fmt\">";
		requestForm += "</form>";
		var f = $(requestForm);
		xmlPanel.append(f);
		// XML保存ボタンの処理
		var xmlButton = xmlPanel.find("#sz_xml_button");
		xmlButton.click(
			$.proxy(function() {
				var webtis = this.sakuzu.getWebtis();
				f.attr("action",webtis.SERVER_URL.CONVERT_FROM_JSON_SERVER);
				//  アップロードするJSONのコンテンツを作成
				var webtis = this.sakuzu.getWebtis();
				var content = webtis.Format.JSGIJSON.makeJSONString(this.sakuzu.getLayers(),Sakuzu.baseProjection);
				//var fmt = xmlPanel.find("input[name='xmltype']:checked").val();
				f.find("#sz_xml_content").val(content);
				f.find("#sz_xml_fmt").val("kml");
				f.submit();
			},this)
		);
		return xmlPanel;
	}
});

/**************************/
/* 地図タブ                  */
/**************************/
Sakuzu.MapTab = Sakuzu.Class(Sakuzu.AbstractTab,{
	isPopupEnabled : function() {
		return true;
	},
	// Mapパネル
	createStylePanel : function() {
		var mapPanel = $("\
				<div>\
					<div style=\"font-size:14px;padding:5px;\">表示されている地図の状態を</div>\
					<div style=\"font-size:14px;\">\
						<button id=\"sz_map_genurl\">URLで生成</button>\
						<button id=\"sz_map_genhtml\">HTMLタグで生成</button>\
					</div>\
					<textarea style=\"width:240px;height:240px;margin-top:5px;margin-bottom:10px;\" id=\"sz_map_textarea\"></textarea>\
					<div style=\"font-size:14px;\">\
						<button id=\"sz_map_savehtml\">HTMLをファイルに保存</button>\
					</button>\
				</div>\
				<iframe id=\"sz_map_uploadframe\" name=\"sz_map_uploadframe\" style=\"display:none;height:0px;\" src=\"about:blank\"></iframe>\
			");
		// HTML保存時に使用するForm
		var requestForm = "<form method=\"post\" id=\"sz_map_form\">";
		requestForm += "<input type=\"hidden\" name=\"tid\" value=\"savehtml\">";
		requestForm += "<input type=\"hidden\" name=\"download\" value=\"true\">";
		requestForm += "<input type=\"hidden\" name=\"did\" value=\"\" id=\"sz_map_did\">";
		requestForm += "</form>";
		var f = $(requestForm);
		mapPanel.append(f);

		// JSONアップロード時に使用するForm
		var requestForm = "<form method=\"post\" id=\"sz_map_uploadjson\" target=\"sz_map_uploadframe\">";
		requestForm += "<input type=\"hidden\" name=\"did\" value=\"\">";
		requestForm += "<input type=\"hidden\" name=\"content\" value=\"\">";
		requestForm += "<input type=\"hidden\" name=\"dataset\" value=\"\">";
		requestForm += "<input type=\"hidden\" name=\"lonlat\" value=\"\">";
		requestForm += "<input type=\"hidden\" name=\"zoomLevel\" value=\"\">";
		requestForm += "</form>";
		var uf = $(requestForm);
		mapPanel.append(uf);
		
		var uploadFrame = mapPanel.find("#sz_map_uploadframe");
		uploadFrame._sakuzuInit = false;
		uploadFrame._saveHTML = false;
		uploadFrame.load($.proxy(function(a){
			if (!uploadFrame._sakuzuInit) {
				uploadFrame._sakuzuInit = true;
				return;
			}			
			var genid = uf.find('input[name="did"]').val();
			if (genid == "") {
				alert("保存できませんでした。");
			} else {
				if (uploadFrame._saveHTML) {
					f.find("#sz_map_did").val(genid);
					f.submit();
				}
				uploadFrame._saveHTML = false;
			}
			
			uf.find('input[name="did"]').val("");
			uf.find('input[name="content"]').val("");
			uf.find('input[name="dataset"]').val("");
			uf.find('input[name="lonlat"]').val("");
			uf.find('input[name="zoomLevel"]').val("");
		},this));
		
		/**
		 * アップロードパラメータ
		 */
		function createUploadParameter(sakuzu) {
			var webtis = sakuzu.getWebtis();
			var content = webtis.Format.JSGIJSON.makeJSONString(sakuzu.getLayers(),Sakuzu.baseProjection);
			var dataset = sakuzu.getMapObject().baseLayer.CLASS_NAME == "webtis.Layer.BaseMap"?sakuzu.getMapObject().baseLayer.getDataSet():null;
			if (dataset) {
				dataset = webtis.Format.JSGIJSON.stringify(dataset);
			}
			var lonlat = sakuzu.getMapObject().getCenter().clone().transform(sakuzu.getMapObject().getProjectionObject(),Sakuzu.baseProjection);
			lonlat = "{'lon':"+lonlat.lon+",'lat':"+lonlat.lat+"}";
			var zoomLevel = "{'zoomLevel':"+sakuzu.getMapObject().zoom+"}";
			var parameter = {
					content : content,
					dataset : dataset,
					lonlat : lonlat,
					zoomLevel : zoomLevel
			};
			return parameter;
		}
		
		// URLで生成
		var genURLButton = mapPanel.find("#sz_map_genurl");
		
		genURLButton.click(
				$.proxy(function() {
					// op=ticket_pub ticketを発行
					var parameter = {
						op : "ticket_pub"
					};
					var webtis = this.sakuzu.getWebtis();
					$.ajax({
						type: "POST",
						url: webtis.SERVER_URL.CONVERT_TO_JSON_SERVER,
						data: parameter,
						dataType: "jsonp",
						success: $.proxy(function(data,status) {
							var genid = data;
							var parameter = createUploadParameter(this.sakuzu);
							// JSON、データセット、緯度経度、縮尺をサーバにアップロード
							var webtis = this.sakuzu.getWebtis();
							// フォームに設定して、アップロード
							uf.attr("action",webtis.SERVER_URL.SAVE_JSON_SERVER);
							uf.find('input[name="did"]').val(genid);
							uf.find('input[name="content"]').val(parameter.content);
							uf.find('input[name="dataset"]').val(parameter.dataset);
							uf.find('input[name="lonlat"]').val(parameter.lonlat);
							uf.find('input[name="zoomLevel"]').val(parameter.zoomLevel);
							uf.submit();
							var url = webtis.SERVER_URL.SHOW_MAP_SERVER+"?did="+genid;
							mapPanel.find("#sz_map_textarea").val(url);
						},this),
						error : function(e) {
							mapPanel.find("#sz_map_textarea").val("");
							alert("読み込めませんでした。");
						}
					});

			},this)
		);
		// HTMLタグで生成
		var genHTMLButton = mapPanel.find("#sz_map_genhtml");
		genHTMLButton.click(
				$.proxy(function() {
					// op=ticket_pub ticketを発行
					var parameter = {
						op : "ticket_pub"
					};
					// JSON、データセット、緯度経度、縮尺をサーバにアップロード
					var webtis = this.sakuzu.getWebtis();
					$.ajax({
						type: "POST",
						url: webtis.SERVER_URL.CONVERT_TO_JSON_SERVER,
						data: parameter,
						dataType: "jsonp",
						success: $.proxy(function(data,status) {
							var genid = data;
							var parameter = createUploadParameter(this.sakuzu);
							var webtis = this.sakuzu.getWebtis();
							// フォームに設定して、アップロード
							uf.attr("action",webtis.SERVER_URL.SAVE_JSON_SERVER);
							uf.find('input[name="did"]').val(genid);
							uf.find('input[name="content"]').val(parameter.content);
							uf.find('input[name="dataset"]').val(parameter.dataset);
							uf.find('input[name="lonlat"]').val(parameter.lonlat);
							uf.find('input[name="zoomLevel"]').val(parameter.zoomLevel);
							uf.submit();
							var url = webtis.SERVER_URL.SHOW_MAP_SERVER+"?did="+genid;
							mapPanel.find("#sz_map_textarea").val(url);

							var url = webtis.SERVER_URL.SHOW_MAP_SERVER+"?tid=include&did="+genid;
							var tag = '<iframe name="map" id="map" width="951" height="907" scrolling="no" src="'+url+'"></iframe>';
							mapPanel.find("#sz_map_textarea").val(tag);
						},this),
						error : function(e) {
							mapPanel.find("#sz_map_textarea").val("");
							alert("読み込めませんでした。");
						}
					});
			},this)
		);
		// HTMLをファイルに保存
		var saveHTMLButton = mapPanel.find("#sz_map_savehtml");
		saveHTMLButton.click(
				$.proxy(function() {
					// op=ticket_pub ticketを発行
					var parameter = {
						op : "ticket_pub"
					};
					// JSON、データセット、緯度経度、縮尺をサーバにアップロード
					var webtis = this.sakuzu.getWebtis();
					var url = webtis.SERVER_URL.SHOW_MAP_SERVER;
					f.attr("action",webtis.SERVER_URL.SHOW_MAP_SERVER);
					$.ajax({
						type: "POST",
						url: webtis.SERVER_URL.CONVERT_TO_JSON_SERVER,
						data: parameter,
						dataType: "jsonp",
						success: $.proxy(function(data,status) {
							var parameter = createUploadParameter(this.sakuzu);
							var webtis = this.sakuzu.getWebtis();
							// フレームからHTMLをダウンロード
							uploadFrame._saveHTML = true;
							var genid = data;
							var parameter = createUploadParameter(this.sakuzu);
							// フォームに設定して、アップロード
							uf.attr("action",webtis.SERVER_URL.SAVE_JSON_SERVER);
							uf.find('input[name="did"]').val(genid);
							uf.find('input[name="content"]').val(parameter.content);
							uf.find('input[name="dataset"]').val(parameter.dataset);
							uf.find('input[name="lonlat"]').val(parameter.lonlat);
							uf.find('input[name="zoomLevel"]').val(parameter.zoomLevel);
							uf.submit();							
						},this)
					});
			},this)
		);
		return mapPanel;
	}
});


/******** ユーティリティ関数  ***********/
// CSSのRGB表記あるいは、16進表記の#rrggbbの書式を10進表記の"r,g,b"に変換
Sakuzu.cssColorToDeci = function(cssColorStr,digit) {
	if (cssColorStr.indexOf("rgb")!=-1) {
		var rgb = cssColorStr.substring(cssColorStr.indexOf("(")+1,cssColorStr.indexOf(")")).split(",");
		var r = parseInt(rgb[0],10);
		var g = parseInt(rgb[1],10);
		var b = parseInt(rgb[2],10);
		return r+","+g+","+b;
	}
	var r = parseInt(cssColorStr.substring(1,3),16);
	var g = parseInt(cssColorStr.substring(3,5),16);
	var b = parseInt(cssColorStr.substring(5,7),16);
	return r+","+g+","+b;
};
//CSSのRGB表記あるいは、10進表記の"r,g,b"書式を16進表記の#rrggbbに変換
Sakuzu.deciColorToCSSHex = function(cssColorStr) {
	var rgb = cssColorStr.split(",");
	var r = parseInt(rgb[0],10);
	var g = parseInt(rgb[1],10);
	var b = parseInt(rgb[2],10);
	return ("#"+Sakuzu.padDeci(r.toString(16),2,"0")+Sakuzu.padDeci(g.toString(16),2,"0")+Sakuzu.padDeci(b.toString(16),2,"0")).toUpperCase();
};

//10進数を16進数に変換
Sakuzu.makeHex = function(deci) {
	var hex = deci.toString(16);
	if (hex.length < 2) {
		hex = "0"+hex;
	}
	return hex;
};

//10進数 10より小さいときは、スペースを付加
Sakuzu.padDeci = function(deci,padLen,pad) {
	var str = deci+"";
	if (!pad) {
		pad = " ";
	}
	while (str.length < padLen) {
		str = pad + str;
	}
	return str;
};
//基準色か否かを判定
Sakuzu.isBasicColor = function( color )
{
	var	x;
	var	theMax = color.length;
	
	for ( x = 0; x < theMax; x++ )
	{
		if ( ( color[ x ] != 0 ) && ( color[ x ] != 255 ) )
		{
			return false;
		}
	}
	
	return true;
};
//距離、面積計算関連
Sakuzu.calcGeo2 = function(geometries,unit,sourceProjection,baseProjection,OpenLayers) {
	if (geometries.length == 0) {
		return 0;
	}
	var result = 0;
	if (geometries[0].CLASS_NAME == "OpenLayers.Geometry.LineString") {
		for (var i = 0; i < geometries.length; i++) {
			var lineStringGeometry = geometries[i];
	        var length, geomUnits;
            length = lineStringGeometry.getGeodesicLength(sourceProjection);
			result += length;
		}
		// 単位を調整
		result *= unit;
	} else if (geometries[0].CLASS_NAME == "OpenLayers.Geometry.Polygon") {
		for (var i = 0; i < geometries.length; i++) {
			var polygonGeometry = geometries[i];
	        var area, geomUnits;
            area = polygonGeometry.getGeodesicArea(sourceProjection);
			result += area;
		}
		// 単位を調整　面積なので二乗
		result *= unit;
		result *= unit;
	}
	return result;
};

/** <layer><name>に格納されるIDを生成します。**/
Sakuzu.generateLayerId = function(styleType,webtis) {
	var now = new Date();
	var yyyyMMddHHmmssmm = webtis.Format.JSGIJSON.zeroPadDeci(now.getFullYear(),4)+webtis.Format.JSGIJSON.zeroPadDeci(now.getMonth(),2)+webtis.Format.JSGIJSON.zeroPadDeci(now.getDate(),2)+webtis.Format.JSGIJSON.zeroPadDeci(now.getHours(),2)+webtis.Format.JSGIJSON.zeroPadDeci(now.getMinutes(),2)+webtis.Format.JSGIJSON.zeroPadDeci(now.getSeconds(),2)+webtis.Format.JSGIJSON.zeroPadDeci(now.getMilliseconds(),3);
	return styleType.toUpperCase() + yyyyMMddHHmmssmm; 
};

//undo/redoのデータ
Sakuzu.OperationHistory = function(sakuzu) {
	
	var MAXDATA = 99;
	
	var undoData = [];
	var redoData = [];
	
	this.add = function(opcode, data) {
		if (undoData.length == MAXDATA-1) { undoData.shift(); }
		undoData.push({ "opcode" : opcode, "data" : data });
		// redoは、消去
		redoData.length = 0;
	};
	this.removeAllStacks = function() {
		undoData = [];
		redoData = [];
	};
	/** 取り消し **/
	this.undo = function() {
		if (undoData.length > 0) {
			var op = undoData.pop();
			if (redoData.length == MAXDATA-1) { redoData.shift(); }
			if (op.opcode == 'move') {
				// 移動の取り消し
				redoData.push({ "opcode" : op.opcode, "data" : { "feature" : op.data.feature, "center" : op.data.feature.geometry.getBounds().getCenterLonLat() } });
				op.data.feature.move(op.data.center);
			} else if (op.opcode == 'del') {
				// 削除の取り消し
				var features = op.data;
				var redoFeatures = [];
				for (var i=0; i<features.length; i++) {
					var layer = features[i]._layer;
					if (layer.features.length == 0) {
						// 削除されているので追加する。
						sakuzu.addLayer(layer);
					}
					layer.addFeatures(features[i]);
					redoFeatures.push(features[i]);
				}
				redoData.push({ "opcode" : op.opcode, "data" : redoFeatures });
			} else if (op.opcode == 'edit') {
				this.doEdit(op,redoData);
			} else if (op.opcode == 'new') {
				// 新規の取り消し
				var feature = op.data.feature;
				sakuzu.unselectFeature(feature);
				var layer = feature.layer;
				layer.removeFeatures(feature);
				if (layer.features.length == 0) {
					sakuzu.deleteLayer(layer);
				}
				redoData.push({ "opcode" : op.opcode, "data" : {"feature":feature,"layer":layer }});
			}
		}
	};
	/** やり直す **/
	this.redo = function() {
		if (redoData.length > 0) {
			var op = redoData.pop();
			if (undoData.length == MAXDATA-1) { undoData.shift(); }
			if (op.opcode == 'move') {
				undoData.push({ "opcode" : op.opcode, "data" : { "feature" : op.data.feature, "center" : op.data.feature.geometry.getBounds().getCenterLonLat() } });
				op.data.feature.move(op.data.center);
			} else if (op.opcode == 'del') {
				var features = op.data;
				var undoFeatures = [];
				for (var i=0; i<features.length; i++) {
					var layer = features[i].layer;
					features[i]._layer = layer;
					layer.removeFeatures(features[i]);
					if (layer.features.length == 0) {
						sakuzu.deleteLayer(layer);
					}
					undoFeatures.push(features[i]);
				}
				if (op.opcode == 'cut') {
					this.clipboardData = undoFeatures;
				}
				undoData.push({ "opcode" : op.opcode, "data" : undoFeatures });
			} else if (op.opcode == 'edit') {
				this.doEdit(op,undoData);
			} else if (op.opcode == 'new') {
				// 新規のやり直し
				var feature = op.data.feature;
				var layer = op.data.layer;
				if (layer.features.length == 0) {
					sakuzu.addLayer(layer);
				}
				layer.addFeatures(feature);
				undoData.push({ "opcode" : op.opcode, "data" : {"feature":feature }});
			}
		} 
	};
	this.doEdit = function(op,stacks) {
		// 編集の取り消し
		// 属性に変更のあったFeature
		var feature = op.data.feature;
		// スタイルに変更のあったFeature
		var features = op.data.features;
		var affixStyle = op.data.affixStyle;
		var style = op.data.style;
		var attributes = op.data.attributes;
		var keepAttributes = null;
		if (feature && attributes) {
			keepAttributes = feature.attributes;
			feature.attributes = attributes;
			if (affixStyle.type == "TEXT" && attributes) {
				feature.geometry.label = attributes.name;
			}
		}
		
		var keepStyle = features[0].style;
		var keepAffixStyle = features[0].layer.affixStyle;
		var redoFeatures = [];
		for (var i=0; i<features.length; i++) {
			var curFeature = features[i];
			// スタイルを取得
			curFeature.layer.styleMap = style;
			curFeature.layer.affixStyle = affixStyle;
			curFeature.style = style;

			curFeature.layer.redraw();
			redoFeatures.push(curFeature);
		}

		stacks.push({ "opcode" : "edit", "data" : {"feature":feature,"features":redoFeatures,"style":keepStyle,"affixStyle":keepAffixStyle,"attributes":keepAttributes} });
	};

};


/** **/
Sakuzu.calcFontSizeNumber = function(textSize,textDynamic) {
	var inputFontSizeNumber = null;
	if (textDynamic) {
		if ("biggest" == textSize) {
			inputFontSizeNumber = 150;
		} else if ("big" == textSize) {
			inputFontSizeNumber = 100;				
		} else if ("medium" == textSize) {
			inputFontSizeNumber = 75;				
		} else if ("small" == textSize) {
			inputFontSizeNumber = 50;				
		} else if ("smallest" == textSize) {
			inputFontSizeNumber = 30;
		} else {
			inputFontSizeNumber = 75;
		}
	} else {
		if ("biggest" == textSize) {
			inputFontSizeNumber = 40;
		} else if ("big" == textSize) {
			inputFontSizeNumber = 30;				
		} else if ("medium" == textSize) {
			inputFontSizeNumber = 20;				
		} else if ("small" == textSize) {
			inputFontSizeNumber = 12;				
		} else if ("smallest" == textSize) {
			inputFontSizeNumber = 9;				
		} else {
			inputFontSizeNumber = 20;				
		}
	}
	return inputFontSizeNumber;
};


/** **/
Sakuzu.getFontSizeString = function(textSize,textDynamic) {
	var fontSizeStr = null;
	if (textDynamic) {
		if ("150" == textSize) {
			fontSizeStr = "biggest";
		} else if ("100" == textSize) {
			fontSizeStr = "big";				
		} else if ("75" == textSize) {
			fontSizeStr = "medium";				
		} else if ("50" == textSize) {
			fontSizeStr = "small";				
		} else if ("30" == textSize) {
			fontSizeStr = "smallest";
		} else {
			fontSizeStr = "medium";				
		}
	} else {
		if ("40" == textSize) {
			fontSizeStr = "biggest";
		} else if ("30" == textSize) {
			fontSizeStr = "big";				
		} else if ("20" == textSize) {
			fontSizeStr = "medium";				
		} else if ("12" == textSize) {
			fontSizeStr = "small";				
		} else if ("9" == textSize) {
			fontSizeStr = "smallest";				
		} else {
			fontSizeStr = "medium";				
		}
	}
	return fontSizeStr;
};

//-------------- DefaultHandler
//-- 電子国土APIで使用するときのハンドラー
Sakuzu.DefaultHandler = Sakuzu.Class({
	useStateSave : true,
	initialize: function(config) {
		this._mo = config.mapObj;
	},
	getLayers : function() {
		// 作図中のレイヤーは、_affix_から始まるレイヤー
		return this.getWebtis().searchLayerInArray("_affix_.*",this.getWebtis().layers,true);
	},
	addLayer : function(sakuzuLayer) {
		this.getWebtis().layers.push(sakuzuLayer);
		this.getMapObject().addLayer(sakuzuLayer);
	},
	removeLayer : function(sakuzuLayer) {
		var j = 0;
		for (j = 0; j < this.getWebtis().layers.length; j++) {
			if (this.getWebtis().layers[j] == sakuzuLayer) {
				break;
			}
		}
		// 新しい描画用レイヤを反映
		this.getWebtis().layers.splice(j,1);
		this.getMapObject().removeLayer(sakuzuLayer);
	},
	discardMouseMode : function() {
		this._getObj().setMouseMode("pan");
	},	
	_getObj : function() {
		if (this._mo.maplt) {
			return this._mo.maplt;
		}
		return this._mo;
	},
	enablePopupLayer : function(layer) {
		if (layer) {
			this._getObj().enablePopup(layer.name);
		} else {
			var tLayers = this.getLayers();
			for (var i = 0; i < tLayers.length; i++) {
				this._getObj().enablePopup(tLayers[i].name);
			}
		}
	},
	disablePopupLayer : function() {
		this._getObj().disablePopup();
	},
	getMapObject : function() {
		return this.getWebtis().map;
	},
	getWebtis: function() {
		if (this._mo.webtis) {
			return this._mo.webtis;
		}
		return this._mo.maplt.webtis;
	},
	getOpenLayers: function() {
		if (this._mo.OpenLayers) {
			return this._mo.OpenLayers;
		}
		return this._mo.maplt.OpenLayers;
	}
});
//-- OpenLayersで使用するときのハンドラー
Sakuzu.OpenLayersDefaultHandler = Sakuzu.Class({
	useStateSave : false,
	initialize: function(config) {
		this.layers = [];
		this.config = config;
		this.mapObj = config.mapObj;
		if (config.webtis) {
			this.webtis = config.webtis;
		}
		if (config.OpenLayers) {
			this.OpenLayers = config.OpenLayers;
		}
	},
	enablePopupLayer : function(layer) {
		// 前のコントロールを無効にする
		if (this.selectPopupCtrl) {
			this.getMapObject().removeControl(this.selectPopupCtrl);
			this.selectPopupCtrl.deactivate();
			this.selectPopupCtrl.destroy();
			delete this.selectPopupCtrl;
			this.selectPopupCtrl = null;
		}
		
		if (this.layers.length > 0) {
			var webtis = this.getWebtis();
			this.selectPopupCtrl = new webtis.Control.SelectFeature(this.layers, { hover : true });
			this.getMapObject().addControl(this.selectPopupCtrl);
			this.selectPopupCtrl.activate();
			// layerに未登録の時だけ登録する。
			if (!this.popup) {
				this.popup = new webtis.Popup.JSGIPopup(this.getMapObject(),$.proxy(function(_feature) {
					this.selectPopupCtrl.unselect(_feature);
				},this));
				var OpenLayers = this.getOpenLayers();
				this._popup_selected = OpenLayers.Function.bindAsEventListener(this.popup.onFeatureSelectPopup,this.popup);
				this._popup_unselected = OpenLayers.Function.bindAsEventListener(this.popup.onFeatureUnselectPopup,this.popup);
			}
			if (layer) {				
				if (!(layer.events.listeners['featureselected'] && layer.events.listeners['featureselected'].length > 0)) {
					layer.events.on({
						'featureselected': this._popup_selected,
						'featureunselected': this._popup_unselected
					});
				}
			}  else {
				var drawLayers = this.layers;
				for (var i=0; i < drawLayers.length; i++) {
					if (!(drawLayers[i].events.listeners['featureselected'] && drawLayers[i].events.listeners['featureselected'].length > 0)) {
						drawLayers[i].events.on({
							'featureselected': this._popup_selected,
							'featureunselected': this._popup_unselected
						});
					}
				}
			}
		}
	},
	disablePopupLayer : function() {
		if (this.popup) {
			this.popup.removePopup();
		}
		// 前のコントロールを無効にする
		if (this.selectPopupCtrl) {
			this.getMapObject().removeControl(this.selectPopupCtrl);
			this.selectPopupCtrl.deactivate();
			this.selectPopupCtrl.destroy();
			delete this.selectPopupCtrl;
			this.selectPopupCtrl = null;
		}
		var drawLayers = this.layers;
		for (var i=0; i < drawLayers.length; i++) {
			// イベントを未登録にする
			drawLayers[i].events.un({
				'featureselected': this._popup_selected,
				'featureunselected': this._popup_unselected
			});
			// フィチャーのポップアップをクリーンアップする
			for (var j=0; j< drawLayers[i].features.length; j++) {
				if (drawLayers[i].features[j].popup) {
					this.getMapObject().removePopup(drawLayers[i].features[j].popup);
					drawLayers[i].features[j].popup = null;
				}
			}
		}
	},
	getLayers : function() {
		return this.layers;
	},
	addLayer : function(sakuzuLayer) {
		this.layers.push(sakuzuLayer);
		this.getMapObject().addLayer(sakuzuLayer);
	},
	removeLayer : function(sakuzuLayer) {
		var j = 0;
		for (j = 0; j < this.layers.length; j++) {
			if (this.layers[j] == sakuzuLayer) {
				break;
			}
		}
		// 新しい描画用レイヤを反映
		this.layers.splice(j,1);
		this.getMapObject().removeLayer(sakuzuLayer);
	},
	discardMouseMode : function() {
		
	},
	getMapObject : function() {
		return this.mapObj;
	},
	getWebtis: function() {
		if (this.webtis) {
			return this.webtis;
		}
		return webtis;
	},
	getOpenLayers: function() {
		if (this.OpenLayers) {
			return this.OpenLayers;
		}
		return OpenLayers;
	}
});
