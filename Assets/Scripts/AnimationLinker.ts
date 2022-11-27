import { AnimationClip, GameObject, Transform } from "UnityEngine";
import { ZepetoPlayer, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import ClientStarter from "./ClientStarter";

export default class AnimationLinker extends ZepetoScriptBehaviour {
  public gestures: AnimationClip[]; // GestureName, AnimationClip

  public interactCanvas: Transform;

  private playingGesture: Map<string, AnimationClip>; // sessionId, playingGesture

  private static _instance: AnimationLinker;

  public static get instance(): AnimationLinker {
    return this._instance;
  }

  public AddGestureAndPoseClip(clip: AnimationClip) {
    this.gestures.push(clip);
  }

  Awake() {
    this.playingGesture = new Map<string, AnimationClip>();
    AnimationLinker._instance = this;
    GameObject.DontDestroyOnLoad(this.gameObject);
  }

  public SetInteractorParent(interactButton: GameObject) {
    interactButton.transform.parent = this.interactCanvas;
  }

  //Local에서 제스처 실행하는 함수
  public PlayGesture(targetClip: string, isInfinite: boolean = false) {
    const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
    this.GestureHandler(player, targetClip, isInfinite);
    ClientStarter.instance.SendGesture(targetClip, isInfinite);
  }

  GestureHandler(
    player: ZepetoPlayer,
    targetClip: string,
    isInfinite: boolean = false
  ) {
    ClientStarter.instance.Debug(
      `제스처 실행 여부 - ${this.GetIsGesturing(player.id)}`
    );
    // if(this.GetIsGesturing(player.id)) return
    ClientStarter.instance.Debug(
      `${player.character.gameObject}가 제스처 실행 - ${targetClip}, ${
        isInfinite ? "무한" : "1회성"
      }`
    );

    if (this.GetIsGesturing(player.id)) {
      this.StopGesture(player);
    }

    const clip = this.GetGesture(targetClip);
    console.log(clip);
    if (!clip) {
      this.StopGesture(player);
    } else {
      this.SetisGesture(player.id, clip);
      player.character.SetGesture(clip);
      this.StopAllCoroutines();
    }
  }

  StopGesture(player: ZepetoPlayer) {
    if (this.playingGesture.has(player.id)) {
      this.playingGesture.delete(player.id);
    }
    player.character.CancelGesture();
  }

  public OnRemovePlayer(sessionId: string) {
    if (this.playingGesture.has(sessionId)) {
      this.playingGesture.delete(sessionId);
    }
  }

  GetGesture(gestureName: string): AnimationClip {
    var clip: AnimationClip = this.gestures.find((item) => {
      return item.name == gestureName;
    });
    return clip;
  }

  public GetPlayingGesture(sessionId: string): AnimationClip {
    return this.playingGesture.get(sessionId);
  }

  GetIsGesturing(sessionId: string): bool {
    var isGesture: bool = this.playingGesture.has(sessionId);
    return isGesture;
  }

  private SetisGesture(sessionId: string, gesture: AnimationClip) {
    if (this.playingGesture.has(sessionId)) {
      ClientStarter.instance.Debug("이미 갖고 있습니다.");
    }
    this.playingGesture.set(sessionId, gesture);
  }
}
