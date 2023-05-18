"use strict";

const FONT = "12px monospace"; //使用フォントサイズ]
//仮想画面関連
let gScreen;//仮想画面
const HEIGHT = 120;//仮想画面の高さ、8で割ると偶数
const WIDTH = 128;//仮想画面の横幅、8で割ると奇数
//実画面関連
let gWidth; //実画面の幅
let gHeight; //実画面の高さ
//マップ画像関連
let gImgMap; //map画像
const TILESIZE = 8;//タイルサイズ（ドット）
const TILECOLUMN = 4;//タイル列数
const TILEROW = 4;//タイル行数
const SCR_HEIGHT = 8;//画面の縦方向のタイル数の半分
const SCR_WIDTH = 8;//画面の横方向のタイル数の半分
//プレイヤー画像関連
let gImgPlayer;//player画像
const CHRHIGHT = 9;//キャラクター画像の高さ
const CHRWIDTH = 8;//キャラクター画像の幅
const CHRCOLUMN = 2;//キャラクター画像の列数
const CHRROW = 4;//キャラクター画像の行数
let gAngle = 0;//プレイヤー画像の向き
//モンスター画像関連
let gImgMonster;
let gEnemyType;		//	敵種別
let gImgBoss;
//モンスター関連
let gEnemyHP;//敵HP
let Encount;//エンカウント
//プレイヤー座標関連
const START_X = 15;//初期x座標
const START_Y = 17;//初期y座標
let gPlayerX = START_X * TILESIZE + TILESIZE / 2;//プレイヤーx座標(ドット単位),TILESIZE/2で中心に合わせている
let gPlayerY = START_Y * TILESIZE + TILESIZE / 2;//プレイヤーy座標(ドット単位）,TILESIZE/2で中心に合わせている
//マップ関連
const MAP_WIDTH = 32;//マップ幅
const MAP_HEIGHT = 32;//マップ高さ
//内部カウンタ
let gFrame = 0; //内部カウンタ
const INTERVAL = 33;//フレーム呼び出し間隔
const SCROLL = 1;//スクロール速度
//ウィンドウ関係
const WINDSTYLE = "rgba(0,0,0,0.75)";//ウィンドウの色
const FONTSTYLE = "#ffffff";//文字の色
//キー入力
const gKey = new Uint8Array(0x100);//キー入力バッファ
//移動処理
let gMoveX = 0;
let gMoveY = 0;
//メッセージ処理
let gMessage1 = null;//表示メッセージ1行目
let gMessage2 = null;//表示メッセージ2行目
//アイテム
let key = 0;//鍵
//プレイヤー情報
let STARTHP = 20;
let exp = 0;
let HP = STARTHP;
let MHP = STARTHP;
let Lv = 1;
//戦闘
let gPhase = 0;//戦闘フェーズ
let gCursor = 0;//	カーソル位置
let gOrder;//行動順
//画像
const gFileMap = "img/map.png";
const gFilePlayer = "img/player.png";
const gFileMonster = "img/monster.png";
const gFileBoss = "img/boss.png";
//画像ファイルの読み込み
function LoadImage() {
	gImgMap = new Image();
	gImgMap.src = gFileMap; //マップ画像の読み込み
	gImgMonster = new Image();
	gImgMonster.src = gFileMonster;
	gImgPlayer = new Image();
	gImgPlayer.src = gFilePlayer; //プレイヤー画像の読み込み
	gImgBoss = new Image();
	gImgBoss.src = gFileBoss; //ボス画像の読み込み
}
//音楽関連
var damage = new Audio("audio/damage.mp3");
var damageB = new Audio("audio/Boss_damage.mp3");
var MBGM = new Audio("audio/MBGM.mp3");
var get = new Audio("audio/get.mp3");
var fail = new Audio("audio/fail.mp3");
var win = new Audio("audio/win.mp3");
var pick = new Audio("audio/pick.mp3");
var BBGM = new Audio("audio/Boss_bgm.mp3");
var EBGM = new Audio("audio/Battle_BGM.mp3");
var DBGM = new Audio("audio/death.mp3");
var keySE = new Audio("audio/key.mp3");
var WBGM = new Audio("audio/WBGM.mp3");
var Victory = new Audio("audio/Victory.mp3");

const save = {
	Lv: Lv,
	MHP: STARTHP,
	exp: exp,
};



const gEncounter = [0, 0, 0, 1, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0];//マップタイルごとの敵出現確立

const gMap = [
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 3, 3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 3, 6, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 3, 3, 6, 6, 7, 7, 7, 2, 2, 2, 7, 7, 7, 7, 7, 7, 7, 6, 3, 0, 0, 0, 3, 3, 0, 6, 6, 6, 0, 0, 0,
	0, 0, 3, 3, 6, 6, 6, 7, 7, 2, 2, 2, 7, 7, 2, 2, 2, 7, 7, 6, 3, 3, 3, 6, 6, 3, 6, 13, 6, 0, 0, 0,
	0, 3, 3, 10, 11, 3, 3, 6, 7, 7, 2, 2, 2, 2, 2, 2, 1, 1, 7, 6, 6, 6, 6, 6, 3, 0, 6, 6, 6, 0, 0, 0,
	0, 0, 3, 3, 3, 0, 3, 3, 3, 7, 7, 2, 2, 2, 2, 7, 7, 1, 1, 6, 6, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 7, 7, 7, 7, 2, 7, 6, 3, 1, 3, 6, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 7, 2, 7, 6, 3, 1, 3, 3, 6, 6, 3, 0, 0, 0, 3, 3, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 7, 7, 7, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 0, 3, 3, 3, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 6, 7, 7, 7, 6, 3, 1, 1, 3, 3, 6, 3, 3, 0, 3, 12, 3, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 7, 7, 6, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 6, 6, 6, 6, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 6, 6, 3, 3, 3, 3, 1, 1, 3, 3, 3, 1, 1, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 5, 3, 3, 3, 6, 6, 6, 3, 3, 3, 1, 1, 1, 1, 1, 3, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 8, 9, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 1, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 3, 3, 3, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 6, 3, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 6, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0,
	7, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 0, 0, 0, 0, 0,
	7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7,
];

const gMonsterName = ["スライム", "ウサギ", "ナイト", "ドラゴン", "魔王"];

//サイン関数
function Sign(val) {
	if (val == 0) {
		return 0;
	} else if (val < 0) {
		return -1;
	} else {
		return 1;
	}
}

//マップ描画処理
function DrawField(g) {
	let mx = Math.floor(gPlayerX / TILESIZE);//プレイヤーのタイル座標ｘ
	let my = Math.floor(gPlayerY / TILESIZE);//プレイヤーのタイル座標ｙ

	//キャラクターを中心として15×17のマップデータの表示
	for (let dy = -SCR_HEIGHT; dy <= SCR_HEIGHT; dy++) {
		let ty = my + dy;//タイルy座標
		let py = (ty + MAP_HEIGHT) % MAP_HEIGHT;//マップがループしても大丈夫なようにあらかじめ0にならないようにして余りを計算

		for (let dx = -SCR_WIDTH; dx <= SCR_WIDTH; dx++) {
			let tx = mx + dx;//タイルx座標
			let px = (tx + MAP_WIDTH) % MAP_WIDTH;//マップがループしても大丈夫なようにあらかじめ0にならないようにして余りを計算

			DrawTile(g,
				//tx,tyの値はキャラクターのタイル座標を元に算出されたマップの現在のタイル座標を表す
				//dyは負の値になる可能性があることから正の値に戻すためWIDTHの半分を足し、全て正の値になるようにする
				//マップのタイル画像を表示する位置に関してはプレイヤーの座標は関係ないことからプレイヤー座標を引く
				//dxdyのみの場合ではタイル単位で処理が行われることからドット単位での移動ができない
				tx * TILESIZE + WIDTH / 2 - gPlayerX,
				ty * TILESIZE + HEIGHT / 2 - gPlayerY,
				gMap[py * MAP_WIDTH + px]);
		}
		//キャラクターの描画
		g.drawImage(gImgPlayer,
			(gFrame >> 3 & 1) * CHRWIDTH, gAngle * CHRHIGHT, CHRWIDTH, CHRHIGHT, //取り出すキャラクターの指定
			//キャラクター画像の横幅が偶数であることから、中心への移動には画像の半分移動
			//キャラクター画像の高さが奇数であることから、一度全体を移動させた後で背景の画像の高さの半分移動
			WIDTH / 2 - CHRWIDTH / 2, HEIGHT / 2 - CHRHIGHT + TILESIZE / 2, CHRWIDTH, CHRHIGHT);//取り出したキャラクターの位置
		//	ステータスウィンドウ
		g.fillStyle = WINDSTYLE;							//	ウィンドウの色
		g.fillRect(2, 2, 44, 37);						//	矩形描画

		DrawStatus(g);								//	ステータス描画
		DrawMessage(g);								//	メッセージ描画


	}
}

//戦闘画面描画処理
function DrawFight(g) {
	g.fillStyle = "#000000";//背景色
	g.fillRect(0, 0, WIDTH, HEIGHT)//画面全体に背景を設置
	if (gPhase <= 5) {//敵が生存している場合
		if (IsBoss()) {
			g.drawImage(gImgBoss, WIDTH / 2 - gImgBoss.width / 2, HEIGHT / 2 - gImgBoss.height / 2);
		} else {
			let w = gImgMonster.width / 4;
			let h = gImgMonster.height;

			g.drawImage(gImgMonster, gEnemyType * w, 0, w, h, Math.floor(WIDTH / 2 - w / 2), Math.floor(HEIGHT / 2 - h / 2), w, h);
		}
	}

	DrawStatus(g);									//	ステータス描画
	DrawMessage(g);									//	メッセージ描画

	if (gPhase == 2) {									//	戦闘フェーズがコマンド選択中の場合
		g.fillText("⇒", 6, 96 + 14 * gCursor);		//	カーソル描画
	}
}

function IsBoss() {
	return (gEnemyType == gMonsterName.length - 1);
}

//画面出力
function DrawMain() {
	const g = gScreen.getContext("2d");//仮想画面の2D描画のコンテキストの所得
	if (gPhase <= 1) {
		DrawField(g);
		BBGM.pause();
		BBGM.currentTime = 0;
		EBGM.pause();
		EBGM.currentTime = 0;
		MBGM.play();
		MBGM.addEventListener("ended", function () {
			MBGM.currentTime = 0;
			MBGM.play();
		}, false);
	} else {
		DrawFight(g);
		MBGM.pause();
		MBGM.currentTime = 0;
	}

	/*デバッグ用
	中心線の表示
	g.fillStyle = "#ff0000";
	g.fillRect(0, HEIGHT / 2 - 1, WIDTH, 2);
	g.fillRect(WIDTH / 2 - 1, 0, 2, HEIGHT);
	
	g.fillStyle = WINDSTYLE;//ウィンドウの色
	g.fillRect(20, 3, 105, 15);//ウィンドウの左上の座標、幅、高さ
	
	g.font = FONT;//文字フォントの定義
	g.fillStyle = FONTSTYLE;//文字の色
	g.fillText("x=" + gPlayerX + " y=" + gPlayerY + " m=" + gMap[my * MAP_WIDTH + mx], 25, 15);//文字列の内容と出力場所の定義及び出力
	*/
}

//メッセージ2行を一括管理
function SetMessage(v1, v2) {
	gMessage1 = v1;
	gMessage2 = v2;
}

//メッセージ描画
function DrawMessage(g) {
	if (!gMessage1) {//メッセージの内容がnullの時表示しない
		return;
	}
	g.fillStyle = WINDSTYLE;//メッセージウィンドウの色
	g.fillRect(4, 84, 120, 30);//メッセージウィンドウの左上の座標、幅、高さ

	g.font = FONT;//文字フォントの定義
	g.fillStyle = FONTSTYLE;//文字の色

	g.fillText(gMessage1, 6, 96);//文字の出力
	if (gMessage2) {//メッセージ2の内容が存在するとき表示
		g.fillText(gMessage2, 6, 110);
	}
}

//ステータス描画
function DrawStatus(g) {

	g.font = FONT;//文字フォントの定義
	g.fillStyle = FONTSTYLE;//文字の色
	g.fillText("Lv", 4, 12); DrawTextR(g, Lv, 36, 13);//レベルの出力
	g.fillText("HP", 4, 25); DrawTextR(g, HP, 36, 25);//HPの出力
	g.fillText("Exp", 4, 37); DrawTextR(g, exp, 36, 37);//Expの出力
}

function DrawTextR(g, str, x, y) {
	g.textAlign = "right";
	g.fillText(str, x, y);
	g.textAlign = "left";
}

//マップデータの処理
function DrawTile(g, x, y, idx) {
	const ix = (idx % TILECOLUMN) * TILESIZE; //取り出す画像のｘ座標を余りを用いることで決定する
	const iy = Math.floor(idx / TILECOLUMN) * TILESIZE;//取り出す画像のy座標を割り算の整数値を用いることで決定する
	//(画像ファイル、画像ファイルの取り出す基準の座標x,y、取り出す幅と高さ、画像を張り付ける基準の座標x,y、貼り付ける幅と高さ)
	g.drawImage(gImgMap,
		ix, iy, TILESIZE, TILESIZE,//取り出す画像の座標と大きさ
		x, y, TILESIZE, TILESIZE);//取り出した画像の表示位置
}

//敵出現処理
function AppearEnemy(t) {
	gPhase = 1;
	gEnemyHP = t * 3 + 5;//敵HP
	gEnemyType = t;
	SetMessage("敵が現れた！", null);
}

//戦闘処理
function Action() {
	gPhase++;//フェーズ経過

	if (((gPhase + gOrder) & 1) == 0) {//敵の攻撃の場合
		const d = GetDamage(gEnemyType + 2);
		SetMessage(gMonsterName[gEnemyType] + "の攻撃!", d + "のダメージ");
		HP -= d;//プレイヤーのHP減少
		if (!IsBoss()) {//魔王出なかったとき
			damage.play();
			damage.currentTime = 0;
		} else {//魔王の時
			damageB.play();
			damageB.currentTime = 0;
		}
		if (HP <= 0) {//HPが0以下の時
			gPhase = 7;//死亡処理
		}
		return;
	}

	if (gCursor == 0) {//プレイヤーの行動順
		const d = GetDamage(Lv + 1);//プレイヤーの攻撃ダメージ
		SetMessage("あなたの攻撃！", d + "のダメージ");
		gEnemyHP -= d;
		damage.play();
		damage.currentTime = 0;
		if (gEnemyHP <= 0) {

			gPhase = 5;
		}
		return;
	}

	if (Math.random() < 0.5) {
		SetMessage("あなたは逃げ出した", null);
		gPhase = 6;
		return;
	}
	SetMessage("あなたは逃げ出した", "しかし回り込まれた");
	fail.play();
	fail.currentTime = 0;
}

//ダメージ量算出
function GetDamage(a) {
	return (Math.floor(a * (1 + Math.random())));//攻撃ダメージ
}


function CommandFight() {
	gPhase = 2;//戦闘コマンド選択
	gCursor = 0;
	SetMessage("　戦う", "　逃げる");
}

//経験値加算処理
function AddExp(val) {
	exp += val;//経験値加算
	while (Lv * (Lv + 1) * 2 <= exp) {//レベルアップ条件
		Lv++;//レベルアップ
		MHP += 4 + Math.floor(Math.random() * 3);//最大HPの増加
	}
}

//仮想画面と実画面をつなげる
function WmPaint() {
	DrawMain();
	const ca = document.getElementById("main");//メインキャンバスの要素取得
	const g = ca.getContext("2d");//2D描画のコンテキストの所得
	g.drawImage(gScreen, 0, 0, gScreen.width, gScreen.height, 0, 0, gWidth, gHeight);//仮想画面のイメージを実画面に転送
}

//ウィンドウの大きさに合わせた描画処理
function WmSize() {
	const ca = document.getElementById("main");//メインキャンバスの要素取得
	ca.width = window.innerWidth;//横幅をウィンドウの横幅に合わせる
	ca.height = window.innerHeight;//縦幅をウィンドウの縦幅に合わせる

	const g = ca.getContext("2d");//2D描画のコンテキストの所得
	g.imageSmoothingEnabled = g.msImageSmoothingEnabled = 0; //ドット絵をはっきりと表示する

	//実画面サイズを計測、ドットのアスペクト比を維持したままの最大サイズを計算
	gWidth = ca.width;
	gHeight = ca.height;
	if (gWidth / WIDTH < gHeight / HEIGHT) { //横よりも縦のほうが長い時
		gHeight = gWidth * HEIGHT / WIDTH;//縦の長さを横幅に合わせる
	} else {//縦よりも横が長い時
		gWidth = gHeight * WIDTH / HEIGHT; //横の長さを縦幅に合わせる
	}

}

//タイマーイベント発生時の処理
function WmTimer() {
	if (!gMessage1) {
		gFrame++; //内部カウンタのインクリメント	
		TickField();//フィールド移動処理
	}
	WmPaint();
}

//キー入力（DOWN）イベント
window.onkeydown = function (ev) {
	let c = ev.keyCode; //キーコードの取得
	if (gKey[c] != 0) {//既にキーが押されている場合
		return;
	}

	gKey[c] = 1;


	if (gPhase == 1) {//敵出現フェーズ
		if (IsBoss()) {
			BBGM.play();
			BBGM.addEventListener("ended", function () {
				BBGM.currentTime = 0;
				BBGM.play();
			}, false);
		} else {
			EBGM.play();
			EBGM.addEventListener("ended", function () {
				EBGM.currentTime = 0;
				EBGM.play();
			}, false);
		}
		CommandFight();
		return;
	}

	if (gPhase == 2) {//戦闘コマンド選択フェーズ
		if (c == 13 || c == 90) {	//	Enterキー、又はZキーの場合
			gOrder = Math.floor(Math.random() * 2);//行動順
			Action();
		} else {
			gCursor = 1 - gCursor;	//	カーソル移動
			pick.play();
			pick.currentTime = 0;
		}
		return;
	}

	if (gPhase == 3) {//戦闘行動処理
		Action();
		return;
	}

	if (gPhase == 4) {
		CommandFight();
		return;
	}

	if (gPhase == 5) {//勝利した場合の処理
		gPhase = 6;
		SetMessage("敵をやっつけた", gEnemyType + 1 + "の経験値を得た");
		AddExp(gEnemyType + 1);//敵を倒した際の経験値処理
		win.play();
		win.currentTime = 0;
		return;
	}
	if (gPhase == 6) {//魔王討伐の際の処理
		if (IsBoss() && gCursor == 0) {
			SetMessage("魔王を倒し", "世界に平和が訪れた");
			BBGM.pause();
			BBGM.currentTime = 0;
			WBGM.play();
			WBGM.addEventListener("ended", function () {
				WBGM.currentTime = 0;
				WBGM.play();
			}, false);
			gPhase = 9;
			return;
		}
		gPhase = 0;					//	マップ移動フェーズ
	}
	if (gPhase == 7) {
		SetMessage("死んでしまった", null);
		gPhase = 8;
		BBGM.pause();
		BBGM.currentTime = 0;
		EBGM.pause();
		EBGM.currentTime = 0;
		DBGM.play();
		DBGM.addEventListener("ended", function () {
			DBGM.currentTime = 0;
			DBGM.play();
		}, false);
		return;
	}
	if (gPhase == 8) {
		SetMessage("GAME OVER", "世界は闇に閉ざされた");
		gPhase = 9;
		return;
	}
	if (gPhase == 9) {
		DBGM.pause();
		DBGM.currentTime = 0;
		save.exp = exp;
		save.Lv = Lv;
		save.MHP = MHP;
		const jsonData = JSON.stringify(save);
		localStorage.setItem(savename, jsonData);
		window.location.reload();
	}

	gMessage1 = null;//メッセージの初期化
}

//キー入力（UP）イベント、これがなければ一度行われた入力がそのまま残り続ける
window.onkeyup = function (ev) {
	gKey[ev.keyCode] = 0;
}

//フィールド移動処理
function TickField() {
	if (gPhase != 0) {
		return;
	}

	if (gMoveX != 0 || gMoveY != 0 || gMessage1) { }//移動中もしくはメッセージ表示中は新たな入力を受け付けない
	else if (gKey[37]) {
		gAngle = 1;
		gMoveX = -TILESIZE;//左
	}
	else if (gKey[38]) {
		gAngle = 3;
		gMoveY = -TILESIZE;//下
	}
	else if (gKey[39]) {
		gAngle = 2;
		gMoveX = TILESIZE;//右
	}
	else if (gKey[40]) {
		gAngle = 0;
		gMoveY = TILESIZE;//上
	}

	//移動後のタイル座標判定
	let mx = Math.floor((gPlayerX + gMoveX) / TILESIZE);//移動処理を行う前にあらかじめ移動先のタイル座標を判定する
	let my = Math.floor((gPlayerY + gMoveY) / TILESIZE);
	mx += MAP_WIDTH;
	mx %= MAP_WIDTH;
	my += MAP_HEIGHT;
	my %= MAP_HEIGHT;
	let m = gMap[my * MAP_WIDTH + mx];

	if (m < 3) {//侵入不可の地形の場合
		gMoveX = 0;
		gMoveY = 0;
	}

	if (Math.abs(gMoveX) + Math.abs(gMoveY) == SCROLL) {//マス移動が終わる直前

		if (m == 8 || m == 9) {//お城
			HP = MHP;
			SetMessage("魔王を倒してください", null);
		}

		if (m == 10 || m == 11) {//街
			HP = MHP;
			SetMessage("東の果てにも", "村があります");
		}

		if (m == 12) {//村
			HP = MHP;
			SetMessage("カギは", "洞窟にあります");
		}

		if (m == 13) {//洞窟
			SetMessage("鍵を手に入れた", null);
			key = 1;
			get.play();
			get.currentTime = 0;
		}

		if (m == 14) {//扉
			if (key == 0) {//鍵を持っていない場合
				gPlayerY -= TILESIZE;
				SetMessage("この先に進むには", "鍵が必要です");
			}
			else {//鍵を持っている場合
				SetMessage("扉が開いた", null);
				keySE.play();
				keySE.currentTime = 0;
			}
		}

		if (m == 15) {//魔王
			AppearEnemy(gMonsterName.length - 1);
		}

		if (Math.random() * 4 < gEncounter[m]) {//ランダムエンカウント
			let t = Math.abs(gPlayerX / TILESIZE - START_X) + Math.abs(gPlayerY / TILESIZE - START_Y);
			if (m == 6) {//マップタイプが林の時
				t += 8;//敵レベルを0.5上昇
			}
			if (m == 7) {//マップタイプが山の時
				t += 16;//敵レベルを1上昇
			}
			t += Math.random() * 8;//敵のレベルをランダムに上昇
			t = Math.floor(t / 16);
			Encount = Math.min(t, gMonsterName.length - 2);
			AppearEnemy(Encount);

		}

	}

	gPlayerX += Sign(gMoveX) * SCROLL;//プレイヤーx座標移動
	gPlayerY += Sign(gMoveY) * SCROLL;//プレイヤーy座標移動
	gMoveX -= Sign(gMoveX) * SCROLL;//移動量の消費
	gMoveY -= Sign(gMoveY) * SCROLL;//移動量の消費

	//マップのループ処理
	gPlayerX += (MAP_WIDTH * TILESIZE);
	gPlayerX %= (MAP_WIDTH * TILESIZE);//マップがループしても座標の値がマイナスにならないようあらかじめ0にならないようにして余りを計算
	gPlayerY += (MAP_HEIGHT * TILESIZE);
	gPlayerY %= (MAP_HEIGHT * TILESIZE);//マップがループしても座標の値がマイナスにならないようあらかじめ0にならないようにして余りを計算
}

//ブラウザ起動時

window.onload = function () {
	const searchParams = new URLSearchParams(window.location.search);
	let savename = searchParams.get('name');
	console.log(searchParams.get('name'));
	const jsonData = localStorage.getItem(savename);
	const save = JSON.parse(jsonData);

	console.log(save);
	if (save) {
		exp = save.exp;
		Lv = save.Lv;
		STARTHP = save.MHP;
	}
	LoadImage();

	gScreen = document.createElement("canvas");//仮想画面を作成
	gScreen.width = WIDTH;//仮想画面の横幅を設定
	gScreen.height = HEIGHT;//仮想画面の高さを設定

	WmSize();//画面サイズをウィンドウに合わせる
	window.addEventListener("resize", function () { WmSize() });//ウィンドウの大きさ変更に伴う画面サイズの変更
	setInterval(function () { WmTimer() }, INTERVAL);//33ms感覚でWmTimer()を呼び出す(約30.3fps)

}