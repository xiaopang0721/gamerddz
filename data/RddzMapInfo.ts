/**
* 斗地主
*/
module gamerddz.data {
	export class RddzMapInfo extends gamecomponent.object.MapInfoT<RddzData> {
		//地图状态变更
		static EVENT_DDZ_STATUS_CHECK: string = "RddzMapInfo.EVENT_DDZ_STATUS_CHECK";
		//战斗体更新
		static EVENT_DDZ_BATTLE_CHECK: string = "RddzMapInfo.EVENT_DDZ_BATTLE_CHECK";
		//倒计时时间戳更新
		static EVENT_DDZ_COUNT_DOWN: string = "RddzMapInfo.EVENT_DDZ_COUNT_DOWN";
		//投票时间戳更新
		static EVENT_PDK_TOUPIAO_TIME: string = "PaodekuaiMapInfo.EVENT_PDKTOUPIAO_TIME";
		private isFirst: boolean = false;	//只是显示详情空行用的

		constructor(v: SceneObjectMgr) {
			super(v, () => { return new RddzData() });
		}

		onUpdate(flags: number, mask: UpdateMask, strmask: UpdateMask): void {
			super.onUpdate(flags, mask, strmask);
			let isNew = flags & core.obj.OBJ_OPT_NEW;
			if (isNew || mask.GetBit(MapField.MAP_INT_BATTLE_INDEX)) {
				this._battleInfoMgr.OnUpdate();
				this._sceneObjectMgr.event(RddzMapInfo.EVENT_DDZ_BATTLE_CHECK);
			}
			if (isNew || mask.GetBit(MapField.MAP_INT_MAP_BYTE)) {
				this._sceneObjectMgr.event(RddzMapInfo.EVENT_DDZ_STATUS_CHECK);
			}
			if (isNew || mask.GetBit(MapField.MAP_INT_COUNT_DOWN)) {
				this._sceneObjectMgr.event(RddzMapInfo.EVENT_DDZ_COUNT_DOWN);
			}
			if (isNew || mask.GetBit(MapField.MAP_INT_TOU_PIAO_TIME)) {
				this._sceneObjectMgr.event("TouPiaoMgr.EVENT_TOUPIAO_TIME");
			}
		}

		private _roundCount: number;//回合计数，方便房卡不同局分割开
		private _showcardCount: number = 0;//摊牌计数，方便重置标识
		private _addRound: boolean = false;//回合标题已增加
		private _addDiZhu: boolean = false;//抢地主标题已增加
		private _addFirst: boolean = false;//先手标题已增加
		private _addShowCards: boolean = false;//结束摊牌标题已增加
		private _addSettle: boolean = false;//结算标题已增加
		public getBattleInfoToObj(): any {
			let battleObj: any[] = [];
			this._roundCount = 1;
			for (let i = 0; i < this._battleInfoMgr.info.length; i++) {
				let info = this._battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				let name = this.GetPlayerNameFromSeat(info.SeatIndex) + "：";
				if (!this._addRound) {//局数信息
					this._addRound = true;
					battleObj.push({ type: 1, title: StringU.substitute("第{0}局", this._roundCount) });
				}
				if (info instanceof gamecomponent.object.BattleInfoJiaoDiZhu) {	//抢地主
					if (!this._addDiZhu) {
						this._addDiZhu = true;
						battleObj.push({ type: 2, title: "开始抢地主" });
					}
					if (info.OptType == 1) {
						let desc = name + "抢地主";
						battleObj.push({ type: 6, desc: desc });
					}
				} else if (info instanceof gamecomponent.object.BattleInfoSimpleCard) { //找到地主
					if (!this._addFirst) {
						this._addFirst = true;
						battleObj.push({ type: 2, title: "先手玩家" });
					}
					let desc = name + HtmlFormat.addHtmlColor("抢得地主", TeaStyle.COLOR_GREEN);
					battleObj.push({ type: 6, desc: desc });
				} else if (info instanceof gamecomponent.object.BattleInfoSettle) {	//结算
					if (!this._addSettle) {
						this._addSettle = true;
						battleObj.push({ type: 2, title: "开始结算" });
					}
					let desc: string = "";
					if (info.SettleVal > 0) {
						desc = name + " 积分 " + HtmlFormat.addHtmlColor("+" + info.SettleVal.toString(), TeaStyle.COLOR_GREEN)
					} else if (info.SettleVal < 0) {
						desc = name + " 积分 " + HtmlFormat.addHtmlColor(info.SettleVal.toString(), TeaStyle.COLOR_RED)
					} else {
						desc = name + " 积分 +" + info.SettleVal;
					}
					battleObj.push({ type: 6, desc: desc });
				} else if (info instanceof gamecomponent.object.BattleInfoShowCards) { //摊牌
					if (!this._addShowCards) {
						this._addShowCards = true;
						battleObj.push({ type: 2, title: "结束余牌" });
					}
					let desc: string = "[" + info.CardType + "张]";
					let cards = info.Cards;
					battleObj.push({ type: 3, name: name, desc: desc, cards: cards });
					this._showcardCount++;
					if (this._showcardCount == this.GetPlayerNumFromSeat()) {
						this._roundCount++;//下一回合计数
						this._addRound = false;
						this._addDiZhu = false;
						this._addFirst = false;
						this._addShowCards = false;
						this._addSettle = false;
						this._showcardCount = 0;
					}
				}
			}
			return battleObj;
		}

		//通过座位取玩家名字
		private GetPlayerNameFromSeat(index: number): string {
			let name: string;
			let users = this._battleInfoMgr.users;
			name = users[index - 1].name;
			return name
		}

		//遍历座位获取玩家总数
		private GetPlayerNumFromSeat(): number {
			let num: number = 0;
			for (let i = 0; i < this._battleInfoMgr.users.length; i++) {
				let user = this._battleInfoMgr.users[i];
				if (user.name) num++;
			}
			return num
		}
	}
}