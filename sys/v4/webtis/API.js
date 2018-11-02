/*
 * =============================================================================
 * webtis v4
 * 
 * webtis APIの実装
 * =============================================================================
 */

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

// =============================================================================
// OpenLayersのインターフェース
// =============================================================================

// OpenLayers地図オブジェクト
webtis.map = null;

// 追加されているレイヤー
webtis.layers = [];
// XMLからロードされているレイヤ（webtis.Layer.JSGILayerオブジェクト）
webtis.xmlLoadLayer = null;
//webtis.xmlLoadLayers = [];
//揮発レイヤ
webtis.volatileLayers = {};

// デフォルトピクセルレイヤ
webtis.volatileLayerDefaultStyle = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
webtis.volatileLayerDefaultStyle["strokeColor"] = 'black';
webtis.volatileLayerDefaultStyle["strokeWidth"] = 1;
webtis.volatileLayerDefaultStyle["fill"] = false;
webtis.volatileLayers["_defvola_screen"] = null;
webtis.volatileLayers["_defvola_deg"] = null;
webtis.currentDrawUnit = "screen";
webtis.currentVolatileLayer = null;
webtis.currentVolatileGroupName = null;
webtis.geoTiffLayer = null;
//ポップアップ有効・無効
webtis.enablePopup = false;

// 初期バウンド
webtis.mapRect = new OpenLayers.Bounds(121.0, 24.0, 150.0, 46.5);

// 地図操作フラグ
webtis.MAP_MOUSEMODE_UNKNOWN = 0;
webtis.MAP_MOUSEMODE_ZOOM = 1;
webtis.MAP_MOUSEMODE_PAN = 2;
webtis.MAP_MOUSEMODE_SELECTION = 3;
webtis.MAP_MOUSEMODE_DRAG = 4;
webtis.MAP_MOUSEMODE_PAN2 = 5;
webtis.MAP_MOUSEMODE_MEASURE = 6;
webtis.MAP_MOUSEMODE_FIXED = 7;
webtis.MAP_MOUSEMODE_SEMIFIXED = 8;
webtis.MAP_MOUSEMODE_SAKUZU = 100;

webtis.mapMouseMode = webtis.MAP_MOUSEMODE_ZOOM;
webtis.currentMouseMode = "zoom";
webtis.lastMouseMode = "zoom";

// 地図コントロール
// スケールバー
webtis.scaleLineCtrl = null;
// 電子国土リンク
webtis.kokudoLinks = null;
// +/-縮尺ボタン
webtis.zoomButtons = null;
// 地図のナビのコントロール（OpenLayers.Control.Navigation）
webtis.mapNaviCtrl = null;
// 地図のpanとzoomのコントロール（OpenLayers.Control.PanZoom）
webtis.mapPanCtrl = null;
// 地図のズームボックスのコントロール（OpenLayers.Control.ZoomBox）
webtis.mapZoomBoxCtrl = null;
// レイヤー選択コントロール
webtis.selectCtrl = null;
// レイヤー選択コントロール(ポップアップ用)
webtis.popupLayers = [];
webtis.popup = null;
webtis.selectPopupCtrl = null;
// ドラッグコントロール（編集用）
webtis.dragCtrls = null;
// 距離計算表示コントロール
webtis.measureDisplayCtrl = null;
webtis.pathMeasureCtrl = null;
webtis.areaMeasureCtrl = null;
// 現在の使用されている地図コントロール
webtis.activeCtrl = null;

// イベントマッピングのコンスタント
webtis.EV_LEFTDOWN = 0;
webtis.EV_LEFTUP = 1;
webtis.EV_RIGHTDOWN = 2;
webtis.EV_RIGHTUP = 3;
webtis.EV_DBCLICK = 4;
webtis.EV_MOVE = 5;
webtis.EV_MAPLOAD = 6;
webtis.EV_REPAINT = 7;
webtis.EV_SELECTION = 8;
webtis.EV_MSELECTION = 9;

LT_P = {};

// 地図イベントのコールバック
webtis.eventProcList = [ null, null, null, null, null, null, null, null, null, null ];

webtis._prepareMouseEventParameters = function(evt) {
	var xy = evt.xy ? evt.xy : { "x" : evt.clientX, "y" : evt.clientY };
	var theX = xy.x;
	var theY = xy.y;
	if (webtis.map.baseLayer && webtis.map.baseLayer.getLonLatFromViewPortPx) {
		var latlon = _transformToWGS84(webtis.map.baseLayer.getLonLatFromViewPortPx(xy));
		theX = latlon.lon;
		theY = latlon.lat;
	}
	
	var theCS = 0;
	if (evt.ctrlKey) {
		theCS = 1;
	} else if (evt.shiftKey) {
		theCS = 2;
	}
	return theX+","+theY+","+theCS;
};

webtis.clickCtrl = null;

// 画像プリロード
webtis.gDLWCtrlBaseDir = 'http://cyberjapan.jp/images/dlwctrl/';
webtis.gDLWCtrlImages = [
	[ 'ctrl000.gif', 'ctrl001.gif', 'ctrl002.gif', 'ctrl003.gif', 'ctrl004.gif', 'ctrl005.gif', 'ctrl006.gif', 'ctrl007.gif', 'ctrl008.gif', 'ctrl009.gif', 'ctrl010.gif' ],
	[ 'ctrl020.gif', 'ctrl021.gif', 'ctrl022.gif' ]
];
webtis._setupDLWCtrlImages = function() {
	for (var y = 0; y<webtis.gDLWCtrlImages.length; y++) {
		for (var x = 0; x<webtis.gDLWCtrlImages[y].length; x++) {
			var image = new Image();
			image.src = webtis.gDLWCtrlBaseDir + webtis.gDLWCtrlImages[y][x];
			webtis.gDLWCtrlImages[y][x] = image;
		}
	}
};
webtis._setupDLWCtrlImages();
// その他画像
webtis.gPartsImagesDir = 'http://cyberjapan.jp/images';
webtis.gAimImage = webtis.gPartsImagesDir + '/aim.gif';
webtis.gIcon01Image = webtis.gPartsImagesDir + '/icon01.gif';
webtis.gIcon02Image = webtis.gPartsImagesDir + '/icon02.gif';
webtis.gIcon03Image = webtis.gPartsImagesDir + '/icon03.gif';
webtis.gIconZoomInImage = webtis.gPartsImagesDir + '/plus.gif';
webtis.gIconZoomOutImage = webtis.gPartsImagesDir + '/minus.gif';
webtis.gDefaultImage = webtis.gPartsImagesDir + '/spacer.gif';

webtis.callEventProc = function(procIndex, paramList, asString) {
	var	theProc = webtis.eventProcList[procIndex];
	var	theParamStr;
	var	theCmd;
	
	if ((theProc == undefined) || (theProc == null) || (theProc == '')) {
		return;
	}
	
	if ((paramList == undefined ) || (paramList == null)) {
		theParamStr = '';
	} else if (asString) {
		theParamStr = paramList;
	} else {
		theParamStr = "paramList";
	}
	
	theCmd = theProc + '(' + theParamStr + ');';
	eval(theCmd);
};


webtis.onMoveEnd = function() {
	var bounds = webtis.map.getExtent();
	webtis.callEventProc(webtis.EV_REPAINT, bounds.left+","+bounds.bottom+","+bounds.right+","+ bounds.top,true);
};

// 手動スクロールのボタンのタイマー(startScroll/stopScrollを参照してください)
webtis.manualScrollInterval = null;

//手動スクロールのボタンのタイマー(startZooming/stopZoomingを参照してください)
webtis.manualZoomInterval = null;

// 手動スクロール(v2のwebtis_limited.js「LT_P.MoveImage」関数のロジック)
webtis.onManualScroll = function(direction) {
	var theMoveX = 0;
	var theMoveY = 0;
	var	theDist = 12;
	var	theTiltDist;
	theTiltDist = Math.round(theDist*Math.SQRT1_2);
	
	switch(direction) {
		case 1: // left
			theMoveX = -theDist;
			break;
		case 2: // up
			theMoveY = -theDist;
			break;
		case 3: // right
			theMoveX = theDist;
			break;
		case 4: // down
			theMoveY = theDist;
			break;
		case 5: // left up
			theMoveX = -theTiltDist;
			theMoveY = -theTiltDist;
			break;
		case 6: // right up
			theMoveX = theTiltDist;
			theMoveY = -theTiltDist;
			break;
		case 7: // right down
			theMoveX = theTiltDist;
			theMoveY = theTiltDist;
			break;
		case 8: // left down
			theMoveX = -theTiltDist;
			theMoveY = theTiltDist;
			break;
	}
	webtis.map.pan(theMoveX, theMoveY);
};

webtis.onManualZoom = function(updown) {
	if (updown == 1) { // zoom in
		webtis.map.zoomIn();
	} else if (updown == 2) { // zoom out
		webtis.map.zoomOut();
	}
};

webtis.resetPopup = function(prevPopupLayers) {
	// 前のコントロールを無効にする
	if (webtis.selectPopupCtrl) {
		webtis.map.removeControl(webtis.selectPopupCtrl);
		webtis.selectPopupCtrl.deactivate();
		webtis.selectPopupCtrl.destroy();
		delete webtis.selectPopupCtrl;
		webtis.selectPopupCtrl = null;
	}
	if (!webtis.popup) {
		webtis.popup = new webtis.Popup.JSGIPopup(webtis.map,webtis.onPopupClose);
		webtis.popup_selected = OpenLayers.Function.bindAsEventListener(webtis.popup.onFeatureSelectPopup,webtis.popup);
		webtis.popup_unselected = OpenLayers.Function.bindAsEventListener(webtis.popup.onFeatureUnselectPopup,webtis.popup);
	}
	webtis.popup.removePopup();
	if (prevPopupLayers) {
		for (var i=0; i< prevPopupLayers.length; i++) {
			// イベントを未登録にする
			prevPopupLayers[i].events.un({
				'featureselected': webtis.popup_selected,
				'featureunselected': webtis.popup_unselected
			});
			// フィチャーのポップアップをクリーンアップする
			for (var j=0; j<prevPopupLayers[i].features.length; j++) {
				if (prevPopupLayers[i].features[j].popup) {
					webtis.map.removePopup(prevPopupLayers[i].features[j].popup);
					prevPopupLayers[i].features[j].popup.destroy();
					prevPopupLayers[i].features[j].popup = null;
				}
			}
		}
	}
	
	if (webtis.popupLayers && webtis.popupLayers.length > 0) {		
		webtis.selectPopupCtrl = new OpenLayers.Control.SelectFeature(webtis.popupLayers, { hover : true });
		//webtis.selectPopupCtrl.hover = true;
		webtis.map.addControl(webtis.selectPopupCtrl);
		webtis.selectPopupCtrl.activate();
		
		for (var i=0; i<webtis.popupLayers.length; i++) {
			webtis.popupLayers[i].events.on({
				'featureselected': webtis.popup_selected,
				'featureunselected': webtis.popup_unselected
			});
		}
	}
};

webtis.onPopupClose = function(feature) {
	webtis.selectPopupCtrl.unselect(feature);
};

webtis.fitMapTimerId = 0;
webtis.onMapResize = function() {
	webtis.fitMapTimerId = 0;
	if (OpenLayers.String.contains(navigator.appName, "Microsoft")) {
		var doc = parent.document;
		var width = Math.max(doc.documentElement.clientWidth, parseInt(doc.body.clientWidth));
		var height = Math.max(doc.documentElement.clientHeight, parseInt(doc.body.clientHeight));
		var pardiv = doc.getElementById('maplt_div');
		pardiv.style.width = width + 'px';
		pardiv.style.height = height + 'px';
		webtis.map.div.style.width = width + "px";
		webtis.map.div.style.height = height + "px";
		//doc.body.style.clip = 'rect(0px ' + width + 'px ' + height + 'px 0px)';
		webtis.map.updateSize();
	}
	webtis.kokudoLinks.adjustPositionOnMapResize();
	webtis.zoomButtons.adjustPositionOnMapResize();
};

webtis.searchLayerInArray = function(layerName, layerArray, include, searchStyleName, excludeNonVector) {
	var ret = [];
	var searchLayerName = layerName;
	if (searchLayerName.substr(0, 4) == "xml.") {
		searchLayerName = searchLayerName.substr(4);
	}
	var prefixSearch = false;
	if (searchLayerName.charAt(searchLayerName.length - 1) == '*') {
		// ワイルドカード検索
		searchLayerName = searchLayerName.substr(0, searchLayerName.length - 1);
		prefixSearch = true;
	}
	for (var i=0; i<layerArray.length; i++) {
		var foundLayer = null;
		var curLayerName = layerArray[i].name;
		if (curLayerName.substr(0, 4) == "xml.") {
			curLayerName = curLayerName.substr(4);
		}
		
		var altName = layerArray[i].styleName ? 
				curLayerName+"."+layerArray[i].styleName : 
				null;
		if (prefixSearch) {
			if (curLayerName.substr(0, searchLayerName.length) == searchLayerName ||
					(altName && altName.substr(0, searchLayerName.length) == searchLayerName) ||
					(searchStyleName && layerArray[i].styleName.substr(0, searchLayerName.length) == searchLayerName)) {
				foundLayer = layerArray[i];
			}
		} else {
			if (curLayerName == searchLayerName || altName == searchLayerName ||
					(searchStyleName && layerArray[i].styleName == searchLayerName)) {
				foundLayer = layerArray[i];
			}
		}
		if (!excludeNonVector || (foundLayer && foundLayer.CLASS_NAME.indexOf("Vector") > -1)) {
			if (foundLayer && include) {
				ret.push(foundLayer);
			} else if (!foundLayer && !include) {
				ret.push(layerArray[i]);
			}
		}
	}
	return ret;
};

// IDの下位互換性
webtis.gObjIDGen = 0;
webtis.SelectionObject = function() {
	webtis.gObjIDGen++;
	
	this.objid = '' + webtis.gObjIDGen;
	this.list = new Array();
	
	this.resetFeatures = function() {
		this.list = new Array();
	};
	
	this.addFeatures = function(features) {
		if (features && features.length > 0) {
			for (var i=0; i<features.length; i++) {
				var id = features[i].id;
				this.list.push({ 
					objid : features[i].objid,
					feature : features[i]
				});
			}
		}
	};
};

webtis.clearAllLayers = function(includingBaseLayer) {
	var delLayers = [];
	for (var i=0; i<webtis.map.layers.length; i++) {
		var layer = webtis.map.layers[i];
		if (!layer.isBaseLayer || includingBaseLayer) {
			delLayers.push(layer);
		}
	}
	
	for (var i=0; i<delLayers.length; i++) {
		if (delLayers[i].removeAllFeatures) {
			delLayers[i].removeAllFeatures();
		}
		webtis.map.removeLayer(delLayers[i]);
//		delLayers[i].destroy();
	}
	
	if (webtis.xmlLoadLayer) {
		webtis.xmlLoadLayer.destroy();
		delete webtis.xmlLoadLayer;
	}
	/**
	if (webtis.xmlLoadLayers) {
		delete webtis.xmlLoadLayers;
	}
	**/
	if (webtis.geoTiffLayer) {
		webtis.map.removeLayer(webtis.geoTiffLayer);
		webtis.geoTiffLayer = null;
	}
	
	delete webtis.volatileLayers["_defvola_screen"];
	delete webtis.volatileLayers["_defvola_deg"];
	webtis.volatileLayers["_defvola_screen"] = null;
	webtis.volatileLayers["_defvola_deg"] = null;
	webtis.currentVolatileLayer = null;
	webtis.currentVolatileGroupName = null;
	
	webtis.layers = [];
	// webtis.xmlLoadLayers = [];
};

webtis.createDiv = function(_document, id, parent) {
	var div = _document.createElement('div');
	if (!id) {
		id = OpenLayers.Util.createUniqueID("webtisDiv");
	}
	div.id = id;
	if (parent)
		parent.appendChild(div);
	
	return div;
};

webtis.TreeNode = function(_document, parent, name, layer, level) {

	this.div = null;
	this.parent = parent;
	this.level = level;
	this.name = name;
	this.layer = layer;
	this.children = [];
	this.idx = 0;
	
	this.expanded = false;
	this.ctrlIdx = -1;
	
	this.invisible = 0; // 0 = visible, 1 = partial, 2 = invisible
	this.img = null;
	
	this.findChildWithName = function(name) {
		for (var i=0; i<this.children.length; i++) {
			if (this.children[i].name == name)
				return this.children[i];
		}
		return null;
	};
	
	this.createCell = function(tr) {
		var	cell = _document.createElement('td');
		cell.style.whiteSpace = 'nowrap';
		cell.style.textAlign = 'left';
		cell.style.verticalAlign = 'middle';
		cell.style.margin = "0px";
		cell.style.padding = "0px";
		tr.appendChild(cell);
		return cell;
	};
	
	this.createCtrlImage = function(parent, src, handler) {
		var	image = _document.createElement('img');
		image.src = src;
		image.style.margin = "0px";
		image.style.padding = "0px";
		image.style.width = '18px';
		image.style.height = '18px';
		image.style.overflow = 'visible';
		if (OpenLayers.Util.getBrowserName() == "msie") {
			image.style.styleFloat = 'left';
		} else {
			image.style.cssFloat = 'left';
		}
		image.border = 0;
		image.hspace = 0;
		image.vspace = 0;
		
		image.obj = this;
		if (handler) {
			image.onclick = handler;
		}
		
		parent.appendChild(image);
		return image;
	};
	
	this.createLabel = function(parent, text) {
		var	span = _document.createElement('span');
		span.style.fontSize = '12px';
		span.style.overflow = 'visible';
		span.style.lineHeight = '18px';
		if (OpenLayers.Util.getBrowserName() == "msie") {
			span.style.styleFloat = 'left';
		} else {
			span.style.cssFloat = 'left';
		}
		span.style.verticalAlign = 'top';
		span.style.margin = "0px";
		span.style.padding = "0px";
		span.innerHTML = this.name;
		span.obj = this;
		span.onclick = function() {
			alert(this.obj.name);
		};
		parent.appendChild(span);
		return span;
	};
	
	this.evExpand = function() {
		if (this.obj.expanded) {
			this.src = webtis.gDLWCtrlImages[0][this.obj.ctrlIdx].src;
			for (var i=0; i<this.obj.children.length; i++) {
				var child = this.obj.children[i];
				child.div.style.display = 'none';
			}
			this.obj.expanded = false;
		} else {
			this.src = webtis.gDLWCtrlImages[0][this.obj.ctrlIdx + 4].src;
			for (var i=0; i<this.obj.children.length; i++) {
				var child = this.obj.children[i];
				child.div.style.display = 'block';
			}
			this.obj.expanded = true;
		}
	};
	
	this.updateVisibilityIcon = function(fv) {
		this.invisible = fv;
		if (fv == 0) {
			this.img.src = webtis.gDLWCtrlImages[1][1].src;
		} else if (fv == 1) {
			this.img.src = webtis.gDLWCtrlImages[1][2].src;
		} else if (fv == 2) {
			this.img.src = webtis.gDLWCtrlImages[1][0].src;
		}
	};
	
	this.updateVisibility = function() {
		var fv = -1;
		if (this.children && this.children.length) {
			for (var i=0; i<this.children.length; i++) {
				if (this.children[i].invisible == 1) {
					fv = 1;
					break;
				}
				if (i == 0) {
					fv = this.children[i].invisible;
				} else {
					if (fv != this.children[i].invisible) {
						fv = 1;
						break;
					}
				}
			}
		}
		this.updateVisibilityIcon(fv);
		if (this.parent) {
			this.parent.updateVisibility();
		}
	};
	
	this.setVisibility = function(visibility) {
		if (this.layer) {
			this.layer.setVisibility(visibility);
			if (this.layer.affixStyle) {
				this.layer.affixStyle.display = visibility?"ON":"OFF";
			}
		}
		if (this.children.length > 0) {
			for (var i=0; i<this.children.length; i++) {
				this.children[i].setVisibility(visibility);
				if (this.children[i].affixStyle) {
					this.children[i].affixStyle.display = visibility?"ON":"OFF";
				}
			}
		}
		if (visibility) {
			this.img.src = webtis.gDLWCtrlImages[1][1].src;
			this.invisible = 0;
		} else {
			this.img.src = webtis.gDLWCtrlImages[1][0].src;
			this.invisible = 2;
		}
	};
	
	this.toggleVisibility = function() {
		this.setVisibility(this.invisible > 0);
		if (this.parent) {
			this.parent.updateVisibility();
		}
	};
	
	this.evToggleVisibility = function() {
		this.obj.toggleVisibility();
	};
	
	this.createDisplayDiv = function(parentDiv) {
		
		this.div = parentDiv;
		
		var table = _document.createElement('table');
		table.cellSpacing = 0;
		table.cellPadding = 0;
		table.border = 0;
		table.style.margin = "0px";
		table.style.padding = "0px";
		
		var tbody = _document.createElement('tbody');
		tbody.style.margin = "0px";
		tbody.style.padding = "0px";
		
		var tr = _document.createElement('tr');
		tr.style.margin = "0px";
		tr.style.padding = "0px";
		
		var td = this.createCell(tr);
		// コラム1
		if (this.level > 0) {
			this.createCtrlImage(td, webtis.gDefaultImage);
		} else {
			// ルート
			if (this.children.length == 0) {
				// 子が無い
				this.createCtrlImage(td, webtis.gDLWCtrlImages[0][9].src);
			} else {
				this.ctrlIdx = 3;
				this.createCtrlImage(td, webtis.gDLWCtrlImages[0][this.ctrlIdx].src, this.evExpand);
			}
		}
		
		td = this.createCell(tr);
		// コラム2
		if (this.level == 0) {
			this.img = this.createCtrlImage(td, webtis.gDLWCtrlImages[1][1].src, this.evToggleVisibility);
		} else if (this.level == 1) {
			if (this.children.length > 0) {
				if (this.idx < this.parent.children.length - 1) {
					this.ctrlIdx = 1;
					this.createCtrlImage(td, webtis.gDLWCtrlImages[0][this.ctrlIdx].src, this.evExpand);
				} else {
					// 最後のノード
					this.ctrlIdx = 3;
					this.createCtrlImage(td, webtis.gDLWCtrlImages[0][this.ctrlIdx].src, this.evExpand);
				}
			} else {
				if (this.idx < this.parent.children.length - 1) {
					this.createCtrlImage(td, webtis.gDLWCtrlImages[0][10].src);
				} else {
					// 最後のノード
					this.createCtrlImage(td, webtis.gDLWCtrlImages[0][9].src);
				}
			}
		} else if (this.level == 2) {
			if (this.parent.idx < this.parent.parent.children.length - 1)
				this.createCtrlImage(td, webtis.gDLWCtrlImages[0][0].src);
			else
				this.createCtrlImage(td, webtis.gDefaultImage);
		}
		
		td = this.createCell(tr);
		// コラム3
		if (this.level == 0) {
			this.createLabel(td, this.name);
		} else if (this.level == 1) {
			this.img = this.createCtrlImage(td, webtis.gDLWCtrlImages[1][1].src, this.evToggleVisibility);
		} else if (this.level == 2) {
			if (this.idx < this.parent.children.length - 1) {
				this.createCtrlImage(td, webtis.gDLWCtrlImages[0][10].src);
			} else {
				this.createCtrlImage(td, webtis.gDLWCtrlImages[0][9].src);
			}
		}
		
		// コラム4
		if (this.level > 0) {
			td = this.createCell(tr);
			if (this.level == 1) {
				this.createLabel(td, this.name);
			} else if (this.level == 2) {
				this.img = this.createCtrlImage(td, webtis.gDLWCtrlImages[1][1].src, this.evToggleVisibility);
			}
		}
		
		// コラム5
		if (this.level == 2) {
			td = this.createCell(tr);
			this.createLabel(td, this.name);
		}
		
		tbody.appendChild(tr);
		table.appendChild(tbody);
		parentDiv.appendChild(table);
		
		// 再帰的に子のdivを作成する
		for (var i=0; i<this.children.length; i++) {
			var div = webtis.createDiv(_document, null, this.box);
			div.style.margin = "0px";
			div.style.padding = "0px";
			div.style.lineHeight = "0px";
			div.style.overflow = "visible";
			div.style.whiteSpace = "nowrap";
			div.style.cursor = "pointer";
			div.style.display = "none";
			this.children[i].createDisplayDiv(div);
			parentDiv.appendChild(div);
		}
		
	};
};

webtis.refreshLayerDataTreeNodeState = function(node) {
	if (node.children && node.children.length > 0) {
		for (var i = 0; i < node.children.length; i++) {
			webtis.refreshLayerDataTreeNodeState(node.children[i]);
		}
	} else {
		if (node.layer && node.layer.getVisibility()) {
			node.updateVisibilityIcon(0);
		} else {
			node.updateVisibilityIcon(2);
		}
		if (node.parent) {
			node.parent.updateVisibility();
		}
	}
};

webtis.buildLayerDataTree = function(_document) {
	var ret = [];
	// XMLレイヤ
	if (webtis.layers) {
		var xmlRoot = new webtis.TreeNode(_document, null, "XML", null, 0);
		var xmlLayers = webtis.layers;
		for (var i=0; i<xmlLayers.length; i++) {
			var node = xmlRoot.findChildWithName(xmlLayers[i].name);
			if (!node) {
				node = new webtis.TreeNode(_document, xmlRoot, xmlLayers[i].name, null, 1);
				xmlRoot.children.push(node);
				node.idx = xmlRoot.children.length - 1;
			}
			var subnode = new webtis.TreeNode(_document, node, xmlLayers[i].styleName, xmlLayers[i], 2);
			node.children.push(subnode);
			subnode.idx = node.children.length - 1;
		}
		ret.push(xmlRoot);
	}
	return ret;
};

webtis.DisplayLayerWindow = function() {
	
	this.win = null;
	this.body = null;
	this.box = null;
	this.width = 250;
	this.height = 400;
	this.tree = null;
	
	this.opened = false;
	
	this.open = function() {
		if (this.opened) return;
		if (OpenLayers.String.contains(navigator.appName, "Microsoft")) {
			this.win = window.open(
					'about:blank', 'layer',
					'width=' + this.width + ',height=' + this.height + 
					',toolbar=no,location=no,scrollbars=no,resizable=no,menubar=no' +
					',directories=no,status=no' +
					',alwaysRaised=yes,dependent=yes,titlebar=yes,favorites=no', 
					false
				);
		} else {
			var t = "";
			var is_chrome = /chrome/.test(navigator.userAgent.toLowerCase());
			if (is_chrome) {
				t = "about:blank";
			}
			this.win = window.open(
					t, 'layer',
					'width=' + this.width + ',height=' + this.height + 
					',toolbar=no,location=no,scrollbars=no,resizable=no,menubar=no' +
					',directories=no,status=no' +
					',alwaysRaised=yes,dependent=yes,titlebar=yes,favorites=no', 
					false
				);
			this.win.focus();
		}
		this.win.document.title = '表示設定';
		this.body = this.win.document.body;
		this.body.style.backgroundColor = '#eeeeee';
		
		var w = this.width - 16;
		var h = this.height - 40;
		
		var back = webtis.createDiv(this.win.document, null, this.body);
		back.style.backgroundColor = '#ffffff';
		back.style.margin = "0px";
		back.style.padding = "0px";
		back.style.top = "2px";
		back.style.left = "2px";
		back.style.width = w + "px";
		back.style.height = h + "px";
		back.style.border = "1px solid black";
		back.style.overflow = 'hidden';
		back.style.position = 'absolute';
		
		this.box = webtis.createDiv(this.win.document, null, back);
		this.box.style.margin = "0px";
		this.box.style.padding = "0px";
		this.box.style.top = "2px";
		this.box.style.left = "2px";
		this.box.style.width = (w-4) + "px";
		this.box.style.height = (h-4) + "px";
		this.box.style.overflow = 'auto';
		
		this.initContent();
		
		var form = this.win.document.createElement('form');
		form.style.position = 'absolute';
		form.style.left = '2px';
		form.style.top = (this.height - 34) + 'px';
		this.body.appendChild(form);
		
		var div = this.win.document.createElement('div');
		div.style.width = (this.width - 6) + 'px';
		div.style.textAlign = 'right';
		form.appendChild(div);
		
		var button1 = this.win.document.createElement('input');
		button1.obj = this;
		button1.type = 'button';
		button1.value = "再作成";
		button1.onclick = function() {
			while (this.obj.box.hasChildNodes()) {
				this.obj.box.removeChild(this.obj.box.lastChild);
			}
			this.obj.initContent();
		};
		div.appendChild(button1);
		
		var button2 = this.win.document.createElement('input');
		button2.obj = this;
		button2.type = 'button';
		button2.value = "閉じる";
		button2.onclick = function() {
			this.obj.win.close();
		};
		div.appendChild(button2);
		this.opened = true;
	};
	
	this.initContent = function() {
		
		var cont = webtis.createDiv(this.win.document, null, this.box);
		cont.style.margin = "0px";
		cont.style.padding = "0px";
		cont.style.lineHeight = "0px";
		cont.style.overflow = "visible";
		cont.style.whiteSpace = "nowrap";
		cont.style.cursor = "pointer";
		
		var dataTree = webtis.buildLayerDataTree(this.win.document);
		for (var i=0; i<dataTree.length; i++) {
			dataTree[i].createDisplayDiv(cont);
			webtis.refreshLayerDataTreeNodeState(dataTree[i]);
		}
	};
	
};

//クリップボードのデータ
webtis.clipboardData = null;
webtis.clipboardDataText = '';
// undo/redoのデータ
webtis.OperationHistory = function() {
	
	var MAXDATA = 99;
	
	var undoData = [];
	var redoData = [];
	
	this.add = function(opcode, data) {
		if (undoData.length == MAXDATA-1) { undoData.shift(); }
		undoData.push({ "opcode" : opcode, "data" : data });
	};
	
	this.undo = function() {
		if (undoData.length > 0) {
			var op = undoData.pop();
			if (redoData.length == MAXDATA-1) {
				redoData.shift();
			}
			if (op.opcode == 'move') {
				redoData.push({ "opcode" : op.opcode, "data" : { "feature" : op.data.feature, "center" : op.data.feature.geometry.getBounds().getCenterLonLat() } });
				op.data.feature.move(op.data.center);
			} else if (op.opcode == 'paste') {
				var features = op.data;
				var redoFeatures = [];
				for (var i=0; i<features.length; i++) {
					var layer = features[i].layer;
					features[i]._layer = layer;
					layer.removeFeatures(features[i]);
					redoFeatures.push(features[i]);
				}
				redoData.push({ "opcode" : op.opcode, "data" : redoFeatures });
			} else if (op.opcode == 'cut' || op.opcode == 'del') {
				var features = op.data;
				var redoFeatures = [];
				for (var i=0; i<features.length; i++) {
					var layer = features[i]._layer;
					layer.addFeatures(features[i]);
					redoFeatures.push(features[i]);
				}
				redoData.push({ "opcode" : op.opcode, "data" : redoFeatures });
			}
		}
	};
	
	this.redo = function() {
		if (redoData.length > 0) {
			var op = redoData.pop();
			if (undoData.length == MAXDATA-1) {
				undoData.shift();
			}
			if (op.opcode == 'move') {
				undoData.push({ "opcode" : op.opcode, "data" : { "feature" : op.data.feature, "center" : op.data.feature.geometry.getBounds().getCenterLonLat() } });
				op.data.feature.move(op.data.center);
			} else if (op.opcode == 'paste') {
				var features = op.data;
				var undoFeatures = [];
				for (var i=0; i<features.length; i++) {
					var layer = features[i]._layer;
					layer.addFeatures(features[i]);
					undoFeatures.push(features[i]);
				}
				undoData.push({ "opcode" : op.opcode, "data" : undoFeatures });
			} else if (op.opcode == 'cut' || op.opcode == 'del') {
				var features = op.data;
				var undoFeatures = [];
				for (var i=0; i<features.length; i++) {
					var layer = features[i].layer;
					if (layer != null) {
						// layer == nullなら、削除済みと言うこと
						features[i]._layer = layer;
						layer.removeFeatures(features[i]);
						undoFeatures.push(features[i]);
					}
				}
				if (undoFeatures.length > 0) {
					if (op.opcode == 'cut') {
						webtis.clipboardData = undoFeatures;
					}
					undoData.push({ "opcode" : op.opcode, "data" : undoFeatures });
				}
			}
		} 
	};
	
	this.check = function() {
		window.console.log("undo="+undoData.length+",redo="+redoData.length);
	};
};
webtis.operationHistory = new webtis.OperationHistory();

// =============================================================================
// 電子国土API実装
// =============================================================================

webtis._createWebtisObject = function() {
/**	
	// proj4js準備
	if (window.Proj4js) {
		// 使っている座標系を定義する (PROJ.4フォーマット)
		// WGS84
		Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
		// JGD2000
		Proj4js.defs["EPSG:4612"] = "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs";
	}
**/	
	webtis.gSelectionObject = new webtis.SelectionObject();
	
	// OpenLayers地図オブジェクトを作成する
	var divId = 'olmaplt_div';
	if (document.body.firstChild.nodeName.toLowerCase() == "div") {
		var mapdiv = document.body.firstChild;
		if (!mapdiv.id) {
			mapdiv.id = divId;
		} else {
			divId = mapdiv.id;
		}
	} else {
		alert("地図のdivが存在していません");
	}

	// 地図を作成
	webtis.map = new OpenLayers.Map(divId, {
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		eventListeners: {
			"moveend": webtis.onMoveEnd
		},
		restrictedExtent:new OpenLayers.Bounds(121.0, 16.0, 158.0, 48.0).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913")),
	    Z_INDEX_BASE: {
	        BaseLayer: 100,
	        Overlay: 325,
	        Feature: 725,
	        Popup: 101750,
	        Control: 102000
	    }		
	});
	
	// センターカーソル
	{
		// 背景地図とレイヤーの間に挟み込む
		webtis.centerCursor = document.createElement("div");
		webtis.centerCursor.style.position = "absolute";
		webtis.centerCursor.style.width = "32px";
		webtis.centerCursor.style.height = "32px";
		webtis.centerCursor.style.left = "150";
		webtis.centerCursor.style.top = "150";
		webtis.centerCursor.style.zIndex = "999999";
		webtis.centerCursor.style.visiblity = "hidden";
		webtis.centerCursor.style.backgroundImage = "url("+webtis._getScriptLocation() + "v4/image/crosshairs.png"+")";
		webtis.map.layerContainerDiv.appendChild(webtis.centerCursor);
		
		function updateCenterCursor() {
			var cx = -16 + (parseInt(webtis.map.getSize().w) / 2) - parseInt(webtis.map.layerContainerDiv.style.left);
			var cy = -16 + (parseInt(webtis.map.getSize().h) / 2) - parseInt(webtis.map.layerContainerDiv.style.top);
			webtis.centerCursor.style.left = cx + "px";
			webtis.centerCursor.style.top = cy + "px";
			webtis.centerCursor.style.visibility = "visible";		
		}
		webtis.map.events.register("moveend", this,updateCenterCursor);
		webtis.map.events.register("move", this,updateCenterCursor);
	}
	// lineHeightを0pxに設定しないと地図がずれている
	var dudu = document.getElementById(webtis.map.id + "_OpenLayers_ViewPort");
	dudu.style.lineHeight = "0px";
	dudu = document.getElementById(divId);
	dudu.style.lineHeight = "0px";
	// デフォルト設定で「OpenLayers.Control.Navigation」と「OpenLayers.Control.PanZoom」を
	// 表示されてしまうので抜きます
	for (var i = 0; i < webtis.map.controls.length; i++) {
		if (webtis.mapNaviCtrl && webtis.mapPanCtrl) { break; }
		if (webtis.map.controls[i].CLASS_NAME == "OpenLayers.Control.Navigation") {
			webtis.mapNaviCtrl = webtis.map.controls[i];
		} else if (webtis.map.controls[i].CLASS_NAME == "OpenLayers.Control.PanZoom") {
			webtis.mapPanCtrl = webtis.map.controls[i];
		}
	}
	if (webtis.mapNaviCtrl) {
		// デフォルト設定でpanとzoomが有効にするので無効に設定する
		webtis.map.removeControl(webtis.mapNaviCtrl);
		webtis.mapNaviCtrl.deactivate();
		
		delete webtis.mapNaviCtrl;
		webtis.mapNaviCtrl = new webtis.Control.Navigation();
	}
	if (webtis.mapPanCtrl) {
		webtis.map.removeControl(webtis.mapPanCtrl);
	}
	
	// 電子国土APIのデフォルト設定では、zoom boxのコントロールは有効するので、
	// 「webtis.Control.ZoomInOutBox」のコントロールを追加する
	webtis.mapZoomBoxCtrl = new webtis.Control.ZoomInOutBox({alwaysZoom:true});
	webtis.map.addControl(webtis.mapZoomBoxCtrl);
	webtis.mapZoomBoxCtrl.activate();
	webtis.activeCtrl = webtis.mapZoomBoxCtrl;
	
	// 電子国土リンク
	webtis.kokudoLinks = new webtis.Control.DenshiKokudoLinks();
	webtis.map.addControl(webtis.kokudoLinks);
	webtis.kokudoLinks.activate();
	
	webtis.zoomButtons = new webtis.Control.ZoomInOutButtons();
	webtis.map.addControl(webtis.zoomButtons);
	webtis.zoomButtons.activate();
	
	webtis.measureDisplayCtrl = new webtis.Control.MeasureDisplay({
		onCloseButton : function() {
			webtis.map.removeControl(webtis.measureDisplayCtrl);
			webtis.measureDisplayCtrl.deactivate();
			webtis.activeCtrl = null;
			setMouseMode(webtis.measureDisplayCtrl.lastMode);
		}
	});
	// style the sketch fancy
	var sketchSymbolizers = {
		"Point": {
			pointRadius: 4,
			graphicName: "square",
			fillColor: "white",
			fillOpacity: 1,
			strokeWidth: 1,
			strokeOpacity: 1,
			strokeColor: "#333333"
		},
		"Line": {
			strokeWidth: 3,
			strokeOpacity: 1,
			strokeColor: "#666666",
			strokeDashstyle: "dash"
		},
		"Polygon": {
			strokeWidth: 2,
			strokeOpacity: 1,
			strokeColor: "#666666",
			fillColor: "white",
			fillOpacity: 0.3
		}
	};
	var style = new OpenLayers.Style();
	style.addRules([
		new OpenLayers.Rule({symbolizer: sketchSymbolizers})
	]);
	var styleMap = new OpenLayers.StyleMap({"default": style});
	webtis.pathMeasureCtrl = new OpenLayers.Control.Measure(webtis.Handler.Path, {
		persist: true,
		geodesic:true,
		handlerOptions: {
			layerOptions: {styleMap: styleMap}
		}
	});
	webtis.pathMeasureCtrl.geodesic = true;
	webtis.pathMeasureCtrl.events.on({
		"measure": webtis.measureDisplayCtrl.handlePathMeasurements,
		"measurepartial": webtis.measureDisplayCtrl.handlePathMeasurements
	});
	webtis.areaMeasureCtrl = new OpenLayers.Control.Measure(webtis.Handler.Polygon, {
		persist: true,
		geodesic:true,
		handlerOptions: {
			layerOptions: {styleMap: styleMap}
		}
	});
	webtis.areaMeasureCtrl.geodesic = true;
	webtis.areaMeasureCtrl.events.on({
		"measure": webtis.measureDisplayCtrl.handleAreaMeasurements,
		"measurepartial": webtis.measureDisplayCtrl.handleAreaMeasurements
	});
	webtis.measureDisplayCtrl.pathMeasureCtrl = webtis.pathMeasureCtrl;
	webtis.measureDisplayCtrl.areaMeasureCtrl = webtis.areaMeasureCtrl;
	
	/** 地図の初期化 **/
	_initMap();
	
	if (OpenLayers.Util.getBrowserName() == "msie") {
		/*
		try { 
			window.parent.parent.app_main(window.parent); 
		} catch(e) {
			alert("例外が発生しました. エラー名: " + e.name 
					+ ". エラーメッセージ: " + e.message);
		}
		*/
		window.parent.parent.app_main(window.parent);
	} else {
		/*
		try { 
			window.parent.app_main(window); 
		} catch(e) {
			alert("例外が発生しました. エラー名: " + e.name 
				+ ". エラーメッセージ: " + e.message);
		}
		*/
		window.parent.app_main(window);
	}

	// bind events
	webtis.map.events.register("mousedown",webtis.map,
			OpenLayers.Function.bindAsEventListener(function(evt) {
				if (OpenLayers.Event.isRightClick(evt)) {
					webtis.callEventProc(webtis.EV_RIGHTDOWN, webtis._prepareMouseEventParameters(evt),true);
				} else {
					webtis.callEventProc(webtis.EV_LEFTDOWN, webtis._prepareMouseEventParameters(evt),true);
				}
			}, webtis.map)
	);
	webtis.map.events.register("mouseup",webtis.map,
			OpenLayers.Function.bindAsEventListener(function(evt) {
				if (OpenLayers.Event.isRightClick(evt)) {
					webtis.callEventProc(webtis.EV_RIGHTUP, webtis._prepareMouseEventParameters(evt),true);
				} else {
					webtis.callEventProc(webtis.EV_LEFTUP, webtis._prepareMouseEventParameters(evt),true);
				}
			}, webtis.map)			
	);
	webtis.map.events.register("mousemove",webtis.map,
			OpenLayers.Function.bindAsEventListener(function(evt) {
				webtis.callEventProc(webtis.EV_MOVE, webtis._prepareMouseEventParameters(evt),true);
			}, webtis.map)			
	);
	webtis.map.events.register("dblclick",webtis.map,
			OpenLayers.Function.bindAsEventListener(function(evt) {
				webtis.callEventProc(webtis.EV_DBCLICK, webtis._prepareMouseEventParameters(evt),true);
			}, webtis.map)
	);
	
	if (OpenLayers.String.contains(navigator.appName, "Microsoft")) {
		//
	} else {
		webtis.onMapResizeDestroy = OpenLayers.Function.bind(webtis.onMapResize, webtis.map);
		OpenLayers.Event.observe(window, 'resize', webtis.onMapResizeDestroy);
	}
	
};

function _initMap() {
	webtis.map.div.style.visibility = "hidden";
	var baseMapLayer = new webtis.Layer.BaseMap("webtis base map");
	webtis.map.addLayers([baseMapLayer]);
	
	// デフォルト揮発レイヤを追加する
	webtis.volatileLayers["_defvola_screen"] = new webtis.Layer.PixelVector("_defvola_screen", {style: webtis.volatileLayerDefaultStyle});
	webtis.volatileLayers["_defvola_screen"].setDisplayLevel('all');
	webtis.volatileLayers["_defvola_deg"] = new webtis.Layer.Vector("_defvola_deg", {style: webtis.volatileLayerDefaultStyle});
	webtis.volatileLayers["_defvola_deg"].setDisplayLevel('all');
	webtis.currentDrawUnit = "screen";
	webtis.currentVolatileLayer = webtis.volatileLayers["_defvola_screen"];
	webtis.currentVolatileGroupName = null;
	
	webtis.map.addLayer(webtis.volatileLayers["_defvola_screen"]);	
	webtis.map.addLayer(webtis.volatileLayers["_defvola_deg"]);
	webtis.map.zoomToExtent(_transformToMercator(webtis.mapRect),true);
}

function _transformToMercator(src) {
	return src.clone().transform(webtis.map.displayProjection,webtis.map.getProjectionObject());
}

function _transformToWGS84(src) {
	return src.clone().transform(webtis.map.getProjectionObject(),webtis.map.displayProjection);
}

function doUnload() {
	if (webtis.onMapResizeDestroy) {
		OpenLayers.Event.stopObserving(window, 'resize', webtis.onMapResizeDestroy);
	} else {
		webtis.map.events.unregister("resize", webtis.map, webtis.onMapResize);
	}
}

//-------------------------------------------------------------------
//地図表示関数
//-------------------------------------------------------------------
function openMap(mapname, dataset_displaylevel, display) {
	
	LT_P.gMapOpened = true;
	webtis.map.div.style.visibility = "visible";

	// IE resize patch
	if (OpenLayers.String.contains(navigator.appName, "Microsoft")) {
		if (webtis._testObj != null) {
			webtis._testObj.timerCallback = null;
		}
		webtis._testObj = new Object();
		var timerCallback = function() {
			fitMap();
			this.prevWidth = webtis.map.div.style.width;
			this.prevHeight = webtis.map.div.style.height;
			if (this.timerCallback != null) {
				setTimeout(this.timerCallback,1000);
			}
		};
		webtis._testObj.timerCallback = OpenLayers.Function.bind(timerCallback,webtis._testObj);
		setTimeout(webtis._testObj.timerCallback,1000);
	}
}

function _raiseVolalayers() {
	if (webtis.volatileLayers["_defvola_screen"]!=null) {
		webtis.map.setLayerIndex(webtis.volatileLayers["_defvola_screen"],webtis.layers.length + 2);
	}
	if (webtis.volatileLayers["_defvola_deg"]!=null) {
		webtis.map.setLayerIndex(webtis.volatileLayers["_defvola_deg"],webtis.layers.length + 3);
	}
}

webtis._testObj = null;

webtis._openJSGILayer = function(layer, url, fit, displaylevel, display) {
	
	layer.events.register("loadend", layer, function() {
		var bounds = null;
		if (!layer.loadFailed && layer.subLayers && layer.subLayers.length > 0) {
			for (var i=0; i<layer.subLayers.length; i++) {
				if (layer.subLayers[i].features && 
						layer.subLayers[i].features.length > 0) {
					var layerFound = null;
					for (var j=0; j<webtis.layers.length; j++) {
						if (layer.subLayers[i].name == webtis.layers[j].name && 
								layer.subLayers[i].styleName == webtis.layers[j].styleName) {
							layerFound = webtis.layers[j];
							break;
						}
					}
					
					if (layerFound != null) {
						// フィーチャー追加
						layerFound.addFeatures(layer.subLayers[i].features);
						layerFound.redraw();
					} else {
						// 新規レイヤ
						layer.subLayers[i].sourceUrl = url;
						if (display === false) {
							layer.subLayers[i].setVisibility(false);
						} else if (display === true) {
							layer.subLayers[i].setVisibility(true);
						}
						if (displaylevel != undefined) {
							layer.subLayers[i].setDisplayLevel(displaylevel);
						}
						webtis.map.addLayer(layer.subLayers[i]);
						webtis.layers.push(layer.subLayers[i]);
//						if (webtis.enablePopup) {
//							enablePopup(layer.subLayers[i].name);
//						}
						layerFound = layer.subLayers[i];
					}
					
					if (fit) {
						var layerBounds = layerFound.getDataExtent();
						if (!bounds) {
							bounds = new OpenLayers.Bounds(layerBounds.left, layerBounds.bottom, layerBounds.right, layerBounds.top);
						} else {
							bounds.extend(layerBounds);
						}
					}
				} else if (layer.subLayers[i].CLASS_NAME == "OpenLayers.Layer.Image") {
					// Imageレイヤ
					webtis.map.addLayer(layer.subLayers[i]);
					webtis.layers.push(layer.subLayers[i]);
//					if (webtis.enablePopup) {
//						enablePopup(layer.subLayers[i].name);
//					}
					if (fit) {
						var layerBounds = layer.subLayers[i].extent;
						if (!bounds) {
							bounds = new OpenLayers.Bounds(layerBounds.left, layerBounds.bottom, layerBounds.right, layerBounds.top);
						} else {
							bounds.extend(layerBounds);
						}
					}
				}
			}
			if (webtis.enablePopup) {
				enablePopup();
			}
		}
		
		// 親レイヤは子レイヤをロードするためだけ
//		webtis.xmlLoadLayers = webtis.xmlLoadLayers.concat(layer.subLayers);
		webtis.xmlLoadLayer = layer;
		webtis.map.removeLayer(layer);
		
		// 揮発レイヤは常に最上位
		_raiseVolalayers();
		
		if (bounds) {
			webtis.map.zoomToExtent(bounds,false);//内包させる
		}
		
		// レイヤ選択コントロール準備
		var selectableLayers = [];
		for (var i=0; i<webtis.layers.length; i++) {
			if (webtis.layers[i].CLASS_NAME.indexOf("Vector") > -1 && webtis.layers[i].JSGISelection) {
				selectableLayers.push(webtis.layers[i]);
			}
		}
		if (webtis.selectCtrl) {
			if (webtis.selectCtrl.active) {
				webtis.map.removeControl(webtis.selectCtrl);
				webtis.selectCtrl.deactivate();
				webtis.selectCtrl.destroy();
				delete webtis.selectCtrl;
			}
		}
		webtis.selectCtrl = new webtis.Control.SelectFeature(selectableLayers, {
			box : true
		});
		webtis._setMouseMode(webtis.currentMouseMode,true);
		
		// removexmlを呼び出し
		if ((LT_P.gAffixObj != undefined) && (LT_P.gAffixObj != null)) {
			if (LT_P.gAffixObj.AFFIX.removexmlurl) {
				var headElements = document.getElementsByTagName("head");
				var script = document.getElementById("removexmlscript");
				if (script) {
					headElements[0].removeChild(script);
				}
				var script = document.createElement('script');
				script.charset = 'UTF-8';
				script.src = LT_P.gAffixObj.AFFIX.removexmlurl;
				script.id = "removexmlscript";
				headElements[0].appendChild(script);
			}
		}
		webtis.callEventProc(webtis.EV_MAPLOAD, [ '\'' + url + '\'' ]);
		
	});
	
	webtis.map.addLayer(layer);
};

webtis._openJSGIJSON = function(url, fit, displaylevel, display) {
	var layer = new webtis.Layer.JSGIXMLLayer("JSGIXML", url, {
		format: webtis.Format.JSGIJSON,
		formatOptions: {
			affix : false,
			"projection" : webtis.map.getProjectionObject()
		}
	});
	webtis._openJSGILayer(layer, url, fit, displaylevel, display);
};

function openJSGIXML(url, fit, displaylevel, display, wmsData) {
	
	var _url = null;
	if ((url != undefined) && (url != null) && (url != '')) {
		_url = url;
	} else if ((LT_P.gAffixObj != undefined) && (LT_P.gAffixObj != null)) {
		_url = LT_P.gAffixObj.loadxmlurl;
		LT_P.gAffixObj.loadxmlurl = null;
	}
	
	// 相対パスを絶対パスにする。
	url = fixURL(_url);
	
	if (fit == undefined) {
		fit = 1;
	}

	// webtis.xmlLoadLayers = [];
	
	if (wmsData) {
		// v2背景地図の上でWMSレイヤ
		var format = wmsData.format ? wmsData.format : "image%2Fpng";
		var layer = new webtis.Layer.JSGIWMSLayer(wmsData.name, null, null, {
			"JSGIXML" : url,
			"format" : "image%2Fpng",
			"transparent" : true,
			"layers" : wmsData.layers,
			"useWMSBaseLayer" : false
		});
		webtis.map.addLayer(layer);
		_raiseVolalayers();
	} else {
		webtis._openJSGIJSON(url, fit, displaylevel, display);
	}

}

function openJSGIXMLex(url, second, fit, displaylevel, display) {
	openJSGIXML(url, fit, displaylevel, display);
}

function openGeoTiff(layername, zorder, url, fit) {
	webtis.clearAllLayers(false);
	webtis.geoTiffLayer = new webtis.Layer.JSGIGeoTiffLayer(layername,url);
	webtis.map.addLayer(webtis.geoTiffLayer);
	_raiseVolalayers();
}

function saveJSGIXML(pClass) {
	//
}

function setLoadXmlClass(pClass) {
	//
};


webtis.BValueToValue = function(pBValue/*, pImageWidth*/) {
	return pBValue*360000;
};

function openTiledataXML(level, sec_size, map_suffix, num_maxopen, folder_url, zorder, left_limit, bottom_limit, right_limit, top_limit) {
	var bounds;
	if (left_limit != undefined && bottom_limit != undefined && right_limit != undefined && top_limit != undefined) {
		bounds = new OpenLayers.Bounds(left_limit, bottom_limit, right_limit, top_limit);
	} else {
		bounds = webtis.map.getExtent();
	}
	
	var	theLeft = webtis.BValueToValue(bounds.left/*, theWidth*/);
	var	theBottom = webtis.BValueToValue(bounds.bottom/*, theWidth*/);
	var	theRight = webtis.BValueToValue(bounds.right/*, theWidth*/);
	var	theTop = webtis.BValueToValue(bounds.top/*, theWidth*/);
	var	theUpValue = sec_size * 100;
	
	var	theLeftLimit = Math.floor(theLeft/theUpValue)*theUpValue;
	var	theBottomLimit = Math.floor(theBottom/theUpValue)*theUpValue;
	var	theRightLimit = (Math.ceil(theRight/theUpValue)+1)*theUpValue;
	var	theTopLimit = (Math.ceil(theTop/theUpValue)+1)*theUpValue;
	
	function makeURL(pE, pN) {
		var	theE = parseInt(pE);
		var	theN = parseInt(pN);
		return folder_url + '/' + theE + '/' + theE + '-' + theN + '-' + map_suffix + '.xml';
	}
	
	var tdc = {};
	var tiles = [];
	
	function TileParent(name) {
		this.name = name;
		this.list = [];
		
		this.checkURL = function(pURL) {
			for (var x = 0; x < this.list.length; x++) {
				if (this.list[x].url == pURL) {
					return true;
				}
			}
			return false;
		};
		
	}
	
	function Tile(url, bbox) {
		this.url = url;
		this.bbox = bbox;
	} 
	
	for (var theE=theLeftLimit; theE<theRightLimit; theE+=theUpValue) {
		var theTDCName = theE.toString();
		var theTDC = tdc[theTDCName];
		if (!theTDC) {
			theTDC = new TileParent(theTDCName);
			tdc[theTDCName] = theTDC;
		}
		for (var theN=theBottomLimit; theN<theTopLimit; theN+=theUpValue) {
			var theURL = makeURL(theE, theN);
			if (!theTDC.checkURL(theURL)) {
				var tile = new Tile(theURL, [theE, theN, theE+theUpValue, theN+theUpValue]);
				theTDC.list.push(tile);
				tiles.push(tile);
			}
		}
	}
	
	webtis.clearAllLayers(false);
	
	for (var i=0; i<tiles.length; i++) {
		webtis._openJSGIJSON(tiles[i].url, 0);
	}
}

function removeTiledata() {
	webtis.clearAllLayers(false);
}

function setMapRect(left, bottom, right, top) {
	var bounds = _transformToMercator(new OpenLayers.Bounds(left, bottom, right, top));
	webtis.map.zoomToExtent(bounds,false);// 内包させる
}

function setMapCenter(x, y, scale) {
	if (scale) {
		var zoomLevel = webtis.map.baseLayer.jsgiScaleToZoomLevel(scale);
		webtis.map.zoomTo(zoomLevel,true);
	}
	webtis.map.setCenter(_transformToMercator(new OpenLayers.LonLat(x, y)));
}

function setMapScale(scale) {
	var zoomLevel = webtis.map.baseLayer.jsgiScaleToZoomLevel(scale);
	webtis.map.zoomTo(zoomLevel,true);
}

function clearMap() {
	disablePopup();
	webtis.clearAllLayers(true);
	if (webtis.scaleLineCtrl) {
		webtis.map.removeControl(webtis.scaleLineCtrl);
		webtis.scaleLineCtrl.deactivate();
		webtis.scaleLineCtrl.destroy();
		delete webtis.scaleLineCtrl;
		webtis.scaleLineCtrl = null;
	}
	// 地図の初期化
	_initMap();	
}

function redrawMap() {
	openMap();
}

function createScaleBar() {
	if (!webtis.scaleLineCtrl) {
		webtis.scaleLineCtrl = new webtis.Control.ScaleLine();
		webtis.map.addControl(webtis.scaleLineCtrl);
		webtis.scaleLineCtrl.div.style.lineHeight = "18px";
	}
}

function enablePopup(layer) {
	if (webtis.layers.length > 0) {
		var prevPopupLayers = webtis.popupLayers;
		if (layer) {
			var addPopupLayers = webtis.searchLayerInArray(layer, webtis.layers, true, false, true);
			if (webtis.popupLayers) {
				webtis.popupLayers = webtis.popupLayers.concat(addPopupLayers);
			} else {
				webtis.popupLayers = addPopupLayers;
			}
		} else {
			webtis.popupLayers = [];
			for (var i=0; i<webtis.layers.length; i++) {
				if (webtis.layers[i].CLASS_NAME.indexOf("Vector") > -1)
					webtis.popupLayers.push(webtis.layers[i]);
			}
		}
		webtis.resetPopup(prevPopupLayers);
	}
	webtis.enablePopup = true;
}

function disablePopup(layer) {
	if (webtis.layers.length > 0) {
		var prevPopupLayers = webtis.popupLayers;
		if (layer) {
			var remain = webtis.searchLayerInArray(layer, webtis.popupLayers, true, false, true);
			var newPopupLayers = [];
			for (var i = 0; i < prevPopupLayers.length; i++) {
				var removed = false;
				for (var j = 0; j < remain.length; j++) {
					if (prevPopupLayers[i] == remain[j]) {
						removed = true;
						break;
					}
				}
				if (!removed) {
					newPopupLayers.push(prevPopupLayers[i]);
				}
			}
			webtis.popupLayers = newPopupLayers;
			webtis.resetPopup(prevPopupLayers);
			return;
		} else {
			webtis.popupLayers = [];
			webtis.resetPopup(prevPopupLayers);
		}
	}
	webtis.enablePopup = false;
}

function setPopupColor(part, r, g, b) {
	// 実装しない
}

// -------------------------------------------------------------------
// 地図操作関数
// -------------------------------------------------------------------

function startZooming(updown) {
	
	if (webtis.mapMouseMode == webtis.MAP_MOUSEMODE_FIXED) {
		return;
	}
	
	var theUpDown = 0;
	switch(updown) {
		case 'in':
		case 1:
			theUpDown = 1;
			break;
		case 'out':
		case 2:
			theUpDown = 2;
			break;
	}
	if (theUpDown > 0) {
		webtis.manualZoomInterval = setInterval(
				"webtis.onManualZoom(" + theUpDown + ")", 100);
	}
}

function stopZooming() {
	
	if (webtis.mapMouseMode == webtis.MAP_MOUSEMODE_FIXED) {
		return;
	}
	
	clearInterval(webtis.manualZoomInterval);
	webtis.manualZoomInterval = null;
}

function startScroll(direction) {
	
	if (webtis.mapMouseMode == webtis.MAP_MOUSEMODE_FIXED) {
		return;
	}
	
	var theDirection = 0;
	switch(direction) {
		case '左': theDirection = 1; break;
		case '上': theDirection = 2; break;
		case '右': theDirection = 3; break;
		case '下': theDirection = 4; break;
		case '左上': theDirection = 5; break;
		case '右上': theDirection = 6; break;
		case '右下': theDirection = 7; break;
		case '左下': theDirection = 8; break;
	}
	if (theDirection > 0) {
		webtis.manualScrollInterval = setInterval(
				"webtis.onManualScroll(" + theDirection + ")", 100);
	}
}

function stopScroll() {
	
	if (webtis.mapMouseMode == webtis.MAP_MOUSEMODE_FIXED) {
		return;
	}
	
	clearInterval(webtis.manualScrollInterval);
	webtis.manualScrollInterval = null;
}

// -------------------------------------------------------------------
// 地図情報関数
// -------------------------------------------------------------------

function getMapScale() {
	var zoom = webtis.map.getZoom();
	return webtis.map.baseLayer.zoomLevelToJSGIScale(zoom);
}

function getPositionMailXY() {
	return 'xy=' + getCx() + ', ' + getCy() + ', ' + getMapScale();
}

function getRect() {
	var bounds = _transformToWGS84(webtis.map.getExtent());
	return [bounds.left, bounds.bottom, bounds.right, bounds.top];
}

function getLeft() {
	var bounds = getRect();
	return bounds[0];
}

function getBottom() {
	var bounds = getRect();
	return bounds[1];
}

function getRight() {
	var bounds = getRect();
	return bounds[2];
}

function getTop() {
	var bounds = getRect();
	return bounds[3];
}

function getCenter() {
	var center = _transformToWGS84(webtis.map.getCenter());
	return [center.lon, center.lat];
}

function getCx() {
	var center = _transformToWGS84(webtis.map.getCenter());
	return center.lon;
}

function getCy() {
	var center = _transformToWGS84(webtis.map.getCenter());
	return center.lat;
}

function copyCenter() {
	webtis.clipboardDataText = getCx() + ', ' + getCy();
}

function pasteText() {
	return webtis.clipboardDataText;
}

// -------------------------------------------------------------------
// レイヤ操作関数
// -------------------------------------------------------------------

webtis._displayLayerOrStyle = function(layername, onoff, asStyle) {
	var layers = webtis.searchLayerInArray(layername, webtis.layers, true, asStyle, false);
	if (layers.length > 0) {
		if (onoff == undefined) {
			var status = -1;
			for (var i=0; i<layers.length; i++) {
				if (asStyle) {
					// 完全一致なので必ず一件のはず
					return layers[i].getVisibility()?1:0;
				} else {
					if (status == -1) {
						if (layers[i].getVisibility()) {
							status = 1;
						} else {
							status = 0;
						}
					} else {
						if (status != 2) {
							var curStatus = 0;
							if (layers[i].getVisibility()) {
								curStatus = 1;
							}
							if (curStatus != status) {
								status = 2;
							}
						}
					}
				}
			}
			return status;
		}
		for (var i=0; i<layers.length; i++) {
			layers[i].setVisibility(onoff? true : false);
		}
	} else {
		if (onoff == undefined) {
			return 0;
		}
	}
	return 1;
};

function displayLayer(layername, onoff) {
	return webtis._displayLayerOrStyle(layername, onoff, false);
}

function displayStyle(stylename, onoff) {
	return webtis._displayLayerOrStyle(stylename, onoff, true);
}

function clearLayers(layername) {
	if ((layername == undefined) || (layername == '') || (layername == null)) {
		return;
	}
	var	theLayerName = layername + '*';
	clearLayer(theLayerName);
}

function clearLayer(layername) {
	var layers = webtis.searchLayerInArray(layername, webtis.layers, true, false, false);
	if (layers.length > 0) {
		if (webtis.selectCtrl) {
			// 選択中の場合は、一度削除
			if (webtis.selectCtrl.active) {
				webtis.map.removeControl(webtis.selectCtrl);
				webtis.selectCtrl.deactivate();
				webtis.selectCtrl.destroy();
				delete webtis.selectCtrl;
			}
		}
		
		for (var i=0; i<layers.length; i++) {
			// 削除前にpopupも除去
			disablePopup(layers[i].name);
			layers[i].removeAllFeatures();
			webtis.map.removeLayer(layers[i]);
//			layers[i].destroy();
		}
		var newLayerList = [];
		for (var i=0; i<webtis.layers.length; i++) {
			var found = false;
			for (var j=0; j<layers.length; j++) {
				if (webtis.layers[i].name == layers[j].name && 
						webtis.layers[i].styleName == layers[j].styleName) {
					found = true;
				}
			}
			if (!found) {
				newLayerList.push(webtis.layers[i]);
			}
		}
		webtis.layers = newLayerList;

		// レイヤ選択コントロールを再作成
		var selectableLayers = [];
		for (var i=0; i<webtis.layers.length; i++) {
			if (webtis.layers[i].CLASS_NAME.indexOf("Vector") > -1 && webtis.layers[i].JSGISelection) {
				selectableLayers.push(webtis.layers[i]);
			}
		}
		webtis.selectCtrl = new webtis.Control.SelectFeature(selectableLayers, {
			box : true
		});
	}
}

function setLayerRGB(layername, r, g, b) {
	var layers = webtis.searchLayerInArray(layername, webtis.layers, true, false, true);
	if (layers.length == 0) {
		return false;
	}
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		if (layer.styleMap && layer.styleMap.styles["default"]) {
			layer.styleMap.styles["default"].defaultStyle.strokeColor = webtis.Format.Parse.RGBToHexaColor(r, g, b);
			layer.styleMap.styles["default"].defaultStyle.fontColor = webtis.Format.Parse.RGBToHexaColor(r, g, b);
			if (layer.affixStyle) {
				layer.affixStyle.rgb = parseInt(r,10)+","+parseInt(g,10)+","+parseInt(b,10);
			}
			layer.redraw();
		}
	}
	return true;
}

function setLayerHRGB(layername, r, g, b) {
	var layers = webtis.searchLayerInArray(layername, webtis.layers, true, false, true);
	if (layers.length == 0) {
		return false;
	}
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		if (layer.styleMap && layers[0].styleMap.styles["default"]) {
			layer.styleMap.styles["default"].defaultStyle.fillColor = webtis.Format.Parse.RGBToHexaColor(r, g, b);
			if (layer.affixStyle) {
				if (layer.affixStyle.type.toLowerCase() == "text") {
					layer.affixStyle.brgb = parseInt(r,10)+","+parseInt(g,10)+","+parseInt(b,10);
				} else {
					layer.affixStyle.hrgb = parseInt(r,10)+","+parseInt(g,10)+","+parseInt(b,10);
				}
			}
			layer.redraw();
		}
	}
	return true;
}

function setLayerBRGB(layername, r, g, b) {
	return false;
}

function setLayerDisplayLevel(layername, level) {
	var layers = webtis.searchLayerInArray(layername, webtis.layers, true, false, true);
	if (layers.length > 0) {
		for (var i=0; i<layers.length; i++) {
			if (layers[i].setDisplayLevel) {
				layers[i].setDisplayLevel(level);
			}
		}
	}
}

var LayerColorJSONRequest={};
setTimeout("LayerColorJSONRequest.checkJsonRequest()",1000);

LayerColorJSONRequest._sequenceNo = 0;

LayerColorJSONRequest.checkJsonRequest = function() {
	if (LayerColorJSONRequest.queue) {
		for (var key in LayerColorJSONRequest.queue) {
			var item = LayerColorJSONRequest.queue[key];
			var testVar;
			eval("testVar = LT_P.gLayerColors["+item.currentId+"];");
			var currentTime = new Date();
			if ((currentTime.getTime() - item.startTime.getTime())>10000) {
				eval("delete LayerColorJSONRequest.queue['"+item.scriptElement.id+"']");
				var headElements = document.getElementsByTagName("head");
				headElements[0].removeChild(item.scriptElement);
				var failure = OpenLayers.Function.bind(item['failure'],item['scope']);
				failure(item);
				continue;
			} else {
				eval("testVar = LT_P.gLayerColors["+item.currentId+"];");
			}
			if (testVar != undefined) {
				var headElements = document.getElementsByTagName("head");
				eval("delete LayerColorJSONRequest.queue['"+item.scriptElement.id+"'];");
				headElements[0].removeChild(item.scriptElement);
				eval("LT_P.gLayerColors["+item.currentId+"]=undefined;");
				testVar.sourceItemId = item.currentId;
				item['result']=testVar;
				var success = OpenLayers.Function.bind(item['success'],item['scope']);
				success(item);
			}
		}
	}
	setTimeout("LayerColorJSONRequest.checkJsonRequest()",2000);
};

LayerColorJSONRequest.getJSON = function(params) {
	if (!LT_P.gLayerColors) {
		LT_P.gLayerColors = new Array();
	}
	if (!LayerColorJSONRequest.queue) {
		LayerColorJSONRequest.queue = new Array();
	}
	var currentId = LayerColorJSONRequest._sequenceNo++;
	var requestUrl = params['url'];
	var url = "http://cyberjapan.gsi.go.jp/cgi-bin/layercolor/getcolors.cgi?s="+currentId+"&url="+encodeURI(requestUrl);
	var script = document.createElement('script');
	script.charset = 'UTF-8';
	script.src = url;
	script.id = "lcjson"+currentId;
	var headElements = document.getElementsByTagName("head");
	headElements[0].appendChild(script);
	var item = params;
	item.currentId = currentId;
	item.scriptElement = script;
	item.startTime = new Date();
	LayerColorJSONRequest.queue[script.id]=item;
};

function setLayerColor(url) {
	
	LayerColorJSONRequest.getJSON({
		url: url,
		success: function(doc) {
			if (doc.result && doc.result.error == "0") {
				var styleObjs = doc.result.data;
				for (var i = 0; i < styleObjs.length; i++) {
					setLayerRGB(styleObjs[i].LAYER, styleObjs[i].FR, styleObjs[i].FG, styleObjs[i].FB);
					setLayerHRGB(styleObjs[i].LAYER, styleObjs[i].HR, styleObjs[i].HG, styleObjs[i].HB);
					setLayerBRGB(styleObjs[i].LAYER, styleObjs[i].BR, styleObjs[i].BG, styleObjs[i].BB);
				}
			}
		},
		failure: function(doc) {
		},
		scope: this
	});
}

function focusLayer(layername) {
	var layers = webtis.searchLayerInArray(layername, webtis.layers, true, false, false);
	if (layers.length > 0) {
		for (var i = 0; i < layers.length; i++) {
			// 最前面に移動します
			webtis.map.setLayerIndex(layers[i],webtis.map.layers.length+1);
		}
		_raiseVolalayers();
	}
}

function getLayers(url) {
	var ret = [];
	for (var i=0; i<webtis.layers.length; i++) {
		if ((url != undefined) && (url != null) && (url != '')) {
			if (webtis.layers[i].sourceUrl == url) {
				ret.push(webtis.layers[i].name);
			}
		} else {
			ret.push(webtis.layers[i].name);
		}
	}
	return ret;
}

function getDescription() {
	var ret = [];
	for (var i=0; i<webtis.layers.length; i++) {
		ret.push(webtis.layers[i].description);
	}
	return ret;
}

function getLayerDescription(layer) {
	var layers = webtis.searchLayerInArray(layer, webtis.layers, true, false, false);
	if (layers.length > 0) {
		return layers[0].description?layers[0].description:"";
	}
	return null;
}

webtis._layerWin = null;
function openDisplayLayerWindow() {
	if (webtis._layerWin == null) {
		var win = new webtis.DisplayLayerWindow();
		webtis._layerWin = win;
	} else {
		webtis._layerWin.win.close();
		var win = new webtis.DisplayLayerWindow();
		webtis._layerWin = win;
	}
	webtis._layerWin.open();
}

function printMap_A4tate() {
	printMap({paperSize:'210,297',orientation:'Landscape'});
}

function printMap(option) {
	// デフォルトでは、選択
	var currentMetaData = webtis.map.baseLayer.getCurrentMetaData();
	var scale = getMapScale();
	var printOption = {
			paperWidth:210,
			paperHeight:297,
			orientation:"landscape",
			header : "地図印刷",
			footer : "["+currentMetaData.title+"]["+currentMetaData.owner+"][1/"+scale+"]"
	};
	function callPDFServer(map,printOption) {
		// 図形をJSON化します。
		var targetLayers = new Array();
		targetLayers  = targetLayers.concat(webtis.layers); 
		var displayProjection = null; 
		if (option && option.displayProjection) {
			displayProjection = option.displayProjection;
		} else {
			displayProjection = webtis.map.displayProjection;
		}
		var jsonString = webtis.Format.JSGIJSON.makeJSONString(targetLayers,displayProjection);
		// 送信用にformを作成
		var printForm = document.getElementById("print_form");
		if (printForm) {
			document.getElementsByTagName("body")[0].removeChild(printForm);
		}
		printForm = document.createElement("form");
		printForm.id = "print_form";
		printForm.method = "post";
		printForm.acceptCharset = "Shift_JIS";
		document.getElementsByTagName("body")[0].appendChild(printForm);
		
		var hiddenParams = {
				"size":"Custom",
				"lmergin":15,
				"rmergin":15,
				"tmergin":15,
				"bmergin":20
		};
		for (var key in hiddenParams) {
			var hiddenParam = document.createElement("input");
			hiddenParam.setAttribute("type","hidden");
			hiddenParam.name = key;
			hiddenParam.value = hiddenParams[key];
			printForm.appendChild(hiddenParam);
		}
		printForm.action = webtis.SERVER_URL.CREATE_PDF_SERVER;
		// JSON
		var jsonParam = document.createElement("input");
		jsonParam.setAttribute("type","hidden");
		jsonParam.name = "json";
		printForm.appendChild(jsonParam);
		jsonParam.value = jsonString;
		
		// X座標
		var cxParam = document.createElement("input");
		cxParam.setAttribute("type","hidden");
		cxParam.name = "cx";
		printForm.appendChild(cxParam);
		cxParam.value = getCx();
		// Y座標
		var cyParam = document.createElement("input");
		cyParam.setAttribute("type","hidden");
		cyParam.name = "cy";
		printForm.appendChild(cyParam);
		cyParam.value = getCy();
		// zoomLevel
		var zoomLevelParam = document.createElement("input");
		zoomLevelParam.setAttribute("type","hidden");
		zoomLevelParam.name = "zoomLevel";
		printForm.appendChild(zoomLevelParam);
		// データセット上でのzoomLevel(オフセットが必要になる)
		zoomLevelParam.value = webtis.map.getZoom() + webtis.map.baseLayer.zoomOffset;
		// dataId ベースマップ
		var dataIdParam = document.createElement("input");
		dataIdParam.setAttribute("type","hidden");
		dataIdParam.name = "dataId";
		printForm.appendChild(dataIdParam);
		dataIdParam.value = webtis.map.baseLayer.getDataSet()[webtis.map.getZoom() + webtis.map.baseLayer.zoomOffset].dataId;

		// customWidth
		var customWidthParam = document.createElement("input");
		customWidthParam.setAttribute("type","hidden");
		customWidthParam.name = "customWidth";
		printForm.appendChild(customWidthParam);
		customWidthParam.value = printOption.paperWidth;
		// customHeight
		var customHeightParam = document.createElement("input");
		customHeightParam.setAttribute("type","hidden");
		customHeightParam.name = "customHeight";
		printForm.appendChild(customHeightParam);
		customHeightParam.value = printOption.paperHeight;
		// orientation
		var orientationParam = document.createElement("input");
		orientationParam.setAttribute("type","hidden");
		orientationParam.name = "orientation";
		printForm.appendChild(orientationParam);
		orientationParam.value = printOption.orientation;
		// header
		var headerParam = document.createElement("input");
		headerParam.setAttribute("type","hidden");
		headerParam.name = "header";
		printForm.appendChild(headerParam);
		headerParam.value = printOption.header;
		// footer
		var footerParam = document.createElement("input");
		footerParam.setAttribute("type","hidden");
		footerParam.name = "footer";
		printForm.appendChild(footerParam);
		footerParam.value = printOption.footer;
		
		// 送信
		document.charset='shift_jis'; 
		
		printForm.submit();	
		return;
	}
	if (!option || option.showChooseDialog) {
		// 画面全体を薄透明の背景にする。
		var contentDiv = document.createElement("div");
		contentDiv.id = "overlay";
		contentDiv.style.visibility = "hidden"; 
		contentDiv.style.position = "absolute";
		contentDiv.style.left = "0px";
		contentDiv.style.top = "0px";
		contentDiv.style.width = "100%";
		contentDiv.style.height = "100%";
		contentDiv.style.textAlign = "center";
		contentDiv.style.zIndex = 9999999999;
		contentDiv.style.backgroundImage = "url("+webtis._getScriptLocation() + "v4/image/black20.png)";
		
		var contentBody = document.createElement("div");
		contentBody.style.width = "300px";
		contentBody.style.margin = "100px auto";
		contentBody.style.backgroundColor = "#fff";
		contentBody.style.border = "1px solid #000";
		contentBody.style.padding = "15px";
		
		contentBody.innerHTML = '<h2 style=\"font-size:16px;text-align:left;margin-top:5px;margin-bottom:5px;\">ページ設定</h2>\
		<form id=\"print_inputs\"><table style=\"width:100%\"><tr><td style=\"width:100px;text-align:left;\">用紙サイズ</td><td> : <select name=\"print_size_list\"></select></td></tr>\
		<tr><td style=\"width:100px;text-align:left;\">用紙方向</td><td> : <label><input type=\"radio\" name=\"print_orientation\" value=\"landscape\" checked>横</label> <label><input type=\"radio\" name=\"print_orientation\" value=\"portrait\" >縦</label></td></tr>\
		<tr><td colspan=\"2\" style=\"text-align:center;padding-top:10px;\"><button id=\"print_ok\">印刷</button><button id=\"print_cancel\">キャンセル</button></td></tr></table></form>';
		contentDiv.appendChild(contentBody);
		
		document.getElementsByTagName("body")[0].appendChild(contentDiv);
		
		var printInputs = document.getElementById("print_inputs");
		// 用紙サイズ
		var paperSizeList = null;
		if (option && option.paperSizeList) {
			paperSizeList = option.paperSizeList;			
		} else {
			paperSizeList = [{"name":"A4(210x297mm)","size":"210,297"}];
		}
		var sizeListSelect = printInputs.print_size_list;
		for(var i = 0; i < paperSizeList.length; i++) {
			var paperOption = document.createElement("option");
			paperOption.value = 0;
			var paperLabel = document.createTextNode(paperSizeList[i]["name"]);
			paperOption.appendChild(paperLabel);
			sizeListSelect.appendChild(paperOption);
		}
		
		// ボタンを設定
		// OKボタン
		document.getElementById("print_ok").onclick = function(ev) {
			// サイズを取得
			var paperSize = paperSizeList[sizeListSelect.selectedIndex]["size"];
			var tokens = paperSize.split(",");
			if (parseInt(tokens[0])>0 && parseInt(tokens[1])>0) { 
				printOption.paperWidth = parseInt(tokens[0]);
				printOption.paperHeight = parseInt(tokens[1]);
			}
			// 方向
			var printOrientation = printInputs.print_orientation;
			for (var i = 0; i < printOrientation.length; i++) {
				if (printOrientation[i].checked) {
					printOption.orientation = printOrientation[i].value;
					break;
				}
			}
			// URLを生成
			
			callPDFServer(webtis.map,printOption);
			contentDiv.parentNode.removeChild(contentDiv);
			return false;
		};
		// キャンセルボタン
		document.getElementById("print_cancel").onclick = function(ev) {
			contentDiv.parentNode.removeChild(contentDiv);
			return false;
		};
		contentDiv.style.visibility = "visible"; 
		return;
	} else {
		if (option && option.paperSize) {
			var tokens = option.paperSize.split(",");
			if (parseInt(tokens[0])>0 && parseInt(tokens[1])>0) { 
				printOption.paperWidth = parseInt(tokens[0]);
				printOption.paperHeight = parseInt(tokens[1]);
			}
		}
		if (option && option.orientation) {
			if (option.orientation.toLowerCase() == "landscape" || option.orientation.toLowerCase() == "portrait") {
				printOption.orientation = option.orientation.toLowerCase();
			}
		}
		callPDFServer(webtis.map,printOption);
	}
}

// -------------------------------------------------------------------
// イベント関連関数
// -------------------------------------------------------------------
function setMouseMode(mode) {
	// 描画、移動モードは、削除する。
	var drawControl = null;
	var force = false;
	
	for (var i = 0; i < webtis.map.controls.length; i++) {
		if (webtis.map.controls[i].CLASS_NAME == "OpenLayers.Control.DrawFeature") {
			drawControl = webtis.map.controls[i]; 
			break;
		}
	}
	if (drawControl) {
		force = true;
		drawControl.deactivate();
		webtis.map.removeControl(drawControl);
	}
	// API以外の選択系は、一度破棄
	for (var i = 0; i < webtis.map.controls.length; i++) {
		if (webtis.selectCtrl != webtis.map.controls[i] && 
				(webtis.map.controls[i].CLASS_NAME == "OpenLayers.Control.SelectFeature" || webtis.map.controls[i].CLASS_NAME == "webtis.Control.SelectFeature" || webtis.map.controls[i].CLASS_NAME == "webtis.Control.MultiLayerDragFeature")
					) {
			force = true;
			break;
		}
	}
	
	webtis._setMouseMode(mode,force);
}

webtis._setMouseMode = function(mode,forceSelect) {
	
	if (LT_P.gAffixObj && LT_P.gAffixObj.AFFIX) {
		LT_P.gAffixObj.AFFIX._deactivate.apply(LT_P.gAffixObj);
	}
	if (forceSelect) {
		// 選択系は、一度破棄
		var classNames = ["OpenLayers.Control.SelectFeature","webtis.Control.SelectFeature","webtis.Control.MultiLayerDragFeature"];
		for (var j = 0; j < classNames.length; j++) {
			var drawSelectControl = null;
			for (var i = 0; i < webtis.map.controls.length; i++) {
				if (webtis.selectCtrl != webtis.map.controls[i] && webtis.map.controls[i].CLASS_NAME == classNames[j]) {
					drawSelectControl = webtis.map.controls[i]; 
					break;
				}
			}
			if (drawSelectControl) {
				drawSelectControl.deactivate();
				webtis.map.removeControl(drawSelectControl);
			}
		}
	}
	var _mode = webtis.MAP_MOUSEMODE_UNKNOWN;
	
	switch(mode) {
	case 'zoom':
		_mode = webtis.MAP_MOUSEMODE_ZOOM;
		break;
	case 'pan' :
		_mode = webtis.MAP_MOUSEMODE_PAN;
		break;
	case 'selection' :
		_mode = webtis.MAP_MOUSEMODE_SELECTION;
		break;
	case 'edit' :
		_mode = webtis.MAP_MOUSEMODE_DRAG;
		break;
	case 'pan2' :
		_mode = webtis.MAP_MOUSEMODE_PAN2;
		break;
	case 'measure' :
		_mode = webtis.MAP_MOUSEMODE_MEASURE;
		break;
	case 'fixed' :
		_mode = webtis.MAP_MOUSEMODE_FIXED;
		break;
	case 'semifixed' :
		_mode = webtis.MAP_MOUSEMODE_SEMIFIXED;
		break;
	}
	
	if (forceSelect || (_mode != webtis.MAP_MOUSEMODE_UNKNOWN && webtis.mapMouseMode != _mode)) {
		var lastMode = webtis.lastMouseMode;
		webtis.currentMouseMode = mode;
		webtis.lastMouseMode = mode;
		webtis.mapMouseMode = _mode;
		
		if (webtis.activeCtrl) {
			
			var clearCtrl = function(ctrl) {
				webtis.map.removeControl(ctrl);
				ctrl.deactivate();
				if (ctrl.CLASS_NAME == 'webtis.Control.MultiLayerDragFeature') {
					ctrl.destroy();
					delete ctrl;
				}
			};
			
			if (webtis.activeCtrl.constructor != Array) {
				clearCtrl(webtis.activeCtrl);
			} else {
				for (var i=0; i<webtis.activeCtrl.length; i++) {
					clearCtrl(webtis.activeCtrl[i]);
				}
			}
		}
		if (_mode == webtis.MAP_MOUSEMODE_ZOOM) {
			webtis.activeCtrl = webtis.mapZoomBoxCtrl;
		} else if (_mode == webtis.MAP_MOUSEMODE_PAN) {
			webtis.activeCtrl = webtis.mapNaviCtrl;
			webtis.mapNaviCtrl.semiFixed = false;
		} else if (_mode == webtis.MAP_MOUSEMODE_SELECTION) {
			if (webtis.selectCtrl && !webtis.selectCtrl.box) {
				webtis.selectCtrl.deactivate();
				webtis.map.removeControl(webtis.selectCtrl);
				webtis.selectCtrl = null;
			}
			if (forceSelect || webtis.selectCtrl == null) {
				var selectableLayers = [];
				for (var i=0; i<webtis.layers.length; i++) {
					if (webtis.layers[i].CLASS_NAME.indexOf("Vector") > -1 && webtis.layers[i].JSGISelection) {
						selectableLayers.push(webtis.layers[i]);
					}
				}
				webtis.selectCtrl = new webtis.Control.SelectFeature(selectableLayers, {
					box : true
				});
			}
			webtis.activeCtrl = webtis.selectCtrl;
		} else if (_mode == webtis.MAP_MOUSEMODE_PAN2) {
			if (webtis.selectCtrl && webtis.selectCtrl.box) {
				webtis.selectCtrl.deactivate();
				webtis.map.removeControl(webtis.selectCtrl);
				webtis.selectCtrl = null;
			}
			if (forceSelect || webtis.selectCtrl == null) {
				var selectableLayers = [];
				for (var i=0; i<webtis.layers.length; i++) {
					if (webtis.layers[i].CLASS_NAME.indexOf("Vector") > -1 && webtis.layers[i].JSGISelection) {
						selectableLayers.push(webtis.layers[i]);
					}
				}
				webtis.selectCtrl = new webtis.Control.SelectFeature(selectableLayers, {
					box : false
				});
			}
			if (webtis.selectCtrl) {
				webtis.activeCtrl = [webtis.mapNaviCtrl,webtis.selectCtrl];
			} else {
				webtis.activeCtrl = webtis.mapNaviCtrl;
			}
			webtis.mapNaviCtrl.semiFixed = false;
		} else if (_mode == webtis.MAP_MOUSEMODE_MEASURE) {
			webtis.measureDisplayCtrl.lastMode = lastMode;
			webtis.activeCtrl = webtis.measureDisplayCtrl;
		} else if (_mode == webtis.MAP_MOUSEMODE_FIXED) {
			webtis.activeCtrl = null;
		} else if (_mode == webtis.MAP_MOUSEMODE_SEMIFIXED) {
			webtis.activeCtrl = webtis.mapNaviCtrl;
			webtis.mapNaviCtrl.semiFixed = true;
		} else if (_mode == webtis.MAP_MOUSEMODE_DRAG) {
			var dragLayers = [];
			for (var i=0; i<webtis.layers.length; i++) {
				if (webtis.layers[i].getFeatureFromEvent) {
					if (webtis.layers[i].JSGISelection!=false) {
						dragLayers.push(webtis.layers[i]);
					}
				}
			}
			if (dragLayers.length > 0) {
				webtis.activeCtrl = new webtis.Control.MultiLayerDragFeature(dragLayers, {
					onStart: function(feature, pixel) {
						webtis.operationHistory.add('move', { "feature" : feature, "center" : feature.geometry.getBounds().getCenterLonLat()});
					},
					onComplete: function(feature, pixel) {
						//alert('drag completed');
					}
				});
			}
		}
		
		if (webtis.activeCtrl) {
			if (webtis.activeCtrl.constructor != Array) {
				webtis.map.addControl(webtis.activeCtrl);
				webtis.activeCtrl.activate();
			} else {
				for (var i=0; i<webtis.activeCtrl.length; i++) {
					webtis.map.addControl(webtis.activeCtrl[i]);
					webtis.activeCtrl[i].activate();
				}
			}
		}
	}
};

function enableWheelZoom(enable) {
	var theEnable = (enable == undefined) ? true : enable;
	if (theEnable == 'true') {
		theEnable = true;
	} else if (theEnable == 'false') {
		theEnable = false;
	}
	if (webtis.mapNaviCtrl) {
		if (theEnable)
			webtis.mapNaviCtrl.enableZoomWheel();
		else
			webtis.mapNaviCtrl.disableZoomWheel();
	}
}

function eventAPI(eventname, procname) {
	event(eventname, procname);
}

function event(eventname, procname) {
	
	var	theIndex = webtis.eventProcList.length;
	var	theProcName = procname;
	
	switch (eventname) {
		case 'leftdown':	theIndex = webtis.EV_LEFTDOWN; break;
		case 'leftup':		theIndex = webtis.EV_LEFTUP; break;
		case 'rightdown':	theIndex = webtis.EV_RIGHTDOWN; break;
		case 'rightup':		theIndex = webtis.EV_RIGHTUP; break;
		case 'dbclick':		theIndex = webtis.EV_DBCLICK; break;
		case 'move':		theIndex = webtis.EV_MOVE; break;
		case 'mapload':		theIndex = webtis.EV_MAPLOAD; break;
		case 'repaint':		theIndex = webtis.EV_REPAINT; break;
		case 'selection':	theIndex = webtis.EV_SELECTION; break;
		case 'mselection':	theIndex = webtis.EV_MSELECTION; break;
		default: return; break;
	}
	
	if ((theProcName != undefined ) && (theProcName != null) 
			&& (theProcName != '') && !theProcName.match(/^top\./)) {
		theProcName = 'top.' + theProcName;
	}
	
	if (theIndex < webtis.eventProcList.length) {
		webtis.eventProcList[theIndex] = theProcName;
	}
	
}

// -------------------------------------------------------------------
// オブジェクト操作関数
// -------------------------------------------------------------------

function queryRect(left, bottom, right, top ,layer) {
	var ret = [];
	var bounds = _transformToMercator(new OpenLayers.Bounds(left, bottom, right, top));
	var layers;
	if (layer) {
		layers = webtis.searchLayerInArray(layer, webtis.layers, true, true, true);
	} else {
		layers = webtis.layers;
	}
	for (var i=layers.length-1; i>=0; i--) {
		if (layers[i].JSGISelection && layers[i].features) {
			for (var j=layers[i].features.length-1; j>=0; j--) {
				var fea = layers[i].features[j];
				var gbounds = fea.geometry.getBounds();
				if (bounds.containsBounds(gbounds,true)) {
					ret.push(fea);
				}
			}
		}
	}
	return ret;	
}

function queryWindow(layer) {
	var bounds = _transformToWGS84(webtis.map.getExtent());
	return queryRect(bounds.left, bounds.bottom, bounds.right, bounds.top, layer);
}

function queryLayer(layer) {
	//var ret = new webtis.SelectionObject();
	var ret = [];
	var layers = webtis.searchLayerInArray(layer, webtis.layers, true, true, true);
	if (layers.length > 0) {
		for (var i=layers.length-1; i>=0; i--) {
			if (layers[i].features) {
				for (var j=layers[i].features.length-1; j>=0; j--) {
					ret.push(layers[i].features[j]);
				}
			}
		}
	}
	return ret;
}

function objLayer(obj) {
	for (var oi=webtis.layers.length-1; oi>=0; oi--) {
		var layer = webtis.layers[oi];
		for (var i=layer.features.length-1; i>=0; i--) {
			var feature = layer.features[i];
			if (feature.objid == obj) {
				var ret = layer.name;
				if (layer.styleName) {
					ret += "." + layer.styleName;
				}
				return ret;
			}
		}
	}
	return null;
}

function objGeometry(obj) {
	for (var oi=webtis.layers.length-1; oi>=0; oi--) {
		var layer = webtis.layers[oi];
		for (var i=layer.features.length-1; i>=0; i--) {
			var feature = layer.features[i];
			if (feature.objid == obj) {
				if (feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
					var r = _transformToWGS84(feature.geometry);
					return [r.x, r.y];
				} else if (feature.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString" || feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
					var r = _transformToWGS84(feature.geometry);
					var vertices = r.getVertices();
					var ret = [];
					for (var i = 0; i < vertices.length; i++) {
						ret.push(vertices[i].x);
						ret.push(vertices[i].y);
					}
					return ret;
				} else if (feature.geometry.CLASS_NAME == "webtis.Geometry.TextRectangle") {
					var point = feature.geometry.components[0];
					var r = _transformToWGS84(point);
					return [r.x, r.y];
				} else if (feature.geometry.CLASS_NAME == "webtis.Geometry.ImageRectangle") {
					var r = _transformToWGS84(feature.geometry);
					return [r.x, r.y];
				}
				return [];
			}
		}
	}
	return [];
}

function objRange(obj) {
	for (var oi=webtis.layers.length-1; oi>=0; oi--) {
		var layer = webtis.layers[oi];
		for (var i=layer.features.length-1; i>=0; i--) {
			var feature = layer.features[i];
			if (feature.objid == obj) {
				var bounds = _transformToWGS84(feature.geometry.getBounds());
				return [bounds.left, bounds.bottom, bounds.right, bounds.top];
			}
		}
	}
	return [];
}

function objFieldNames(obj) {
	var targetId;
	if (typeof obj == "object") {
		targetId = obj.objid;
	} else {
		targetId = obj; 
	}
	// obj == feature id番号
	// フィチャー検索
	for (var oi=webtis.layers.length-1; oi>=0; oi--) {
		var layer = webtis.layers[oi];
		for (var i=layer.features.length-1; i>=0; i--) {
			var feature = layer.features[i];
			if (feature.objid == targetId) {
				var ret = [];
				for (var key in feature.attributes) {
					if (key == "attr") {
						// attrは、展開する
						var attr = feature.attributes.attr;
						for (var z = 0; z < attr.length; z++) {
							if (!feature.attributes[attr[z].name]) {
								ret.push(attr[z].name);
							}
						}
					} else {
						ret.push(key);
					}
				}
				return ret;
			}
		}
	}
	return [];
}

function objFieldVal(obj, name) {
	// obj == feature id番号
	// フィチャー検索
	for (var oi=webtis.layers.length-1; oi>=0; oi--) {
		var layer = webtis.layers[oi];
		for (var i=layer.features.length-1; i>=0; i--) {
			var feature = layer.features[i];
			if (feature.objid == obj) {
				for (var key in feature.attributes) {
					if (key == name) {
						return feature.attributes[key];
					} else if (key == "attr") {
						// attrは、展開する
						var attr = feature.attributes.attr;
						for (var z = 0; z < attr.length; z++) {
							if (attr[z].name == name) {
								return attr[z].value;
							}
						}
					}
					
				}
			}
		}
	}
	return null;
}

function objType(obj) {
	for (var oi=webtis.layers.length-1; oi>=0; oi--) {
		var layer = webtis.layers[oi];
		for (var i=layer.features.length-1; i>=0; i--) {
			var feature = layer.features[i];
			if (feature.objid == obj) {
				var theType = layer.styleType;
				switch (theType) {
				case 'line':
					theType = 'string';
					break;
				case 'poly':
					theType = 'polygon';
					break;
				case 'circle':
				case 'disc':
					theType = 'circle';
					break;
				case 'symbol':
				case 'jsymbol':
					theType = 'symbol';
					break;
				case 'text':
					theType = 'text';
					break;
				case 'image':
				case 'bmp':
					theType = 'bmp';
					break;
				}
				return theType;
			}
		}
	}
	return '';
}

function objName(obj) {
	for (var oi=webtis.layers.length-1; oi>=0; oi--) {
		var layer = webtis.layers[oi];
		for (var i=layer.features.length-1; i>=0; i--) {
			var feature = layer.features[i];
			if (feature.objid == obj) {
				return feature.attributes["name"];
			}
		}
	}
	return null;
}

function objFromList(list) {
	var foundList = new Array();
	for (var oi=0; oi<webtis.layers.length; oi++) {
		var layer = webtis.layers[oi];
		for (var i=0; i<layer.features.length; i++) {
			var feature = layer.features[i];
			for (var j=0; j<list.length; j++) {
				var targetId;
				if (typeof list[j]=="object") {
					targetId = list[j].objid;
				} else {
					targetId = list[j];
				}
				if (feature.objid == targetId) {
					foundList[foundList.length] = feature;
					break;
				}
			}
		}
	}
	return foundList;
}

function changeSelection(olist, redraw) {
	if (!webtis.selectCtrl) {
		// レイヤ選択コントロール準備
		var selectableLayers = [];
		for (var i=0; i<webtis.layers.length; i++) {
			if (webtis.layers[i].CLASS_NAME.indexOf("Vector") > -1 && webtis.layers[i].JSGISelection) {
				selectableLayers.push(webtis.layers[i]);
			}
		}
		webtis.selectCtrl = new webtis.Control.SelectFeature(selectableLayers, {
			box : true
		});
	}
	clearSelection(redraw);
	var selist = olist;
	if (olist.constructor != Array) {
		selist = [olist];
	}
	var foundList = new Array();
	for (var oi=0; oi<webtis.layers.length; oi++) {
		var layer = webtis.layers[oi];
		if (layer.JSGISelection==false) {
			continue;
		}
		for (var i=0; i<layer.features.length; i++) {
			var feature = layer.features[i];
			for (var j=0; j<selist.length; j++) {
				var targetId;
				if (typeof selist[j]=="object") {
					targetId = selist[j].objid;
				} else {
					targetId = selist[j];
				}
				if (feature.objid == targetId) {
					foundList[foundList.length] = feature.objid;
					if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
						webtis.selectCtrl.select(feature);
						webtis.selectCtrl.highlight(feature);
						if (selist.length == 1) {
							webtis.callEventProc(webtis.EV_SELECTION, feature);
							return;
						}
					} else {
						webtis.selectCtrl.unselect(feature);
					}
					break;
				}
			}
		}
	}
	if (foundList.length > 1) {
		webtis.callEventProc(webtis.EV_MSELECTION, foundList);
	}
}

function appendSelection(olist, redraw) {
	if (!webtis.selectCtrl) {
		// レイヤ選択コントロール準備
		var selectableLayers = [];
		for (var i=0; i<webtis.layers.length; i++) {
			if (webtis.layers[i].CLASS_NAME.indexOf("Vector") > -1 && webtis.layers[i].JSGISelection) {
				selectableLayers.push(webtis.layers[i]);
			}
		}
		webtis.selectCtrl = new webtis.Control.SelectFeature(selectableLayers, {
			box : true
		});
	}
	var selist = olist;
	if (olist.constructor != Array) {
		selist = [olist];
	}
	var foundList = new Array();
	var exitsIds = selectionList();
	var checkList = new Array();
	// 重複していないかを確認
	for (var j = 0; j < selist.length; j++) {
		var targetId;
		if (typeof selist[j]=="object") {
			targetId = selist[j].objid;
		} else {
			targetId = selist[j];
		}
		var found = false;
		for (var i = 0; i < exitsIds.length; i++) {
			if (targetId == exitsIds[i]) {
				found = true;
				break;
			}
		}
		if (!found) {
			checkList.push(targetId);
		}
	}
	selist = checkList;
	for (var oi=0; oi<webtis.layers.length; oi++) {
		var layer = webtis.layers[oi];
		if (layer.JSGISelection==false) {
			continue;
		}
		for (var i=0; i<layer.features.length; i++) {
			var feature = layer.features[i];
			for (var j=0; j<selist.length; j++) {
				var targetId = selist[j];
				if (feature.objid == targetId) {
					foundList[foundList.length] = feature.objid;
					webtis.selectCtrl.select(feature);
					webtis.selectCtrl.highlight(feature);
					if (selist.length == 1) {
						// Appendでは、イベントは飛ばない
						// webtis.callEventProc(webtis.EV_SELECTION, feature);
						return;
					}
					break;
				}
			}
		}
	}
}

function clearSelection(redraw) {
	if (webtis.selectCtrl) {
		webtis.selectCtrl.unselectAll();
	}
}

function selectionNum() {
	var ret = 0;
	for (var oi=0; oi<webtis.layers.length; oi++) {
		var layer = webtis.layers[oi];
		if (layer.selectedFeatures) {
			ret += layer.selectedFeatures.length;
		}
	}
	return ret;
}

webtis._selectionList = function() {
	var ret = webtis.gSelectionObject;
	ret.resetFeatures();
	for (var oi=0; oi<webtis.layers.length; oi++) {
		var layer = webtis.layers[oi];
		ret.addFeatures(layer.selectedFeatures);
	}
	return ret;
};

function selectionList() {
	var ret = webtis._selectionList();
	var result = new Array();
	for (var i = 0; i < ret.list.length;i++) {
		result.push(ret.list[i].objid);
	}
	return result;
}

function selectionObj(index) {
	var reta = selectionList();
	var results = objFromList(reta);
	return results[index];
}

function deleteObject() {
	var deleted = [];
	for (var oi=0; oi<webtis.layers.length; oi++) {

		var layer = webtis.layers[oi];
		var curlayerdeleted = [];

		for (var j=0; j<layer.selectedFeatures.length; j++) {
			var feature = layer.selectedFeatures[j];
			if (feature.popup) {
				webtis.map.removePopup(feature.popup);
				feature.popup.destroy();
				feature.popup = null;
			}
			feature._layer = layer;
			curlayerdeleted.push(feature);
			deleted.push(feature);
		}

		for (var j=0; j<curlayerdeleted.length; j++) {
			if (!layer.forceUnselect(curlayerdeleted[j])) {
				if (webtis.selectCtrl) {
					webtis.selectCtrl.unselect(curlayerdeleted[j]);
				}
			}
		}

		layer.removeFeatures(curlayerdeleted);
	}
	webtis.operationHistory.add('del', deleted);
}

function cutClipbord() {
	var clipboardData = [];
	for (var oi=0; oi<webtis.layers.length; oi++) {

		var layer = webtis.layers[oi];
		var curlayerdeleted = [];

		for (var j=0; j<layer.selectedFeatures.length; j++) {
			var feature = layer.selectedFeatures[j];
			feature._layer = layer;
			clipboardData.push(feature);
			curlayerdeleted.push(feature);
		}

		for (var j=0; j<curlayerdeleted.length; j++) {
			if (!layer.forceUnselect(curlayerdeleted[j])) {
				webtis.selectCtrl.unselect(curlayerdeleted[j]);
			}
		}

		layer.removeFeatures(curlayerdeleted);
	}

	webtis.operationHistory.add('cut', clipboardData);
	webtis.clipboardData = clipboardData;
}

function copyClipbord() {
	var clipboardData = [];
	for (var oi=0; oi<webtis.layers.length; oi++) {
		var layer = webtis.layers[oi];
		for (var j=0; j<layer.selectedFeatures.length; j++) {
			var clone = layer.selectedFeatures[j].clone();
			clone._layer = layer;
			clipboardData.push(clone);
		}
	}
	webtis.clipboardData = clipboardData;
}

function pastClipbord() {
	clearSelection();
	if (webtis.clipboardData) {
		if (webtis.clipboardData.length > 0) {
			var pastedObj = [];
			for (var i=0; i<webtis.clipboardData.length; i++) {
				var clipedFeature = webtis.clipboardData[i];
				var layer = webtis.map.getLayer(clipedFeature._layer.id);				
				if (layer) {
					var newFeature = clipedFeature.clone();
					layer.addFeatures(newFeature);
					pastedObj.push(newFeature);
				}
			}
			if (pastedObj.length > 0) {
				webtis.operationHistory.add('paste', pastedObj);
			}
		}
	}
	// webtis.clipboardData = null;
}

function undoEdit() {
	webtis.operationHistory.undo();
};

function redoEdit() {
	webtis.operationHistory.redo();
};

// -------------------------------------------------------------------
// 揮発レイヤ関連関数
// -------------------------------------------------------------------

function draw_xyunit(unit) {
	webtis.currentDrawUnit = unit;
	if (!webtis.currentVolatileLayer || webtis.currentVolatileLayer.name.substr(0, 4) == "_def")
		webtis.currentVolatileLayer = webtis.volatileLayers["_defvola_" + webtis.currentDrawUnit];
};

function draw_group(groupname) {
	if (!groupname) {
		webtis.currentVolatileGroupName = null;
	} else {
		webtis.currentVolatileGroupName = groupname;
	}
	
}

function draw_level(unit) {
	if (!webtis.currentVolatileLayer) return;
	webtis.currentVolatileLayer.setDisplayLevel(unit);
}

function draw_width(width) {
	if (!webtis.currentVolatileLayer) return;
	webtis.currentVolatileLayer.style.strokeWidth = width;
}

function draw_color(r, g, b) {
	if (!webtis.currentVolatileLayer) return;
	webtis.currentVolatileLayer.style.strokeColor = webtis.Format.Parse.RGBToHexaColor(r, g, b);
}

function draw_color2(r, g, b) {
	if (!webtis.currentVolatileLayer) return;
	webtis.currentVolatileLayer.style.fill = true;
	webtis.currentVolatileLayer.style.fillColor = webtis.Format.Parse.RGBToHexaColor(r, g, b);
}

webtis.drawCircleInternal = function(cx, cy, r, fill) {
	if (!webtis.currentVolatileLayer) return;
	
	var style = OpenLayers.Util.extend({}, webtis.currentVolatileLayer.style);
	var geometry = new OpenLayers.Geometry.Point(cx, cy);
	if (webtis.currentDrawUnit != "screen") {
		geometry = _transformToMercator(geometry);
	}
	var pointFeature = null;
	if (fill && !style.fill) {
		style.fill = true;
	} else {
		style.fill = fill;
	}
	if (webtis.currentVolatileLayer == webtis.volatileLayers["_defvola_screen"]) {
		// ピクセル
		style.pointRadius = r;
		pointFeature = new webtis.Feature.Vector(geometry, null, style);
	} else {
		style = new OpenLayers.Style({
			'stroke' : style.stroke,
			'strokeColor' : style.strokeColor,
			'strokeOpacity' : style.strokeOpacity,
			'strokeWidth' : style.strokeWidth,
			'fillOpacity' : style.fillOpacity,
			'fillColor' : style.fillColor,
			'fill' : style.fill,
			'pointRadius' : "${getRadius}",
			'JSGIDynamicSize' : true
		}, {
			context : {
				getRadius : function(feature) {
					return Math.round(webtis.Format.Parse.metersToPixel(feature.layer.map, feature.radius));
				}
			}
		});
		pointFeature = new webtis.Feature.Vector(geometry, null, style);
		pointFeature.radius = r;
		pointFeature.radiusUnit = "meter";
	}

	if (webtis.currentVolatileGroupName) {
		pointFeature.groupName = webtis.currentVolatileGroupName;
	}
	webtis.currentVolatileLayer.addFeatures(pointFeature);
};

function draw_circle(cx, cy, r) {
	webtis.drawCircleInternal(cx, cy, r, false);
}

function draw_disc(cx, cy, r) {
	webtis.drawCircleInternal(cx, cy, r, true);
}

webtis.convertPointListToArrayOfPoints = function(pointList) {
	var points = [];
	if (typeof pointList[0] == 'string' && pointList[0].indexOf(' ') > -1) {
		for (var i=0; i<pointList.length; i++) {
			var coords = pointList[i].split(" ");
			points.push(new OpenLayers.Geometry.Point(parseFloat(coords[0]), parseFloat(coords[1])));
		}
	} else {
		for (var i=0; i<(pointList.length-1); i=i+2) {
			points.push(new OpenLayers.Geometry.Point(pointList[i], pointList[i+1]));
		}
	}
	return points;
};

function draw_line(pointList) {
	if (!webtis.currentVolatileLayer) return;
	if (!pointList.length) return;
	
	var style = OpenLayers.Util.extend({}, webtis.currentVolatileLayer.style);
	var points = webtis.convertPointListToArrayOfPoints(pointList);
	var geometry = new OpenLayers.Geometry.LineString(points);
	if (webtis.currentDrawUnit != "screen") {
		geometry = _transformToMercator(geometry);
	}
	var lineFeature = new webtis.Feature.Vector(
			geometry, 
			null, style);
	if (webtis.currentVolatileGroupName) {
		lineFeature.groupName = webtis.currentVolatileGroupName;
	}
	webtis.currentVolatileLayer.addFeatures(lineFeature);
}

function draw_poly(pointList) {
	if (!webtis.currentVolatileLayer) return;
	if (!pointList.length) return;
	
	var style = OpenLayers.Util.extend({}, webtis.currentVolatileLayer.style);
	var points = webtis.convertPointListToArrayOfPoints(pointList);
	var geometry = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(points)]);
	if (webtis.currentDrawUnit != "screen") {
		geometry = _transformToMercator(geometry);
	}
	var polygonFeature = new webtis.Feature.Vector(
			geometry, 
			null, style);
	if (webtis.currentVolatileGroupName) {
		polygonFeature.groupName = webtis.currentVolatileGroupName;
	}
	webtis.currentVolatileLayer.addFeatures(polygonFeature);
}

function draw_symbol(url, size, x, y) {
	if (!webtis.currentVolatileLayer) return;
	
	var nsize;
	if (typeof size == 'string') {
		nsize = parseInt(size);
	} else {
		nsize = size;
	}
	
	var style = {
		'externalGraphic' : url,
		'graphicWidth': nsize,
		'graphicHeight': nsize,
		'graphicXOffset': -(nsize/2),
		'graphicYOffset': -(nsize/2)
	};
	
	var geometry = new OpenLayers.Geometry.Point(x, y);
	if (webtis.currentDrawUnit != "screen") {
		geometry = _transformToMercator(geometry);
	}
	var pointFeature = new webtis.Feature.Vector(geometry, null, style);
	if (webtis.currentVolatileGroupName) {
		pointFeature.groupName = webtis.currentVolatileGroupName;
	}
	webtis.currentVolatileLayer.addFeatures(pointFeature);
}

function draw_text(font, textStyle, size, origin, text, x, y) {
	if (!webtis.currentVolatileLayer) return;
	
	var style = OpenLayers.Util.extend({}, webtis.currentVolatileLayer.style);
	
	style.label = text;
	style.fontColor = style.strokeColor;
	style.fontFamily = font;
	style.fontWeight = webtis.Format.Parse.mapTextStyle(textStyle);
	style.fontSize = size + "px";
	
	style.labelAlign = webtis.Format.Parse.mapTextAlignment(origin);
	style.pointRadius = 0;
	
	var geometry = new OpenLayers.Geometry.Point(x, y);
	if (webtis.currentDrawUnit != "screen") {
		geometry = _transformToMercator(geometry);
	}
	var pointFeature = new webtis.Feature.Vector(geometry, null, style);
	if (webtis.currentVolatileGroupName) {
		pointFeature.groupName = webtis.currentVolatileGroupName;
	}
	webtis.currentVolatileLayer.addFeatures(pointFeature);
}

function draw_display(group, onoff) {
	webtis.currentVolatileLayer.setGroupVisibility(group, onoff == 0 ? false : true);
	webtis.currentVolatileLayer.redraw();
}

function draw_remove(group) {
	webtis.currentVolatileLayer.removeGroup(group);
	webtis.currentVolatileLayer.redraw();
}


// -------------------------------------------------------------------
// プラグイン関連関数
// -------------------------------------------------------------------

function PluginVersion() {
	return "4.0";
}

function testplugin() {
	return false;
}

//-------------------------------------------------------------------
// 背景地図関連関数
//-------------------------------------------------------------------

function Change25k(mapid) {
	if (webtis.map.baseLayer) {
		var curDataSet = webtis.map.baseLayer.getDataSet();
		var newDataSet = {};
		newDataSet = OpenLayers.Util.extend(newDataSet,curDataSet);
		newDataSet = OpenLayers.Util.extend(newDataSet,
				{
					17 : {
						dataId : "DJBMO"
					},
					18 : {
						dataId : "DJBMO"
					},
					19 : {
						dataId : "DJBMO"
					}
				}
			);
		webtis.map.baseLayer.setDataSet(newDataSet);
	}
}

function ChangeRasterMap(map_kind) {
	// 削除されました。
}

function SelectFramework(mapid) {
	if (webtis.map.baseLayer) {
		if (mapid == "Mixed_L") {
			webtis.map.baseLayer.setDataSet(webtis.map.baseLayer.getDefaultDataSet());
			return;
		}
		var curDataSet = webtis.map.baseLayer.getDataSet();
		var newDataSet = {};
		newDataSet = OpenLayers.Util.extend(newDataSet,curDataSet);
		newDataSet = OpenLayers.Util.extend(newDataSet,
				{
					17 : {
						dataId : "DJBMO"
					},
					18 : {
						dataId : "DJBMO"
					},
					19 : {
						dataId : "DJBMO"
					}
				}
			);
		webtis.map.baseLayer.setDataSet(newDataSet);
	}
}

function toOrtho(mapid) {
	if (webtis.map.baseLayer) {
		if (!mapid) {
			webtis.map.baseLayer.setDataSet(webtis.map.baseLayer.getDefaultDataSet());
			return ;
		}
		var curDataSet = webtis.map.baseLayer.getDataSet();
		var newDataSet = {};
		newDataSet = OpenLayers.Util.extend(newDataSet,curDataSet);
		var applyDataSet = null;
		// window.console.log(mapid);
		if (mapid == "ORT_L") {
			applyDataSet = {
				12 : {
					dataId : "NLII"
				},
				13 : {
					dataId : "NLII"
				},
				14 : {
					dataId : "NLII"
				},
				15 : {
					dataId : "NLII"
				},
				16 : {
					dataId : "DJBMO"
				},
				17 : {
					dataId : "DJBMO"
				},
				18 : {
					dataId : "DJBMO"
				},
				19 : {
					dataId : "DJBMO"
				}
			};
		}
		if (applyDataSet) {
			newDataSet = OpenLayers.Util.extend(newDataSet,applyDataSet);
		}
		webtis.map.baseLayer.setDataSet(newDataSet);
	}
}

function fitMap() {
	if (webtis.fitMapTimerId != 0) {
		clearTimeout(webtis.fitMapTimerId);
	}
	webtis.fitMapTimerId = setTimeout(webtis.onMapResize, 400);
}

function fixURL( pURL ) {
	if ( pURL.match( /^https?:/ ) ) {
		return pURL;
	}
	
	var	theDomain = document.domain;
	var	thePath = location.href;
	var	theURL = pURL;
	var	theTop = thePath.replace( /^(.+?:\/\/.+?)(\/.+)$/, '$1' );
	var	theMid;
	var	theTempURL;
	
	if ( pURL.match( /^\// ) ) {
		theURL = theTop + pURL;
		return theURL;
	}
	
	thePath = thePath.replace( /^(.+?)\?(.*)$/, '$1' );
	thePath = thePath.replace( /\/[^\/]*$/, '\/' );
	
	if ( pURL.match( /^\.\// ) ) {
		theURL = thePath + pURL.replace( /^\.\//, '' );
	} else if ( pURL.match( /^\.\.\// ) ) {
		theMid = thePath.replace( theTop + '/', '' );
		theTempURL = pURL;
		while ( theTempURL.match( /^\.\.\// ) ) {
			theMid = theMid.replace( /[^\/]+\/$/, '' );
			theTempURL = theTempURL.replace( /^\.\.\//, '' );
		}
		theURL = theTop + '/' + theMid + theTempURL;
	} else {
		theURL = thePath + pURL;
	}
	
	return theURL;
};
//API初期化
webtis._createWebtisObject();
document.close();
