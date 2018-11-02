// 重ね合わせレイヤー
webtis.Layer.OverlayLayer = OpenLayers.Class(OpenLayers.Layer.XYZ,{
	name : "WEBTIS.PROXYMAP",
	attribution : "国土地理院　",
	attributionTemplate : '<span>${title}${copyright}</span>',

	sphericalMercator : true,
	wrapDateLine : false,

	url : null,
	
	availableMapUrl : webtis.SERVER_URL.AVAILABLE_MAP_SERVER,

	MIN_ZOOM_LEVEL : 5,
	MAX_ZOOM_LEVEL : 19,
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
     * Constructor: webtis.Layer.OverlayLayer
     * 電子国土Webシステムの重ね合わせ情報を表示するレイヤーを生成します。
     */
	initialize : function(name, options) {
		this.url = webtis.SERVER_URL.OVERLAY_MAP_SERVER +"${z}${dir}.${ext}?s=${style}"; 
		var url = url || this.url;
		name = name || this.name;
		this.projection = new OpenLayers.Projection("EPSG:900913");
		// データセット設定
		var overlays;
		if (options && options.overlays) {
			overlays = options.overlays;
		}
		this.options = this._createOption(options);
		this.overlays = overlays;
		var newArguments = [ name, url, {}, this.options ];
		OpenLayers.Layer.Grid.prototype.initialize.apply(this,newArguments);

		// メタデータを取得
		var metaJS = document.createElement("script");
		metaJS.setAttribute("type","text/javascript");
		var key = "j"+webtis.Layer.OverlayLayer.j_c;
		var that = this;
		webtis.Layer.OverlayLayer[key] = function(ev) {
			metaJS.parentNode.removeChild(metaJS);
			delete webtis.Layer.OverlayLayer[key];
			that.metaData = ev.items; 
			that.overlayParams = that._createOverlayStyleParam();
			if (that.map) {
				that.updateAttribution();
				that.redraw();
			}
		};
		metaJS.setAttribute("src", this.availableMapUrl+"?callback=webtis.Layer.OverlayLayer.j"+webtis.Layer.OverlayLayer.j_c);
		webtis.Layer.OverlayLayer.j_c++;
		this.metaJS = metaJS;
		document.getElementsByTagName("head")[0].appendChild(metaJS);
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
			obj = new webtis.Layer.OverlayLayer(this.name, this.getOptions());
		}
		obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this,[ obj ]);
		return obj;
	},
    /**
     * APIMethod: addTile
     * Create a tile, initialize it, and add it to the layer div. 
     *
     * Parameters
     * bounds - {<OpenLayers.Bounds>}
     * position - {<OpenLayers.Pixel>}
     *
     * Returns:
     * {<OpenLayers.Tile>} The added OpenLayers.Tile
     */
    addTile:function(bounds, position) {
        return new webtis.Layer.OverlayTileImage(this, position, bounds, null, 
                                         this.tileSize, this.tileOptions);
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
		
		var z = OpenLayers.Util.indexOf(this.BASE_RESOLUTIONS, res);
				
		var limit = Math.pow(2, z);
		if (this.wrapDateLine) {
			x = ((x % limit) + limit) % limit;
		}
		var style = this.overlayParams != null ? this.overlayParams[z] : null;
		return {
			'x' : x,
			'y' : y,
			'z' : z,
			'style' : style
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
		if (this.metaData == null) {
			return null;
		}
		var xyz = this.getXYZ(bounds);
		if (xyz.style == null) {
			return null;
		}
		if (this.getOptions().minZoomLevel > xyz.z || this.getOptions().maxZoomLevel < xyz.z) {
			return null;
		}
		// 変換有無の判定
		var d = unescape(this.overlayParams[xyz.z]).split("|");
		if (d.length == 1) {
			var did = d[0].split(",");
			if (did.length == 1) {
				// %7Cで分割して1つかつ、%2Cで分割して1つなら、単一データIDで無変換
				// メタデータから、取得サーバを取得して、直接取得する。
				var didAndRevisionID = did[0].split(".");
				var dataId = didAndRevisionID[0];
				var revisionId = null;
				if (didAndRevisionID.length == 1) {
					revisionId = "latest";
				} else {
					revisionId = didAndRevisionID[1];
				}
				var curMetaData = this.metaData[dataId];
				if (!curMetaData) {
					return null;
				}
				var url = (revisionId=="latest"?curMetaData["serverURL"]:curMetaData["serverRevisionURL"])+"/${did}/${revisionId}/${z}${dir}/${x}${y}.${ext}";
				var dir = "";
				var xi;
				var yi;
				var strX = this.zeroPad(xyz.x,7);
				var strY = this.zeroPad(xyz.y,7);
				for (var i = 0; i < 6; i++) {
					xi = strX.substr(i, 1);
					yi = strY.substr(i, 1);
					dir += "/"+xi+yi;
				}
				xyz.did = dataId;
				xyz.revisionId = revisionId;
				xyz.dir = dir;
				var imageFormat = curMetaData.imageFormat.toLowerCase();
				var ext = "png";
				if (imageFormat == "png") {
					ext = "png";
				} else if (imageFormat == "jpeg") {
					ext = "jpg";
				}
				xyz.ext = ext;
				xyz.x = strX;
				xyz.y = strY;
				return OpenLayers.String.format(url, xyz);
			}
		}
		var ext = "png";
		xyz.ext = ext;
		var url = this.url;
		
		var dir = "/"+xyz.x+"/"+xyz.y;
		xyz.dir = dir;
		return OpenLayers.String.format(url, xyz);
	},

	/**
	 * コピーライト等を更新
	 */
	updateAttribution : function() {
		if (this.map && this.metaData) {
			// attributionを更新
			var oldAttribution = this.attribution;
			this.attribution = "国土地理院";
			var layers = this.overlays.layers;
			var zoomLevel = OpenLayers.Util.indexOf(this.BASE_RESOLUTIONS, this.map.getResolution());
			var newAttribution = "";
			var newFullBaseAttribution = "";
			for (var i = 0; i <layers.length; i++ ) {
				var layer = layers[i];
				var minZ = layer.minZoomLevel != undefined ? layer.minZoomLevel : this.minZoomLevel;
				var maxZ = layer.maxZoomLevel != undefined ? layer.maxZoomLevel : this.maxZoomLevel;
				if (minZ <= zoomLevel && maxZ >= zoomLevel) {
					var found = false;
					if (layer.applyZoomLevels) {
						for (var j = 0,jLen = layer.applyZoomLevels.length; j < jLen; j++) {
							if (zoomLevel == layer.applyZoomLevels[j]) {
								found = true;
								break;
							}
						}
					} else {
						found = true;
					}
					if (!found) {
						continue;
					}
					var curMetaData = this.metaData[layer.dataId];
					var title = curMetaData?curMetaData.title:"";
					var copyright = curMetaData?curMetaData.owner:"国土地理院";
					var attr = OpenLayers.String.format(
							this.attributionTemplate, {
								title : title,
								copyright : copyright.length > 0 ? ","+copyright:""
							});
					
					if (newAttribution.length == 0) {
						newAttribution = attr;
					} else {
						newFullBaseAttribution = newAttribution + "<br>" + attr;
						break;
					}
				}
			}
			this.attribution = newAttribution;
			this.fullBaseAttribution = newFullBaseAttribution;
			this.map && this.map.events.triggerEvent(
					"changelayer", {
						layer : this,
						property : "attribution"
					});
		}
	},

	setMap : function(map) {
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
	 * 縮尺情報を含むOptionを生成します。
	 */
	_createOption : function(options) {
		// 縮尺数を設定
		var minZoomLevel = options.minZoomLevel==undefined?this.MIN_ZOOM_LEVEL:options.minZoomLevel;
		var maxZoomLevel = options.maxZoomLevel==undefined?this.MAX_ZOOM_LEVEL:options.maxZoomLevel;
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
	 * 重ね合わせ用のパラメータ文字列を作成
	 */
	_createOverlayStyleParam : function() {
		var sp = {};
		if (!this.overlays) {
			return sp;
		}
		// 現在のズームレベル毎のパラメータを作成
		var layers = this.overlays.layers;
		for (var zoomLevel = this.minZoomLevel; zoomLevel <= this.maxZoomLevel; zoomLevel++) {
			var zoomParam = "";
			for (var i = 0; i <layers.length; i++ ) {
				var layer = layers[i];
				var found = false;
				if (layer.applyZoomLevels) {
					for (var j = 0,jLen = layer.applyZoomLevels.length; j < jLen; j++) {
						if (zoomLevel == layer.applyZoomLevels[j]) {
							found = true;
							break;
						}
					}
				} else {
					found = (this.minZoomLevel <= zoomLevel && this.maxZoomLevel >= zoomLevel);
				}
				if (!found) {
					continue;
				}
				// レイヤが縮尺に該当
				var layerStyle = layer.dataId;
				if (layer.revisionId) {
					layerStyle += "."+layer.revisionId;
				} else {
					layerStyle += ".latest";
				}
				if (layer.op == undefined) {
					// 画像変換無し
				} else if (layer.op == "exchange") {
					// 色変換
					layerStyle += ",op:exchange";
					layerStyle += ";p1:"+layer.p1; // 変換後の色
				} else if (layer.op == "grayscale") {
					// グレースケール
					layerStyle += ",op:grayscale";
				} else if (layer.op == "brightness") {
					// 輝度変換
					layerStyle += ",op:brightness";
					layerStyle += ";p1:"+layer.p1; // 輝度倍率
				} else if (layer.op == "transparent") {
					// 透過率
					layerStyle += ",op:transparent";
					layerStyle += ";p1:"+layer.p1; // 透過率
				}
				if (zoomParam.length > 0) {
					zoomParam += "|";	
				}
				zoomParam += layerStyle;
			}
			// URLエンコードして格納
			if (zoomParam.length > 0) {
				sp[zoomLevel] = escape(zoomParam);
			}
		}
		return sp;
	},
	
	getOverlaysInfo :function() {
		return this.overlays;
	},
	
	setOverlaysInfo : function(newOverlays) {
		this.overlays = newOverlays;
		this.overlayParams = this._createOverlayStyleParam();
		this.clearGrid();
		this.redraw();
		this.updateAttribution();
	},
	
	getAllMetaData : function() {
		if (!this.overlays) {
			return undefined;
		}
		var byScales = {};
		for (var i = 0,len = this.overlays.layers.length; i < len; i++) {
			var ly = this.overlays.layers[i];
			var did = ly["dataId"];
			var meta = this.metaData[did];
			if (!meta) {
				if (window.console) {
					window.console.log("meta:'" + did+ "' not found." );
				}
				continue;
			}
			
			var applyZoomLevels = ly.applyZoomLevels;
			if (applyZoomLevels) {
				for (var j = 0,jlen = applyZoomLevels.length; j < jlen; j++) {
					var z = applyZoomLevels[j];
					if (z >= this.minZoomLevel && z <= this.maxZoomLevel) {
						putMetaByScale(meta,z);
					}
				}
			} else {
				for (var z = this.minZoomLevel; z <= this.maxZoomLevel; z++) {
					putMetaByScale(meta,z);
				}
			}
		}
		function putMetaByScale(meta,z) {
			var info = byScales[z];
			if (!info) {
				info =  new Array();
				byScales[z] = info;
			}
			info.push(meta);
		}
		return byScales;
	},
	
	getCurrentMetaData : function() {
		if (!this.overlays || !this.metaData) {
			return undefined;
		}
		var z = this.getCurrentZoomLevel();
		if (z < this.minZoomLevel || z > this.maxZoomLevel) {
			return undefined;
		}
		var result = new Array();
		for (var i = 0,len = this.overlays.layers.length; i < len; i++) {
			var ly = this.overlays.layers[i];
			var did = ly["dataId"];
			var meta = this.metaData[did];
			if (!meta) {
				if (window.console) {
					window.console.log("meta:'" + did+ "' not found." );
				}
				continue;
			}
			var applyZoomLevels = ly.applyZoomLevels;
			if (applyZoomLevels) {
				if (OpenLayers.Util.indexOf(applyZoomLevels, z) != -1) {
					result.push(meta);
				}
			} else {
				result.push(meta);
			}
		}
		return result;
	},
	
	/**
	 * Method: getCurrentZoomLevel
	 * 現在表示中の地図データのズームレベルを取得します。
	 * 
     * Returns:
     * <Number> ズームレベル
	 */
	getCurrentZoomLevel : function() {
		if (this.map == null) {
			return null;
		}
		var res = this.map.getResolution();
		var z = OpenLayers.Util.indexOf(this.BASE_RESOLUTIONS, res);
		return z;
	},

	CLASS_NAME : "webtis.Layer.OverlayLayer"
});


// 画像が取得出来ない場合は、透過で表示する処理を追加
webtis.Layer.OverlayTileImage = OpenLayers.Class(OpenLayers.Tile.Image, {
    initialize: function(layer, position, bounds, url, size, options) {
        OpenLayers.Tile.Image.prototype.initialize.apply(this, arguments);
    },
    /**
     * Method: initImgDiv
     * Creates the imgDiv property on the tile.
     */
    initImgDiv: function() {
        if (this.imgDiv == null) {
            var offset = this.layer.imageOffset; 
            var size = this.layer.getImageSize(this.bounds); 

            if (this.layerAlphaHack) {
                this.imgDiv = OpenLayers.Util.createAlphaImageDiv(null,
                                                               offset,
                                                               size,
                                                               null,
                                                               "relative",
                                                               null,
                                                               null,
                                                               null,
                                                               true);
            } else {
                this.imgDiv = this.createImage(null,
                                                          offset,
                                                          size,
                                                          null,
                                                          "relative",
                                                          null,
                                                          null,
                                                          true);
            }

            // needed for changing to a different server for onload error
            if (OpenLayers.Util.isArray(this.layer.url)) {
                this.imgDiv.urls = this.layer.url.slice();
            }
      
            this.imgDiv.className = 'olTileImage';

            /* checkImgURL used to be used to called as a work around, but it
               ended up hiding problems instead of solving them and broke things
               like relative URLs. See discussion on the dev list:
               http://openlayers.org/pipermail/dev/2007-January/000205.html

            OpenLayers.Event.observe( this.imgDiv, "load",
                OpenLayers.Function.bind(this.checkImgURL, this) );
            */
            this.frame.style.zIndex = this.isBackBuffer ? 0 : 1;
            this.frame.appendChild(this.imgDiv); 
            this.layer.div.appendChild(this.frame); 

            if(this.layer.opacity != null) {

                OpenLayers.Util.modifyDOMElement(this.imgDiv, null, null, null,
                                                 null, null, null, 
                                                 this.layer.opacity);
            }

            // we need this reference to check back the viewRequestID
            this.imgDiv.map = this.layer.map;

            //bind a listener to the onload of the image div so that we 
            // can register when a tile has finished loading.
            var onload = function() {

                //normally isLoading should always be true here but there are some 
                // right funky conditions where loading and then reloading a tile
                // with the same url *really*fast*. this check prevents sending 
                // a 'loadend' if the msg has already been sent
                //
                if (this.isLoading) { 
                    this.isLoading = false; 
                    this.events.triggerEvent("loadend"); 
                }
            };

            if (this.layerAlphaHack) { 
                OpenLayers.Event.observe(this.imgDiv.childNodes[0], 'load', 
                                         OpenLayers.Function.bind(onload, this));    
            } else { 
                OpenLayers.Event.observe(this.imgDiv, 'load', 
                                     OpenLayers.Function.bind(onload, this)); 
            } 


            // Bind a listener to the onerror of the image div so that we
            // can registere when a tile has finished loading with errors.
            var onerror = function() {

                // If we have gone through all image reload attempts, it is time
                // to realize that we are done with this image. Since
                // OpenLayers.Util.onImageLoadError already has taken care about
                // the error, we can continue as if the image was loaded
                // successfully.
                if (this.imgDiv._attempts > OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
                    onload.call(this);
                }
            };
            OpenLayers.Event.observe(this.imgDiv, "error",
                                     OpenLayers.Function.bind(onerror, this));
        }
        
        this.imgDiv.viewRequestID = this.layer.map.viewRequestID;
    },
    createImage : function(id, px, sz, imgURL, position, border,opacity, delayDisplay) {
		var image = document.createElement("img");
		
		//set generic properties
		if (!id) {
			id = OpenLayers.Util.createUniqueID("OpenLayersDiv");
		}
		if (!position) {
			position = "relative";
		}
		OpenLayers.Util.modifyDOMElement(image, id, px, sz, position, 
		          border, null, opacity);
		
		if(delayDisplay) {
			image.style.display = "none";
			OpenLayers.Event.observe(image, "load", 
			OpenLayers.Function.bind(OpenLayers.Util.onImageLoad, image));
			OpenLayers.Event.observe(image, "error", 
			OpenLayers.Function.bind(function() {
				this.src = webtis.SERVER_URL.OVERLAY_MAP_TRANSPARENT_IMAGE;
			}, image));		
		}
		
		//set special properties
		image.style.alt = id;
		image.galleryImg = "no";
		if (imgURL) {
			image.src = imgURL;
		}
		
		
		
		return image;
	},
    /**
     * Method: clone
     *
     * Parameters:
     * obj - {<OpenLayers.Tile.Image>} The tile to be cloned
     *
     * Returns:
     * {<OpenLayers.Tile.Image>} An exact clone of this <OpenLayers.Tile.Image>
     */
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.OverlayTileImage(this.layer, 
                                            this.position, 
                                            this.bounds, 
                                            this.url, 
                                            this.size);        
        } 
        
        //pick up properties from superclass
        obj = OpenLayers.Tile.Image.prototype.clone.apply(this, [obj]);
        
        //dont want to directly copy the image div
        obj.imgDiv = null;
            
        
        return obj;
    },


    CLASS_NAME: "webtis.Layer.OverlayTileImage"
  }
);
webtis.Layer.OverlayLayer.j_c = 0;

// 電子国土の背景地図を使用するときに使う、OpenLayers.Control.Attributionから派生したクラス
webtis.Control.Attribution = OpenLayers.Class(OpenLayers.Control.Attribution, {
    /**
     * Method: updateAttribution
     * Update attribution string.
     */
    updateAttribution: function() {
        var attributions = [];
        if (this.map && this.map.layers) {
        	// 背景地図が電子国土Webシステムの時だけ機能する。
        	if (this.map.baseLayer != null && ("webtis.Layer.BaseMap" == this.map.baseLayer.CLASS_NAME || "webtis.Layer.OverlayLayer" == this.map.baseLayer.CLASS_NAME)) {
        		var metaInfo = [];
        		var baseMeta = this.map.baseLayer.getCurrentMetaData();
        		if (OpenLayers.Util.isArray(baseMeta)) {
        			metaInfo = metaInfo.concat(baseMeta);
        		} else {
        			metaInfo.push(baseMeta);
        		}
        		var altAttributionHTML = "";
	            for(var i=0, len=this.map.layers.length; i<len; i++) {
	                var layer = this.map.layers[i];
	                if (!layer.isBaseLayer && layer.attribution && layer.getVisibility()) {
	                	if ("webtis.Layer.BaseMap" == this.map.baseLayer.CLASS_NAME || "webtis.Layer.OverlayLayer" == this.map.baseLayer.CLASS_NAME) {
	                		var curMeta = layer.getCurrentMetaData();
	                		if (OpenLayers.Util.isArray(curMeta)) {
	                			metaInfo = metaInfo.concat(curMeta);
	                		} else {
	                			metaInfo.push(curMeta);
	                		}
	                	} else {
	                		// それ以外は、","で連結。
	                		if (altAttributionHTML.length > 0) {
	                			altAttributionHTML += ",";
	                		}
	                		altAttributionHTML += layer.attribution;
	                	}
	                }
	            }
        		// １行目と２行目は、電子国土のレイヤーの情報
	            var html = "";
	            for (var i = 0; i < metaInfo.length && i < 2; i++) {
	    			var title = metaInfo[i]?metaInfo[i].title:"";
	    			var copyright = metaInfo[i]?metaInfo[i].owner:"国土地理院";
	    			if (html.length > 0) {
	    				html += "<br/>";
	    			}
	            	html += OpenLayers.String.format('<span>${title}${copyright}</span>', {
	    						title : title,
	    						copyright : copyright.length > 0 ? ","+copyright:""	            	
	            	});
	            }
        		// ３行目以降は、その他のレイヤーの重ね合わせ情報を表示
	            if (altAttributionHTML.length > 0) {
	            	if (html.length > 0) {
	            		html += "<br>";
	            	}
	            	html += altAttributionHTML; 
	            }
	            this.div.innerHTML = html;
        	} else {
	            for(var i=0, len=this.map.layers.length; i<len; i++) {
	                var layer = this.map.layers[i];
	                if (layer.attribution && layer.getVisibility()) {
	                    // add attribution only if attribution text is unique
	                    if (OpenLayers.Util.indexOf(
	                                    attributions, layer.attribution) === -1) {
	                        attributions.push( layer.attribution );
	                    }
	                }
	            }
	            this.div.innerHTML = attributions.join(this.separator);
        	}
        }
    },

    CLASS_NAME: "webtis.Control.Attribution"
});