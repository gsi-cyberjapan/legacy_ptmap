//URL����p�����[�^���擾��������
var htmlName = location.href;				//URL���擾
var htmlNames = htmlName.split("?");		//�u?�v�ȉ��̕������擾
var params = htmlNames[1].split("&");		//�u&�v�ŕ���
var cx = (params[0].split("="))[1];			//���S��X���W�i���o�̓x�P�ʁj�i���E���n�n10�i�@�j
var cy = (params[1].split("="))[1];			//���S��Y���W�i�k�܂̓x�P�ʁj�i���E���n�n10�i�@�j
var z = (params[2].split("="))[1];			//�Y�[�����x��
//URL����p�����[�^���擾�����܂�

function moveOtherMap(name)	{				//�����N��Ɉړ�����
	location.href = createLinkURL(name);			//createLinkURL�֐��Ń����N���URL�𐶐�����
}

function world2japan(cx,cy)	{			//���E���n�n�o�ܓx������{���n�n�o�ܓx�ւ̕ϊ�
	var worldLonLat = new Proj4js.Proj('EPSG:4326');		//���E���n�n
	var japanLonLat = new Proj4js.Proj('EPSG:4301');		//���{���n�n
	var worldP = new Proj4js.Point(cx,cy);					//�|�C���g�I�u�W�F�N�g���쐬�i���E���n�n�o�ܓx�j
	var japanP = Proj4js.transform(worldLonLat,japanLonLat,worldP);		//���{���n�n�̌o�ܓx�ɕϊ�
	return {x:japanP.x, y:japanP.y}
}

function createLinkURL(name)	{		//�����N��URL���쐬����֐�
	var linkURL;						//���̕ϐ��Ƀ����N���URL������
	
	switch(name)	{					//�ʂ̔��������		//�����邲�ƂɁucase�v�ɑ����Ēǉ�����
		case "osm":				//�I�[�v���X�g���[�g�}�b�v�̏ꍇ
			linkURL = "http://www.openstreetmap.org/index.html?mlat=" + cy + "&mlon=" + cx + "&zoom=" + z;
			break;
		case "Mapion":				//�}�s�I���̏ꍇ
			linkURL = "http://www.mapion.co.jp/m/" + cy + "_" + cx + "_" + zoomLevel(1) + "/?wgs=1";
			break;
		case "ItsumoNAVI":				//����NAVI�̏ꍇ
			var japanlonlat = world2japan(cx,cy);	//���W�l����{���n�n�ɕϊ�
			cx = japanlonlat.x;
			cy = japanlonlat.y;
			cx = Math.round(cx * 3600 * 1000);
			cy = Math.round(cy * 3600 * 1000);
			linkURL = "http://www.its-mo.com/z-" + cy +"-" + cx + "-" + zoomLevel(2) + ".htm";
			break;
		default:				//�ǂ��ɂ����Ă͂܂�Ȃ��ꍇ�i�G���[�����j
			linkURL = "http://portal.cyberjapan.jp/";
			break;
	}
	return linkURL;		//URL��Ԃ�
}

//�Y�[�����x���̓T�C�g�ɂ���ĈقȂ�̂ŁA�Y�[�����x�����擾����֐���Ή��\������ނ��p�ӂ��Ă���
function zoomLevel(id)	{
	var zoomLevel;			//�����ɃY�[�����x�����i�[����
	
	if(id==1)	{		//����1�i�}�s�I���j
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
	}else if(id==2)	{		//����2�i����NAVI�j
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
		zoomLevel = z;				//�G���[�����iz�����̂܂ܕԂ��j
	}
	return zoomLevel;
}
//�Y�[�����x�����擾����֐������܂�


//�\�̐F�ς����������֐���������
function cellOver(obj){						//onMouseOver�C�x���g�ōs�̔w�i�F��ύX����
	obj.style.backgroundColor="#00FFFF";
}

function cellOut(obj){						//onMouseOut�C�x���g�ōs�̔w�i�F���f�t�H���g�̐F�ɖ߂�
	obj.style.backgroundColor="";
}
//�\�̐F�ς����������֐������܂�
