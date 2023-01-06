import {
  Collider,
  Material,
  SkinnedMeshRenderer,
  Transform,
} from "UnityEngine";
import { ZepetoCharacter, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import MissionController, { MissionType } from "./MissionController";

export default class GhostTrigger extends ZepetoScriptBehaviour {
  @SerializeField()
  private spawnPoint: Transform;

  @SerializeField()
  private ghostMaterial: Material;

  OnTriggerEnter(col: Collider) {
    const player = col.GetComponent<ZepetoCharacter>();
    this.AddMaterial(this.ghostMaterial, player.transform);
    player.Teleport(this.spawnPoint.position, this.spawnPoint.rotation);
    if (player == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character) {
      MissionController.instance?.MissionClear(MissionType.BECOMEGHOST);
    }
  }

  public AddMaterial(material: Material, trans: Transform) {
    if (!material) return;
    const mesh = trans.GetComponentsInChildren<SkinnedMeshRenderer>();
    mesh.forEach((item: SkinnedMeshRenderer) => {
      let mats: Material[] = new Array<Material>(item.materials.length);
      for (let idx = 0; idx < item.materials.length; idx++) {
        if (item.materials[idx].name == "eyelash(Clone)") {
          continue;
        }
        mats[idx] = material;
      }
      item.materials = mats;
    });
  }
}
