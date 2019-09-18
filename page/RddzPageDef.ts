/**
* 斗地主 
*/
module gamerddz.page {
	export class RddzPageDef extends game.gui.page.PageDef {
		static GAME_NAME: string;
		//界面
		static PAGE_DDZ: string = "1";			//HUD界面
		static PAGE_DDZ_MAP: string = "2";		//地图界面
		static PAGE_DDZ_RULE: string = "101";		//规则界面
		static PAGE_DDZ_CREATE_CARDROOM: string = "8";	// 创建房间
		static PAGE_DDZ_CARDROOM_SETTLE: string = "10";	// 房卡结算页
		static PAGE_DDZ_JOIN_CARDROOM: string = "100";		// 加入房间
		static myinit(str: string) {
			super.myinit(str);
			DdzClip.init();
			PageDef._pageClassMap[RddzPageDef.PAGE_DDZ] = RddzPage;
			PageDef._pageClassMap[RddzPageDef.PAGE_DDZ_MAP] = RddzMapPage;
			PageDef._pageClassMap[RddzPageDef.PAGE_DDZ_RULE] = RddzRulePage;
			PageDef._pageClassMap[RddzPageDef.PAGE_DDZ_CREATE_CARDROOM] = RddzCreadRoomPage;
			PageDef._pageClassMap[RddzPageDef.PAGE_DDZ_JOIN_CARDROOM] = RddzJoinRoomPage;
			PageDef._pageClassMap[RddzPageDef.PAGE_DDZ_CARDROOM_SETTLE] = RddzRoomSettlePage;


			this["__needLoadAsset"] = [
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				Path_game_rddz.atlas_game_ui + "doudizhu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "qifu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/fapai_1.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/xipai.atlas",
				Path_game_rddz.atlas_game_ui + "doudizhu/effect/baodan.atlas",
				Path_game_rddz.atlas_game_ui + "doudizhu/effect/chuntian.atlas",
				Path_game_rddz.atlas_game_ui + "doudizhu/effect/feiji.atlas",
				Path_game_rddz.atlas_game_ui + "doudizhu/effect/huojian.atlas",
				Path_game_rddz.atlas_game_ui + "doudizhu/effect/shunzi.atlas",
				Path_game_rddz.atlas_game_ui + "doudizhu/effect/boom.atlas",

				PathGameTongyong.atlas_game_ui_tongyong + "jiaru.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "logo.atlas",
				Path.custom_atlas_scene + 'card.atlas',
				Path.map + 'pz_ddz.png',
				Path.map_far + 'bg_ddz.jpg'
			]

			if (WebConfig.needMusicPreload) {
				this["__needLoadAsset"] = this["__needLoadAsset"].concat([
					Path_game_rddz.music_ddz + "man_1_2.mp3",
					Path_game_rddz.music_ddz + "man_1_3.mp3",
					Path_game_rddz.music_ddz + "man_1_4.mp3",
					Path_game_rddz.music_ddz + "man_1_5.mp3",
					Path_game_rddz.music_ddz + "man_1_6.mp3",
					Path_game_rddz.music_ddz + "man_1_7.mp3",
					Path_game_rddz.music_ddz + "man_1_8.mp3",
					Path_game_rddz.music_ddz + "man_1_9.mp3",
					Path_game_rddz.music_ddz + "man_1_10.mp3",
					Path_game_rddz.music_ddz + "man_1_11.mp3",
					Path_game_rddz.music_ddz + "man_1_12.mp3",
					Path_game_rddz.music_ddz + "man_1_13.mp3",
					Path_game_rddz.music_ddz + "man_1_14.mp3",
					Path_game_rddz.music_ddz + "man_1_99.mp3",
					Path_game_rddz.music_ddz + "man_1_100.mp3",
					Path_game_rddz.music_ddz + "man_2_2.mp3",
					Path_game_rddz.music_ddz + "man_2_3.mp3",
					Path_game_rddz.music_ddz + "man_2_4.mp3",
					Path_game_rddz.music_ddz + "man_2_5.mp3",
					Path_game_rddz.music_ddz + "man_2_6.mp3",
					Path_game_rddz.music_ddz + "man_2_7.mp3",
					Path_game_rddz.music_ddz + "man_2_8.mp3",
					Path_game_rddz.music_ddz + "man_2_9.mp3",
					Path_game_rddz.music_ddz + "man_2_10.mp3",
					Path_game_rddz.music_ddz + "man_2_11.mp3",
					Path_game_rddz.music_ddz + "man_2_12.mp3",
					Path_game_rddz.music_ddz + "man_2_13.mp3",
					Path_game_rddz.music_ddz + "man_2_14.mp3",
					Path_game_rddz.music_ddz + "man_3_2.mp3",
					Path_game_rddz.music_ddz + "man_3_3.mp3",
					Path_game_rddz.music_ddz + "man_3_4.mp3",
					Path_game_rddz.music_ddz + "man_3_5.mp3",
					Path_game_rddz.music_ddz + "man_3_6.mp3",
					Path_game_rddz.music_ddz + "man_3_7.mp3",
					Path_game_rddz.music_ddz + "man_3_8.mp3",
					Path_game_rddz.music_ddz + "man_3_9.mp3",
					Path_game_rddz.music_ddz + "man_3_10.mp3",
					Path_game_rddz.music_ddz + "man_3_11.mp3",
					Path_game_rddz.music_ddz + "man_3_12.mp3",
					Path_game_rddz.music_ddz + "man_3_13.mp3",
					Path_game_rddz.music_ddz + "man_3_14.mp3",
					Path_game_rddz.music_ddz + "man_4.mp3",
					Path_game_rddz.music_ddz + "man_5.mp3",
					Path_game_rddz.music_ddz + "man_6.mp3",
					Path_game_rddz.music_ddz + "man_7.mp3",
					Path_game_rddz.music_ddz + "man_8.mp3",
					Path_game_rddz.music_ddz + "man_9.mp3",
					Path_game_rddz.music_ddz + "man_10.mp3",
					Path_game_rddz.music_ddz + "man_11.mp3",
					Path_game_rddz.music_ddz + "man_pass1.mp3",
					Path_game_rddz.music_ddz + "man_pass2.mp3",
					Path_game_rddz.music_ddz + "man_pass3.mp3",
					Path_game_rddz.music_ddz + "man_pass4.mp3",
					Path_game_rddz.music_ddz + "man_bujiao.mp3",
					Path_game_rddz.music_ddz + "man_jiaodizhu.mp3",
					Path_game_rddz.music_ddz + "man_buqiang.mp3",
					Path_game_rddz.music_ddz + "man_qiangdizhu1.mp3",
					Path_game_rddz.music_ddz + "man_qiangdizhu2.mp3",
					Path_game_rddz.music_ddz + "man_chuntian.mp3",
					Path_game_rddz.music_ddz + "man_wangzha.mp3",
					Path_game_rddz.music_ddz + "man_yupai_1.mp3",
					Path_game_rddz.music_ddz + "man_yupai_2.mp3",
					Path_game_rddz.music_ddz + "man_chupai1.mp3",
					Path_game_rddz.music_ddz + "man_chupai2.mp3",
					Path_game_rddz.music_ddz + "ddz_BGM.mp3",
					Path_game_rddz.music_ddz + "woman_1_2.mp3",
					Path_game_rddz.music_ddz + "woman_1_3.mp3",
					Path_game_rddz.music_ddz + "woman_1_4.mp3",
					Path_game_rddz.music_ddz + "woman_1_5.mp3",
					Path_game_rddz.music_ddz + "woman_1_6.mp3",
					Path_game_rddz.music_ddz + "woman_1_7.mp3",
					Path_game_rddz.music_ddz + "woman_1_8.mp3",
					Path_game_rddz.music_ddz + "woman_1_9.mp3",
					Path_game_rddz.music_ddz + "woman_1_10.mp3",
					Path_game_rddz.music_ddz + "woman_1_11.mp3",
					Path_game_rddz.music_ddz + "woman_1_12.mp3",
					Path_game_rddz.music_ddz + "woman_1_13.mp3",
					Path_game_rddz.music_ddz + "woman_1_14.mp3",
					Path_game_rddz.music_ddz + "woman_1_99.mp3",
					Path_game_rddz.music_ddz + "woman_1_100.mp3",
					Path_game_rddz.music_ddz + "woman_2_2.mp3",
					Path_game_rddz.music_ddz + "woman_2_3.mp3",
					Path_game_rddz.music_ddz + "woman_2_4.mp3",
					Path_game_rddz.music_ddz + "woman_2_5.mp3",
					Path_game_rddz.music_ddz + "woman_2_6.mp3",
					Path_game_rddz.music_ddz + "woman_2_7.mp3",
					Path_game_rddz.music_ddz + "woman_2_8.mp3",
					Path_game_rddz.music_ddz + "woman_2_9.mp3",
					Path_game_rddz.music_ddz + "woman_2_10.mp3",
					Path_game_rddz.music_ddz + "woman_2_11.mp3",
					Path_game_rddz.music_ddz + "woman_2_12.mp3",
					Path_game_rddz.music_ddz + "woman_2_13.mp3",
					Path_game_rddz.music_ddz + "woman_2_14.mp3",
					Path_game_rddz.music_ddz + "woman_3_2.mp3",
					Path_game_rddz.music_ddz + "woman_3_3.mp3",
					Path_game_rddz.music_ddz + "woman_3_4.mp3",
					Path_game_rddz.music_ddz + "woman_3_5.mp3",
					Path_game_rddz.music_ddz + "woman_3_6.mp3",
					Path_game_rddz.music_ddz + "woman_3_7.mp3",
					Path_game_rddz.music_ddz + "woman_3_8.mp3",
					Path_game_rddz.music_ddz + "woman_3_9.mp3",
					Path_game_rddz.music_ddz + "woman_3_10.mp3",
					Path_game_rddz.music_ddz + "woman_3_11.mp3",
					Path_game_rddz.music_ddz + "woman_3_12.mp3",
					Path_game_rddz.music_ddz + "woman_3_13.mp3",
					Path_game_rddz.music_ddz + "woman_3_14.mp3",
					Path_game_rddz.music_ddz + "woman_4.mp3",
					Path_game_rddz.music_ddz + "woman_5.mp3",
					Path_game_rddz.music_ddz + "woman_6.mp3",
					Path_game_rddz.music_ddz + "woman_7.mp3",
					Path_game_rddz.music_ddz + "woman_8.mp3",
					Path_game_rddz.music_ddz + "woman_9.mp3",
					Path_game_rddz.music_ddz + "woman_10.mp3",
					Path_game_rddz.music_ddz + "woman_11.mp3",
					Path_game_rddz.music_ddz + "woman_pass1.mp3",
					Path_game_rddz.music_ddz + "woman_pass2.mp3",
					Path_game_rddz.music_ddz + "woman_pass3.mp3",
					Path_game_rddz.music_ddz + "woman_pass4.mp3",
					Path_game_rddz.music_ddz + "woman_bujiao.mp3",
					Path_game_rddz.music_ddz + "woman_jiaodizhu.mp3",
					Path_game_rddz.music_ddz + "woman_buqiang.mp3",
					Path_game_rddz.music_ddz + "woman_qiangdizhu1.mp3",
					Path_game_rddz.music_ddz + "woman_qiangdizhu2.mp3",
					Path_game_rddz.music_ddz + "woman_chuntian.mp3",
					Path_game_rddz.music_ddz + "woman_wangzha.mp3",
					Path_game_rddz.music_ddz + "woman_yupai_1.mp3",
					Path_game_rddz.music_ddz + "woman_yupai_2.mp3",
					Path_game_rddz.music_ddz + "woman_chupai1.mp3",
					Path_game_rddz.music_ddz + "woman_chupai2.mp3",
				])
			}
		}
	}
}