/**
* 斗地主
*/
module gamerddz.story {
	const enum MAP_STATUS {
		MAP_STATE_NONE = 0,			//初始化
		MAP_STATE_CARDROOM_CREATED = 1,  	//房间创建后
		MAP_STATE_CARDROOM_WAIT = 2,		//房卡等人中
		MAP_STATE_SHUFFLE = 3,  	//洗牌中
		MAP_STATE_DEAL = 4,			//准备发牌
		MAP_STATE_DEAL_END = 5,		//发牌结束
		MAP_STATE_DIZHU = 6,	//准备抢地主
		MAP_STATE_PLAYING = 7, 	    //准备游戏
		MAP_STATE_SETTLE = 8,    	//准备结算
		MAP_STATE_SHOW = 9,         //准备摊牌
		MAP_STATE_WAIT = 10,      	//等待下一局
		MAP_STATE_END = 11,			//结束
	}
	export class RddzStory extends gamecomponent.story.StoryRoomCardBase {
		private _ddzMgr: RddzMgr;
		private _cardsTemp: any = [];
		private _ddzMapInfo: RddzMapInfo;
		private _battleIndex = -1;

		constructor(v: Game, mapid: string, maplv: number, dataSource: any) {
			super(v, mapid, maplv, dataSource);
			this.init();
		}

		init() {
			if (!this._ddzMgr) {
				this._ddzMgr = new RddzMgr(this._game);
			}
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.sceneObjectMgr.on(RddzMapInfo.EVENT_DDZ_BATTLE_CHECK, this, this.updateBattledInfo);

		}

		get ddzMgr() {
			return this._ddzMgr;
		}

		set mapLv(lv: number) {
			this.maplv = lv;
		}

		get mapLv() {
			return this.maplv;
		}

		private onIntoNewMap(info?: MapAssetInfo): void {
			if (!info) return;

			this.onMapInfoChange();
			this._game.uiRoot.closeAll();
			this._game.uiRoot.HUD.open(RddzPageDef.PAGE_DDZ_MAP);
		}

		private onMapInfoChange(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo;
			this._ddzMapInfo = mapinfo as RddzMapInfo;
			if (mapinfo) {
				this.resetBattleIdx();
				this.onUpdateCardInfo();
			}
		}

		//重连之后，战斗日志从哪开始刷
		private resetBattleIdx(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo as RddzMapInfo;
			if (!mapinfo) return;
			let battleInfoMgr = mapinfo.battleInfoMgr;
			for (let i = 0; i < battleInfoMgr.info.length; i++) {
				let battleInfo = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				if (battleInfo instanceof gamecomponent.object.BattleInfoShowCards) {
					this._battleIndex = i;
				}
			}
		}

		private updateBattledInfo(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo as RddzMapInfo;
			let mainUnit: Unit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit) return;
			let battleInfoMgr = mapinfo.battleInfoMgr;
			let mainIdx = mainUnit.GetIndex();
			if (mainIdx == 0) return;
			for (let i = 0; i < battleInfoMgr.info.length; i++) {
				let battleInfo = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				if (battleInfo instanceof gamecomponent.object.BattleInfoMingPai && this._battleIndex < i) {	//发牌
					this._battleIndex = i;
					let idx = battleInfo.SeatIndex;
					if (idx == mainIdx) {
						this._ddzMgr.allCards = [];
						for (let k = 0; k < battleInfo.Cards.length; k++) {
							let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, RddzData) as RddzData;
							card.pos = new Vector2(981, 113);
							card.Init(battleInfo.Cards[k]);
							this._ddzMgr.allCards.push(card);
						}
						this._ddzMgr.sort();
						if (this._ddzMgr.isReLogin) {
							this._ddzMgr.refapai();
						} else {
							this._ddzMgr.fapai();
						}
						this._ddzMgr.dealEndCards();
					}
				}
				else if (battleInfo instanceof gamecomponent.object.BattleInfoSeeCard && this._battleIndex < i) {	//重新开始
					if (this._battleIndex < i) {
						this._battleIndex = i;
						// this._ddzMgr.reStart = true;
						this._ddzMgr.isShowCards = false;
						this._ddzMgr.allCards = [];
						this._ddzMgr.endCards = [];
						this._ddzMgr.clearCardObject();
					}
				}
				else if (battleInfo instanceof gamecomponent.object.BattleInfoSimpleCard && this._battleIndex < i) {  //给地主底牌
					if (this._battleIndex < i) {
						this._battleIndex = i;
						//显示下底牌
						this._ddzMgr.showEndCards(battleInfo.Cards);
						let info = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoSimpleCard<RddzData>;
						this._ddzMgr.diZhuSeat = info.SeatIndex;
						if (battleInfo.SeatIndex == mainIdx) {
							for (let k = 0; k < battleInfo.Cards.length; k++) {
								let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, RddzData) as RddzData;
								if (this._ddzMgr.isReLogin) {
									card.pos = new Vector2(640, 625);
								} else {
									card.pos = new Vector2(640, 360);
								}
								card.Init(battleInfo.Cards[k].GetVal());
								if (card) {
									this._ddzMgr.allCards.push(card);
									card.isShow = true;
								}
								this._ddzMgr.tidyCard();
							}
							//给主玩家得所有手牌加上地主标识
							for(let i=0;i<this._ddzMgr.allCards.length;i++){
								let card:RddzData = this._ddzMgr.allCards[i];
								card.isShowJB = true;
							}
						}
					}
				}
			}
		}

		//断线重连,重发下牌
		private onUpdateCardInfo(): void {
			let mapinfo: MapInfo = this._game.sceneObjectMgr.mapInfo;
			let mainUnit: Unit = this._game.sceneObjectMgr.mainUnit;
			if (!mapinfo) return;
			if (!mainUnit) return;
			let statue = mapinfo.GetMapState();
			if (statue >= MAP_STATUS.MAP_STATE_SHUFFLE && statue <= MAP_STATUS.MAP_STATE_WAIT) {
				this._ddzMgr.isReLogin = true;
				if (statue > MAP_STATUS.MAP_STATE_DEAL) {
					this.updateBattledInfo();
				}
			}
		}

		clear() {
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.sceneObjectMgr.off(RddzMapInfo.EVENT_DDZ_BATTLE_CHECK, this, this.updateBattledInfo);
			if (this._ddzMgr) {
				this._ddzMgr.clear();
				this._ddzMgr = null;
			}
			this._ddzMapInfo = null;
		}
	}
}