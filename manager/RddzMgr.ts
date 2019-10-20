/**
* 斗地主
*/
module gamerddz.manager {
	const enum CARD_TYPE {
		CARDS_TYPE_WUXIAO = 0, //无效牌
		CARDS_TYPE_DAN = 1, //单张
		CARDS_TYPE_DUI = 2, //对子
		CARDS_TYPE_SAN = 3, //三张
		CARDS_TYPE_SANDAIYI = 4, //三带一
		CARDS_TYPE_SANDAIER = 5, //三带一对
		CARDS_TYPE_SHUN = 6, //顺子
		CARDS_TYPE_BOMB = 7, //炸弹
		CARDS_TYPE_LIANDUI = 8, //连对
		CARDS_TYPE_SIDAIER = 9, //四带二
		CARDS_TYPE_SIDAIDUI = 10, //四带二对
		CARDS_TYPE_FEIJI = 11, //飞机
		CARDS_TYPE_FEIJI_DAN = 12, //飞机带单
		CARDS_TYPE_FEIJI_DUI = 13, //飞机带对
	}
	const MIN_CHECKTIME: number = 1000;//最小检测时间间隔(毫秒)

	export class RddzMgr extends gamecomponent.managers.PlayingCardMgrBase<RddzData>{
		public isReLogin: boolean;		//是否断线重连，各种判断操作用的
		public isShowCards: boolean = false;	//是否翻牌
		public allCards: any = [];	//主玩家手牌
		public otherCards: any = [];//其他玩家手牌
		public maxCardVal: number = 0;	//所选牌型最大牌值
		public endCards: any = [];	//底牌
		public diZhuSeat: number;

		static readonly MAPINFO_OFFLINE: string = "DdzMgr.MAPINFO_OFFLINE";//假精灵
		static readonly DEAL_CARDS: string = "DdzMgr.DEAL_CARDS";//发牌结束
		static readonly WXSHARE_TITLE = "斗地主]房号:{0}";	// 分享标题
		static readonly WXSHARE_DESC = "开好房喽,就等你们一起来玩斗地主啦!晚了位置就没了哟~";	// 分享内容

		private _offsetTime: number//剩余检测时间(毫秒)
		private _unitOffline: UnitOffline;//假精灵信息
		private _cardsTemp: any = [[], [], [], []];	//玩家出牌数据
		private _reStart: boolean = false;//是否重开游戏
		private _totalUnitCount: number = 3;	// 玩家数量
		private _centerPosTemp = [640, 450, 36];	//主玩家出牌中间那张牌的位置
		private _centerPlayPosTemp = [700, 625, 50];	//主玩家手牌中间那张牌的位置
		private _playCardsPos = [[1040, 280, -22], [240, 280, 22]];	//其他人出牌第一张位置,3人场
		private _endCardPos: any = [551, 75, 88];	//三张底牌的第一张位置
		private _playFaPaiPos = [[181, 309], [1124, 309]];//其他人发牌位置，3人场

		constructor(game: Game) {
			super(game);
		}

		get unitOffline() {
			return this._unitOffline;
		}

		set unitOffline(v) {
			this._unitOffline = v;
			this.event(RddzMgr.MAPINFO_OFFLINE)
		}

		get totalUnitCount() {
			return this._totalUnitCount;
		}

		set totalUnitCount(v: number) {
			this._totalUnitCount = v;
		}

		get reStart() {
			return this._reStart;
		}

		set reStart(b: boolean) {
			this._reStart = b;
		}

		//重新初始化牌
		Init(all_val: Array<number>, create_fun: Handler): void {
			this._cards.length = 0;
			for (let i: number = 0; i < all_val.length; i++) {
				let card: RddzData;
				card = create_fun.run();
				card.Init(all_val[i]);
				card.index = i;
				this._cards.push(card)
			}
			create_fun.recover();
			create_fun = null;
		}

		//心跳更新
		update(diff: number) {
			if (this._offsetTime > 0) {
				this._offsetTime -= diff;
				return;
			}
			this._offsetTime = MIN_CHECKTIME;
			//测试用的记得删掉
			// let len = this._cards.length;
		}

		//判断对子
		private isDuiZi(cards: any): boolean {
			if (cards.length != 2) return false;
			if (cards[0].GetCardVal() != cards[1].GetCardVal()) return false;
			this.maxCardVal = cards[0].GetCardVal();
			return true;
		}

		//判断3张
		private isSanZhang(cards: any): boolean {
			if (cards.length != 3) return false;
			if (cards[0].GetCardVal() != cards[2].GetCardVal()) return false;
			this.maxCardVal = cards[0].GetCardVal();
			return true;
		}

		//判断3带1
		private isSanDaiYi(cards: any): boolean {
			if (cards.length != 4) return false;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			let temp = this.findSomeCards(copyCards, 3);
			if (temp.length != 3) return false;
			this.maxCardVal = temp[0].GetCardVal();
			return true;
		}

		//判断3带2
		private isSanDaiEr(cards: any): boolean {
			if (cards.length != 5) return false;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			let temp = this.findSomeCards(copyCards, 3);
			if (temp.length != 3) return false;
			if (copyCards[0].GetCardVal() != copyCards[1].GetCardVal()) return false;
			this.maxCardVal = temp[0].GetCardVal();
			return true;
		}

		//判断顺子
		private isShunZi(cards: any): boolean {
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			if (copyCards[0].GetCardVal() == 14) {
				return false;
			}
			if (copyCards.length < 5) return false;
			let val1 = copyCards[0].GetCardVal();
			for (let i = 1; i < copyCards.length; i++) {
				let val2 = copyCards[i].GetCardVal();
				if (val2 + 1 != val1) return false;
				val1 = val2;
			}
			this.maxCardVal = copyCards[0].GetCardVal();
			return true;
		}

		//判断炸弹
		private isBomb(cards: any): boolean {
			if (cards.length != 2 && cards.length != 4) return false;
			//2张就是王炸
			if (cards.length == 2) {
				if (cards[0].GetCardVal() != 100 || cards[1].GetCardVal() != 99) return false;
			} else {
				if (cards[0].GetCardVal() != cards[cards.length - 1].GetCardVal()) return false;
			}
			this.maxCardVal = cards[0].GetCardVal();
			return true;
		}

		//判断连对
		private isLianDui(cards: any): boolean {
			//3连对开始
			if (cards.length < 6) return false;
			if (cards.length % 2 != 0) return false;
			if (cards[0].GetCardVal() == 14) {
				return false;
			}
			let val1 = cards[0].GetCardVal();
			//隔着一张的牌是不是连续的
			for (let i = 1; i < cards.length / 2; i++) {
				let val2 = cards[i * 2].GetCardVal();
				if (val2 + 1 != val1) return false;
				val1 = val2;
			}
			//相邻的牌是不是对子
			for (let i = 0; i < cards.length / 2; i++) {
				if (cards[i * 2].GetCardVal() != cards[i * 2 + 1].GetCardVal()) return false;
			}
			this.maxCardVal = cards[0].GetCardVal();
			return true;
		}

		//判断四带二
		private isSiDaiEr(cards: any): boolean {
			if (cards.length != 6) return false;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			let temp = this.findSomeCards(copyCards, 4);
			if (temp.length != 4) return false;
			this.maxCardVal = temp[0].GetCardVal();
			return true;
		}

		//判断四带二对
		private isSiDaiDui(cards: any): boolean {
			if (cards.length != 8) return false;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			let temp = this.findSomeCards(copyCards, 4);
			if (temp.length != 4) return false;
			let temp1 = this.findDuiZi(copyCards);
			if (temp1.length != 2) return false;
			if (copyCards.length > 0) return false;
			this.maxCardVal = temp[0].GetCardVal();
			return true;
		}

		//判断飞机
		private isFeiJi(cards): boolean {
			//飞机怎么也要6张
			if (cards.length < 6) return false;
			if (cards.length % 3 != 0) return false;
			//有没有2
			if (cards[0].GetCardVal() == 14) return false;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			//需要N个3张
			let szCount = cards.length / 3;
			let temp = this.findSanZhang(copyCards);
			if (temp.length != szCount) return false;
			let val = temp[0][0].GetCardVal();
			//看下是不是连续的3张
			for (let i = 1; i < temp.length; i++) {
				if (temp[i][0].GetCardVal() + 1 != val) return false;
				val = temp[i][0].GetCardVal();
			}
			this.maxCardVal = temp[0][0].GetCardVal();
			return true;
		}

		//判断飞机带翅膀-单张
		private isFeiJiDan(cards: any): boolean {
			//最少也要8张
			if (cards.length < 8) return false;
			if (cards.length % 4 != 0) return false;
			//有没有2
			if (cards[0].GetCardVal() == 14) return false;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			//需要N个4张
			let szCount = cards.length / 4;
			let temp1 = this.findSanZhang(copyCards);
			if (temp1.length < szCount) return false;
			let val = temp1[0][0].GetCardVal();
			let temp = [];
			//找出飞机
			while (temp1.length >= szCount && temp.length == 0) {
				let val = temp1[0][0].GetCardVal();
				let newTemp = [temp1[0]];
				for (let i = 1; i < temp1.length; i++) {
					if (temp1[i][0].GetCardVal() + 1 == val && temp1[i][0].GetCardVal() != 14) {
						val = temp1[i][0].GetCardVal();
						newTemp.push(temp1[i]);
					} else {
						break;
					}
				}
				if (newTemp.length >= szCount) {
					for (let i = 0; i < szCount; i++) {
						for (let k = 0; k < 3; k++) {
							temp.push(newTemp[i][k]);
						}
					}
				}
				for (let i = 0; i < newTemp.length; i++) {
					for (let k = 0; k < temp1.length; k++) {
						if (newTemp[i][0].GetVal() == temp1[k][0].GetVal()) {
							temp1.splice(k, 1);
						}
					}
				}
			}
			if (temp.length == 0) return false;
			this.maxCardVal = temp[0].GetCardVal();
			return true;
		}

		//判断飞机带翅膀-带对
		private isFeiJiDui(cards: any): boolean {
			//最少也要10张
			if (cards.length < 10) return false;
			if (cards.length % 5 != 0) return false;
			//有没有2
			if (cards[0].GetCardVal() == 14) return false;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			//需要N个5张
			let szCount = cards.length / 5;
			let temp1 = this.findSanZhang(copyCards);
			if (temp1.length < szCount) return false;
			let val = temp1[0][0].GetCardVal();
			let temp = [];
			//找出飞机
			while (temp1.length >= szCount && temp.length == 0) {
				let val = temp1[0][0].GetCardVal();
				let newTemp = [temp1[0]];
				for (let i = 1; i < temp1.length; i++) {
					if (temp1[i][0].GetCardVal() + 1 == val && temp1[i][0].GetCardVal() != 14) {
						val = temp1[i][0].GetCardVal();
						newTemp.push(temp1[i]);
					} else {
						break;
					}
				}
				if (newTemp.length >= szCount) {
					for (let i = 0; i < szCount; i++) {
						for (let k = 0; k < 3; k++) {
							temp.push(newTemp[i][k]);
						}
					}
				}
				for (let i = 0; i < newTemp.length; i++) {
					for (let k = 0; k < temp1.length; k++) {
						if (newTemp[i][0].GetVal() == temp1[k][0].GetVal()) {
							temp1.splice(k, 1);
						}
					}
				}
			}
			//剩下必须都是对子
			if (temp.length > 0) {
				let temp2 = this.findDuiZi(copyCards);
				//抽出对子了，还有没有单张
				if (copyCards.length > 0) return false;
			}
			if (temp.length == 0) return false;
			this.maxCardVal = temp[0].GetCardVal();
			return true;
		}

		//找出一堆牌里N张一样的牌
		private findSomeCards(cards: any, count: number): any {
			let temp = [];
			if (cards.length < count) return temp;
			for (let i = 0; i < cards.length - 1; i++) {
				temp = [];
				let val = cards[i].GetCardVal();
				for (let k = 0; k < cards.length; k++) {
					if (cards[k].GetCardVal() == val) {
						temp.push(cards[k]);
					}
				}
				if (temp.length >= count) break;
			}
			if (temp.length >= count) {
				for (let i = 0; i < temp.length; i++) {
					for (let k = 0; k < cards.length; k++) {
						if (temp[i].GetVal() == cards[k].GetVal()) {
							cards.splice(k, 1);
							break;
						}
					}
				}
			} else {
				temp = [];
			}
			return temp;
		}

		//复制数组，1复制到2
		copyTalbe(temp1: any, temp2: any): void {
			for (let i = 0; i < temp1.length; i++) {
				temp2[i] = temp1[i];
			}
		}

		//检查一堆牌是什么类型的
		checkCardsType(cards): number {
			let cardLen = cards.length;
			if (cardLen == 0) return CARD_TYPE.CARDS_TYPE_WUXIAO;	//无效牌
			if (cardLen == 1) {
				this.maxCardVal = cards[0].GetCardVal();
				return CARD_TYPE.CARDS_TYPE_DAN;	//单张
			}
			let result: boolean = false;
			result = this.isDuiZi(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_DUI;	//对子
			result = this.isSanZhang(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_SAN;	//三张
			result = this.isSanDaiYi(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_SANDAIYI;	//三带一
			result = this.isSanDaiEr(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_SANDAIER;	//三带一对
			result = this.isShunZi(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_SHUN;	//顺子
			result = this.isBomb(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_BOMB;	//炸弹
			result = this.isLianDui(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_LIANDUI;	//连对
			result = this.isSiDaiEr(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_SIDAIER;	//四带二
			result = this.isSiDaiDui(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_SIDAIDUI;	//四带二对
			result = this.isFeiJi(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_FEIJI;	//飞机
			result = this.isFeiJiDan(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_FEIJI_DAN;	//飞机带单
			result = this.isFeiJiDui(cards);
			if (result) return CARD_TYPE.CARDS_TYPE_FEIJI_DUI;	//飞机带对
			return CARD_TYPE.CARDS_TYPE_WUXIAO;
		}

		//从手牌里找所有顺子
		findShunZi(cards: any): any {
			let temp = [];
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			if (copyCards.length < 5) return temp;
			//找完2张以上的牌，剩下的都是单张了
			let temp1 = this.findDuiZi(copyCards);
			let temp2 = [];
			for (let i = 0; i < temp1.length; i++) {
				temp2.push(temp1[i][0]);
			}
			//已经没有重复的牌了
			temp2 = temp2.concat(copyCards);
			this.SortCards(temp2);
			for (let i = 0; i < temp2.length; i++) {
				if (temp2[i].GetCardVal() == 14) {
					temp2.splice(i, 1);
				}
			}
			while (temp2.length >= 5) {
				let val = temp2[0].GetCardVal();
				let szTemp = [temp2[0]];
				for (let k = 1; k < temp2.length; k++) {
					if (temp2[k].GetCardVal() + 1 == val) {
						val = temp2[k].GetCardVal();
						szTemp.push(temp2[k]);
					} else {
						break;
					}
				}
				if (szTemp.length >= 5) {
					temp.push(szTemp);
				}
				for (let i = 0; i < szTemp.length; i++) {
					for (let k = 0; k < temp2.length; k++) {
						if (szTemp[i].GetVal() == temp2[k].GetVal()) {
							temp2.splice(k, 1);
							break;
						}
					}
				}
			}
			return temp;
		}

		//从手牌里找所有2张以上
		findDuiZi(cards: any): any {
			let temp = [];
			if (cards.length < 2) return temp;
			let flag: boolean = true;
			while (flag) {
				let temp1 = this.findSomeCards(cards, 2);
				if (temp1.length >= 2) {
					temp.push(temp1)
				} else {
					flag = false;
				}
			}
			return temp;
		}

		//从手牌里找出所有3张以上
		findSanZhang(cards: any): any {
			let temp = [];
			if (cards.length < 3) return temp;
			let flag: boolean = true;
			while (flag) {
				let temp1 = this.findSomeCards(cards, 3);
				if (temp1.length >= 3) {
					temp.push(temp1)
				} else {
					flag = false;
				}
			}
			return temp;
		}

		//从手牌里找出所有炸弹
		private findBomb(cards: any): any {
			let temp = [];
			if (cards.length < 4) return temp;
			let flag: boolean = true;
			while (flag) {
				let temp1 = this.findSomeCards(cards, 4);
				if (temp1.length == 4) {
					temp.push(temp1)
				} else {
					flag = false;
				}
			}
			return temp;
		}

		//提示按钮找牌
		promptBtn(cards: any, type: number, length: number, max_val: number, is_move: boolean): any {
			let allCardsArray = [];
			if (cards.length < length && cards.length < 2) return allCardsArray;
			let copyCards = [];
			this.copyTalbe(cards, copyCards);
			this.SortCardsSmall(copyCards);
			if (type == CARD_TYPE.CARDS_TYPE_DAN) {	//找单张
				let temp1 = this.findDuiZi(copyCards);
				//先找出所有单张
				for (let i = 0; i < copyCards.length; i++) {
					let temp = [];
					if (copyCards[i].GetCardVal() > max_val) {
						temp.push(copyCards[i]);
						allCardsArray.push(temp);
					}
				}
				//再去找多张的
				if (temp1.length > 0) {
					for (let i = 0; i < temp1.length; i++) {
						let temp = [];
						if (temp1[i][0].GetCardVal() > max_val && temp1[i].length < 4) {
							temp.push(temp1[i][0]);
							allCardsArray.push(temp);
						}
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_DUI) {	//找出对子
				let temp1 = this.findDuiZi(copyCards);
				if (temp1.length > 0) {
					for (let i = 0; i < temp1.length; i++) {
						if (temp1[i][0].GetCardVal() > max_val && temp1[i].length == 2) {
							let temp = temp1[i];
							allCardsArray.push(temp);
						}
					}
					for (let i = 0; i < temp1.length; i++) {
						let temp = [];
						if (temp1[i][0].GetCardVal() > max_val && temp1[i].length == 3) {
							for (let k = 0; k < 2; k++) {
								temp.push(temp1[i][k]);
							}
							allCardsArray.push(temp);
						}
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_SAN) {	//3根
				let temp1 = this.findSanZhang(copyCards);
				if (temp1.length > 0) {
					for (let i = 0; i < temp1.length; i++) {
						if (temp1[i][0].GetCardVal() > max_val && temp1[i].length == 3) {
							let temp = temp1[i];
							allCardsArray.push(temp);
						}
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_SANDAIYI) {	//三带一
				let allCards = [];
				this.copyTalbe(cards, allCards);
				this.SortCardsSmall(allCards);
				let temp1 = this.findSanZhang(copyCards);
				if (temp1.length > 0) {
					for (let i = 0; i < temp1.length; i++) {
						if (temp1[i][0].GetCardVal() > max_val && temp1[i].length == 3) {
							let temp = temp1[i];
							allCardsArray.push(temp);
						}
					}
					if (allCardsArray.length > 0) {	//再找单张
						let temp2 = this.findDuiZi(allCards);
						for (let i = 0; i < temp2.length; i++) {
							if (temp2[i].length < 4) {
								allCards.push(temp2[i][0]);
							}
						}
						//把单张和3张拼上
						for (let i = 0; i < allCardsArray.length; i++) {
							for (let k = 0; k < allCards.length; k++) {
								if (allCardsArray[i][0].GetCardVal() != allCards[k].GetCardVal()) {
									allCardsArray[i].push(allCards[k]);
									break;
								}
							}
						}
					}
				}
				if (allCardsArray.length > 0) {
					if (allCardsArray[0].length != length) {
						allCardsArray = [];
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_SANDAIER) {	//三带一对
				let allCards = [];
				this.copyTalbe(cards, allCards);
				this.SortCardsSmall(allCards);
				let temp1 = this.findSanZhang(copyCards);
				if (temp1.length > 0) {
					for (let i = 0; i < temp1.length; i++) {
						if (temp1[i][0].GetCardVal() > max_val && temp1[i].length == 3) {
							let temp = temp1[i];
							allCardsArray.push(temp);
						}
					}
					if (allCardsArray.length > 0) {	//再找对子
						let dz_temp = [];
						let temp2 = this.findDuiZi(allCards)
						for (let i = 0; i < temp2.length; i++) {
							if (temp2[i].length < 4) {
								let temp = []
								temp.push(temp2[i][0]);
								temp.push(temp2[i][1]);
								dz_temp.push(temp)
							}
						}
						//把3条和对子拼上
						for (let i = 0; i < allCardsArray.length; i++) {
							for (let k = 0; k < dz_temp.length; k++) {
								if (allCardsArray[i][0].GetCardVal() != dz_temp[k][0].GetCardVal()) {
									allCardsArray[i].push(dz_temp[k][0]);
									allCardsArray[i].push(dz_temp[k][1]);
									break;
								}
							}
						}
					}
				}
				if (allCardsArray.length > 0) {
					if (allCardsArray[0].length != length) {
						allCardsArray = [];
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_BOMB) {	//找出所有炸弹
				let temp1 = this.findBomb(copyCards);
				if (temp1.length > 0) {
					for (let i = 0; i < temp1.length; i++) {
						if (temp1[i][0].GetCardVal() > max_val) {
							allCardsArray.push(temp1[i]);
						}
					}
				}
				//找下王炸
				if (cards[0].GetCardVal() == 100 && cards[1].GetCardVal() == 99) {
					let temp = []
					temp.push(cards[0]);
					temp.push(cards[1]);
					allCardsArray.push(temp);
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_SIDAIER || type == CARD_TYPE.CARDS_TYPE_SIDAIDUI) {	//找4带2
				let temp1 = this.findBomb(copyCards);
				if (temp1.length > 0) {
					for (let i = 0; i < temp1.length; i++) {
						allCardsArray.push(temp1[i]);
					}
				}
				//找下王炸
				if (cards[0].GetCardVal() == 100 && cards[1].GetCardVal() == 99) {
					let temp = []
					temp.push(cards[0]);
					temp.push(cards[1]);
					allCardsArray.push(temp);
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_LIANDUI) {	//找下连对
				let temp1 = this.findDuiZi(copyCards);
				let min_val = max_val - length / 2 + 1;
				for (let i = 0; i < temp1.length - 1; i++) {
					let val = temp1[i][0].GetCardVal();
					let ld_temp = [];
					ld_temp.push(temp1[i][0]);
					ld_temp.push(temp1[i][1]);
					if (temp1[i].length < 4 && val != 14 && val > min_val) {
						for (let k = i + 1; k < temp1.length; k++) {
							let new_val = temp1[k][0].GetCardVal();
							if (val + 1 == new_val && temp1[k].length < 4 && new_val != 14) {
								val = new_val;
								ld_temp.push(temp1[k][0]);
								ld_temp.push(temp1[k][1]);
								if (ld_temp.length == length) {
									allCardsArray.push(ld_temp);
									break;
								}
							}
						}
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_SHUN) {	//找顺子
				let temp1 = this.findDuiZi(copyCards);
				let min_val = max_val - length + 1;
				for (let i = 0; i < temp1.length; i++) {
					if (temp1[i].length < 4) {
						copyCards.push(temp1[i][0]);	//所有牌都抽一张出来
					}
				}
				this.SortCardsSmall(copyCards);
				for (let i = 0; i < copyCards.length - 1; i++) {
					let val = copyCards[i].GetCardVal();
					let sz_temp = [copyCards[i]];
					if (val < 14 && val > min_val) {
						for (let k = i + 1; k < copyCards.length; k++) {
							let new_val = copyCards[k].GetCardVal();
							if (val + 1 == new_val && new_val < 14) {
								val = new_val;
								sz_temp.push(copyCards[k]);
								if (sz_temp.length == length) {
									allCardsArray.push(sz_temp);
									break;
								}
							}
						}
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_FEIJI) {	//找飞机
				let temp1 = this.findSanZhang(copyCards);
				for (let i = 0; i < temp1.length - 1; i++) {
					let val = temp1[i][0].GetCardVal();
					let st_temp = [];
					st_temp.push(temp1[i][0]);
					st_temp.push(temp1[i][1]);
					st_temp.push(temp1[i][2]);
					if (temp1[i].length < 4 && val != 14 && val > max_val) {
						for (let k = i + 1; k < temp1.length; k++) {
							let new_val = temp1[k][0].GetCardVal();
							if (val + 1 == new_val && temp1[k].length < 4 && new_val != 14) {
								val = new_val;
								st_temp.push(temp1[k][0]);
								st_temp.push(temp1[k][1]);
								st_temp.push(temp1[k][2]);
								if (st_temp.length == length) {
									allCardsArray.push(st_temp);
									break;
								}
							}
						}
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_FEIJI_DAN) {	//飞机带单
				let temp1 = this.findSanZhang(copyCards);
				let szCount = length / 4;
				for (let i = 0; i < temp1.length - 1; i++) {
					let val = temp1[i][0].GetCardVal();
					let st_temp = [];
					st_temp.push(temp1[i][0]);
					st_temp.push(temp1[i][1]);
					st_temp.push(temp1[i][2]);
					if (temp1[i].length < 4 && val != 14 && val > max_val) {
						for (let k = i + 1; k < temp1.length; k++) {
							let new_val = temp1[k][0].GetCardVal();
							if (val + 1 == new_val && temp1[k].length < 4 && new_val != 14) {
								val = new_val;
								st_temp.push(temp1[k][0]);
								st_temp.push(temp1[k][1]);
								st_temp.push(temp1[k][2]);
								if (st_temp.length == szCount * 3) {
									allCardsArray.push(st_temp);
									break;
								}
							}
						}
					}
				}
				if (allCardsArray.length > 0) {	//找下单张
					let allCards = [];
					this.copyTalbe(cards, allCards);
					this.SortCardsSmall(allCards);
					let temp2 = this.findDuiZi(allCards);
					//先把对子以上的牌拼成一个数组
					let dz_temp = allCards;
					let new_temp = [];
					for (let i = 0; i < temp2.length; i++) {
						new_temp = new_temp.concat(temp2[i]);
					}
					//开始找牌做单张用
					for (let i = 0; i < new_temp.length; i++) {
						dz_temp.push(new_temp[i]);
					}
					//拼下飞机带单
					for (let i = 0; i < allCardsArray.length; i++) {
						for (let k = 0; k < dz_temp.length; k++) {
							let val = dz_temp[k].GetCardVal();
							let is_exist = false;
							//找出的单张，是否是飞机里的牌
							for (let l = 0; l < allCardsArray[i].length; l++) {
								if (val == allCardsArray[i][l].GetCardVal()) {
									is_exist = true;
									break;
								}
							}
							if (!is_exist) {
								allCardsArray[i].push(dz_temp[k]);
								if (allCardsArray[i].length == length) {
									break;
								}
							}
						}
					}
				}
				if (allCardsArray.length > 0) {
					if (allCardsArray[0].length != length) {
						allCardsArray = [];
					}
				}
			} else if (type == CARD_TYPE.CARDS_TYPE_FEIJI_DUI) {	//飞机带对子
				let temp1 = this.findSanZhang(copyCards);
				let szCount = length / 5;
				for (let i = 0; i < temp1.length - 1; i++) {
					let val = temp1[i][0].GetCardVal();
					let st_temp = [];
					st_temp.push(temp1[i][0]);
					st_temp.push(temp1[i][1]);
					st_temp.push(temp1[i][2]);
					if (temp1[i].length < 4 && val != 14 && val > max_val) {
						for (let k = i + 1; k < temp1.length; k++) {
							let new_val = temp1[k][0].GetCardVal();
							if (val + 1 == new_val && temp1[k].length < 4 && new_val != 14) {
								val = new_val;
								st_temp.push(temp1[k][0]);
								st_temp.push(temp1[k][1]);
								st_temp.push(temp1[k][2]);
								if (st_temp.length == szCount * 3) {
									allCardsArray.push(st_temp);
									break;
								}
							}
						}
					}
				}
				if (allCardsArray.length > 0) {	//找下对子
					let dz_temp = [];
					let allCards = [];
					this.copyTalbe(cards, allCards);
					this.SortCardsSmall(allCards);
					let temp2 = this.findDuiZi(allCards);
					for (let i = 0; i < temp2.length; i++) {
						//先找下对子
						if (temp2[i].length == 2) {
							dz_temp = dz_temp.concat(temp2[i]);
						}
					}
					//去三条里拆
					for (let i = 0; i < temp2.length; i++) {
						if (temp2[i].length == 3) {
							dz_temp.push(temp2[i][0]);
							dz_temp.push(temp2[i][1])
						}
					}
					//拼下飞机带对
					for (let i = 0; i < allCardsArray.length; i++) {
						for (let k = 0; k < dz_temp.length; k++) {
							let val = dz_temp[k].GetCardVal();
							let is_exist = false;
							//找出的牌，是否是飞机里的牌
							for (let l = 0; l < allCardsArray[i].length; l++) {
								if (val == allCardsArray[i][l].GetCardVal()) {
									is_exist = true;
									break;
								}
							}
							if (!is_exist) {
								allCardsArray[i].push(dz_temp[k]);
								if (allCardsArray[i].length == length) {
									break;
								}
							}
						}
					}
				}
				if (allCardsArray.length > 0) {
					if (allCardsArray[0].length != length) {
						allCardsArray = [];
					}
				}
			}
			//那看下自己有没炸弹
			if (!is_move) {	//滑动选牌的话，就不需要再判断炸弹了
				if (type != CARD_TYPE.CARDS_TYPE_BOMB) {
					let allCards = [];
					this.copyTalbe(cards, allCards);
					this.SortCardsSmall(allCards);
					let temp1 = this.findBomb(allCards);
					for (let i = 0; i < temp1.length; i++) {
						allCardsArray.push(temp1[i])
					}
					if (cards.length > 1) {
						if (cards[0].GetCardVal() == 100 && cards[1].GetCardVal() == 99) {
							let temp = [];
							temp.push(cards[0]);
							temp.push(cards[1]);
							allCardsArray.push(temp);
						}
					}
				}
			}
			return allCardsArray;
		}

		//充值弹框
		alert(str: string, ecb: Function = null, ccb: Function = null, isOnlyOK: boolean = true, okSkin?: string, titleSkin?: string, cancleSkin?: string): void {
			if (!this._game.uiRoot.general.isOpened(TongyongPageDef.PAGE_TONGYONG_TIPS)) {
				this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_TIPS, (tip: TongyongTipsPage) => {
					tip.isOnlyOK = isOnlyOK;
					tip.setInfo(str, ecb, ccb, okSkin, titleSkin, cancleSkin);
				});
			}
		}

		createObj() {
			let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, RddzData) as RddzData;
			card.pos = new Vector2(981, 113);
			return card;
		}

		sort() {
			for (let i = 0; i < this._cards.length; i++) {
				let card = this._cards[i];
				if (i < this._cards.length / this._totalUnitCount)
					this.allCards.push(card);
				else {
					this.otherCards.push(card);
				}
			}
			let mainUnit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit) return;
			let idx = mainUnit.GetIndex();
			if (idx == 0) return;
			let count = 0;
			for (let i = 0; i < this.allCards.length; i++) {
				let card = this.allCards[i] as RddzData;
				if (card) {
					card.myOwner(idx, idx, i);
					card.index = i;
					card.sortScore = -i;
				}
			}
		}

		//对牌进行排序,大到小
		SortCards(cards: any[]) {
			if (!cards) return;
			cards.sort((a: RddzData, b: RddzData) => {
				return a.Compare(b, true);
			});
		}

		//对牌进行排序,小到大
		SortCardsSmall(cards: any[]) {
			if (!cards) return;
			cards.sort((a: RddzData, b: RddzData) => {
				return b.Compare(a, true);
			});
		}

		//发牌
		fapai() {
			let cardSingleCount: number = this.allCards.length;	//一个人的手牌数
			let cardsMainPos = this.getCardsPosTemp(cardSingleCount, true);
			let cardsOtherPos = this._playFaPaiPos;
			let cardIndex = 0;
			let count = 0;
			for (let k = 0; k < this._totalUnitCount; k++) {
				for (let i = 0; i < cardSingleCount; i++) {
					//播音效
					let card: RddzData;
					let cardsPos;
					if (k == this._totalUnitCount - 1) {
						//最后一位给到主玩家
						card = this.allCards[i];
						cardsPos = cardsMainPos[i];
					} else {
						card = this.otherCards[i + (k * cardSingleCount)];
						card.scaleX = 0.3;
						card.scaleY = 0.3;
						cardsPos = cardsOtherPos[k];
					}
					Laya.timer.once(50 * count, this, () => {
						this._game.playSound(PathGameTongyong.music_tongyong + "fapai.mp3", false);
						let posX = cardsPos[0];	//当前座位号的发牌位置
						let posY = cardsPos[1];
						card.mingpai(posX, posY);
						cardIndex++;
						if (cardIndex >= cardSingleCount * this._totalUnitCount)
							this.event(RddzMgr.DEAL_CARDS);
					});
					count++;
				}
			}
		}

		//发底牌
		dealEndCards() {
			this.endCards = [];
			for (let i = 0; i < 3; i++) {
				let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, RddzData) as RddzData;
				let posX = this._endCardPos[0] + this._endCardPos[2] * i;
				let posY = this._endCardPos[1];
				card.pos = new Vector2(posX, posY);
				card.Init(1);
				card.sortScore = -i;
				card.size = 0.8;
				this.endCards.push(card);
			}
		}

		//清理其他的发牌
		clearOtherCard(): void {
			for (let i = 0; i < this.otherCards.length; i++) {
				let card = this.otherCards[i];
				if (card) {
					this._game.sceneObjectMgr.clearOfflineObject(card);
				}
				this.otherCards.splice(i, 1);
				i--
			}
			this.otherCards = [];
		}

		//重连发牌
		refapai() {
			let cardsPos = this.getCardsPosTemp(this.allCards.length, true);
			for (let i = 0; i < this.allCards.length; i++) {
				let card = this.allCards[i] as RddzData;
				let posX = cardsPos[i][0];
				let posY = cardsPos[i][1];
				if (card) {
					card.refapai(posX, posY);
				}
			}
		}

		//显示底牌
		showEndCards(cards: any) {
			for (let i = 0; i < this.endCards.length; i++) {
				let card = this.endCards[i] as RddzData;
				card.Init(cards[i].GetVal());
				if (card) {
					card.fapai();
					//地主底牌加标识
					// card.isShowJB = true;
				}
			}
		}

		//出牌
		playingCard(seat: number, cards: any) {
			if (cards.length < 1) return;
			let mainUnit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit) return;
			let mainIdx = mainUnit.GetIndex();
			if (mainIdx == 0) return;
			this.clearPlayingCard(seat);
			if (seat == mainIdx) {
				let cardsPos = this.getCardsPosTemp(cards.length, false);
				for (let i = 0; i < cards.length; i++) {
					let card: RddzData;
					for (let k = 0; k < this.allCards.length; k++) {
						if (cards[i].GetVal() == this.allCards[k].GetVal()) {
							card = this.allCards[k];
							break;
						}
					}
					let posX = cardsPos[i][0];
					let posY = cardsPos[i][1];
					if (card) {
						card.sortScore = -i;
						card.toggle = false;
						card._isPlaying = true;
						card.playingcard(posX, posY);
						this.delCard(card);
						if (this.diZhuSeat && this.diZhuSeat == seat) {
							card.isShowJB = true;
						} else {
							card.isShowJB = false;
						}
						this._cardsTemp[seat - 1].push(card);
					}
				}
				this.tidyCard();
			} else {
				let posIdx = (seat - mainIdx + this._totalUnitCount) % this._totalUnitCount;
				for (let i = 0; i < cards.length; i++) {
					let posX = this._playCardsPos[posIdx - 1][0] + i * this._playCardsPos[posIdx - 1][2];
					let posY = this._playCardsPos[posIdx - 1][1];
					let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, RddzData) as RddzData;
					card.pos = new Vector2(posX, posY);
					card.Init(cards[i].GetVal());
					if (card) {
						if (posIdx == 1) {
							card.sortScore = i;
						} else {
							card.sortScore = -i;
						}
						if (this.diZhuSeat && this.diZhuSeat == seat) {
							card.isShowJB = true;
						} else {
							card.isShowJB = false;
						}
						card.otherPlayCard();
						this.delCard(card);
						this._cardsTemp[seat - 1].push(card);
					}
				}
			}
		}

		//结束后摊牌
		showCards(seat: number, cards: any): void {
			if (cards.length < 1) return;
			let mainUnit = this._game.sceneObjectMgr.mainUnit;
			if (!mainUnit) return;
			let mainIdx = mainUnit.GetIndex();
			if (mainIdx == 0) return;
			this.clearPlayingCard(seat);
			let posIdx = (seat - mainIdx + this._totalUnitCount) % this._totalUnitCount;
			for (let i = 0; i < cards.length; i++) {
				let posX = this._playCardsPos[posIdx - 1][0] + i * this._playCardsPos[posIdx - 1][2];
				let posY = this._playCardsPos[posIdx - 1][1];
				let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, RddzData) as RddzData;
				card.pos = new Vector2(posX, posY);
				card.Init(cards[i]);
				if (card) {
					if (posIdx == 1) {
						card.sortScore = i;
					} else {
						card.sortScore = -i;
					}
					if (this.diZhuSeat && this.diZhuSeat == seat) {
						card.isShowJB = true;
					} else {
						card.isShowJB = false;
					}
					card.otherPlayCard();
				}
			}
		}

		private getCardsPosTemp(val: number, shoupai: boolean): any {
			let temp = [];
			let cardTemp: any;
			if (shoupai) {
				cardTemp = this._centerPlayPosTemp;
			} else {
				cardTemp = this._centerPosTemp;
			}
			let space = cardTemp[2];
			let posX = cardTemp[0];
			let posY = cardTemp[1];
			for (let i = 1; i <= val; i++) {
				let spaceVal = Math.floor(i / 2);
				let posTemp = [];
				if (i % 2 == 0) {
					posTemp = [posX - space * spaceVal, posY]
				} else {
					posTemp = [posX + space * spaceVal, posY]
				}
				temp.push(posTemp);
			}
			temp.sort((a: number, b: number) => {
				return a[0] - b[0];
			});
			return temp;
		}

		//翻牌
		showMainCards() {
			for (let i = 0; i < this.allCards.length; i++) {
				let card = this.allCards[i];
				if (card) {
					card.fanpai();
				}
			}
			this.isShowCards = true;
		}

		//从手牌中删除
		delCard(card: any): void {
			for (let i = 0; i < this.allCards.length; i++) {
				if (this.allCards[i].GetVal() == card.GetVal()) {
					this.allCards.splice(i, 1);
					break;
				}
			}
		}

		//整理下手牌
		tidyCard() {
			this.SortCards(this.allCards);
			let cardsPos = this.getCardsPosTemp(this.allCards.length, true);
			for (let i = 0; i < this.allCards.length; i++) {
				let card = this.allCards[i];
				if (card) {
					card.sortScore = -i;
					card.index = i;
					card.toggle = false;
					card.disable = false;
					let posX = cardsPos[i][0];
					let posY = cardsPos[i][1];
					card.mingpai(posX, posY, true);
				}
			}
		}

		// 清理卡牌对象
		clearCardObject(): void {
			this._game.sceneObjectMgr.ForEachObject((obj: any) => {
				if (obj instanceof RddzData) {
					this._game.sceneObjectMgr.clearOfflineObject(obj);
				}
			})
			// this._cards = [];
		}

		//清除打出去的卡牌
		clearPlayingCard(seat: number): void {
			for (let i = 0; i < this._cardsTemp[seat - 1].length; i++) {
				let card = this._cardsTemp[seat - 1][i];
				if (card) {
					this._game.sceneObjectMgr.clearOfflineObject(card);
				}
			}
			this._cardsTemp[seat - 1] = [];
		}

		//重置数据
		resetData(): void {
			this._cardsTemp = [[], [], [], []];
			this.isShowCards = false;
			this.allCards = [];
			this.endCards = [];
			this.otherCards = [];
			this.clearCardObject();
		}
	}
}