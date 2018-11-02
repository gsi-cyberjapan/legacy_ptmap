var local = "./";

var script = document.createElement("script");
script.type = "text/javascript";
script.src = local + "lzwurlc.js";
var firstScript = document.getElementsByTagName("script")[0];
firstScript.parentNode.insertBefore(script, firstScript);

if(!window.MAP_LOAD) {
	var datas = new Array();

	window.MAP_LOAD = function(p) {
		datas[p.t] = p;

		var width = parseInt(p.v[0]);
		var height = parseInt(p.v[1]);
		
		createFrame(p.t, width, height);
	}

	var createFrame = function(id, w, h) {
		document.open();
		document.write('<iframe src="' + local + 'map.html" onload="sendMessage(\'' + id +'\')" name="' + id + '" id="' + id + '" width="' + w + '" height="' + h + '"></iframe>');
		document.close();
	}

	var sendMessage = function(id) {
		var data = datas[id];
		var msg = JSON.stringify(data);
		document.getElementById(data.t).contentWindow.postMessage(msg, "*");

		if (typeof app_main != "undefined") {
			var command = 'app_main();'
			setTimeout(command, 2000);
		}
	}

	// パラメタの読込
    var getQueryString = function(url) {
    	var param = url.split('?');

        if (1 < param.length) {
            var query = param[1];

            // クエリの区切り記号 (&) で文字列を配列に分割する
            var parameters = query.split('&');

            var result = new Object();
            for (var i = 0; i < parameters.length; i++) {
                // パラメータ名とパラメータ値に分割する
                var element = parameters[i].split('=');

                var paramName = decodeURIComponent(element[0]);
                var paramValue = decodeURIComponent(element[1]);

                // パラメータ名をキーとして連想配列に追加する
                result[paramName] = decodeURIComponent(paramValue);
            }
            return result;
        }
        return null;
    }

	var map = {};
	map.openJSGIXML = function(url) {
		var code = getQueryString(url);
		var ret = LZWURLCEncoder.decode(code.code);

		for (var i in datas) {
 			var data = datas[i];
			document.getElementById(data.t).contentWindow.postMessage(ret, "*");
		}
	}
	
	// ダミー
	map.openMap = function(){ }

}