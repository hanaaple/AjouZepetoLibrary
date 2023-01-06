import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { GameObject, Transform } from "UnityEngine";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";

export default class PickUpZepetoCharacter extends ZepetoScriptBehaviour {
  @NonSerialized()
  public pickObject: GameObject;

  private rightHandBone: string = "hand_R";

  public PickUp(prefabObj: GameObject): GameObject {
    if (this.pickObject) {
      GameObject.Destroy(this.pickObject);
    }
    console.log(prefabObj);
    this.pickObject = GameObject.Instantiate<GameObject>(prefabObj);
    console.log(this.pickObject);
    ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
      .GetComponentsInChildren<Transform>()
      .forEach((characterObj) => {
        if (
          characterObj.name == this.rightHandBone &&
          characterObj.transform.childCount != 0
        ) {
          this.pickObject.transform.SetParent(characterObj);
        }
      });
    return this.pickObject;
  }

  public Drop() {
    if (this.pickObject) {
      GameObject.Destroy(this.pickObject);
    }
    this.pickObject = null;
  }
}
