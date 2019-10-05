/**
* 斗地主-规则
*/
module gamerddz.page {
	const enum TYPE_INDEX {
		TYPE_WANFA = 0,
		TYPE_TYPE = 1,
		TYPE_DAXIAO = 2,
		TYPE_BEISHU = 3,
		TYPE_POINT = 4,
	}
	export class RddzRulePage extends game.gui.base.Page {
		private _viewUI: ui.nqp.game_ui.doudizhu.DouDiZhu_GuiZeUI;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._isNeedBlack = true;
			this._isClickBlack = true;
			this._asset = [
				Path_game_rddz.atlas_game_ui + "doudizhu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.doudizhu.DouDiZhu_GuiZeUI');
			this.addChild(this._viewUI);

		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.btn_tab.selectHandler = Handler.create(this, this.selectHandler, null, false);
			if (this.dataSource) {
				this._viewUI.btn_tab.selectedIndex = this.dataSource;
			}
			else {
				this._viewUI.btn_tab.selectedIndex = TYPE_INDEX.TYPE_WANFA;
			}
			this._viewUI.panel_type.vScrollBarSkin = "";
			this._viewUI.panel_type.vScrollBar.autoHide = true;
			this._viewUI.panel_type.vScrollBar.elasticDistance = 100;

			this._viewUI.panel_daxiao.vScrollBarSkin = "";
			this._viewUI.panel_daxiao.vScrollBar.autoHide = true;
			this._viewUI.panel_daxiao.vScrollBar.elasticDistance = 100;
		}

		private selectHandler(index: number): void {
			this._viewUI.img_wanfa.visible = this._viewUI.btn_tab.selectedIndex == TYPE_INDEX.TYPE_WANFA;
			this._viewUI.panel_type.visible = this._viewUI.img_type.visible = this._viewUI.btn_tab.selectedIndex == TYPE_INDEX.TYPE_TYPE;
			this._viewUI.panel_daxiao.visible = this._viewUI.img_daxiao.visible = this._viewUI.btn_tab.selectedIndex == TYPE_INDEX.TYPE_DAXIAO;
			this._viewUI.img_beishu.visible = this._viewUI.btn_tab.selectedIndex == TYPE_INDEX.TYPE_BEISHU;
			this._viewUI.img_point.visible = this._viewUI.btn_tab.selectedIndex == TYPE_INDEX.TYPE_POINT;
		}

		public close(): void {
			if (this._viewUI) {
				this._viewUI.btn_tab.selectedIndex = -1;
			}

			super.close();
		}
	}
}