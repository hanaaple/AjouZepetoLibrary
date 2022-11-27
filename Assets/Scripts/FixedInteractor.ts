import {
  AnimationClip,
  Camera,
  Collider,
  GameObject,
  LayerMask,
  Vector3,
} from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import AnimationLinker from "./AnimationLinker";
import ClientStarter from "./ClientStarter";
import ObjectPooler from "./ObjectPooler";

export default class FixedInteractor extends ZepetoScriptBehaviour {
  public interactButtonPrefab: GameObject;
  private _interactButton: Button;

  public animationClip: AnimationClip;
  public cameraOffset: Vector3;
  public fixedPointOffset: Vector3;
  private localCamera: Camera;

  private isIn: boolean = false;

  Start() {
    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.localCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;
    });
  }

  Update() {
    if (this._interactButton && this.localCamera) {
      var screenPos = this.localCamera.WorldToScreenPoint(
        Vector3.op_Addition(this.transform.position, this.cameraOffset)
      );
      this._interactButton.transform.position = screenPos;
    }
  }

  SetButton(isActive: boolean) {
    if (isActive) {
      const buttonObject = ObjectPooler.instance.GetObject(
        this.interactButtonPrefab
      );
      buttonObject.SetActive(true);
      AnimationLinker.instance.SetInteractorParent(buttonObject);

      this._interactButton = buttonObject.GetComponent<Button>();

      this._interactButton.onClick.AddListener(() => {
        AnimationLinker.instance.PlayGesture(this.animationClip.name, true);
        var offset = Vector3.op_Addition(
          Vector3.op_Addition(
            Vector3.op_Multiply(this.transform.right, this.fixedPointOffset.x),
            Vector3.op_Multiply(this.transform.up, this.fixedPointOffset.y)
          ),
          Vector3.op_Multiply(this.transform.forward, this.fixedPointOffset.z)
        );
        const charTransform =
          ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform;
        charTransform.position = Vector3.op_Addition(
          this.transform.position,
          offset
        );
        charTransform.rotation = this.transform.rotation;
        ClientStarter.instance.SendTransform(charTransform);
        this.StartCoroutine(this.CheckPlayerMove());
        this.SetButton(false);
      });
    } else {
      this._interactButton?.gameObject.SetActive(false);
      this._interactButton?.onClick.RemoveAllListeners();
      this._interactButton = null;
    }
  }

  *CheckPlayerMove() {
    while (true) {
      if (
        AnimationLinker.instance.GetPlayingGesture(
          ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.id
        ) != this.animationClip
      ) {
        if (this.isIn) {
          this.SetButton(true);
        }
        break;
      } else if (
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.tryMove ||
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.tryJump
      ) {
        if (this.isIn) {
          this.SetButton(true);
        }
        AnimationLinker.instance.StopGesture(
          ZepetoPlayers.instance.LocalPlayer.zepetoPlayer
        );
        break;
      }
      yield null;
    }
  }
  OnTriggerEnter(col: Collider) {
    if (col.gameObject.layer != LayerMask.NameToLayer("LocalPlayer")) {
      return;
    }
    this.isIn = true;
    this.SetButton(true);
  }

  OnTriggerExit(col: Collider) {
    if (col.gameObject.layer != LayerMask.NameToLayer("LocalPlayer")) {
      return;
    }
    this.isIn = false;
    this.SetButton(false);
  }
}
