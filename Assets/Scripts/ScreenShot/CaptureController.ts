import {
  Camera,
  GameObject,
  RenderTexture,
  WaitForEndOfFrame,
} from "UnityEngine";
import { RawImage, Text } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import {
  VideoResolutions,
  WorldVideoRecorder,
  ZepetoWorldContent,
} from "ZEPETO.World";
import ClientStarter from "../ClientStarter";
import UiController from "../UiController";

export default class CaptureController extends ZepetoScriptBehaviour {
  private camera: Camera;

  public renderTexture: RenderTexture;

  public captureThumbnail: RawImage[];

  public uiController: GameObject;
  private _uiController: UiController;
  // private videoPlayerObject: GameObject;
  public textField: Text;

  private recordCamera: Camera;
  Start() {
    this._uiController = this.uiController.GetComponent<UiController>();
    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.camera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;
    });
  }

  public SetCaptureCamera(camera: Camera) {
    this.camera = camera;
  }

  public TakeScreenShot(isVideoMode: boolean) {
    if (!isVideoMode) {
      this.captureThumbnail.forEach((item: RawImage) => {
        item.texture = this.renderTexture;
      });
      this.camera.targetTexture = this.renderTexture;
      this.StartCoroutine(this.RenderTargetTexture());
    } else {
      ClientStarter.instance.Debug("무슨 일이여");
      if (WorldVideoRecorder.IsRecording()) {
        ClientStarter.instance.Debug("녹화 중단");
        WorldVideoRecorder.StopRecording();
      } else {
        //문제 발생 2 ~ 60초만 가능함
        ClientStarter.instance.Debug("녹화");
        this.StartCoroutine(this.StartRecording());
        // if(!WorldVideoRecorder.StartRecording(this.camera, VideoResolutions.W1280xH720, 10)) return
        // this.StartCoroutine(this.CheckRecording());
      }
    }
  }
  *StartRecording() {
    this.recordCamera = GameObject.Instantiate<Camera>(this.camera);
    WorldVideoRecorder.StartRecording(
      this.recordCamera.GetComponent<Camera>(),
      VideoResolutions.W1920xH1080,
      59
    );

    while (WorldVideoRecorder.IsRecording()) {
      this.recordCamera.transform.position = this.camera.transform.position;
      this.recordCamera.transform.rotation = this.camera.transform.rotation;
      yield null;
    }

    if (this.recordCamera != null) {
      GameObject.Destroy(this.recordCamera.gameObject);
      this.recordCamera = null;
    }
    this.captureThumbnail.forEach((item: RawImage) => {
      item.texture = WorldVideoRecorder.GetThumbnail();
    });
    this._uiController.ShowCaptureResultPanel();
  }
  // CheckRecording() {
  //     this.captureThumbnail.forEach((item : RawImage) => {
  //         let videoPlayer = WorldVideoRecorder.AddVideoPlayerComponent(item.gameObject, this.renderTexture);
  //         if (videoPlayer != null){
  //             videoPlayer.isLooping = true
  //             videoPlayer.Play();
  //         }
  //     })
  // }

  public Save(isVideoMode: boolean) {
    if (isVideoMode) {
      this.SaveVideo();
    } else {
      this.SaveScreenShot();
    }
  }

  public Share(isVideoMode: boolean) {
    if (isVideoMode) {
      this.ShareVideo();
    } else {
      this.ShareScreenShot();
    }
  }

  public CreateFeed(isVideoMode: boolean) {
    if (isVideoMode) {
      this.CreateFeedVideo();
    } else {
      this.CreateFeedScreenShot();
    }
  }
  // Screenshot Result
  // 1. Btn: 스크린샷 저장 - 스크린샷을 갤러리에 저장합니다.
  // 2. Btn: 스크린샷 공유 - 스크린샷을 공유할 수 있는 기능입니다.
  // 3. Btn: 피드 올리기 - 피드에 올리는 기능입니다.

  SaveScreenShot() {
    ZepetoWorldContent.SaveToCameraRoll(
      this.renderTexture,
      (result: boolean) => {
        console.log(`스크린샷 저장 결과 : ${result}`);
        this._uiController.StartCoroutine(
          this._uiController.ShowToastMessage("SAVED")
        );
      }
    );
  }

  ShareScreenShot() {
    ZepetoWorldContent.Share(this.renderTexture, (result: boolean) => {
      console.log(`스크린샷 공유 결과 : ${result}`);
    });
  }

  CreateFeedScreenShot() {
    this._uiController.StartCoroutine(
      this._uiController.ShowToastMessage("Uploading")
    );
    ZepetoWorldContent.CreateFeed(
      this.renderTexture,
      this.textField.text,
      (result: boolean) => {
        this._uiController.ShowCreateFeedResult(result);
        console.log(`피드 생성 결과 : ${result}`);
      }
    );
  }

  // Video Capture Result

  SaveVideo() {
    WorldVideoRecorder.SaveToCameraRoll((result: boolean) => {
      console.log(`동영상 녹화 저장 결과 : ${result}`);
      this._uiController.StartCoroutine(
        this._uiController.ShowToastMessage("Save")
      );
    });
  }

  ShareVideo() {
    WorldVideoRecorder.Share((result: boolean) => {
      console.log(`동영상 녹화 공유 결과 : ${result}`);
    });
  }

  CreateFeedVideo() {
    WorldVideoRecorder.CreateFeed(this.textField.text, (result: boolean) => {
      this._uiController.ShowCreateFeedResult(result);
      console.log(`동영상 녹화 피드 생성 결과 : ${result}`);
      this._uiController.StartCoroutine(
        this._uiController.ShowToastMessage("UPLOADING")
      );
    });
  }

  *RenderTargetTexture() {
    yield new WaitForEndOfFrame();
    this.camera.Render();
    this.camera.targetTexture = null;
  }
}
