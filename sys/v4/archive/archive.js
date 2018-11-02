/** アーカイブコントロール用 JQueryプラグイン実装 **/
var ArchiveMapControl = {};

jQuery.fn.ArchiveMapControl = function(config) {
	var that = this;
	that.config = config;
	
	// スライダー操作で行われた処理に対しての委譲先
	that.mapEventHandler = that.config.mapEventHandler;
	that.sliderStep = that.config.sliderStep?that.config.sliderStep:1;
	
	// スライダー操作を行う、データ
	that.targetData = that.config.targetData;
	that.append($("\
			<div style=\"padding:5px;\" class=\"ui-widget-content ui-corner-all\"><table style=\"width:100%;\">\
				<tr>\
					<td style=\"padding-bottom:5px;text-align:right;\"><label><input type=\"checkbox\" name=\"beginCheck\" id=\"beginCheck\" value=\"\">自年(から)</label>\
						<div id=\"beginYear\" style=\"display:inline-block;border:1px solid gray; font-weight:bold;text-align:center;width:50px;\"></div></td>\
					<td style=\"width:60%;padding-left:10px;padding-right:10px;\"><div id=\"sliderBegin\"></div></td>\
				</tr>\
				<tr>\
					<td style=\"padding-bottom:5px;text-align:right;\"><label><input type=\"checkbox\" name=\"endCheck\" id=\"endCheck\" value=\"\">至年(まで)</label>\
						<div id=\"endYear\" style=\"display:inline-block;border:1px solid gray; font-weight:bold;text-align:center;width:50px;\"></div></td>\
					<td style=\"width:60%;padding-left:10px;padding-right:10px;\"><div id=\"sliderEnd\"></div></td>\
					<td rowspan=\"3\" style=\"vertical-align:middle;padding:10px;\"><button id=\"archive_apply_button\" style=\"font-size:16px;\">適用</button></td>\
				</tr>\
				<tr>\
					<td></td>\
					<td style=\"width:60%;padding-left:10px;padding-right:10px;\"><div id=\"yearLabel1\" style=\"text-align:left;float:left;\">1940</div><div id=\"yearLabel2\" style=\"text-align:right;\">2010</div></td>\
				</tr>\
			</table></div>\
	"));
	that.find( "#sliderBegin" ).slider({
		value:1980,
		min: 1940,
		max: 2020,
		step: that.sliderStep,
		slide: function( event, ui ) {
			that.find( "#beginYear" ).text( ui.value );
		}
	});
	that.find("#beginYear" ).text( that.find( "#sliderBegin" ).slider( "value" ) );	
	that.find("#sliderBegin").slider("option", "disabled", true );
	
	that.find("#sliderEnd" ).slider({
		value:1980,
		min: 1940,
		max: 2020,
		step: that.sliderStep,
		slide: function( event, ui ) {
			that.find( "#endYear" ).text( ui.value );
		}
	});
	that.find("#endYear" ).text(that.find("#sliderEnd" ).slider( "value" ) );
	that.find("#sliderEnd").slider("option", "disabled", true );
	
	that.find("#endCheck").change(
			function() {
				// endがonの時だけ、beginのチェックは有効になる。
				if (that.find("#endCheck").attr("checked")) {
					that.find("#beginCheck").removeAttr("disabled");
				} else {
					that.find("#beginCheck").attr("disabled","disabled");
					that.find("#beginCheck").removeAttr("checked");
				}
			}
	);
	that.find("#archive_apply_button").click(
			function (ev) {
				// 整合性の確認
				var beginCheck = that.find("#beginCheck").attr("checked");
				var endCheck = that.find("#endCheck").attr("checked");
				var beginValue = parseInt(that.find("#sliderBegin" ).slider("value"));
				var endValue = parseInt(that.find("#sliderEnd" ).slider("value"));
				if (beginCheck && endCheck) {
					if (beginValue > endValue) {
						alert("自年(から)が至年(まで)を上回っています。");
						return;
					}
				}
				// 背景レイヤに設定を反映
				var baseLayer = that.mapEventHandler.getMapObject().baseLayer;
				var currentData = baseLayer.getCurrentData();
				var newDataSet = {};
				newDataSet =ArchiveMapControl.extend(newDataSet,baseLayer.getDataSet());
				
				for (var key in newDataSet) {
					if (newDataSet[key].dataId == currentData.dataId) {
						// 同じIDのデータにすべて反映
						newDataSet[key].beginUse = beginCheck;
						newDataSet[key].endUse = endCheck;
						newDataSet[key].begin = beginValue;
						newDataSet[key].end = endValue;
					}
				}
				// レイヤを更新
				baseLayer.setDataSet(newDataSet);
			}
	);
	
	// 関数を登録
	that.archiveMapControlInit = $.proxy(archiveMapControlInit,that);
	that.disable = $.proxy(disable,that);
	that.enable = $.proxy(enable,that);
	that.downloadMetaData = $.proxy(downloadMetaData,that);
	that.updateUI = $.proxy(updateUI,that);
	that.isArchiveData = $.proxy(isArchiveData,that);
	
	// 初期状態では、使用不可にする。	
	that.disable();
	
	/** ArchiveDataに対応しているか否かを取得　**/
	function isArchiveData(dataId) {
		for (var i = 0; i < that.targetData.length; i++) {
			if (that.targetData[i] == dataId) {
				return true;
			}
		}
		return false;
	}
	/** コントロールを使用不可にする。 **/
	function disable() {
		this.find("#sliderBegin").slider("option", "disabled", true );	
		this.find("#sliderEnd").slider("option", "disabled", true );	
		this.find("#beginCheck").attr("disabled","disabled");
		this.find("#endCheck").attr("disabled","disabled");
		this.find("#archive_apply_button").attr("disabled","disabled");
		this.find("#beginYear").css("color","#aaaaaa");
		this.find("#endYear").css("color","#aaaaaa");
	}

	/** コントロールを使用可にする。 **/
	function enable() {
		this.find("#sliderBegin").slider("option", "disabled", false );	
		this.find("#sliderEnd").slider("option", "disabled", false );	
		if (this.find("#endCheck").attr("checked")) {
			this.find("#beginCheck").removeAttr("disabled");
		} else {
			this.find("#beginCheck").attr("disabled","disabled");
			this.find("#beginCheck").removeAttr("checked");
		}
		this.find("#endCheck").removeAttr("disabled");
		this.find("#archive_apply_button").removeAttr("disabled");
		this.find("#beginYear").css("color","black");
		this.find("#endYear").css("color","black");
	}
	
	// 対象となるデータのメタデータをサーバより取得する。
	function downloadMetaData() {
		// ベースマップのレイヤを取得
		var baseLayer = this.mapEventHandler.getMapObject().baseLayer;
		var did = this.targetData.join("|"); 
		$.ajax({
			type: "GET",
			url: baseLayer.metaUrl,
			data: {"did":did},
			dataType: "jsonp",
			success: $.proxy(function(data,status) {
				// メタを保存
				this.metaData = data.items;
				// UIを更新
				this.updateUI();
				this.mapEventHandler.getMapObject().events.register("zoomend",this,mapMoved);
			},this)
		});
	}
	
	/** 初期化します **/
	function archiveMapControlInit() {
		if (this.mapEventHandler.getMapObject().baseLayer.CLASS_NAME != "webtis.Layer.BaseMap") {
			alert("アーカイブコントロールを使用するには、背景地図は、webtis.Layer.BaseMapである必要があります。");
			return;
		}
		// イベントを外しておきます。
		this.mapEventHandler.getMapObject().events.unregister("moveend",this,mapMoved);
		// データのメタデータを取得
		this.downloadMetaData();
	}
	
	/**
	 * UIを更新
	 */
	function updateUI() {
		this.disable();
		// ベースマップのレイヤの情報を取得
		var baseLayer = this.mapEventHandler.getMapObject().baseLayer;
		// 現在のIDを取得
		var currentData = baseLayer.getCurrentData();
		for (var i = 0; i < this.metaData.length; i++) {
			var dataId = this.metaData[i].dataID;
			if (currentData.dataId == dataId) {
				// 設定を変更
				// 最初の4文字は、yyyy
				var beginYear = this.metaData[i].minRevision.substring(0,4);
				var endYear = this.metaData[i].maxRevision.substring(0,4);
				this.find("#yearLabel1").text(beginYear);
				this.find("#yearLabel2").text(endYear);

				var beginValue;
				var endValue;
				// UIは、年のみ対応
				if (currentData.begin) {
					beginValue = (currentData.begin+"").substring(0,4);
				} else {
					beginValue = endYear;
				}
				if (currentData.end) {
					endValue = (currentData.end+"").substring(0,4);
				} else {
					endValue = endYear;
				}
				
				this.find( "#sliderBegin" ).slider({
					min: parseInt(beginYear),
					max: parseInt(endYear),
					step: 1
				});
				this.find( "#sliderEnd" ).slider({
					min: parseInt(beginYear),
					max: parseInt(endYear),
					step: 1
				});
				this.find( "#beginYear" ).text(beginValue);
				this.find( "#endYear" ).text(endValue);
				this.find( "#sliderBegin" ).slider( "value",beginValue);
				this.find( "#sliderEnd" ).slider("value",endValue);

				this.find("#beginCheck").attr("checked",currentData.beginUse?true:false);
				this.find("#endCheck").attr("checked",currentData.endUse?true:false);
				
				this.enable();
				return true;
			}
		}
		// 該当なし。
		return false;
	}
	
	/** 地図の移動したときのイベント**/
	function mapMoved(ev) {
		this.updateUI();
	}
	return this;
};

/** OpenLayersのクラスの簡易版 **/
ArchiveMapControl.Class = function() {
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
        ArchiveMapControl.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};

ArchiveMapControl.extend = function(destination, source) {
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


//-------------- DefaultHandler
//-- 電子国土APIで使用するときのハンドラー
ArchiveMapControl.DefaultHandler = ArchiveMapControl.Class({
	initialize: function(config) {
		this._mo = config.mapObj;
	},
	getMapObject : function() {
		return this.getWebtis().map;
	},
	getWebtis: function() {
		if (this._mo && this._mo.webtis) {
			return this._mo.webtis;
		}
		if (this._mo && this._mo.maplt && this._mo.maplt.webtis) {
			return this._mo.maplt.webtis;
		}
		return null;
	},
	getOpenLayers: function() {
		if (this._mo.OpenLayers) {
			return this._mo.OpenLayers;
		}
		return this._mo.maplt.OpenLayers;
	}
});

//-- OpenLayersで使用するときのハンドラー
ArchiveMapControl.OpenLayersDefaultHandler = ArchiveMapControl.Class({
	initialize: function(config) {
		this.config = config;
		this.mapObj = config.mapObj;
		if (config.webtis) {
			this.webtis = config.webtis;
		}
		if (config.OpenLayers) {
			this.OpenLayers = config.OpenLayers;
		}
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

