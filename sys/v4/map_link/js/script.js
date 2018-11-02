//URLからパラメータを取得ここから
var htmlName = location.href;				//URLを取得
var htmlNames = htmlName.split("?");		//「?」以下の部分を取得
var params = htmlNames[1].split("&");		//「&」で分割
var cx = (params[0].split("="))[1];			//中心のX座標（東経の度単位）（世界測地系10進法）
var cy = (params[1].split("="))[1];			//中心のY座標（北緯の度単位）（世界測地系10進法）
var z = (params[2].split("="))[1];			//ズームレベル
//URLからパラメータを取得ここまで

function moveOtherMap(name)	{				//リンク先に移動する
	location.href = createLinkURL(name);			//createLinkURL関数でリンク先のURLを生成する
}

function world2japan(cx,cy)	{			//世界測地系経緯度から日本測地系経緯度への変換
	var worldLonLat = new Proj4js.Proj('EPSG:4326');		//世界測地系
	var japanLonLat = new Proj4js.Proj('EPSG:4301');		//日本測地系
	var worldP = new Proj4js.Point(cx,cy);					//ポイントオブジェクトを作成（世界測地系経緯度）
	var japanP = Proj4js.transform(worldLonLat,japanLonLat,worldP);		//日本測地系の経緯度に変換
	return {x:japanP.x, y:japanP.y}
}

function createLinkURL(name)	{		//リンクのURLを作成する関数
	var linkURL;						//この変数にリンク先のURLを入れる
	
	switch(name)	{					//個別の判定をする		//増えるごとに「case」に続けて追加する
		case "osm":				//オープンストリートマップの場合
			linkURL = "http://www.openstreetmap.org/index.html?mlat=" + cy + "&mlon=" + cx + "&zoom=" + z;
			break;
		case "Mapion":				//マピオンの場合
			linkURL = "http://www.mapion.co.jp/m/" + cy + "_" + cx + "_" + zoomLevel(1) + "/?wgs=1";
			break;
		case "ItsumoNAVI":				//いつもNAVIの場合
			var japanlonlat = world2japan(cx,cy);	//座標値を日本測地系に変換
			cx = japanlonlat.x;
			cy = japanlonlat.y;
			cx = Math.round(cx * 3600 * 1000);
			cy = Math.round(cy * 3600 * 1000);
			linkURL = "http://www.its-mo.com/z-" + cy +"-" + cx + "-" + zoomLevel(2) + ".htm";
			break;
		default:				//どこにも当てはまらない場合（エラー処理）
			linkURL = "http://portal.cyberjapan.jp/";
			break;
	}
	return linkURL;		//URLを返す
}

//ズームレベルはサイトによって異なるので、ズームレベルを取得する関数を対応表を何種類か用意しておく
function zoomLevel(id)	{
	var zoomLevel;			//ここにズームレベルを格納する
	
	if(id==1)	{		//その1（マピオン）
		if(z <= 6)			{zoomLevel = 1;}
		else if(z <= 8)		{zoomLevel = 2;}
		else if(z <= 9)		{zoomLevel = 3;}
		else if(z <= 10)	{zoomLevel = 4;}
		else if(z <= 11)	{zoomLevel = 5;}
		else if(z <= 13)	{zoomLevel = 6;}
		else if(z <= 14)	{zoomLevel = 7;}
		else if(z <= 16)	{zoomLevel = 8;}
		else if(z <= 17)	{zoomLevel = 9;}
		else				{zoomLevel = 10;}
	}else if(id==2)	{		//その2（いつもNAVI）
		if(z <= 5)			{zoomLevel = 1;}
		else if(z <= 6)		{zoomLevel = 2;}
		else if(z <= 7)		{zoomLevel = 3;}
		else if(z <= 8)		{zoomLevel = 4;}
		else if(z <= 9)		{zoomLevel = 6;}
		else if(z <= 10)	{zoomLevel = 7;}
		else if(z <= 11)	{zoomLevel = 8;}
		else if(z <= 12)	{zoomLevel = 9;}
		else if(z <= 13)	{zoomLevel = 10;}
		else if(z <= 14)	{zoomLevel = 11;}
		else if(z <= 15)	{zoomLevel = 13;}
		else if(z <= 16)	{zoomLevel = 14;}
		else if(z <= 17)	{zoomLevel = 16;}
		else				{zoomLevel = 18;}
	}else{
		zoomLevel = z;				//エラー処理（zをそのまま返す）
	}
	return zoomLevel;
}
//ズームレベルを取得する関数ここまで


//表の色変え操作をする関数ここから
function cellOver(obj){						//onMouseOverイベントで行の背景色を変更する
	obj.style.backgroundColor="#00FFFF";
}

function cellOut(obj){						//onMouseOutイベントで行の背景色をデフォルトの色に戻す
	obj.style.backgroundColor="";
}
//表の色変え操作をする関数ここまで
