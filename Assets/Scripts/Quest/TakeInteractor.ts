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
import LoanBookQuest from "./LoanBookQuest";

export default class TakeInteractor extends ZepetoScriptBehaviour {
  public cameraOffset: Vector3;

  @NonSerialized()
  public interactButton: Button;

  @NonSerialized()
  public isInteractable: bool;

  public prefab: GameObject;

  Initialize(
    takeButtonPrefab: GameObject,
    canvasRoot: Transform,
    targetObj: string,
    posOffset: Vector3,
    rotOffset: Vector3
  ) {
    const button = GameObject.Instantiate<GameObject>(
      takeButtonPrefab,
      canvasRoot
    );
    button.SetActive(false);
    this.interactButton = button.GetComponent<Button>();
    this.interactButton.onClick.AddListener(() => {
      const book = GameObject.Instantiate<GameObject>(this.prefab);
      ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
        .GetComponentsInChildren<Transform>()
        .forEach((characterObj) => {
          if (characterObj.name == targetObj) {
            book.transform.parent = characterObj;
            book.transform.localPosition = posOffset;
            book.transform.localRotation = Quaternion.Euler(rotOffset);
          }
        });
      LoanBookQuest.instance.EnableUnHand(book);
    });
  }

  OnTriggerEnter(col: Collider) {
    const character = col.GetComponent<ZepetoCharacter>();
    if (
      !character ||
      character != ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
    ) {
      return;
    }

    if (this.interactButton) {
      this.interactButton.gameObject.SetActive(true);
      this.isInteractable = true;
    }
  }

  OnTriggerExit(col: Collider) {
    const character = col.GetComponent<ZepetoCharacter>();
    if (
      !character ||
      character != ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
    ) {
      return;
    }

    if (this.interactButton) {
      this.interactButton.gameObject.SetActive(false);
      this.isInteractable = false;
    }
  }
}
