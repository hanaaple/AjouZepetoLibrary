import { Canvas } from "UnityEngine";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";

export enum MissionType {
  BOOKLOAN = 0,
  FINDGHOST = 1,
  BECOMEGHOST = 2,
}
export default class MissionController extends ZepetoScriptBehaviour {
  public worldCanvas: Canvas;

  public missionList: boolean[];
  public static instance: MissionController;
  // 책 대출
  // 귀신 찾기(버튼)
  // 귀신 되기

  Awake() {
    if (!MissionController.instance) {
      MissionController.instance = this;
    }
  }
  Start() {
    this.missionList = new Array<boolean>(3);
    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.worldCanvas.worldCamera = ZepetoPlayers.instance.ZepetoCamera.camera;
    });
  }

  MissionClear(missionType: MissionType) {
    // console.log(this.missionList[MissionType.FINDGHOST]);
    // console.log(this.missionList[1]);
    // console.log(MissionType.FINDGHOST);

    this.missionList[missionType] = true;
    // switch (missionType) {
    //   case MissionType.BOOKLOAN: {
    //     this.missionList[0] = true;
    //     break;
    //   }
    //   case MissionType.FINDGHOST: {
    //     break;
    //   }
    //   case MissionType.BECOMEGHOST: {
    //     this.missionList[2] = true;
    //     break;
    //   }
    //   default:
    //     break;
    // }
  }
}
