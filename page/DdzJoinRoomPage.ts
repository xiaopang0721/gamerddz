/**
* 斗地主-加入房间
*/
module gameddz.page {
	export class DdzJoinRoomPage extends gametongyong.page.JoinCardRoomBase {
		protected readonly _game_id = "ddz";
		protected readonly _open_id = DdzPageDef.PAGE_DDZ_JOIN_CARDROOM;
	}
}