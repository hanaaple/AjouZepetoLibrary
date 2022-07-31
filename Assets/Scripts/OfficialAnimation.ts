import {
  Application,
  GameObject,
  Rect,
  Sprite,
  Vector2,
  WaitUntil,
} from "UnityEngine";
import { Button, Image } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { Content, OfficialContentType, ZepetoWorldContent } from "ZEPETO.World";
import AnimationLinker from "./AnimationSynchronizer";
import ClientStarter from "./ClientStarter";
import SS_UIController from "./SS_UIController";
import UIGesture from "./UIGesture";

export default class OfficialAnimation extends ZepetoScriptBehaviour {
  // public messageButton : Button
  // public quickButton : Button
  public uiGesture: GameObject;
  public _uiGesture: UIGesture;

  private gestureItemIndex: number = 0;
  private poseItemIndex: number = 0;
  private ContentsLen: number = -1;

  public uiController: GameObject;
  private _uiController: SS_UIController;

  public gestures: number[];
  public poses: number[];

  public isAll: boolean;

  // Start() {
  //   this._uiController = this.uiController.GetComponent<SS_UIController>();
  //   this._uiGesture = this.uiGesture.GetComponent<UIGesture>();
  //   ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
  //     ZepetoWorldContent.RequestOfficialContentList(
  //       OfficialContentType.Gesture,
  //       (contents: Content[]) => {
  //         console.log(
  //           "ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ"
  //         );
  //         console.log(contents.length);
  //         var character =
  //           ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
  //         var contentLen: number = 0;
  //         // if(Application.isEditor) return
  //         for (var index = 0; index < contents.length; index++) {
  //           if (!this.isAll) {
  //             var isInclude = this.gestures.includes(index);
  //             if (!isInclude) continue;
  //           }
  //           contentLen++;
  //           const idx = index;
  //           const cnt = contents[idx];
  //           cnt.DownloadAnimation(() => {
  //             console.log("애니메이션");
  //             console.log(idx);
  //             console.log(cnt);
  //             console.log(cnt.AnimationClip);
  //             const aniClip = cnt.AnimationClip;
  //             AnimationLinker.instance.AddGestureAndPoseClip(cnt.AnimationClip);
  //             this._uiGesture.AddGestureClip(aniClip, idx);

  //             if (!Application.isEditor) {
  //               // isDownloadAnimation 기다리다가 실행
  //               cnt.DownloadThumbnail(character, () => {
  //                 ClientStarter.instance.Debug("썸네일");
  //                 ClientStarter.instance.Debug(idx);
  //                 console.log(this.gestureItemIndex);
  //                 var texture = cnt.Thumbnail;
  //                 // ClientStarter.instance.Debug(texture)
  //                 ClientStarter.instance.Debug(texture.width);
  //                 ClientStarter.instance.Debug(texture.height);
  //                 const sprite = Sprite.Create(
  //                   texture,
  //                   new Rect(0, 0, texture.width, texture.height),
  //                   new Vector2(0.5, 0.5)
  //                 );
  //                 this._uiGesture.SetGestureThumbnail(
  //                   sprite,
  //                   this.gestureItemIndex
  //                 );
  //                 this.gestureItemIndex++;
  //                 console.log("인덱스 ++++++++");
  //                 console.log(this.gestureItemIndex);
  //               });
  //             } else {
  //               this._uiGesture.SetGestureThumbnail(
  //                 null,
  //                 this.gestureItemIndex
  //               );
  //               this.gestureItemIndex++;
  //               console.log("인덱스 ++++++++");
  //               console.log(this.gestureItemIndex);
  //             }
  //           });
  //         }
  //         if (this.ContentsLen < 0) this.ContentsLen = 0;
  //         this.ContentsLen += contentLen;
  //         console.log(
  //           "ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ"
  //         );
  //       }
  //     );

  //     ZepetoWorldContent.RequestOfficialContentList(
  //       OfficialContentType.Pose,
  //       (contents: Content[]) => {
  //         console.log(
  //           "ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ"
  //         );
  //         console.log(contents.length);
  //         var character =
  //           ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
  //         // if(Application.isEditor) return
  //         var contentLen: number = 0;
  //         for (var index = 0; index < contents.length; index++) {
  //           const idx = index;
  //           const cnt = contents[idx];
  //           contentLen++;
  //           cnt.DownloadAnimation(() => {
  //             console.log("애니메이션 포즈");
  //             console.log(idx);
  //             console.log(cnt);
  //             console.log(cnt.AnimationClip);
  //             const aniClip = cnt.AnimationClip;
  //             AnimationLinker.instance.AddGestureAndPoseClip(cnt.AnimationClip);
  //             this._uiGesture.AddPoseClip(aniClip, idx);

  //             if (!Application.isEditor) {
  //               // isDownloadAnimation 기다리다가 실행
  //               cnt.DownloadThumbnail(character, () => {
  //                 ClientStarter.instance.Debug("썸네일");
  //                 ClientStarter.instance.Debug(idx);
  //                 var texture = cnt.Thumbnail;
  //                 // ClientStarter.instance.Debug(texture)
  //                 ClientStarter.instance.Debug(texture.width);
  //                 ClientStarter.instance.Debug(texture.height);
  //                 const sprite = Sprite.Create(
  //                   texture,
  //                   new Rect(0, 0, texture.width, texture.height),
  //                   new Vector2(0.5, 0.5)
  //                 );
  //                 this._uiGesture.SetPoseThumbnail(sprite, this.poseItemIndex);
  //                 this.poseItemIndex++;
  //                 console.log("인덱스 ++++++++");
  //                 console.log(this.poseItemIndex);
  //               });
  //             } else {
  //               this._uiGesture.SetPoseThumbnail(null, this.poseItemIndex);
  //               this.poseItemIndex++;
  //               console.log("인덱스 ++++++++");
  //               console.log(this.poseItemIndex);
  //             }
  //           });
  //         }
  //         if (this.ContentsLen < 0) this.ContentsLen = 0;
  //         this.ContentsLen += contentLen;
  //         console.log(
  //           "ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ"
  //         );
  //       }
  //     );
  //     this.StartCoroutine(this.OnCompleteGesture());
  //   });
  // }
  // *OnCompleteGesture() {
  //   console.log(this.ContentsLen);
  //   yield new WaitUntil(() => {
  //     return this.ContentsLen == this.gestureItemIndex + this.poseItemIndex;
  //   });
  //   console.log(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
  //   console.log(this.gestureItemIndex + this.poseItemIndex);
  //   this._uiController.InitUIPos();
  //   console.log(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
  // }
}
