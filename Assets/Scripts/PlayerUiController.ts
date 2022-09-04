import { Camera, GameObject, Sprite, Transform, Vector3 } from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import ReturnInteractor from "./ReturnInteractor";
import TakeInteractor from "./TakeInteractor";

export default class PlayerUiController extends ZepetoScriptBehaviour {
  private static _instance: PlayerUiController;

  public static get instance(): PlayerUiController {
    return this._instance;
  }

  private localCamera: Camera;

  public takeInteractors: GameObject[];
  private _takeInteractors: TakeInteractor[];

  public returnInteractors: GameObject[];
  private _returnInteractors: ReturnInteractor[];

  @SerializeField()
  private interactButton: Button;

  @SerializeField()
  private takeButtonPrefab: GameObject;

  @SerializeField()
  private bookPrefab: GameObject;

  @SerializeField()
  private returnButtonPrefab: GameObject;

  private interactObj: GameObject;

  private rightHandBone: string = "hand_R";

  Awake() {
    PlayerUiController._instance = this;
  }
  Start() {
    this._takeInteractors = new Array<TakeInteractor>(
      this.takeInteractors.length
    );
    this.takeInteractors.forEach((item) => {
      this._takeInteractors.push(item.GetComponent<TakeInteractor>());
    });

    this._returnInteractors = new Array<ReturnInteractor>(
      this.returnInteractors.length
    );
    this.returnInteractors.forEach((item) => {
      this._returnInteractors.push(item.GetComponent<ReturnInteractor>());
    });

    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.localCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;

      this.interactButton.onClick.AddListener(() => {
        if (this.interactObj) {
          GameObject.Destroy(this.interactObj);
          this.interactObj = null;
        }
        this.interactButton.gameObject.SetActive(false);
      });
      this._takeInteractors.forEach((item) => {
        item.Initialize(
          this.takeButtonPrefab,
          this.interactButton.transform.parent,
          this.bookPrefab,
          this.rightHandBone
        );
      });

      this._returnInteractors.forEach((item) => {
        item.Initialize(
          this.returnButtonPrefab,
          this.interactButton.transform.parent
        );
      });
    });
  }

  Update() {
    if (this.localCamera != null) {
      this._takeInteractors.forEach((item) => {
        if (!item.isInteractable) return;
        var screenPos = this.localCamera.WorldToScreenPoint(
          Vector3.op_Addition(item.transform.position, item.cameraOffset)
        );
        item.interactButton.transform.position = screenPos;
        item.interactButton.transform.position = screenPos;
      });

      this._returnInteractors.forEach((item) => {
        if (!item.isInteractable) return;
        var screenPos = this.localCamera.WorldToScreenPoint(
          Vector3.op_Addition(item.transform.position, item.cameraOffset)
        );
        item.interactButton.transform.position = screenPos;
        item.interactButton.transform.position = screenPos;
      });
    }
  }

  IsTaking(): bool {
    return this.interactObj ? true : false;
  }

  EnableUnHand(book: GameObject) {
    if (this.interactObj) {
      GameObject.Destroy(this.interactObj);
      this.interactObj = null;
    }
    this.interactObj = book;
    this.interactButton.gameObject.SetActive(true);
  }

  ReturnBook() {
    if (this.interactObj) {
      GameObject.Destroy(this.interactObj);
      this.interactObj = null;
    }
    this.interactButton.gameObject.SetActive(false);
  }
}
