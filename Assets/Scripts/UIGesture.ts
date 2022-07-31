import {
  AnimationClip,
  Color,
  GameObject,
  Sprite,
  WrapMode,
} from "UnityEngine";
import { Button, Image, Text } from "UnityEngine.UI";
import { ZepetoPlayer, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import AnimationSynchronizer from "./AnimationSynchronizer";
import ClientStarter from "./ClientStarter";
import SS_UIController from "./SS_UIController";
import WaitForSecondsCash from "./WaitForSecondsCash";

export default class UIGesture extends ZepetoScriptBehaviour {
  public defaultColor: Color;
  public infiniteColor: Color;
  public infiniteButton: Button;

  private isInfinite: boolean = false;

  public gestureButtons: Button[];
  public gestureClips: AnimationClip[];
  // private waitForSeconds : WaitForSeconds

  public poseButtons: Button[];
  public poseClips: AnimationClip[];

  private gestureLen: number;
  private poseLen: number;

  public officialDownloader: GameObject;
  //   private _officialDownloader: TTETST;

  //   Start() {
  //     this.gestureLen = this.gestureButtons.length;
  //     this.poseLen = this.poseButtons.length;
  //     this._officialDownloader = this.officialDownloader.GetComponent<TTETST>();
  //     ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
  //       const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
  //       for (var idx = 0; idx < this.gestureButtons.length; idx++) {
  //         let clip = this.gestureClips[idx];
  //         // console.log(this.gestureButtons[idx])
  //         this.gestureButtons[idx].onClick.AddListener(() => {
  //           if (AnimationSynchronizer.instance.GetIsGesturing(player.id)) {
  //             AnimationSynchronizer.instance.StopGesture(player);
  //             if (
  //               clip !=
  //               AnimationSynchronizer.instance.GetPlayingGesture(player.id)
  //             ) {
  //               // this.StopAllCoroutines()
  //               AnimationSynchronizer.instance.PlayGesture(
  //                 clip.name,
  //                 this.isInfinite
  //               );
  //               this.StartCoroutine(this.CheckPlayerMove());
  //             }
  //           } else {
  //             AnimationSynchronizer.instance.PlayGesture(
  //               clip.name,
  //               this.isInfinite
  //             );
  //             this.StartCoroutine(this.CheckPlayerMove());
  //           }
  //         });
  //       }
  //       for (var idx = 0; idx < this.poseButtons.length; idx++) {
  //         let poseClip = this.poseClips[idx];
  //         this.poseButtons[idx].onClick.AddListener(() => {
  //           if (AnimationSynchronizer.instance.GetIsGesturing(player.id)) {
  //             AnimationSynchronizer.instance.StopGesture(player);
  //             if (
  //               poseClip !=
  //               AnimationSynchronizer.instance.GetPlayingGesture(player.id)
  //             ) {
  //               // this.StopAllCoroutines()
  //               AnimationSynchronizer.instance.PlayGesture(poseClip.name, true);
  //               this.StartCoroutine(this.CheckPlayerMove());
  //             }
  //           } else {
  //             AnimationSynchronizer.instance.PlayGesture(poseClip.name, true);
  //             this.StartCoroutine(this.CheckPlayerMove());
  //           }
  //         });
  //       }
  //     });
  //     this.infiniteButton.onClick.AddListener(() => {
  //       this.isInfinite = !this.isInfinite;
  //       if (!this.isInfinite) {
  //         this.infiniteButton.GetComponent<Image>().color = this.defaultColor;
  //         this.infiniteButton.colors.normalColor = this.defaultColor;
  //         this.infiniteButton.colors.highlightedColor = this.defaultColor;
  //         this.infiniteButton.colors.pressedColor = this.GetGrayColor(
  //           this.defaultColor
  //         );
  //         this.infiniteButton.colors.selectedColor = this.defaultColor;
  //         this.infiniteButton.colors.disabledColor = this.GetGrayColor(
  //           this.defaultColor
  //         );
  //       } else {
  //         this.infiniteButton.GetComponent<Image>().color = this.infiniteColor;
  //         this.infiniteButton.colors.normalColor = this.infiniteColor;
  //         this.infiniteButton.colors.highlightedColor = this.infiniteColor;
  //         this.infiniteButton.colors.pressedColor = this.GetGrayColor(
  //           this.infiniteColor
  //         );
  //         this.infiniteButton.colors.selectedColor = this.infiniteColor;
  //         this.infiniteButton.colors.disabledColor = this.GetGrayColor(
  //           this.infiniteColor
  //         );
  //       }
  //     });
  //   }

  //   public AddPoseClip(clip: AnimationClip, idx: number) {
  //     const prefabBtn = this.poseButtons[0];
  //     const poseBtn = GameObject.Instantiate<GameObject>(
  //       prefabBtn.gameObject,
  //       prefabBtn.transform.parent
  //     ).GetComponent<Button>();
  //     // const indexScript = poseBtn.gameObject.GetComponent<TestButtonIndex>()
  //     // indexScript.index = idx
  //     this.poseButtons.push(poseBtn);
  //     this.poseClips.push(clip);
  //     clip.wrapMode = WrapMode.Loop;
  //     console.log(clip.length);
  //     poseBtn.onClick.AddListener(() => {
  //       this._officialDownloader.PoseIndexTest(idx);
  //       const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
  //       // this.StartCoroutine(this.StopGesture(player, clip.length))
  //       if (AnimationSynchronizer.instance.GetIsGesturing(player.id)) {
  //         AnimationSynchronizer.instance.StopGesture(player);
  //         if (
  //           clip != AnimationSynchronizer.instance.GetPlayingGesture(player.id)
  //         ) {
  //           AnimationSynchronizer.instance.PlayGesture(clip.name, true);
  //           this.StartCoroutine(this.CheckPlayerMove());
  //         }
  //       } else {
  //         AnimationSynchronizer.instance.PlayGesture(clip.name, true);
  //         this.StartCoroutine(this.CheckPlayerMove());
  //       }
  //     });
  //   }

  //   public AddGestureClip(clip: AnimationClip, idx: number) {
  //     const prefabBtn = this.gestureButtons[0];
  //     const gestureBtn = GameObject.Instantiate<GameObject>(
  //       prefabBtn.gameObject,
  //       prefabBtn.transform.parent
  //     ).GetComponent<Button>();
  //     // const indexScript = gestureBtn.gameObject.GetComponent<TestButtonIndex>()
  //     // indexScript.index = idx
  //     this.gestureButtons.push(gestureBtn);
  //     this.gestureClips.push(clip);
  //     clip.wrapMode = WrapMode.Loop;
  //     gestureBtn.onClick.AddListener(() => {
  //       // this.StopAllCoroutines()
  //       // this._officialDownloader.GestureIndexTest(idx)
  //       const player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
  //       ClientStarter.instance.Debug(clip.length);
  //       console.log(clip.length);
  //       // this.StartCoroutine(this.StopGesture(player, clip.length))
  //       if (AnimationSynchronizer.instance.GetIsGesturing(player.id)) {
  //         AnimationSynchronizer.instance.StopGesture(player);
  //         if (
  //           clip != AnimationSynchronizer.instance.GetPlayingGesture(player.id)
  //         ) {
  //           AnimationSynchronizer.instance.PlayGesture(
  //             clip.name,
  //             this.isInfinite
  //           );
  //           this.StartCoroutine(this.CheckPlayerMove());
  //         }
  //       } else {
  //         AnimationSynchronizer.instance.PlayGesture(clip.name, this.isInfinite);
  //         this.StartCoroutine(this.CheckPlayerMove());
  //       }
  //     });
  //   }

  //   public SetGestureThumbnail(sprite: Sprite, idx: number) {
  //     // ClientStarter.instance.Debug(sprite)
  //     this.gestureButtons[this.gestureLen + idx].GetComponent<Image>().sprite =
  //       sprite;
  //     // ClientStarter.instance.Debug(this.gestureButtons[this.gestureLen + idx].GetComponent<Image>().sprite)
  //   }
  //   public SetPoseThumbnail(sprite: Sprite, idx: number) {
  //     // ClientStarter.instance.Debug(sprite)
  //     this.poseButtons[this.poseLen + idx].GetComponent<Image>().sprite = sprite;
  //     // ClientStarter.instance.Debug(this.gestureButtons[this.gestureLen + idx].GetComponent<Image>().sprite)
  //   }

  //   *StopGesture(player: ZepetoPlayer, clipTime: float) {
  //     yield WaitForSecondsCash.instance.WaitForSeconds(clipTime);
  //     player.character.CancelGesture();
  //   }

  //   GetGrayColor(color: Color): Color {
  //     let c = new Color(color.r - 0.2, color.g - 0.2, color.b - 0.2, color.a);
  //     return color;
  //   }
  //   // *OnUpdate(){
  //   //     while(true){
  //   //         console.log(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.tryMove)
  //   //         yield null
  //   //     }
  //   // }

  //   *CheckPlayerMove() {
  //     while (!ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.tryMove) {
  //       yield null;
  //     }
  //     AnimationSynchronizer.instance.StopGesture(
  //       ZepetoPlayers.instance.LocalPlayer.zepetoPlayer
  //     );
  //     // this.StopAllCoroutines()
  //   }
}
