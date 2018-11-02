/** 地名検索用 JQueryプラグイン実装 **/
var ChimeiSearch = {};
ChimeiSearch.SERVER_ROOT = "http://search.cyberjapan.jp/cs4/cs/";

(function(){
jQuery.fn.ChimeiSearch = function(config) {
	this.config = config;
	if (this.config.mapEventHandler) {
		// 地名検索で行われた処理に対しての委譲先
		this.mapEventHandler = this.config.mapEventHandler;
	}
	this.append($("\
			<div id=\"cs_main\" class=\"ui-widget-content ui-corner-all\">\
				<h2 class=\"ui-widget-header ui-corner-all\">地名を検索</h2>\
				<div class=\"cs_block\">\
					<span class=\"cs_label\">地名</span> : <input type=\"text\" id=\"cs_chimei_text\" name=\"\" value=\"\" style=\"width:170px;\">\
				</div>\
				<div class=\"cs_block\">\
					<span class=\"cs_label\">範囲指定</span>\
					<ul id=\"cs_area_types\">\
						<li><table><tr><td><input type=\"radio\" name=\"cs_area_type\" value=\"none\" checked></td><td>&nbsp;指定なし</td></tr></table></li>\
						<li><table><tr><td><input type=\"radio\" name=\"cs_area_type\" value=\"map\"></td><td>&nbsp;地図上に指定した範囲(面)</td></tr></table></li>\
						<li>\
							<table>\
								<tr>\
									<td><input type=\"radio\" name=\"cs_area_type\" value=\"layer\"></td>\
									<td>&nbsp;都道府県</td>\
									<td><select id=\"cs_area_layers\" style=\"width:150px;\"></select></td>\
								</tr>\
								<tr>\
									<td>&nbsp;</td>\
									<td>&nbsp;市区町村</td>\
									<td><select id=\"cs_area_objects\" style=\"width:150px;\"></select></t>\
								</tr>\
							</table>\
						</li>\
					</ul>\
				</div>\
				<div class=\"cs_block\">\
					<span class=\"cs_label\">検索対象</span>\
					<ul id=\"cs_target_layers\">\
					</ul>\
				</div>\
				<div class=\"cs_block\">\
					<span class=\"cs_label\">一致方法</span><br>\
					<div id=\"cs_condition\">\
						<table>\
							<tr>\
								<td><input type=\"radio\" name=\"cs_logical_condition\" value=\"AND\" checked >AND </td>\
								<td><input type=\"radio\" name=\"cs_logical_condition\" value=\"OR\" >OR </td>\
								<td>&nbsp;</td>\
							</tr>\
							<tr>\
								<td><input type=\"radio\" name=\"cs_textmatch_condition\" value=\"PARTIAL\" checked >部分一致 </td>\
								<td><input type=\"radio\" name=\"cs_textmatch_condition\" value=\"PREFIX\" >前方一致 </td>\
								<td><input type=\"radio\" name=\"cs_textmatch_condition\" value=\"EXACT\" >完全一致 </td>\
							</tr>\
						</table>\
					</div>\
				</div>\
				<div class=\"cs_block\">\
					<div id=\"cs_buttons\">\
						<button id=\"cs_search_button\">検索</button>&nbsp;<button id=\"cs_clear_button\">クリア</button>\
					</div>\
				</div>\
				<div class=\"cs_block\">\
					<div id=\"cs_result_block\" >\
						<span>検索結果表示欄</span>\
						<div id=\"cs_result\">\
						</div>\
					</div>\
				</div>\
			</div>\
	"));
	
	
	// プラグインにメソッドを追加
	this.loadLayerList = $.proxy(loadLayerList,this);
	this.loadAreaObjectList = $.proxy(loadAreaObjectList,this);
	this.searchChimei = $.proxy(searchChimei,this);
	this.executeSearch = $.proxy(executeSearch,this);
	
	this.clickResult = $.proxy(clickResult,this);
	
	// サーバからレイヤリストを取得
	this.loadLayerList();

	// テキストボックスでエンターキーを押すと、検索を実行
	$("#cs_chimei_text").keypress($.proxy(function(e) {
		if (e.which == 13) {
			this.executeSearch();
		}
	},this));
	// エリアレイヤを変更したときに、オブジェクトを再読み込み
	var areaLayersElement = this.find("#cs_area_layers");
	areaLayersElement.change(
		$.proxy(function(event) {
			var areaLayerId = event.target.options[event.target.selectedIndex].value;
			var areaObjectsElement = this.find("#cs_area_objects");
			if (areaLayerId != "") {
				areaObjectsElement[0].disabled = true;
				this.loadAreaObjectList(areaLayerId);
			} else {
				// 消します
				areaObjectsElement.empty();
			}
		},this)
	);

	// エリアレイヤを変更したときに、オブジェクトを再読み込み
	var areaObjectsElement = this.find("#cs_area_objects");
	areaObjectsElement.change(
		$.proxy(function(event) {
			// 地図を移動
			var areaObjectId = event.target.options[event.target.selectedIndex].value;
			if (areaObjectId!=null && areaObjectId.charAt(0)=="@") {
				return;
			}
			var geom = this.currentAreaObjects[areaObjectId];
			this.mapEventHandler.areaChanged(geom.clone());			
		},this)
	);

	
	// エリアタイプボタン
	this.find('input[name="cs_area_type"]:radio').change(
		$.proxy(function(event) {
			if (event.target.checked && $(event.target).val() == "map") {
				this.mapEventHandler.startDrawArea();
			} else {
				this.mapEventHandler.stopDrawArea();
			}
		},this)
	);
	
	// 検索ボタン
	var searchButtonElement = this.find("#cs_search_button");
	searchButtonElement.click(
		$.proxy(function(event) {
			this.executeSearch();
		},this)
	);
	
	// クリアボタン
	var clearButtonElement = this.find("#cs_clear_button");
	clearButtonElement.click(
		$.proxy(function(event) {
			var searchButtonElement = this.find("#cs_search_button")[0];
			searchButtonElement.disabled = false;
			// 検索結果の消去
			var resultElement = this.find("#cs_result");
			resultElement.empty();
			
			// 検索条件のリセット
			this.find("#cs_chimei_text").val("");
			this.find('input[name="cs_area_type"]').val(["none"]);
			this.find('input[name="cs_logical_condition"]').val(["AND"]);
			this.find('input[name="cs_textmatch_condition"]').val(["PARTIAL"]);
			
			this.find("#cs_area_layers").val([""]);
			var areaObjectsElement = this.find("#cs_area_objects");
			areaObjectsElement.empty();
			var targetLayers = this.find("input[name='cs_target_layer']");
			for (var i = 0; i < targetLayers.length; i++) {
				targetLayers[i].checked = (i == 0);
			}
			// 
			this.mapEventHandler.stopDrawArea();

		},this)
	);
	
	//********* 関数 *************//
	function executeSearch() {
		var resultElement = this.find("#cs_result");
		// 検索結果の消去
		resultElement.empty();

		var parameter = {
		};

		// 地名
		var chimeiTextElement = this.find("#cs_chimei_text")[0];
		var chimeiText = chimeiTextElement.value.replace(/^\s+|\s+$/g, "");
		if (!chimeiText) {
			resultElement.append($("<div style='padding:10px;text-align:center;color:red;'>地名を入力してください</div>"));
			return;
		}
		parameter['q'] = chimeiText;
		// 範囲指定
		var areaType = $('input[name="cs_area_type"]:checked').val();
		if (areaType == "map") {
			// 描画モードの場合、形状を取得
			var areaWKT = this.mapEventHandler.getDrawArea();
			if (areaWKT == null || areaWKT.length == 0) {
				resultElement.append($("<div style='padding:10px;text-align:center;color:red;'>範囲が描画されていません。</div>"));
				return;
			}
			parameter['awkt'] = areaWKT;
		} else if (areaType == "layer") {
			// 選択されているレイヤーとObjetIDから
			var areaLayer = this.find('#cs_area_layers option:selected').val();
			if (areaLayer == "") {
				resultElement.append($("<div style='padding:10px;text-align:center;color:red;'>都道府県が選択されていません。</div>"));
				return;
			}
			var areaObject = this.find('#cs_area_objects option:selected').val();
			if (areaObject == "") {
				resultElement.append($("<div style='padding:10px;text-align:center;color:red;'>範囲が選択されていません。</div>"));
				return;
			}
			parameter['al'] = areaLayer;
			parameter['alid'] = areaObject;
		}
		// 検索対象
		var targetLayers = this.find("input[name='cs_target_layer']:checked");
		if (targetLayers.length == 0) {
			resultElement.append($("<div style='padding:10px;text-align:center;color:red;'>検索対象を選択してください</div>"));
			return;
		}
		var tl = targetLayers[0].value;
		for (var i = 1; i < targetLayers.length; i++) {
			tl += "|"+ targetLayers[i].value;
		} 
		parameter['tl'] = tl;
		// 一致方法
		var logicalCondition = this.find("input[name='cs_logical_condition']:checked").val();
		var textMatchCondition = this.find("input[name='cs_textmatch_condition']:checked").val();
		parameter['qt'] = logicalCondition+"|"+textMatchCondition;
		
		$("#cs_search_button")[0].disabled = true;

		// 検索開始
		resultElement.append($("<div style='padding:10px;text-align:center;color:red;'>検索中</div>"));
		this.searchChimei(parameter);	
		
	}
	function clickResult(event) {
		if (this.mapEventHandler) {
			// 行がクリックされたときの処理を委譲
			var featureIndex = $(event.currentTarget).attr("_feature_index");			
			var feature = this.currentResults.features[featureIndex];			
			this.mapEventHandler.resultSelected(
					feature,this
			);
		}
	}
	
	function escapeHTML(val) {
       	 return $('<div>').text(val).html();
	}
	
	/**
	 * 地名検索を実行します。
	 */
	function searchChimei(parameter) {
		parameter["f"] = "GeoJSON";
		parameter["r"] = 10;
		$.ajax({
			type: "GET",
			url:	ChimeiSearch.SERVER_ROOT+"chimei_search",
			data: parameter,
			dataType: "jsonp",
			success: $.proxy(function(data,status) {
				var searchButtonElement = this.find("#cs_search_button")[0];
				searchButtonElement.disabled = false;
				if (data.error) {
					if (window.console) {
						window.console.log("Error:"+data.error);
					}
					return;
				}
				var resultElement = this.find("#cs_result");
				
				resultElement.empty();
				var OpenLayers = this.mapEventHandler.getOpenLayers();
				var geojson_format = new OpenLayers.Format.GeoJSON();
				var features = geojson_format.read(data.result);
				
				var totalCounts = data.total;
				resultElement.append("<div style='padding:5px;color:green;'>検索結果:"+totalCounts+"件</div>");
				if (features.length == 0) {
					resultElement.append($("<div style='padding:10px;color:red;'></div>").append("「"+escapeHTML(parameter.q)+"」は見つかりませんでした。"));					
				} else {
					var results = $("<div></div>");
					resultElement.append(results);
					for (var i = 0; i < features.length; i++) {
						var feature = features[i];
						var line ="<a href='javascript:void(0);' class='cs_result_line'>";
						line += escapeHTML(feature.data.title+"("+feature.data.address+")");
						line += "</a>";
						// 検索結果を行にマッピング
						var lineObj = $(line);
						lineObj.fff = feature;
						lineObj.attr({"_feature_index":i});
						lineObj.click(this.clickResult);
						results.append(lineObj);
					}
				}
				// ページ処理
				// 表示中のページ番号
				if (!parameter.pnum) {
					parameter.pnum = 0;
				}
				// 総ページ数
				var totalPages = parseInt(totalCounts / parameter.r);
				totalPages += (totalCounts % parameter.r)>0?1:0;
				// window.console.log("totalPages="+totalPages);
				var withPrev = true;
				var withNext = true;
				var controlElement = $("<div style='padding:10px;'></div>");
				if (parameter.pnum == 0 || totalPages == 1) {
					withPrev = false;
				}
				if ((parameter.pnum + 1)>=totalPages) {
					withNext = false;
				}
				if (withPrev) {
					controlElement.append("<button id='cs_prev'>前へ</button>");
				}
				if (withNext) {
					controlElement.append("<button id='cs_next'>次へ</button>");
				}
				controlElement.find("#cs_prev").click($.proxy(function(){
					parameter.pnum -= 1;
					this.searchChimei(parameter);
				},this));
				controlElement.find("#cs_next").click($.proxy(function(){
					parameter.pnum += 1;
					this.searchChimei(parameter);
				},this));
				resultElement.append(controlElement);
				var results = {
					parameter:parameter,
					totalCounts:totalCounts,
					features:features
				};
				this.currentResults = results;
			},this)
		});
	}
	/**
	 * 地名検索で使用できるレイヤーの一覧を取得します。
	 */
	function loadLayerList() {
		$.ajax({
			type: "GET",
			url:	ChimeiSearch.SERVER_ROOT+"layer_list",
			data: {
				"f" : "JSON"
			},
			dataType: "jsonp",
			success: $.proxy(function(data,status) {
				if (data.error) {
					alert("検索範囲を取得出来ませんでした。");
					if (window.console) {
						window.console.log("Error:"+data.error);
					}
					return;
				} 
				// コンボボックスに格納
				var areaLayersElement = this.find("#cs_area_layers");
				areaLayersElement.empty();
				var targetLayersElement = this.find("#cs_target_layers");
				targetLayersElement.empty();
				//var firstAreaLayerId = null;
				
				var optStr = "<option value=''>未選択</option>";
				areaLayersElement.append($(optStr));
				for (var i = 0; i < data.area_layers.length;i++) {
					optStr = "<option value='"+data.area_layers[i].id+"'>"+data.area_layers[i].title+"</option>";
					areaLayersElement.append($(optStr));
				}
				for (var i = 0; i < data.target_layers.length;i++) {
					var liStr = "<li style=\"border:1px solid white;margin:0px;\"><label><table><tr><td><input type=\"checkbox\" name=\"cs_target_layer\" ";
					liStr += "value=\""+data.target_layers[i].id+"\" ";
					if (i == 0) {
						liStr += "checked";
					}
					liStr += "></td><td>&nbsp;";
					liStr += data.target_layers[i].title;
					liStr += "</td></tr></table></label></li>";
					targetLayersElement.append($(liStr));
				}
				// 初回は、選択されているレイヤーのオブジェクトを取得
				// this.loadAreaObjectList(firstAreaLayerId);
			},this)
		});
	}

	/**
	 * 地名検索で使用するレイヤーオブジェクトの一覧を取得します。
	 */
	function loadAreaObjectList(areaLayerId) {
		if (areaLayerId) {
			$.ajax({
				type: "GET",
				url:	ChimeiSearch.SERVER_ROOT+"area_list",
				data: {
					"f" : "GeoJSON",
					"al" : areaLayerId
				},
				dataType: "jsonp",
				success: $.proxy(function(data,status) {
					// コンボボックスに格納
					var areaObjectsElement = this.find("#cs_area_objects");
					areaObjectsElement.empty();
					if (data.error) {
						areaObjectsElement[0].disabled = false;
						alert("検索対象を取得出来ませんでした。");
						if (window.console) {
							window.console.log("Error:"+data.error);
						}
						return;
					} 
					var features = data.result.features;
					// areaLayerIdの後ろ2文字は、lgcodeとします。
					// ハーコーディングです。
					var lgcode = areaLayerId.substring(areaLayerId.length - 2);
					var optStr = "<option value='@lgcode:"+lgcode+"*'>未選択</option>";
					areaObjectsElement.append($(optStr));
					var extents = [];
					var OpenLayers = this.mapEventHandler.getOpenLayers();
					var geojson_format = new OpenLayers.Format.GeoJSON();

					for (var i = 0; i < features.length; i++) {
						optStr = "<option value='";
						optStr += features[i].properties.geom_id;
						optStr += "'>";
						optStr += features[i].properties.title;
						optStr +="</option>";
						areaObjectsElement.append($(optStr));
						// geom_idをキーにして、矩形を保存
						var geom = geojson_format.parseGeometry(features[i].geometry);
						extents[features[i].properties.geom_id] = geom;
					}
					this.currentAreaObjects = extents;
					areaObjectsElement[0].disabled = false;
				},this)
			});
		} else {
			// コンボボックスに格納
			var areaObjectsElement = this.find("#cs_area_objects");
			areaObjectsElement.empty();
		}
	}
};
})(jQuery);

/** OpenLayersのクラスの簡易版 **/
ChimeiSearch.Class = function() {
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
        ChimeiSearch.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};

ChimeiSearch.extend = function(destination, source) {
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


// -------------- DefaultHandler
// -- Denshikokudoで使用するときのハンドラー
ChimeiSearch.DefaultHandler = ChimeiSearch.Class({
	initialize: function(config) {
		this.mapObj = config.mapObj;
	},
	// 初期化
	initHandler : function() {
		// 描画用のレイヤを用意
		var webtis = this.getWebtis();
		var OpenLayers = this.getOpenLayers();
		// OpenLayersのMapオブジェクトを取り出して、描画を行います。
		this.layer = new webtis.Layer.Vector("temp");
		webtis.map.addLayer(this.layer);						
		this.drawControl = new OpenLayers.Control.DrawFeature(this.layer, webtis.Handler.Polygon);
		this.drawControl.featureAdded = $.proxy(function(newFeature) {
			// 選択用の範囲オブジェクトは、一つだけ。
			for (var i = 0; i < this.layer.features.length; i++) {
				if (newFeature != this.layer.features[i]) {
					this.layer.removeFeatures(this.layer.features[i]);
				}
			}
			if (newFeature.geometry.components[0].components.length <= 3) {
				this.layer.removeFeatures(newFeature);
				return;
			}

		},this);
	},
	getWebtis: function() {
		if (this.mapObj.webtis) {
			return this.mapObj.webtis;
		}
		return this.mapObj.maplt.webtis;
	},
	getOpenLayers: function() {
		if (this.mapObj.OpenLayers) {
			return this.mapObj.OpenLayers;
		}
		return this.mapObj.maplt.OpenLayers;
	},
	getProjection : function() {
		if (!this.projection) {
			var OpenLayers = this.getOpenLayers();
			this.projection = new OpenLayers.Projection("EPSG:4326");
		}
		return this.projection;
	},	
	// 検索結果を選択したときの処理
	resultSelected : function (feature,csSearch) {
		var point = feature.geometry.getCentroid();
		this.mapObj.setMapCenter(point.x,point.y,9000);
	},
	// 地図上でエリアを描画を開始するときの処理
	startDrawArea : function () {
		if (this.layer == null) {
			this.initHandler();
		}
		var webtis = this.getWebtis();
		webtis.map.addControl(this.drawControl);
		webtis.activeCtrl.deactivate();
		this.drawControl.activate();					
	},
	// 地図上でエリアを描画を終了するときの処理
	stopDrawArea : function () {
		if (this.layer == null) {
			this.initHandler();
		}
		var webtis = this.getWebtis();
		webtis.map.removeControl(this.drawControl);
		this.layer.removeAllFeatures();
		this.drawControl.deactivate();
		webtis.activeCtrl.activate();
	},
	// 描画した形状を取得
	getDrawArea :  function() {
		if (this.layer == null) {
			this.initHandler();
		}
		if (this.layer.features.length == 0) {
			// 描画した範囲は、存在しません。
			return null;
		}
		// WKTでかえします。
		var webtis = this.getWebtis();
		var a = this.layer.features[0].geometry.clone().transform(webtis.map.getProjectionObject(),this.getProjection());
		return a.toString();
	},
	// エリアが選択されたときに呼び出されます。
	areaChanged : function(geom) {
		var webtis = this.getWebtis();
		var a = geom.getBounds().transform(this.getProjection(),webtis.map.getProjectionObject());
		webtis.map.zoomToExtent(a);
	}
	
});

//-- OpenLayersのハンドラ
ChimeiSearch.OpenLayersDefaultHandler = ChimeiSearch.Class({
	initialize: function(config) {
		this.mapObj = config.mapObj;
		if (config.webtis) {
			this.webtis = config.webtis;
		}
		if (config.OpenLayers) {
			this.OpenLayers = config.OpenLayers;
		}
	},
	// 初期化
	initHandler : function() {
		// 描画用のレイヤを用意
		// OpenLayersのMapオブジェクトを取り出して、描画を行います。
		var OpenLayers = this.getOpenLayers();
		this.layer = new OpenLayers.Layer.Vector("temp");
		this.mapObj.addLayer(this.layer);							
		this.drawControl = new OpenLayers.Control.DrawFeature(this.layer, OpenLayers.Handler.Polygon);
		this.drawControl.featureAdded = $.proxy(function(newFeature) {
			// 選択用の範囲オブジェクトは、一つだけ。
			for (var i = 0; i < this.layer.features.length; i++) {
				if (newFeature != this.layer.features[i]) {
					this.layer.removeFeatures(this.layer.features[i]);
				}
			}
			if (newFeature.geometry.components[0].components.length <= 3) {
				this.layer.removeFeatures(newFeature);
				return;
			}
		},this);
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
	},
	getProjection : function() {
		if (!this.projection) {
			var OpenLayers = this.getOpenLayers();
			this.projection = new OpenLayers.Projection("EPSG:4326");
		}
		return this.projection;
	},
	// 検索結果を選択したときの処理
	resultSelected : function (feature,csSearch) {
		var point = feature.geometry.getCentroid();
		// 地図の投影法に合わせる
		var a = point.transform(this.getProjection(),this.mapObj.getProjectionObject());
		var OpenLayers = this.getOpenLayers();
		var zoomLevel = this.mapObj.getNumZoomLevels()-4;
		if (zoomLevel < 0) {
			zoomLevel = this.mapObj.getNumZoomLevels()-1;
		}
		this.mapObj.setCenter(new OpenLayers.LonLat(a.x,a.y),zoomLevel);
	},
	// 地図上でエリアを描画を開始するときの処理
	startDrawArea : function () {
		if (this.layer == null) {
			this.initHandler();
		}
		this.mapObj.addControl(this.drawControl);
		this.drawControl.activate();					
	},
	// 地図上でエリアを描画を終了するときの処理
	stopDrawArea : function () {
		if (this.layer == null) {
			this.initHandler();
		}
		this.mapObj.removeControl(this.drawControl);
		this.layer.removeAllFeatures();
		this.drawControl.deactivate();
	},
	// 描画した形状を取得
	getDrawArea :  function() {
		if (this.layer == null) {
			this.initHandler();
		}
		if (this.layer.features.length == 0) {
			// 描画した範囲は、存在しません。
			return null;
		}
		// WKTでかえします。
		var a = this.layer.features[0].geometry.clone().transform(this.mapObj.getProjectionObject(), this.getProjection());
		return a.toString();
	},
	// エリアが選択されたときに呼び出されます。
	areaChanged : function(geom) {
		var transGeom = geom.transform(this.getProjection(),this.mapObj.getProjectionObject());
		this.mapObj.zoomToExtent(transGeom.getBounds());
		
	}
});
