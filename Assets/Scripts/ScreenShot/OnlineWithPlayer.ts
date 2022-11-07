import {
  Animator,
  AvatarIKGoal,
  GameObject,
  Quaternion,
  Transform,
  Vector3,
} from "UnityEngine";
import { ZepetoPlayer } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { Vector3 as Vector3Schema } from "ZEPETO.Multiplay.Schema";
import OnlineSelfieCamera from "./OnlineSelfieCamera";
import ClientStarter from "../ClientStarter";

export default class OnlineWithPlayer extends ZepetoScriptBehaviour {
  private animator: Animator;

  public buttonUI: Transform;
  public cameraTarget: Transform;

  private watchTarget: Transform;
  private gripTarget: Transform;
  private selfieStick: Transform;

  private isWatching: boolean = false;
  private isTaking: boolean = false;

  // target에 대한 body와 head의 weight 설정
  // - head가 target의 움직임에 더 크게 반응하도록 함
  private bodyWeight: number = 0.3;
  private headWeight: number = 0.7;

  private readonly rightHandBone: string = "hand_R";

  Start() {
    this.animator = this.GetComponent<Animator>();
  }

  public Initialize(
    cameraPrefab: GameObject,
    buttonUIPrefab: GameObject,
    canvasRoot: Transform
  ) {
    this.buttonUI = GameObject.Instantiate<GameObject>(
      buttonUIPrefab,
      canvasRoot
    ).transform;
    this.buttonUI.gameObject.SetActive(false);
    this.cameraTarget =
      GameObject.Instantiate<GameObject>(cameraPrefab).transform;
    let selfieCamera = this.cameraTarget.GetComponent<OnlineSelfieCamera>();
    this.gripTarget = selfieCamera.GetGripObject().transform;
  }

  public SetSelfieStick(player: ZepetoPlayer, selfieStickPrefab: GameObject) {
    this.isTaking = true;
    if (!player.isLocalPlayer) {
      this.buttonUI.gameObject.SetActive(true);
      this.selfieStick =
        GameObject.Instantiate<GameObject>(selfieStickPrefab).transform;
      player.character
        .GetComponentsInChildren<Transform>()
        .forEach((characterObj) => {
          if (characterObj.name == this.rightHandBone) {
            this.selfieStick.parent = characterObj;
            this.selfieStick.localPosition = Vector3.zero;
            this.selfieStick.localRotation = Quaternion.Euler(Vector3.zero);
          }
        });
    }
  }

  public RemovePlayer(player: ZepetoPlayer) {
    this.isTaking = false;
    GameObject.Destroy(this.buttonUI.gameObject);
    GameObject.Destroy(this.cameraTarget.gameObject);
    if (!player.isLocalPlayer) {
      GameObject.Destroy(this.selfieStick.gameObject);
      this.cameraTarget = null;
      this.gripTarget = null;
      this.selfieStick = null;
    }
  }

  public Watch(watchTarget: Transform) {
    if (this.isWatching) {
      ClientStarter.instance.Debug("이미 보고 있습니다.");
    } else {
      this.watchTarget = watchTarget;
      this.isWatching = true;
    }
  }

  public StopWatch() {
    if (this.isWatching) {
      this.watchTarget = null;
      this.isWatching = false;
    } else {
      ClientStarter.instance.Debug("이미 껐습니다.");
    }
  }

  // 유저가 로컬이 아닌 경우에만 온다
  // 로컬 --> 온라인 캐릭터 업데이트
  public OnUpdateOnline(player: ZepetoPlayer, screenPos: Vector3) {
    this.buttonUI.position = Vector3.Lerp(
      this.buttonUI.position,
      screenPos,
      0.8
    );
    // ClientStarter.instance.Debug("하이")
    // ClientStarter.instance.Debug(this.buttonUI.gameObject.activeSelf)
    // this.camera.position = this.ParseVector3(takingUser.cameraTransform.position)

    // 찍고 있는 플레이어 foreach
    const takingUser = ClientStarter.instance
      .GetRoom()
      .State.selfiePlayer.get_Item(player.id);

    if (
      takingUser.cameraTransform == null ||
      takingUser.cameraTransform == undefined
    ) {
      ClientStarter.instance.Debug(
        `위험할 뻔 했습니다 - 카메라스키마 transform NULL`
      );
    } else {
      // console.log(takingUser.cameraTransform.position)
      this.cameraTarget.position = this.ParseVector3(
        takingUser.cameraTransform.position
      );
      if (!player.isLocalPlayer) {
        player.character.transform.LookAt(
          new Vector3(
            this.cameraTarget.position.x,
            player.character.transform.position.y,
            this.cameraTarget.position.z
          )
        );
      }
    }
  }

  OnAnimatorIK(layerIndex: number) {
    if (this.isWatching) {
      this.animator.SetLookAtWeight(1, this.bodyWeight, 0.9);
      // lookAt target 설정
      this.animator.SetLookAtPosition(this.watchTarget.position);
    }

    if (this.isTaking) {
      this.animator.SetLookAtWeight(1, this.bodyWeight, this.headWeight);
      // lookAt target 설정
      this.animator.SetLookAtPosition(this.cameraTarget.position);

      // rightHand의 target weight 설정
      this.animator.SetIKPositionWeight(AvatarIKGoal.RightHand, 1);
      // rightHand가 뻗을 위치를 Grip으로 설정
      this.animator.SetIKPosition(
        AvatarIKGoal.RightHand,
        this.gripTarget.position
      );
    }
  }

  ParseVector3(vector3: Vector3Schema): Vector3 {
    return new Vector3(vector3.x, vector3.y, vector3.z);
  }
}
