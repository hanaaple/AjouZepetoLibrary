import {
  AudioClip,
  AudioSource,
  Canvas,
  GameObject,
  Rect,
  RectTransform,
  Screen,
  Sprite,
  Vector2,
  YieldInstruction,
} from "UnityEngine";
import { Button, Image } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import WaitForSecondsCash from "../WaitForSecondsCash";
import CaptureController from "./CaptureController";
import ScreenShotModeManager from "./ScreenShotModeManager";

export default class ScreenShotUiController extends ZepetoScriptBehaviour {
  @Header("Safe Area")
  public safeAreaObject: GameObject;

  @Header("ScreenShot Panels")
  public zepetoScreenShotCanvas: Canvas;
  public screenDefaultPanel: GameObject;
  public screenShotModePanel: GameObject;
  public screenShotResultPanel: GameObject;
  public screenShotFeedPanel: GameObject;

  @Header("ScreenShot Audio")
  public audioSource: AudioSource;
  public screenShotAudio: AudioClip;

  @Header("ScreenShot Mode")
  public screenShotModeButton: Button;
  public shootScreenShotButton: Button;
  public screenShotModeExitButton: Button;
  public viewChangeButton: Button;
  private viewChangeImage: Image;
  public selfiViewSprite: Sprite;
  public thirdPersonViewSprite: Sprite;
  public videoModeButton: Button;
  public imageModeButton: Button;
  public focusedVideoModeSprite: Sprite;
  public idleVideoModeSprite: Sprite;
  public focusedImageModeSprite: Sprite;
  public idleImageModeSprite: Sprite;

  @Header("ScreenShot Result")
  public saveButton: Button;
  public shareButton: Button;
  public feedButton: Button;
  public screenShotResultExitButton: Button;

  @Header("ScreenShot Feed")
  public createFeedButton: Button;
  public feedBackButton: Button;

  @Header("스크립트 모음 오브젝트")
  public captureController: GameObject;
  public screenShotModeManager: GameObject;

  private _screenShotModeManager: ScreenShotModeManager;
  private _captureController: CaptureController;

  @Header("Toast Message")
  // public toastMessagePrefab : GameObject
  private waitForSecond: YieldInstruction;

  //  Camera Mode
  isThirdPersonView = false;
  isVideoMode = false;

  TOAST_MESSAGE = {
    feedUploading: "Uploading...",
    feedCompleted: "Done",
    feedFailed: "Failed",
    screenShotSaveCompleted: "Saved!",
  };

  private isUIOpen: boolean = false;

  AddVector2(t1: Vector2, t2: Vector2): Vector2 {
    return new Vector2(t1.x + t2.x, t1.y + t2.y);
  }

  Start() {
    this.zepetoScreenShotCanvas.sortingOrder = 1;
    this._screenShotModeManager =
      this.screenShotModeManager.GetComponent<ScreenShotModeManager>();
    this._captureController =
      this.captureController.GetComponent<CaptureController>();
    this.viewChangeImage = this.viewChangeButton.GetComponent<Image>();

    this.waitForSecond = WaitForSecondsCash.instance.WaitForSeconds(1);

    this.screenDefaultPanel.SetActive(true);
    this.screenShotModePanel.SetActive(false);
    this.screenShotResultPanel.SetActive(false);

    // SafeArea 설정
    let safeArea: Rect = Screen.safeArea;
    let newAnchorMin = safeArea.position;
    let newAnchorMax = this.AddVector2(safeArea.position, safeArea.size);
    newAnchorMin.x /= Screen.width;
    newAnchorMax.x /= Screen.width;
    newAnchorMin.y /= Screen.height;
    newAnchorMax.y /= Screen.height;

    let rect = this.safeAreaObject.GetComponent<RectTransform>();
    rect.anchorMin = newAnchorMin;
    rect.anchorMax = newAnchorMax;

    this.screenShotModeButton.onClick.AddListener(() => {
      if (this.isUIOpen) return;
      this.isUIOpen = true;
      // 스크린샷 모드 Panel 키기
      // Default Panel 끄기
      this.screenDefaultPanel.SetActive(false);
      this.screenShotModePanel.SetActive(true);

      this.isThirdPersonView = true;
      console.log(this._screenShotModeManager);
      this._screenShotModeManager.StartScreenShotMode();
    });

    this.viewChangeButton.onClick.AddListener(() => {
      if (this.isThirdPersonView) {
        this.viewChangeImage.sprite = this.selfiViewSprite;
        this._screenShotModeManager.SetSelfieCameraMode();
        // this.poseDefaultPanels.SetActive(false)
        // this.poseModePanels.SetActive(false)
        this.isThirdPersonView = false;
      } else {
        this.viewChangeImage.sprite = this.thirdPersonViewSprite;
        this._screenShotModeManager.SetZepetoCameraMode();
        // this.poseDefaultPanels.SetActive(true)
        this.isThirdPersonView = true;
      }
    });

    this.videoModeButton.onClick.AddListener(() => {
      this.videoModeButton.image.sprite = this.focusedVideoModeSprite;
      this.imageModeButton.image.sprite = this.idleImageModeSprite;
      this.isVideoMode = true;
    });

    this.imageModeButton.onClick.AddListener(() => {
      this.imageModeButton.image.sprite = this.focusedImageModeSprite;
      this.videoModeButton.image.sprite = this.idleVideoModeSprite;
      this.isVideoMode = false;
    });

    this.screenShotModeExitButton.onClick.AddListener(() => {
      // 스크린샷 모드 Panel 끄기
      // Default Panel 키기
      this.isUIOpen = false;

      this.screenDefaultPanel.SetActive(true);
      this.screenShotModePanel.SetActive(false);

      this._screenShotModeManager.ExitScreenShotMode(this.isThirdPersonView);
    });

    // 스크린샷 촬영
    this.shootScreenShotButton.onClick.AddListener(() => {
      //스크린샷
      this._captureController.TakeScreenShot(this.isVideoMode);

      //결과 보여주기
      if (!this.isVideoMode) {
        this.screenShotModePanel.SetActive(false);
        this.screenShotResultPanel.SetActive(true);

        this.audioSource.PlayOneShot(this.screenShotAudio);
      }
    });

    //ScreenShot Result
    this.screenShotResultExitButton.onClick.AddListener(() => {
      //스크린샷 결과 창 끄기
      this.isUIOpen = false;
      this.screenShotResultPanel.SetActive(false);
      this.screenDefaultPanel.SetActive(true);

      this._screenShotModeManager.ExitScreenShotMode(this.isThirdPersonView);
    });

    this.saveButton.onClick.AddListener(() => {
      this._captureController.Save(this.isVideoMode);
      //토스트 메시지
    });

    this.shareButton.onClick.AddListener(() => {
      this._captureController.Share(this.isVideoMode);
    });

    this.feedButton.onClick.AddListener(() => {
      this.screenShotResultPanel.SetActive(false);
      this.screenShotFeedPanel.SetActive(true);
    });
    this.createFeedButton.onClick.AddListener(() => {
      this.isUIOpen = false;
      this._screenShotModeManager.ExitScreenShotMode(this.isThirdPersonView);
      this._captureController.CreateFeed(this.isVideoMode);
      this.screenDefaultPanel.SetActive(true);
      this.screenShotFeedPanel.SetActive(false);
    });
    this.feedBackButton.onClick.AddListener(() => {
      this.screenShotResultPanel.SetActive(true);
      this.screenShotFeedPanel.SetActive(false);
    });
  }

  public ShowCreateFeedResult(result: Boolean) {
    if (result) {
      // this.createFeedButton.gameObject.SetActive(false);
      this.StartCoroutine(
        this.ShowToastMessage(this.TOAST_MESSAGE.feedCompleted)
      );
    } else {
      this.StartCoroutine(this.ShowToastMessage(this.TOAST_MESSAGE.feedFailed));
    }
  }

  *ShowToastMessage(text: string) {
    // let toastMessage: GameObject = null;
    // if (text == this.TOAST_MESSAGE.feedFailed)
    //     toastMessage = GameObject.Instantiate<GameObject>(this.toastErrorMessage);
    // else
    //     toastMessage = GameObject.Instantiate<GameObject>(this.toastSuccessMessage);
    // toastMessage.transform.SetParent(this.screenShotResultPanel.transform);
    // toastMessage.GetComponentInChildren<Text>().text = text;
    // GameObject.Destroy(toastMessage, 1);
  }
}
