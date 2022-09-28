import { Canvas, Debug, GameObject, Sprite } from "UnityEngine";
import { Button, Image } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";

export enum MissionType {
  BOOKLOAN = 0,
  FINDGHOST = 1,
  BECOMEGHOST = 2,
}
export default class MissionController extends ZepetoScriptBehaviour {
  public worldCanvas: Canvas;

  public questButton: Button;
  public questPanel: GameObject;
  public questImage: Image;
  public questExitButton: Button;

  public questImages: Image[];

  public questUnClearSprite: Sprite;
  public questClearSprite: Sprite;
  public questCompleteSprite: Sprite;

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
      this.questButton.gameObject.SetActive(false);
      this.questPanel.SetActive(true);
      this.worldCanvas.worldCamera = ZepetoPlayers.instance.ZepetoCamera.camera;
    });
    this.questButton.onClick.AddListener(() => {
      this.questButton.gameObject.SetActive(false);
      this.questPanel.SetActive(true);
    });

    this.questExitButton.onClick.AddListener(() => {
      this.questButton.gameObject.SetActive(true);
      this.questPanel.SetActive(false);
    });
  }

  MissionClear(missionType: MissionType) {
    // console.log(this.missionList[MissionType.FINDGHOST]);
    // console.log(this.missionList[1]);
    // console.log(MissionType.FINDGHOST);

    this.missionList[missionType] = true;

    this.questImages[missionType].sprite = this.questClearSprite;

    let isClear = true;
    for (let i = 0; i < this.missionList.length; i++) {
      const item = this.missionList[i];
      console.log(item);
      if (!item) {
        console.log("클리어 실패");
        isClear = false;
      }
    }
    if (isClear) {
      this.questImages.forEach((item) => {
        item.gameObject.SetActive(false);
      });
      this.questImage.sprite = this.questCompleteSprite;

      this.questButton.gameObject.SetActive(false);
      this.questPanel.SetActive(true);
    }
  }
}
