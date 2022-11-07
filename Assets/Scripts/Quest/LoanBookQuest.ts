import { Camera, GameObject, Vector3 } from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import ReturnInteractor from "./ReturnInteractor";
import TakeInteractor from "./TakeInteractor";

export default class LoanBookQuest extends ZepetoScriptBehaviour {
  private static _instance: LoanBookQuest;

  public static get instance(): LoanBookQuest {
    return this._instance;
  }

  private localCamera: Camera;

  public takeInteractors: GameObject[];
  private _takeInteractors: TakeInteractor[];

  public returnInteractors: GameObject[];
  private _returnInteractors: ReturnInteractor[];

  @SerializeField()
  private takeOffButton: Button;

  @SerializeField()
  private takeButtonPrefab: GameObject;

  @SerializeField()
  private returnButtonPrefab: GameObject;

  @SerializeField()
  private posOffset: Vector3;

  @SerializeField()
  private rotOffset: Vector3;

  private interactObj: GameObject;

  private rightHandBone: string = "hand_R";

  Awake() {
    LoanBookQuest._instance = this;
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

      this.takeOffButton.onClick.AddListener(() => {
        if (this.interactObj) {
          GameObject.Destroy(this.interactObj);
          this.interactObj = null;
        }
        this.takeOffButton.gameObject.SetActive(false);
      });
      this._takeInteractors.forEach((item) => {
        item.Initialize(
          this.takeButtonPrefab,
          this.takeOffButton.transform.parent,
          this.rightHandBone,
          this.posOffset,
          this.rotOffset
        );
      });

      this._returnInteractors.forEach((item) => {
        item.Initialize(
          this.returnButtonPrefab,
          this.takeOffButton.transform.parent
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
    this.takeOffButton.gameObject.SetActive(true);
  }

  ReturnBook() {
    if (this.interactObj) {
      GameObject.Destroy(this.interactObj);
      this.interactObj = null;
    }
    this.takeOffButton.gameObject.SetActive(false);
  }
}
