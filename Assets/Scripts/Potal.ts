import {
  AudioClip,
  AudioSource,
  Collider,
  GameObject,
  Time,
} from "UnityEngine";
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";

export default class Potal extends ZepetoScriptBehaviour {
  public connectedPotal: GameObject;
  public audioManger: AudioSource;
  public audioClip: AudioClip;
  private _connectedPotal: Potal;

  Start() {
    this._connectedPotal = this.connectedPotal.GetComponent<Potal>();
  }

  *TryTeleport(zepetoChar: ZepetoCharacter, potal: Potal) {
    if (this.audioManger != null && this.audioClip != null) {
      this.audioManger.Stop();
      this.audioManger.clip = this.audioClip;
      this.audioManger.Play();
    }
    var time = 0.0;
    console.log("포탈 들어감");
    while (time < 4) {
      time += Time.deltaTime;
      //포탈 효과
      yield null;
    }
    console.log("포탈 실행");
    zepetoChar.Teleport(potal.transform.position, potal.transform.rotation);
    this.audioManger.Stop();
  }

  StopTeleport(zepetoChar: ZepetoCharacter, potal: Potal) {
    console.log("도중에 포탈 나감");
    this.StopAllCoroutines();
  }

  OnTriggerEnter(col: Collider) {
    const zepetoCharacter = col.GetComponent<ZepetoCharacter>();
    if (
      ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character ==
      zepetoCharacter
    ) {
      this.StartCoroutine(
        this.TryTeleport(zepetoCharacter, this._connectedPotal)
      );
    }
  }
  OnTriggerExit(col: Collider) {
    const zepetoCharacter = col.GetComponent<ZepetoCharacter>();
    if (
      ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character ==
      zepetoCharacter
    ) {
      this.StopTeleport(zepetoCharacter, this._connectedPotal);
    }
  }
}
