import {
  AnimationClip,
  Animator,
  AnimatorOverrideController,
  GameObject,
  Quaternion,
  RuntimeAnimatorController,
  Transform,
} from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { ZepetoPlayer, ZepetoPlayers } from "ZEPETO.Character.Controller";
import ClientStarter from "./ClientStarter";
import WaitForSecondsCash from "./WaitForSecondsCash";
import { Button } from "UnityEngine.UI";
import MoveAnimationInteractor from "./Interact/MoveAnimationInteractor";

class playerData {
  animatorController: RuntimeAnimatorController;
  curMoveAni: string;
  gesture: AnimationClip;
}

export default class AnimationSynchronizer extends ZepetoScriptBehaviour {
  /// 제스처 도중에 사용자 접속하면??
  /// 제스처 도중에 사용자 나가면??

  public takeInteractors: GameObject[];
  private _takeInteractors: MoveAnimationInteractor[];
  public gestures: AnimationClip[]; // GestureName, AnimationClip

  @Header("물건 해제 버튼")
  public putDownButton: Button;
  @Header("--------------------------------")
  @Header("디버그용입니다 넣지 마세용")
  public originalName: string;
  //왜 이거 하나밖에 없어 오류 걸리지 않나?
  // public animationName : string   //현재 animation 이름 - "", "물건 든 상태", "어떤 상태"
  @Header("--------------------------------")
  @Header("애니메이션 형식 기존이름_이름으로 넣으세요. ex) idle_cup")
  public animations: AnimationClip[];

  public interactCanvas: Transform;

  private takingObject: Map<string, GameObject>; // sessionId, TakeObject
  private originalAnimators: Map<string, RuntimeAnimatorController>; // sessionId, RuntimeAnimator
  private animationNames: Map<string, string>; // sessionId, current moveAnimationName for each player
  private playingGesture: Map<string, AnimationClip>; // sessionId, playingGesture

  private static _instance: AnimationSynchronizer;

  public static get instance(): AnimationSynchronizer {
    return this._instance;
  }
  private readonly AniOriginal: string[] = [
    "idle",
    "walk",
    "run",
    "jump_idle",
    "jump_move",
  ];

  public AddGestureAndPoseClip(clip: AnimationClip) {
    this.gestures.push(clip);
  }

  Awake() {
    if (AnimationSynchronizer.instance) {
      GameObject.Destroy(this);
    } else {
      GameObject.DontDestroyOnLoad(this.gameObject);
      AnimationSynchronizer._instance = this;
    }
  }
  Start() {
    this.originalAnimators = new Map<string, RuntimeAnimatorController>();
    this.animationNames = new Map<string, string>();
    this.playingGesture = new Map<string, AnimationClip>();
    this.takingObject = new Map<string, GameObject>();

    this.putDownButton.onClick.AddListener(() => {
      this.SendAnimationToServer("");
    });

    //   this._takeInteractors = new Array<MoveAnimationInteractor>(
    //     this.takeInteractors.length
    //   );

    this._takeInteractors = this.takeInteractors.map((item: GameObject) => {
      return item.GetComponent<MoveAnimationInteractor>();
    });
    //   for (var idx = 0; idx < this.takeInteractors.length; idx++) {
    //     this._takeInteractors[idx] =
    //       this.takeInteractors[idx].GetComponent<MoveAnimationInteractor>();
    //   }
  }

  public AddInteractor(interactButton: GameObject) {
    interactButton.transform.parent = this.interactCanvas;
  }

  //Local에서 Move 애니메이션 실행하는 함수
  // interactor는 targetAni가 있는 경우에만 실행된다.
  SendAnimationToServer(targetName: string, interactor: string = "") {
    const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
    const curAniName = this.GetPlayerAnimation(player.id);
    //
    if (curAniName != targetName) {
      this.SetMoveAnimation(
        player.character.ZepetoAnimator,
        player.id,
        targetName,
        interactor
      );
      if (targetName == null || targetName.length == 0) {
        this.putDownButton.gameObject.SetActive(false);
      } else {
        this.putDownButton.gameObject.SetActive(true);
      }
      // const data = new RoomData()
      // data.Add("prefab", takeObjPrefab.name)
      // const targetObject =
      ClientStarter.instance.SendAnimation(targetName, interactor);
    } else if (this.takingObject.has(player.id)) {
      if (this.takingObject.get(player.id).name != interactor) {
        this.SetMoveAnimation(
          player.character.ZepetoAnimator,
          player.id,
          targetName,
          interactor
        );
        ClientStarter.instance.SendAnimation(targetName, interactor);
      }
    }
  }

  // move 애니메이터 및 클립을 변경시키는 함수 (서버 실행 시 로컬 제외)
  // interactor는 targetAni가 있는 경우에만 실행된다.
  SetMoveAnimation(
    charAnimator: Animator,
    sessionId: string,
    targetAni: string,
    interactor: string = ""
  ) {
    // //animationName - ex) "", "coffee"
    this.SetPlayerAnimation(sessionId, targetAni);

    //Default인 경우
    if (targetAni == null || targetAni.length == 0) {
      this.ResetAniamtor(charAnimator, sessionId);
      if (this.takingObject.has(sessionId)) {
        GameObject.Destroy(this.takingObject.get(sessionId));
        this.takingObject.delete(sessionId);
      }
    } else {
      this.OverrideAnimator(charAnimator, targetAni);

      const moveAni = this._takeInteractors.find(
        (item: MoveAnimationInteractor) => {
          return item.gameObject.name == interactor;
        }
      );
      const player = ZepetoPlayers.instance.GetPlayer(sessionId);
      const takingObj = GameObject.Instantiate<GameObject>(moveAni.prefab);
      takingObj.name = moveAni.name;

      if (this.takingObject.has(sessionId)) {
        GameObject.Destroy(this.takingObject.get(sessionId));
        this.takingObject.delete(sessionId);
      }

      this.takingObject.set(sessionId, takingObj);
      //   player.character
      //     .GetComponentsInChildren<Transform>()
      //     .forEach((characterObj) => {
      //       if (characterObj.name == this.leftHandBone) {
      //         takingObj.transform.parent = characterObj;
      //         takingObj.transform.localPosition = moveAni.posOffset;
      //         takingObj.transform.localRotation = Quaternion.Euler(
      //           moveAni.rotOffset
      //         );
      //       }
      //     });
    }
  }

  OverrideAnimator(charAnimator: Animator, name: string) {
    var overrideController: AnimatorOverrideController =
      new AnimatorOverrideController(charAnimator.runtimeAnimatorController);
    charAnimator.runtimeAnimatorController = overrideController;

    for (var index = 0; index < this.AniOriginal.length; index++) {
      // console.log("아이템 : " + this.AniOriginal[index])
      overrideController[this.AniOriginal[index]] = this.FindAnimationClip(
        this.AniOriginal[index] + "_" + name
      );
    }
  }

  ResetAniamtor(charAnimator: Animator, sessionId: string) {
    charAnimator.runtimeAnimatorController =
      this.originalAnimators.get(sessionId);
  }
  //Local에서 제스처 실행하는 함수
  PlayGesture(targetClip: string, isInfinite: boolean = false) {
    //실행한 상태에서 다시 실행하는 경우에는 ???
    console.log("하이111111");
    const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
    console.log("하이2222222");
    this.GestureHandler(player, targetClip, isInfinite);
    console.log("하이3333333");
    ClientStarter.instance.SendGesture(targetClip, isInfinite);
    console.log("하이4444444");
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

    const clip = this.GetPlayerGesture(targetClip);
    console.log(clip);
    if (clip == undefined || clip == null) {
      this.StopGesture(player);
      return;
    }
    this.SetisGesture(player.id, clip);
    // this.StopCoroutine(this.GestureStop(player.character, clip.length))
    // 쓰읍 실행 중인 플레이어만 멈추려면 StopAllCorutine 쓰면 안되는데
    // 다른데랑 겹친다 Client에서 isGesturing() 체크하는 부분 다시 생각하도록
    this.ResetAniamtor(player.character.ZepetoAnimator, player.id);
    player.character.SetGesture(clip);
    this.StopAllCoroutines();
    if (!isInfinite) {
      this.StartCoroutine(this.GestureStopCoroutine(player, clip.length));
    }
  }
  *GestureStopCoroutine(player: ZepetoPlayer, clipTime: float) {
    yield WaitForSecondsCash.instance.WaitForSeconds(clipTime);
    this.StopGesture(player);
    ClientStarter.instance.SendGesture("");
  }

  StopGesture(player: ZepetoPlayer) {
    if (this.playingGesture.has(player.id)) {
      this.playingGesture.delete(player.id);
    }
    let targetAni = this.GetPlayerAnimation(player.id);
    let animator = player.character.ZepetoAnimator;
    if (targetAni == null || targetAni.length == 0) {
      this.ResetAniamtor(animator, player.id);
    } else {
      this.OverrideAnimator(animator, targetAni);
    }
    player.character.CancelGesture();
  }

  OnAddPlayer(sessionId: string, animator: Animator, animationName: string) {
    this.originalAnimators.set(sessionId, animator.runtimeAnimatorController);
    this.SetPlayerAnimation(sessionId, animationName);
    // this.DeleteGesture(sessionId)
    ///여기
    ///여기
    ///여기
    ///여기
    ///여기
    if (animationName != "") {
      AnimationSynchronizer.instance.OverrideAnimator(animator, animationName);
      // AnimationLinker.instance.OverrideAnimator(zepetoPlayer.character.ZepetoAnimator, player.animation)
    }
  }
  public OnRemovePlayer(sessionId: string) {
    if (this.originalAnimators.has(sessionId))
      this.originalAnimators.delete(sessionId);
    if (this.playingGesture.has(sessionId))
      this.playingGesture.delete(sessionId);
    if (this.animationNames.has(sessionId))
      this.animationNames.delete(sessionId);
    //아이템을 갖고 있을 경우 아이템 삭제
  }

  // item name - asda_idle, asda_jump_move
  FindAnimationClip(name: string): AnimationClip {
    var clip: AnimationClip = this.animations.find((item) => {
      return item.name == name;
    });
    return clip;
  }

  GetPlayerAnimation(sessionId: string): string {
    var animationName: string = this.animationNames.get(sessionId);
    if (animationName) {
      return animationName;
    } else {
      return "";
    }
  }

  SetPlayerAnimation(sessionId: string, name: string) {
    this.animationNames.set(sessionId, name);
  }

  GetPlayerGesture(gestureName: string): AnimationClip {
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
  SetisGesture(sessionId: string, gesture: AnimationClip) {
    if (this.playingGesture.has(sessionId)) {
      ClientStarter.instance.Debug("이미 갖고 있습니다.");
    }
    this.playingGesture.set(sessionId, gesture);
  }
}
