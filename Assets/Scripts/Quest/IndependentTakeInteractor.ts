import {
  Camera,
  Collider,
  GameObject,
  Quaternion,
  Random,
  Transform,
  Vector3,
} from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import PickUpZepetoCharacter from "./PickUpZepetoCharacter";

export default class TakeInteractor extends ZepetoScriptBehaviour {
  public interactCanvas: Transform;

  public takeButtonPrefab: GameObject;

  public takeOffButton: Button;

  public buttonCamOffset: Vector3;

  public takePrefabs: GameObject[];

  @Space(10)
  public posOffset: Vector3;

  public rotOffset: Vector3;

  private interactButton: Button;

  private localCamera: Camera;

  private takeObj: GameObject;
  Start() {
    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.localCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;

      this.takeOffButton.onClick.AddListener(() => {
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
          .GetComponent<PickUpZepetoCharacter>()
          .Drop();
        this.takeObj = null;
        this.takeOffButton.gameObject.SetActive(false);
      });
    });

    this.Initialize();
  }

  Initialize() {
    const button = GameObject.Instantiate<GameObject>(
      this.takeButtonPrefab,
      this.interactCanvas
    );
    button.SetActive(false);
    this.interactButton = button.GetComponent<Button>();
    this.interactButton.onClick.AddListener(() => {
      let ranVal = Math.floor(Random.Range(0, this.takePrefabs.length));
      const takeObj = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
        .GetComponent<PickUpZepetoCharacter>()
        .PickUp(this.takePrefabs[ranVal]);
      takeObj.transform.localPosition = this.posOffset;
      takeObj.transform.localRotation = Quaternion.Euler(this.rotOffset);

      this.takeObj = takeObj;

      this.takeOffButton.gameObject.SetActive(true);
    });
  }

  Update() {
    if (this.interactButton.gameObject.activeSelf && this.localCamera) {
      var screenPos = this.localCamera.WorldToScreenPoint(
        Vector3.op_Addition(this.transform.position, this.buttonCamOffset)
      );
      this.interactButton.transform.position = screenPos;
      this.interactButton.transform.position = screenPos;
    }
    if (this.takeObj) {
      this.takeObj.transform.localPosition = this.posOffset;
      this.takeObj.transform.localRotation = Quaternion.Euler(this.rotOffset);
    }
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
    }
  }
}
