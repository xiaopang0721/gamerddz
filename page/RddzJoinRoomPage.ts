/**
* 斗地主-加入房间
*/
module gamerddz.page {
	export class RddzJoinRoomPage extends gamedating.page.JoinCardRoomBase {
		protected readonly _game_id = "ddz";
		protected readonly _open_id = RddzPageDef.PAGE_DDZ_JOIN_CARDROOM;
	}
}