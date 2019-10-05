/**
* 房卡类型游戏结算页面
*/
module gamerddz.page {
    export class RddzRoomSettlePage extends game.gui.base.Page {
        private _viewUI: ui.nqp.game_ui.doudizhu.JieSuan_FangKaUI;
        private _isGameEnd: boolean = false;  //是否结束

        constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
            super(v, onOpenFunc, onCloseFunc);
            this._isNeedBlack = true;
            this._isClickBlack = false;
            this._asset = [
                PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
            ];
        }

        // 页面初始化函数
        protected init(): void {
            this._viewUI = this.createView('game_ui.doudizhu.JieSuan_FangKaUI');
            this.addChild(this._viewUI);
        }

        // 页面打开时执行函数
        protected onOpen(): void {
            super.onOpen();
            this._viewUI.list_settle.itemRender = this.createChildren("game_ui.tongyong.JieSuanRender2UI", ListRecordItem);
            this._viewUI.list_settle.renderHandler = new Handler(this, this.renderHandler);
            this._viewUI.list_settle.dataSource = this.dataSource[2];
            this._isGameEnd = this.dataSource[3] >= MAP_STATUS.MAP_STATE_END;
            this.setGameEndBtnState(this._isGameEnd);
        }

        //按钮点击
        protected onBtnTweenEnd(e: LEvent, target: any) {
            switch (target) {
                case this._viewUI.btn_create_room:
                    this._game.uiRoot.general.open(RddzPageDef.PAGE_DDZ_CREATE_CARDROOM);
                    this.close();
                    break;
                case this._viewUI.btn_close:
                    this._game.sceneObjectMgr.leaveStory(true);
                    break;
                default:
                    break;
            }
        }

        // 设置最后结束时的按纽状态
        private setGameEndBtnState(isEventOn) {
            this._viewUI.box_jx_info.visible = !this._isGameEnd;
            this._viewUI.btn_create_room.visible = this._viewUI.box_js_info.visible = this._isGameEnd;
            let str = StringU.substitute("本轮游戏已满{0}局...", HtmlFormat.addHtmlColor(this.dataSource[0], TeaStyle.COLOR_YELLOW));
            TextFieldU.setHtmlText(this._viewUI.lb_js, str);
            this._viewUI.btn_close.visible = this._isGameEnd;
            if (isEventOn) {
                this._viewUI.btn_create_room.on(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_close.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            } else {
                this._viewUI.btn_create_room.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_close.off(LEvent.CLICK, this, this.onBtnClickWithTween);
            }
        }

        private renderHandler(cell: ListRecordItem, index: number) {
            if (cell) {
                cell.setData(this._game, cell.dataSource);
            }
        }

        protected onBlackSpriteClick() {
            if (!this._isGameEnd) return;
            super.onBlackSpriteClick();
        }

        //倒计时
        private _endTime = this._game.sync.serverTimeBys + 5;
        deltaUpdate(): void {
            if (!this._isGameEnd) {
                let curTime = this._game.sync.serverTimeBys;
                let time = Math.floor(this._endTime - curTime) + 1;
                if (time > 0) {
                    let str = StringU.substitute("{0}后开始{1}{2}局...", HtmlFormat.addHtmlColor(time + "s", TeaStyle.COLOR_YELLOW), HtmlFormat.addHtmlColor(this.dataSource[0] + "/", TeaStyle.COLOR_YELLOW), HtmlFormat.addHtmlColor(this.dataSource[1], TeaStyle.COLOR_YELLOW));
                    TextFieldU.setHtmlText(this._viewUI.lab_xinxi, str);
                } else {
                    // 最后一局不自动关闭
                    this.close();
                }
            }
        }

        public close(): void {
            this.setGameEndBtnState(false);
            super.close();
        }
    }

    class ListRecordItem extends ui.nqp.game_ui.tongyong.JieSuanRender2UI {
        private _game: Game;
        private _data: any;
        setData(game: Game, data: any) {
            this._game = game;
            this._data = data;
            this.img_banker.visible = this._data.isDiZhu;
            this.img_banker.skin = Path_game_rddz.ui_ddz + "tu_dizhu.png";
            this.img_bg.visible = this._data.isMain;
            this.lab_name.text = this._data.name;
            this.lab_chip.text = this._data.multiple;
            this.lab_multiple.text = this._data.cardCount;
            this.lab_point.text = this._data.point ? this._data.point : "0";
            this.lbl_totalpoint.text = String(this._data.totalPoint);
            this.lab_name.color = this._data.isMain ? "#cc90ff" : "#ffffff";
            this.lab_point.color = parseFloat(this._data.point) >= 0 ? "#069e00" : "#ff0000";
            this.lbl_totalpoint.color = parseFloat(this._data.totalPoint) >= 0 ? "#069e00" : "#ff0000";
        }

        destroy() {
            super.destroy();
        }
    }
}