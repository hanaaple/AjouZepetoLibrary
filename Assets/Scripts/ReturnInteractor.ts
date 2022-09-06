import {
  Collider,
  GameObject,
  Quaternion,
  Transform,
  Vector3,
} from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import PlayerUiController from "./PlayerUiController";

export default class ReturnInteractor extends ZepetoScriptBehaviour {
  public cameraOffset: Vector3;

  @NonSerialized()
  public interactButton: Button;

  @NonSerialized()
  public isInteractable: bool;

  @SerializeField()
  private book: GameObject;

  Initialize(takeButtonPrefab: GameObject, canvasRoot: Transform) {
    const button = GameObject.Instantiate<GameObject>(
      takeButtonPrefab,
      canvasRoot
    );
    button.SetActive(false);
    this.interactButton = button.GetComponent<Button>();
    this.interactButton.onClick.AddListener(() => {
      this.interactButton.gameObject.SetActive(false);
      this.isInteractable = false;
      this.book.SetActive(true);
      PlayerUiController.instance.ReturnBook();
    });
  }

  OnTriggerEnter(col: Collider) {
    if (
      !(
        col.GetComponent<ZepetoCharacter>() &&
        PlayerUiController.instance.IsTaking() &&
        !this.book.activeSelf
      )
    ) {
      return;
    }

    if (this.interactButton) {
      this.interactButton.gameObject.SetActive(true);
      this.isInteractable = true;
    }
  }

  OnTriggerExit(col: Collider) {
    if (!(col.GetComponent<ZepetoCharacter>() && !this.book.activeSelf)) {
      return;
    }

    if (this.interactButton) {
      this.interactButton.gameObject.SetActive(false);
      this.isInteractable = false;
    }
  }
}
