/**
* name 斗地主-剧情
*/
module gameddz.story {
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
	export class DdzStory extends gamecomponent.story.StoryNormalBase {
		private _ddzMgr: DdzMgr;
		private _cardsTemp: any = [];
		private _ddzMapInfo: DdzMapInfo;
		private _battleIndex = -1;

		constructor(v: Game, mapid: string, maplv: number) {
			super(v, mapid, maplv);
			this.init();
		}

		init() {
			if (!this._ddzMgr) {
				this._ddzMgr = new DdzMgr(this._game);
			}
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.sceneObjectMgr.on(DdzMapInfo.EVENT_DDZ_BATTLE_CHECK, this, this.updateBattledInfo);
			this.onIntoNewMap();
			super.init();
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
			this._game.uiRoot.HUD.open(DdzPageDef.PAGE_DDZ_MAP);
		}

		private onMapInfoChange(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo;
			this._ddzMapInfo = mapinfo as DdzMapInfo;
			if (mapinfo) {
				this.onUpdateCardInfo();
			} else {
				this._ddzMgr.unitOffline = this._offlineUnit;
			}
		}

		private updateBattledInfo(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo as DdzMapInfo;
			let mainUnit: Unit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit) return;
			let battleInfoMgr = mapinfo.battleInfoMgr;
			let mainIdx = mainUnit.GetIndex();
			if (!mainIdx) return;
			//好几局，用这个区分一下
			for (let i = 0; i < battleInfoMgr.info.length; i++) {
				let battleInfo = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				if (battleInfo.Type == 11) {
					this._battleIndex = i;
				}
			}
			for (let i = 0; i < battleInfoMgr.info.length; i++) {
				let battleInfo = battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				if (battleInfo instanceof gamecomponent.object.BattleInfoMingPai && this._battleIndex < i) {	//发牌
					let idx = battleInfo.SeatIndex;
					if (idx == mainIdx) {
						this._cardsTemp = [];
						for (let k = 0; k < battleInfo.Cards.length; k++) {
							this._cardsTemp.push(battleInfo.Cards[k]);
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

		createofflineUnit() {
			//创建假的地图和精灵
			let unitOffline = new UnitOffline(this._game.sceneObjectMgr);
			let mainPlayer = this._game.sceneObjectMgr.mainPlayer;
			if (mainPlayer) {
				unitOffline.SetStr(UnitField.UNIT_STR_NAME, mainPlayer.playerInfo.nickname);
				unitOffline.SetStr(UnitField.UNIT_STR_HEAD_IMG, mainPlayer.playerInfo.headimg);
				unitOffline.SetDouble(UnitField.UNIT_INT_MONEY, mainPlayer.playerInfo.money);
				unitOffline.SetUInt32(UnitField.UNIT_INT_QI_FU_END_TIME, mainPlayer.GetQiFuEndTime(mainPlayer.playerInfo.qifu_type - 1));
				unitOffline.SetUInt32(UnitField.UNIT_INT_QI_FU_TYPE, mainPlayer.playerInfo.qifu_type);
				unitOffline.SetUInt32(UnitField.UNIT_INT_VIP_LEVEL, mainPlayer.playerInfo.vip_level);
			}
			unitOffline.SetUInt16(UnitField.UNIT_INT_UINT16, 0, 1);

			this._offlineUnit = unitOffline;
		}

		enterMap() {
			//各种判断
			if (this.mapinfo) return false;
			if (!this.maplv) {
				this.maplv = this._last_maplv;
			}
			this._game.network.call_match_game(this._mapid, this.maplv)
			return true;
		}

		leavelMap() {
			//各种判断
			this._game.network.call_leave_game();
			return true;
		}

		clear() {
			super.clear();
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.sceneObjectMgr.off(DdzMapInfo.EVENT_DDZ_BATTLE_CHECK, this, this.updateBattledInfo);
			if (this._ddzMgr) {
				this._ddzMgr.clear();
				this._ddzMgr = null;
			}
			this._ddzMapInfo = null;
		}
	}
}