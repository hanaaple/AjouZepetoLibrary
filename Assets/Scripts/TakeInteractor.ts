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

export default class TakeInteractor extends ZepetoScriptBehaviour {
  public cameraOffset: Vector3;

  @NonSerialized()
  public interactButton: Button;

  @NonSerialized()
  public isInteractable: bool;

  Initialize(
    takeButtonPrefab: GameObject,
    canvasRoot: Transform,
    bookPrefab: GameObject,
    targetObj: string
  ) {
    const button = GameObject.Instantiate<GameObject>(
      takeButtonPrefab,
      canvasRoot
    );
    button.SetActive(false);
    this.interactButton = button.GetComponent<Button>();
    this.interactButton.onClick.AddListener(() => {
      //   if (!PlayerUiController.instance.IsTaking()) {
      const book = GameObject.Instantiate<GameObject>(bookPrefab);
      ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
        .GetComponentsInChildren<Transform>()
        .forEach((characterObj) => {
          if (characterObj.name == targetObj) {
            book.transform.parent = characterObj;
            book.transform.localPosition = Vector3.zero;
            book.transform.localRotation = Quaternion.Euler(Vector3.zero);
          }
        });
      PlayerUiController.instance.EnableUnHand(book);
      // }
    });
  }

  OnTriggerEnter(col: Collider) {
    if (!col.GetComponent<ZepetoCharacter>()) {
      return;
    }

    if (this.interactButton) {
      this.interactButton.gameObject.SetActive(true);
      this.isInteractable = true;
    }
  }

  OnTriggerExit(col: Collider) {
    if (!col.GetComponent<ZepetoCharacter>()) {
      return;
    }

    if (this.interactButton) {
      this.interactButton.gameObject.SetActive(false);
      this.isInteractable = false;
    }
  }
}
