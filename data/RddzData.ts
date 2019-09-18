/**
* 斗地主 
*/
module gamerddz.data {
	export class RddzData extends gamecomponent.object.PlayingPuKeCard {
		public _ownerIdx: number;		//牌的归属座位
		public _cardIndex: number;		//牌的序号
		public _isPlaying: boolean = false;	//是不是打出的牌
		private _mainPlayerIndex: number;
		private _endCardPos: any = [515, 10, 85];	//三张底牌的位置
		myOwner(index: number, seat: number, cardIndex: number) {
			this._mainPlayerIndex = index;
			this._ownerIdx = seat;
			this._cardIndex = cardIndex;
			this.scaleX = -1;
			this.size = 0.2;
		}

		protected Analyze(): void {
			if (this._val == 52) {
				this._card_val = 99;
				this._card_color = 3;
			} else if (this._val == 53) {
				this._card_val = 100;
				this._card_color = 4;
			} else {
				this._card_val = this._val % 13;
				if (this._card_val == 0) this._card_val = 13;
				if (this._card_val == 1) this._card_val = 14;
				this._card_color = Math.floor(this._val / 13);
			}
		}

		fapai() {	//翻底牌
			this.toggleEnable = false;
			this.isFinalPos = true;
			this.size = 0.8;
			this.time_interval = 500;
			this.fanpai();
		}

		mingpai(posX, posY, isSort?) {	//玩家手牌
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.toggleEnable = true;
			this.targe_pos.x = posX;
			this.targe_pos.y = posY;
			this.time_interval = 200;
			this.isFinalPos = false;
			if (isSort) {
				this.size = 1.1;
			} else {
				Laya.Tween.to(this, { size: 1.1 }, this.time_interval);
			}
			if (!this.pos) return;
			Laya.Tween.to(this.pos, { x: this.targe_pos.x, y: this.targe_pos.y }, this.time_interval);
		}

		playingcard(posX, posY) {	//自己打出去的牌
			this.size = 0.7;
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.toggleEnable = false;
			this.isShow = true;
			this.scaleX = 1;
			this.isFinalPos = true;
			this.targe_pos.x = posX;
			this.targe_pos.y = posY;
			this.time_interval = 150;
			this.disable = false;
			if (!this.pos) return;
			Laya.Tween.to(this.pos, { x: this.targe_pos.x, y: this.targe_pos.y }, this.time_interval);
		}

		otherPlayCard() {	//别人打出去的牌
			this.size = 0.7;
			this.isFinalPos = true;
			this._isPlaying = true;
			this.isShow = true;
			this.toggleEnable = false;
			this.disable = false;
		}

		//重连发牌
		refapai(posX, posY) {
			this.size = 1.1;
			this.pos.x = posX;
			this.pos.y = posY;
			this.isShow = true;
			this.scaleX = 1;
			this.isFinalPos = false;
			this.toggleEnable = true;
		}

		fanpai() {
			super.fanpai();
		}
	}
}