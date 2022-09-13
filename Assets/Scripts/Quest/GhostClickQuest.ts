import { Camera, GameObject, Transform, Vector3 } from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import MissionController, { MissionType } from "./MissionController";

export default class GhostClickQuest extends ZepetoScriptBehaviour {
  @SerializeField()
  private canvasParent: Transform;

  public ghostButtonPrefab: GameObject;

  public ghostObjectList: GameObject[];
  private ghostButton: Button[];

  public buttonOffset: Vector3;

  private zepetoCamera: Camera;

  Start() {
    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.zepetoCamera = ZepetoPlayers.instance.ZepetoCamera.camera;
    });
    this.ghostButton = new Array<Button>();
    this.ghostObjectList.forEach((item) => {
      const t = GameObject.Instantiate<GameObject>(
        this.ghostButtonPrefab,
        this.canvasParent
      );
      const tButton = t.GetComponent<Button>();
      tButton.onClick.AddListener(() => {
        MissionController.instance.MissionClear(MissionType.FINDGHOST);
        const len = this.ghostObjectList.length;
        for (let i = 0; i < len; i++) {
          GameObject.Destroy(this.ghostButton[i].gameObject);
        }
        this.ghostButton = null;
        this.zepetoCamera = null;
      });
      this.ghostButton.push(tButton);
    });
  }

  Update() {
    if (this.zepetoCamera != null) {
      this.ghostObjectList.forEach((item, idx) => {
        this.ghostButton[idx].transform.position = Vector3.op_Addition(
          this.transform.position,
          this.buttonOffset
        );

        this.ghostButton[idx].transform.LookAt(this.zepetoCamera.transform);

        this.ghostButton[idx].transform.eulerAngles = Vector3.op_Addition(
          this.ghostButton[idx].transform.eulerAngles,
          new Vector3(0, 180, 0)
        );
      });
    }
  }
}
