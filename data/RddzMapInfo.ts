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
				this._sceneObjectMgr.event(TouPiaoMgr.EVENT_TOUPIAO_TIME);
			}
		}

		public getBattleInfoToString(): string {
			let str: string = "";
			for (let i = 0; i < this._battleInfoMgr.info.length; i++) {
				let battleInfo = this._battleInfoMgr.info[i] as gamecomponent.object.BattleInfoBase;
				let name = this.GetPlayerNameFromSeat(battleInfo.SeatIndex)
				if (battleInfo.Type == 35) {	//定下地主
					let info = this._battleInfoMgr.info[i] as gamecomponent.object.BattleInfoPass;
					let newString = "地主是：" + name;
					if (!this.isFirst) {
						this.isFirst = true;
						if (str == "") {
							str = newString;
						} else {
							str = str + "#" + "" + "#" + newString;
						}
					} else {
						str = str + "#" + newString;
					}
				} else if (battleInfo.Type == 11) {	//结算
					let info = this._battleInfoMgr.info[i] as gamecomponent.object.BattleInfoSettle;
					let newString = name + "盈利：" + info.SettleVal;
					str = str + "#" + newString;
					this.isFirst = false;
				}
			}
			return str;
		}

		//通过座位取玩家名字
		private GetPlayerNameFromSeat(index: number): string {
			let name: string;
			let users = this._battleInfoMgr.users;
			name = users[index - 1].name;
			return name
		}
	}
}