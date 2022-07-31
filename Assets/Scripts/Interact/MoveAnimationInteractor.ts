import { Camera, Collider, GameObject, LayerMask, Vector3 } from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import AnimationSynchronizer from "../AnimationSynchronizer";

export default class MoveAnimationInteractor extends ZepetoScriptBehaviour {
  public interactButton: Button;
  private _interactButton: Button;
  @Header("애니메이션 이름을 넣으세요. ex) idle_cup인 경우 cup")
  public animationClipName: string;
  public cameraOffset: Vector3;

  public prefab: GameObject;

  public posOffset: Vector3;
  public rotOffset: Vector3;

  private localCamera: Camera;
  Start() {
    if (this.posOffset == undefined) this.posOffset = Vector3.zero;
    if (this.rotOffset == undefined) this.rotOffset = Vector3.zero;
    this._interactButton = GameObject.Instantiate<GameObject>(
      this.interactButton.gameObject,
      this.interactButton.transform.parent
    ).GetComponent<Button>();
    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.localCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;
    });
    this._interactButton.onClick.AddListener(() => {
      // if(AnimationSynchronizer.instance.isAlreadyAnimating(this.animationClipName)){

      // }
      AnimationSynchronizer.instance.SendAnimationToServer(
        this.animationClipName,
        this.gameObject.name
      );
    });
  }

  Update() {
    if (
      this._interactButton.gameObject.activeSelf &&
      this.localCamera != null
    ) {
      var screenPos = this.localCamera.WorldToScreenPoint(
        Vector3.op_Addition(this.transform.position, this.cameraOffset)
      );
      this._interactButton.transform.position = screenPos;
    }
  }

  OnTriggerEnter(col: Collider) {
    if (col.gameObject.layer === LayerMask.NameToLayer("LocalPlayer")) {
      this._interactButton.gameObject.SetActive(true);
    }
  }

  OnTriggerExit(col: Collider) {
    if (col.gameObject.layer === LayerMask.NameToLayer("LocalPlayer")) {
      this._interactButton.gameObject.SetActive(false);
    }
  }
}
