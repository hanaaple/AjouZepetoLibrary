import { Camera, GameObject, Transform, Vector3 } from "UnityEngine";
import { Button } from "UnityEngine.UI";
import { ZepetoPlayer, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { RoomData } from "ZEPETO.Multiplay";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import ClientStarter from "../ClientStarter";
import OnlineWithPlayer from "./OnlineWithPlayer";

class TakeUserProps {
  camera: Transform;
  takeWithButtonUi: Transform;
  // withUsers: string[];
}

export default class SelfieRegistrant extends ZepetoScriptBehaviour {
  private static _instance: SelfieRegistrant;

  public static get instance(): SelfieRegistrant {
    return this._instance;
  }

  @SerializeField()
  private takeWithButtonPrefab: GameObject;
  @SerializeField()
  private cameraOffset: Vector3;
  @Space(10)
  @SerializeField()
  private cameraPrefab: GameObject;
  @SerializeField()
  private selfieStickPrefab: GameObject;

  private localCamera: Camera;

  // 찍는 유저
  private takingUsers: Map<ZepetoPlayer, TakeUserProps>; //player, UI

  // 찍는 거 같이 바라보는 유저
  private withUsers: Map<ZepetoPlayer, ZepetoPlayer>; //withplayer, player

  Awake() {
    if (SelfieRegistrant.instance) {
      GameObject.Destroy(this);
    } else {
      GameObject.DontDestroyOnLoad(this.gameObject);
      SelfieRegistrant._instance = this;
    }
  }

  Start() {
    this.takingUsers = new Map<ZepetoPlayer, TakeUserProps>();
    this.withUsers = new Map<ZepetoPlayer, ZepetoPlayer>();

    // 플레이어 생성 시
    ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
      if (!ZepetoPlayers.instance.HasPlayer(sessionId)) {
        console.log("오류오류오류");
        return;
      }
      const player = ZepetoPlayers.instance.GetPlayer(sessionId);
      player.character.ZepetoAnimator.gameObject.AddComponent<OnlineWithPlayer>();
    });

    ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
      this.localCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;
    });
  }

  // 찍는 유저 등록
  public AddSelfieUser(takingSessionId: string) {
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    ClientStarter.instance.Debug(`Try Add SelfiePlayer`);
    if (!ZepetoPlayers.instance.HasPlayer(takingSessionId)) return;
    const player = ZepetoPlayers.instance.GetPlayer(takingSessionId);
    ClientStarter.instance.Debug(`대상 - ${player.character.gameObject}`);
    const onlinePlayer =
      player.character.ZepetoAnimator.gameObject.GetComponent<OnlineWithPlayer>();

    onlinePlayer.Initialize(this.cameraPrefab, this.takeWithButtonPrefab);
    onlinePlayer.SetSelfieStick(player, this.selfieStickPrefab);

    const takeUserProps = new TakeUserProps();
    takeUserProps.camera = onlinePlayer.cameraTarget;
    takeUserProps.takeWithButtonUi = onlinePlayer.buttonUI;
    this.takingUsers.set(player, takeUserProps);

    onlinePlayer.buttonUI.GetComponent<Button>().onClick.AddListener(() => {
      this.SetTakeWithUI(
        true,
        takingSessionId,
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.id
      );
      this.TakeWithSendData(
        true,
        takingSessionId,
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.id
      );
    });
    ClientStarter.instance.Debug(`Add SelfiePlayer 완료`);
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
  }

  // 찍는 유저 삭제
  public DeleteSelfieUser(takingSessionId: string) {
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    ClientStarter.instance.Debug("Delete Try");
    if (!ZepetoPlayers.instance.HasPlayer(takingSessionId)) {
      ClientStarter.instance.Debug("오류오류");
      return;
    }

    const player = ZepetoPlayers.instance.GetPlayer(takingSessionId);

    if (this.takingUsers.has(player)) {
      const onlinePlayer =
        player.character.ZepetoAnimator.gameObject.GetComponent<OnlineWithPlayer>();
      //셀카봉 삭제
      onlinePlayer.RemovePlayer(player);
      this.takingUsers.delete(player);
    }
    ClientStarter.instance.Debug("Delete Complete");
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
  }

  //sessionId - 셀카 찍는 유저, client - 셀카 누른(당한) 유저
  TakeWithSendData(
    isWith: boolean,
    takingSessionId: string,
    takedSessionId: string
  ) {
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    ClientStarter.instance.Debug(`Try Take With Send Data : ${isWith}`);
    // const hasTakingPlayer = ZepetoPlayers.instance.HasPlayer(takingSessionId)
    if (isWith) {
      const data = new RoomData();
      data.Add("sessionId", takingSessionId);
      data.Add("withSessionId", takedSessionId);
      const room = ClientStarter.instance.GetRoom();
      room.Send("onTakeWith", data.GetObject());
    } else {
      const data = new RoomData();
      data.Add("sessionId", takingSessionId);
      const room = ClientStarter.instance.GetRoom();
      room.Send("onTakeWithout", data.GetObject());
    }
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    ClientStarter.instance.Debug(`Complete Take With Send Data : ${isWith}`);
  }

  //UI 버튼 연결 true - 키기, false - 끄기
  SetTakeWithUI(
    isWith: boolean,
    takingSessionId: string,
    takedSessionId: string
  ) {
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    ClientStarter.instance.Debug(`Try Take Setting UI 키기: ${isWith}`);
    if (!ZepetoPlayers.instance.HasPlayer(takingSessionId)) return;
    const takingPlayer = ZepetoPlayers.instance.GetPlayer(takingSessionId);
    const btn = this.takingUsers
      .get(takingPlayer)
      .takeWithButtonUi.GetComponent<Button>();
    btn.onClick.RemoveAllListeners();
    if (isWith) {
      btn.onClick.AddListener(() => {
        this.SetTakeWithUI(false, takingSessionId, takedSessionId);
        this.TakeWithSendData(false, takingSessionId, takedSessionId);
      });
      // IKController 생성 후 그립 위치로 손, 카메라 바라보기
      // 손에다가 생성
    } else {
      btn.onClick.AddListener(() => {
        this.SetTakeWithUI(true, takingSessionId, takedSessionId);
        this.TakeWithSendData(true, takingSessionId, takedSessionId);
      });
    }
    ClientStarter.instance.Debug(`Complete Take Setting UI 키기: ${isWith}`);
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
  }

  Update() {
    // ClientStarter.instance.Debug(`${ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject}가 본다.`)
    this.takingUsers.forEach(
      (takeUserProps: TakeUserProps, player: ZepetoPlayer) => {
        const onlineWithPlayer =
          player.character.ZepetoAnimator.gameObject.GetComponent<OnlineWithPlayer>();
        const screenPos = this.localCamera.WorldToScreenPoint(
          Vector3.op_Addition(
            player.character.transform.position,
            this.cameraOffset
          )
        );
        onlineWithPlayer.OnUpdateOnline(player, screenPos);
      }
    );
  }

  public LookAt(sessionId: string, withSessionId: string) {
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    ClientStarter.instance.Debug(`저이 봐봐라`);
    if (
      !ZepetoPlayers.instance.HasPlayer(sessionId) ||
      !ZepetoPlayers.instance.HasPlayer(withSessionId)
    )
      return;
    const takePlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
    const withPlayer = ZepetoPlayers.instance.GetPlayer(withSessionId);
    this.withUsers.set(withPlayer, takePlayer);
    // 이제부터 selfieCamera 위치 보내
    const onlineWithPlayer =
      withPlayer.character.ZepetoAnimator.gameObject.GetComponent<OnlineWithPlayer>();
    onlineWithPlayer.Watch(this.takingUsers.get(takePlayer).camera);

    ClientStarter.instance.Debug(`Complete LookAT`);
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
  }

  public StopLookAt(withSessionId: string) {
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    ClientStarter.instance.Debug(`저이 스탑 보지마`);
    if (!ZepetoPlayers.instance.HasPlayer(withSessionId)) return;
    const withPlayer = ZepetoPlayers.instance.GetPlayer(withSessionId);

    if (this.withUsers.has(withPlayer)) {
      this.withUsers.delete(withPlayer);
      const onlineWithPlayer =
        withPlayer.character.ZepetoAnimator.gameObject.GetComponent<OnlineWithPlayer>();
      onlineWithPlayer.StopWatch();
      ClientStarter.instance.Debug(
        `같이 찍는 애 - ${withSessionId} - 스탑 성공`
      );
    }
    ClientStarter.instance.Debug(`Complete Stop LookAt`);
    ClientStarter.instance.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
  }

  HasPlayer(sessionId: string): boolean {
    if (!ZepetoPlayers.instance.HasPlayer(sessionId)) return false;
    const player = ZepetoPlayers.instance.GetPlayer(sessionId);

    return this.takingUsers.has(player) || this.withUsers.has(player);
  }
}
