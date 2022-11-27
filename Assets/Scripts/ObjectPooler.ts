import { GameObject } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";

export default class ObjectPooler extends ZepetoScriptBehaviour {
  private static _instance: ObjectPooler;
  public static get instance(): ObjectPooler {
    return this._instance;
  }

  private list: Map<GameObject, Array<GameObject>>;

  Awake() {
    ObjectPooler._instance = this;
    GameObject.DontDestroyOnLoad(this.gameObject);
  }

  Start() {
    this.list = new Map<GameObject, Array<GameObject>>();
  }

  public GetObject(prefab: GameObject): GameObject {
    let gameObj: GameObject;

    if (!this.list.has(prefab)) {
      const gameObjectList = new Array<GameObject>();
      this.list.set(prefab, gameObjectList);
    }
    const gameObjList = this.list.get(prefab);
    gameObj = gameObjList.find((item) => !item.activeSelf);
    if (!gameObj) {
      gameObj = GameObject.Instantiate<GameObject>(prefab);
      gameObjList.push(gameObj);
    }
    return gameObj;
  }
}
