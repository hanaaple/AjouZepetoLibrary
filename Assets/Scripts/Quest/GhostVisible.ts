import { Collider, GameObject } from "UnityEngine";
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { Image } from "UnityEngine.UI";

export default class GhostVisible extends ZepetoScriptBehaviour {
  @NonSerialized()
  public button: GameObject;

  OnTriggerEnter(col: Collider) {
    const character = col.GetComponent<ZepetoCharacter>();
    if (
      !character ||
      character != ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
    ) {
      return;
    }
    this.button?.SetActive(true);
  }

  OnTriggerExit(col: Collider) {
    const character = col.GetComponent<ZepetoCharacter>();
    if (
      !character ||
      character != ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
    ) {
      return;
    }
    this.button?.SetActive(false);
  }
}
