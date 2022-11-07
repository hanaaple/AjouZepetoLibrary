import { GameObject } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";

export default class OnlineSelfieCamera extends ZepetoScriptBehaviour {
  public grip: GameObject;

  public GetGripObject(): GameObject {
    return this.grip;
  }
}
