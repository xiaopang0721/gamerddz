/**
* 斗地主-HUD
*/
module gamerddz.page {
	export class RddzPage extends game.gui.base.Page {
		private _viewUI: ui.nqp.game_ui.doudizhu.DouDiZhu_HUDUI;
		private _player: any;
		private _ddzMgr: RddzMgr;
		private _isRoomcardType: boolean = false;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._asset = [
				Path_game_rddz.atlas_game_ui + "doudizhu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong+ "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				PathGameTongyong.atlas_game_ui_tongyong+ "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong+ "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong+ "logo.atlas",
			];
			this._isNeedDuang = false;
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.doudizhu.DouDiZhu_HUDUI', ["game_ui.tongyong.HudUI"]);
			this.addChild(this._viewUI);
			this._game.playMusic(Path.music + "ddz/ddz_BGM.mp3");
			this._ddzMgr = new RddzMgr(this._game);

			for (let index = 0; index < this._viewUI.box_right.numChildren; index++) {
				this._viewUI.box_right._childs[index].visible = false;
			}
		}

		/**数据*/
		set dataSource(v: any) {
			this._dataSource = v;
			this._isRoomcardType = this._dataSource == PageDef.TYPE_CARD;
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();

			this._viewUI.box_normal.visible = !this._isRoomcardType;
			this._viewUI.box_roomcard.visible = this._isRoomcardType;
			(this._viewUI.view_hud as TongyongHudNqpPage).onOpen(this._game, RddzPageDef.GAME_NAME, this._isRoomcardType);
			if (this._isRoomcardType) {
				for (let index = 0; index < this._viewUI.box_roomcard.numChildren; index++) {
					this._viewUI.box_right._childs[index].visible = true;
					Laya.Tween.from(this._viewUI.box_right._childs[index], {
						right: -300
					}, 200 + index * 100, Laya.Ease.linearNone);
				}
			} else {
				for (let index = 0; index < this._viewUI.box_right.numChildren; index++) {
					this._viewUI.box_right._childs[index].visible = true;
					Laya.Tween.from(this._viewUI.box_right._childs[index], {
						right: -300
					}, 200 + index * 100, Laya.Ease.linearNone);
				}
			}

			this._viewUI.img_room0.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.img_room1.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.img_room2.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.img_room3.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.img_room_create.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.img_room_join.on(LEvent.CLICK, this, this.onBtnClickWithTween);
		}

		protected onBtnTweenEnd(e: LEvent, target: any): void {
			this._player = this._game.sceneObjectMgr.mainPlayer;
			if (!this._player) return;
			if (this.chkPlayerIsGuest()) return;
			switch (target) {
				case this._viewUI.img_room_create:
					this._game.uiRoot.general.open(RddzPageDef.PAGE_DDZ_CREATE_CARDROOM);
					break;
				case this._viewUI.img_room_join:
					this._game.uiRoot.general.open(RddzPageDef.PAGE_DDZ_JOIN_CARDROOM);
					break;
				default:
					break;
			}
		}

		private chkPlayerIsGuest(): boolean {
			let result: boolean = false;
			if (this._player.playerInfo.isguest) {
				TongyongPageDef.ins.alertRecharge("您选择了游客模式登录游戏，由于该模式下的游戏数据(包括付费数据)在删除游戏、更换设备后将被清空!对此造成的损失，本平台将不承担任何责任。为了您的虚拟财产安全,我们强烈建议您使用微信登录和账号登录游戏!", () => {
					this._game.uiRoot.general.open(DatingPageDef.PAGE_BINDPHONE, (page) => {
						page.dataSource = 3;//绑定手机类型
					})
				}, () => {
				}, false, PathGameTongyong.ui_tongyong_general + "btn_qw.png");
				result = true;
			}
			return result;
		}

		public close(): void {
			if (this._viewUI) {
				this._viewUI.img_room0.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.img_room1.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.img_room2.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.img_room3.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.img_room_create.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.img_room_join.off(LEvent.CLICK, this, this.onBtnClickWithTween);
			}
			this._game.stopMusic();

			super.close();
		}
	}
}