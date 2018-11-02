var PtmapObj = {};

(function($){
jQuery.fn.PtmapObj = function(config) {
	this.config = config;
	this.map = config.map;
	this.layer = config.layer;
	this.selectObject = null;

	this.createFeatures = $.proxy(createFeatures, this);
	this.addPopup = $.proxy(addPopup, this);
	this.calcZL = $.proxy(calcZL, this);

	// 作図データの表示
	function createFeatures(datas) {
		
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			if (d.i) {
				// 画像
				var image_layer = new OpenLayers.Layer.Image("image1", d.i[0].s,
					new OpenLayers.Bounds(d.i[0].c).transform(projection4326, projection3857),
					new OpenLayers.Size(5, 5),
					{
						isBaseLayer: false,
						projection: projection3857,
						maxZoomLevel: 18,
						minZoomLevel: 3
					}
				);
				this.map.addLayer(image_layer);
				
			} else if (d.p) {
				// 点
				var style_symbol = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
				var symbol = new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Point(d.p[0].c[0], d.p[0].c[1]).transform(projection4326, projection3857),
					{
						"name": d.p[0].n,
						"description": createDescription(d.p[0].a)
					},
					OpenLayers.Util.extend(style_symbol, {
						"externalGraphic": "./symbols/" + d.s.u,
						"graphicWidth": 20,
						"graphicHeight": 20,
						"fillOpacity": 1
					})
				);

				this.layer.addFeatures([symbol]);

			} else if (d.a) {
				// 文字
				var fontSize = d.s.e.split(",")[0];
				
				var style_text = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
				var text = new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.Point(d.a[0].c[0], d.a[0].c[1]).transform(projection4326, projection3857),
					{
						"name": d.a[0].n,
						"description": createDescription(d.a[0].a)
					},
					OpenLayers.Util.extend(style_text, {
						"fillOpacity": 0,
						"strokeOpacity": 0,
						"label": d.a[0].n,
						"fontColor": "rgb(" + d.s.c + ")",
						"fontFamily": "ＭＳ ゴシック",
						"fontSize": fontSize * 4 / 3,
						"fontWeight" : (d.s.a == "極太") ? "bold" : "normal",
						"labelOutlineWidth": 3,
						"labelOutlineColor": d.s.p == "on" ? "rgb(" + d.s.g + ")" : null,
						"labelSelect": true
					})
				);

				this.layer.addFeatures([text]);

			} else if (d.c) {
				// 線
				var strokeWidth = d.s.w.split(",")[0];
				var point_array = [];
				for (var j = 0; j < d.c[0].c.length; j++) {
					var pt = d.c[0].c[j];
					point_array.push(new OpenLayers.Geometry.Point(pt[0], pt[1]));
				}

				var style_line = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
				var line = new OpenLayers.Feature.Vector(
					new OpenLayers.Geometry.LineString(point_array).transform(projection4326, projection3857),
					{},
					OpenLayers.Util.extend(style_line, {
						'strokeColor' : "rgb(" + d.s.c + ")",
						'strokeWidth' : strokeWidth
					})
				);

				this.layer.addFeatures([line]);
			}
		}
	}

	// 属性文字列の生成
	function createDescription(attr) {
		var ret = "";
		if (attr) {
			attr = attr.replace(/　=/,"");
			ret = attr.replace(/,=/g,"<br>");
		}

		return ret;
	}

	// ポップアップの定義
	function addPopup() {
		if (this.selectControl) {
			this.map.removeControl(this.selectControl);
			this.selectControl.deactivate();
			this.selectControl.destroy();
			delete this.selectControl;
			this.selectControl = null;
		}
	
		if (!(this.layer.events.listeners['featureselected'] && this.layer.events.listeners['featureselected'].length > 0)) {
			this.layer.events.on({
				"featureselected": onFeatureSelect,
				"featureunselected": onFeatureUnselect
			});
		}

		this.selectControl = new OpenLayers.Control.SelectFeature(this.layer);
		this.map.addControl(this.selectControl);
		this.selectControl.activate();
	}

	// 作図オブジェクト選択時の処理
	function onFeatureSelect(event) {
	    var feature = event.feature;

	    var content = "";
	    if (feature.attributes.name) { content += "<div style='color:red;'>" + escapeHTML(feature.attributes.name) + "</div>"; }
	    if (feature.attributes.description) { content += escapeDescriotion(feature.attributes.description); }

	    if (content == "") {
	    	return;
	    }

	    // ポップアップウィンドウを表示
	    popup = new OpenLayers.Popup.FramedCloud(
	                "featurePopup", 
	                feature.geometry.getBounds().getCenterLonLat(),
	                new OpenLayers.Size(100,100),
	                content,
	                null, false);

	    feature.popup = popup;
	    this.map.addPopup(popup);
	}

	// 作図オブジェクト選択状態を解除した時の処理
	function onFeatureUnselect(event) {
	    var feature = event.feature;

	    if(feature.popup) {
	        this.map.removePopup(feature.popup);
	        feature.popup.destroy();
	        delete feature.popup;
	    }
	}

	// ポップアップに表示する文字列のエスケープ処理
	function escapeDescriotion(str) {
		var parts = [];

		var str = str.replace(/\n/g, "");

		while (str.length > 0) {
			var m = str.match(/<[^>]+>/i);
			if (!m) {
				parts.push({
					part: str,
					istag: false
				});
				break;
			}
			
			if (m.index > 0) {
				parts.push({
					part: str.substr(0, m.index),
					istag: false
				});
			}
			
			parts.push({
				part: m[0],
				istag: true
			});
			str = str.substr(m.index + m[0].length);
		}

		var ret = "";

		var wlist = [
			{
				tag: "a",
				attr: [
					{ name: "href" },
					{ name: "style" }
				],
				force: [
					{ name: "target", value: "_blank" }
				]
			},
			{ tag: "br" },
			{ tag: "hr" },
			{ tag: "b" },
			{ tag: "i" },
			{ tag: "u" },
			{
				tag: "font",
				attr: [
					{ name: "size" },
					{ name: "color" },
					{ name: "style" }
				]
			},
			{
				tag: "table",
				attr: [
					{ name: "width" },
					{ name: "style" }
				]
			},
			{
				tag: "tr",
				attr: [
					{ name: "align" },
					{ name: "style" }
				]
			},
			{
				tag: "td",
				attr: [
					{ name: "align" },
					{ name: "height" },
					{ name: "width" },
					{ name: "colspan" },
					{ name: "rowspan" },
					{ name: "style" }
				]
			},
		]

		for (var i = 0; i < parts.length; i++) {
			if (parts[i].istag) {
			
				var part = parts[i].part;
			
				if (part.match(/javascript/i)){
					continue;
				}
			
				var tag = part.match(/<(\S+)(?:\s+.+)?>/);

				if (tag) {
					// タグ
					for (var j = 0; j < wlist.length; j++) {
						if (!wlist[j]) break;
						
						var re = new RegExp("\/?" + wlist[j].tag + "$", "i");
						var ma = tag[1].match(re);

						if (ma) {
							var vals = [];
							var attrs = wlist[j].attr ? wlist[j].attr : [];
							
							// 属性チェック
							for(var k = 0; k < attrs.length; k++) {
								// ダブルクォーテーションなし
								var re1 = new RegExp(".+<?\\s" + attrs[k].name + "=\\s*(.*?)[\\s|>].*", "i");
								var val1 = part.match(re1);
								if (val1 && !val1[1].match(/[\'|"]/i)) {
									vals.push({
										name: attrs[k].name,
										value: val1[1]
									});
									continue;
								}

								// ダブルクォーテーションあり
								var re2 = new RegExp(".+<?\\s" + attrs[k].name + "=[\\'|\"](.*?)[\\'|\"].*", "i");
								var val2 = part.match(re2);
								if (val2) {
									vals.push({
										name: attrs[k].name,
										value: val2[1]
									});
									continue;
								}
							}

							// 必須属性
							if (wlist[j].force) {
								vals = vals.concat(wlist[j].force);
							}

							if (vals.length > 0) {
								ret = ret + "<" +  wlist[j].tag;
								for (var m = 0; m < vals.length; m++) {
									ret = ret + ' ' + vals[m].name + '="' + vals[m].value + '"';
								}
								ret = ret + ">";
							}
							else {
								ret = ret + "<" + ma[0] + ">";
							}
						}
					}
				}
			}
			else {
				// タグ以外の文字をエスケープ
				ret = ret + escapeHTML(parts[i].part);
			}
		}
		
		return ret;
	}

	// 文字列のエスケープ
	function escapeHTML(str, forSend) {
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

	// スケールをズームレベルに変換
	function calcZL(scale) {
		var scales = [
			2500,	// 2500以下=ZL18
			5000,
			10000,
			20000,
			40000,
			80000,
			150000,
			300000,
			600000,
			1200000,
			2300000,
			4600000,
			9000000	// 900万以下=ZL6, 超えたらZL5
		];
		
		var zl = 18;

		for (var j = 0; j < scales.length; j++) {
			if (scale <= scales[j]) {
				zl = "" + (18 - j);
				break;
			}
		}
		
		return zl;
	}
	return this;
};
})(jQuery);
