import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { Room, RoomData } from "ZEPETO.Multiplay";
import {
  Player,
  SelfieUser,
  SelfieWithUser,
  State,
  User,
  Vector3 as Vector3Schema,
} from "ZEPETO.Multiplay.Schema";
import {
  CharacterJumpState,
  CharacterState,
  SpawnInfo,
  ZepetoPlayers,
} from "ZEPETO.Character.Controller";
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import {
  AudioListener,
  GameObject,
  LayerMask,
  Quaternion,
  Time,
  Transform,
  Vector3,
} from "UnityEngine";
import WaitForSecondsCash from "./WaitForSecondsCash";
import SelfieRegistrant from "./ScreenShot/SelfieRegistrant";

export default class ClientStarter extends ZepetoScriptBehaviour {
  @SerializeField()
  private multiplay: ZepetoWorldMultiplay;

  @SerializeField()
  private spawnPoint: Transform;

  private room: Room;
  private static _instance: ClientStarter;

  public static get instance(): ClientStarter {
    return this._instance;
  }
  public GetRoom(): Room {
    return this.room;
  }

  Awake() {
    if (ClientStarter._instance) {
      GameObject.Destroy(this);
    } else {
      ClientStarter._instance = this;
      GameObject.DontDestroyOnLoad(this.gameObject);
    }
  }

  Start() {
    this.multiplay.RoomCreated += (room: Room) => {
      this.room = room;
    };

    this.multiplay.RoomJoined += (room: Room) => {
      room.OnStateChange += this.OnStateChange;
    };
  }

  private *SendMessageLoop(tick: number) {
    const waitForSeconds = WaitForSecondsCash.instance.WaitForSeconds(tick);
    const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
    while (true) {
      yield waitForSeconds;

      if (this.room != null && this.room.IsConnected) {
        if (ZepetoPlayers.instance.HasPlayer(this.room.SessionId)) {
          if (myPlayer.character.CurrentState != CharacterState.Idle) {
            this.SendTransform(myPlayer.character.transform);
          }
        }
      }
    }
  }

  private OnStateChange(state: State, isFirst: boolean) {
    if (isFirst) {
      this.StartCoroutine(this.OnUpdateSelfie(state));

      state.players.ForEach((sessionId: string, player: Player) =>
        this.OnJoinPlayer(sessionId, player)
      );

      state.players.OnAdd += (player: Player, sessionId: string) =>
        this.OnJoinPlayer(sessionId, player);

      state.players.OnRemove += (player: Player, sessionId: string) =>
        this.StartCoroutine(this.OnLeavePlayer(sessionId, player));

      // On Add Local Player
      ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
        this.Debug(
          `[로컬 플레이어 생성] player ${ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.id}`
        );

        this.StartCoroutine(this.SendMessageLoop(Time.deltaTime));

        const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
        myPlayer.character.gameObject.AddComponent<AudioListener>();
        myPlayer.character.OnChangedState.AddListener((next, cur) => {
          console.log("로컬 State 변경", cur, next);
          this.SendState(next);
        });
        myPlayer.character.gameObject.layer =
          LayerMask.NameToLayer("LocalPlayer");
        this.SendTransform(myPlayer.character.transform);
      });

      // On Add Player
      ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
        const isLocal = this.room.SessionId === sessionId;
        const player: Player = this.room.State.players.get_Item(sessionId);
        if (player == null || player == undefined) return;

        if (!isLocal) {
          this.Debug(`[온라인 플레이어 생성] player  ${sessionId}`);
          player.OnChange += (changeValues) =>
            this.OnUpdateMultiPlayer(sessionId, player);
        }
      });
    }
  }

  private OnJoinPlayer(sessionId: string, player: Player) {
    console.log(
      `[OnJoinPlayer] roomSession - ${this.room.SessionId}\nplayerSession - ${player.sessionId}\nsessionId - ${sessionId}`
    );
    const spawnInfo = new SpawnInfo();

    spawnInfo.position = this.spawnPoint.position;
    spawnInfo.rotation = this.spawnPoint.rotation;

    const isLocal = this.room.SessionId === player.sessionId;
    ZepetoPlayers.instance.CreatePlayerWithUserId(
      sessionId,
      player.zepetoUserId,
      spawnInfo,
      isLocal
    );
  }
  private *OnUpdateSelfie(state: State) {
    this.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    this.Debug(`플레이어 생성까지 foreach 시작 ${state.players.Count}`);
    for (var i = 0; i < state.players.Count; i++) {
      while (state.players.GetByIndex(i) === null) i++;
      this.Debug(`${i + 1}번째 생성대기 foeach,  ${state.players.Count}`);
      while (
        !ZepetoPlayers.instance.HasPlayer(state.players.GetByIndex(i).sessionId)
      ) {
        yield null;
      }
    }
    this.Debug(
      `${ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject} 생성 완료`
    );
    this.Debug(`ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ`);
    this.room.State.selfiePlayer.OnAdd += (
      user: SelfieUser,
      sessionId: string
    ) => {
      // this.Debug(`${sessionId}   ${user.sessionId}  +로 바뀜`)
      SelfieRegistrant.instance.AddSelfieUser(user.sessionId);
      //UI On
    };
    this.room.State.selfiePlayer.OnRemove += (
      user: SelfieUser,
      sessionId: string
    ) => {
      // this.Debug(`${sessionId}   ${user.sessionId}  -로 바뀜`)
      //UI Off
      SelfieRegistrant.instance.DeleteSelfieUser(user.sessionId);
      //셀카 자세 중지
    };

    this.room.State.selfieWithPlayers.OnAdd += (
      user: SelfieWithUser,
      sessionId: string
    ) => {
      // this.Debug(`${sessionId}   ${user.sessionId} 누군가 바라보기로 시작함`)

      //바라보기
      user.withUser.OnAdd += (withUser: User) => {
        SelfieRegistrant.instance.LookAt(user.sessionId, withUser.sessionId);
      };

      //바라보기 종료
      user.withUser.OnRemove += (withUser: User) => {
        SelfieRegistrant.instance.StopLookAt(withUser.sessionId);
      };
    };

    this.room.State.selfieWithPlayers.OnRemove += (
      user: SelfieWithUser,
      sessionId: string
    ) => {
      // this.Debug(`${sessionId}   ${user.sessionId}  모든 이가 바라보기 멈춤`)
      //바라보기 종료
      user.withUser.ForEach((withSessionId: string) => {
        SelfieRegistrant.instance.StopLookAt(withSessionId);
      });
    };

    this.Debug(
      `플레이어 셀카 foreach 수 - ${this.room.State.selfiePlayer.Count}`
    );
    this.room.State.selfiePlayer.ForEach(
      (sessionId: string, user: SelfieUser) => {
        this.Debug("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ");
        this.Debug("기존의 플레이어 Foreach 돌리기");
        // this.Debug(sessionId)
        // this.Debug(user.sessionId)
        this.Debug("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ");
        SelfieRegistrant.instance.AddSelfieUser(user.sessionId);
        //이미 UI를 누른 플레이어 === selfieWithPlayer
      }
    );

    this.Debug(
      `플레이어 셀카 같이 찍기 foreach 수 - ${this.room.State.selfieWithPlayers.Count}`
    );
    this.room.State.selfieWithPlayers.ForEach(
      (sessionId: string, user: SelfieWithUser) => {
        this.Debug("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ");
        this.Debug("기존의 플레이어 같이 찍기 Foreach 돌리기");
        // this.Debug(user.sessionId)
        this.Debug("ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ");

        // 각 플레이어 ui에 누르면 꺼지도록 세팅
        user.withUser.ForEach((sessionId: string, withUser: User) => {
          SelfieRegistrant.instance.SetTakeWithUI(
            true,
            user.sessionId,
            withUser.sessionId
          );
          SelfieRegistrant.instance.LookAt(user.sessionId, withUser.sessionId);
          //카메라 위치 조정
        });
      }
    );
    this.Debug("셀카 관련 세팅 종료");
  }

  private *OnLeavePlayer(sessionId: string, player: Player) {
    while (SelfieRegistrant.instance.HasPlayer(player.sessionId)) {
      this.Debug(SelfieRegistrant.instance.HasPlayer(player.sessionId));
      yield null;
    }
    console.log(`[OnRemove] players - sessionId : ${sessionId}`);
    ZepetoPlayers.instance.RemovePlayer(sessionId);
  }

  private OnUpdateMultiPlayer(sessionId: string, player: Player) {
    const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

    const position = this.ParseVector3(player.transform.position);

    var moveDir = Vector3.op_Subtraction(
      position,
      zepetoPlayer.character.transform.position
    );
    const rot = this.ParseVector3(player.transform.rotation);
    if (moveDir.magnitude > 5) {
      zepetoPlayer.character.Teleport(
        position,
        Quaternion.Euler(rot.x, rot.y, rot.z)
      );
    } else {
      moveDir = new Vector3(moveDir.x, 0, moveDir.z);

      if (moveDir.magnitude < 0.05) {
        if (player.state === CharacterState.MoveTurn) return;
        zepetoPlayer.character.StopMoving();
      } else {
        zepetoPlayer.character.MoveToPosition(position);
      }
    }

    if (player.state === CharacterState.Jump) {
      if (zepetoPlayer.character.CurrentState !== CharacterState.Jump) {
        zepetoPlayer.character.Jump();
      }

      if (player.subState === CharacterJumpState.JumpDouble) {
        zepetoPlayer.character.DoubleJump();
      }
    }
  }

  public SendTransform(transform: Transform) {
    const data = new RoomData();

    const pos = new RoomData();
    pos.Add("x", transform.localPosition.x);
    pos.Add("y", transform.localPosition.y);
    pos.Add("z", transform.localPosition.z);
    data.Add("position", pos.GetObject());

    const rot = new RoomData();
    rot.Add("x", transform.localEulerAngles.x);
    rot.Add("y", transform.localEulerAngles.y);
    rot.Add("z", transform.localEulerAngles.z);
    data.Add("rotation", rot.GetObject());
    this.room.Send("onChangedTransform", data.GetObject());
  }
  public SendCameraTransform(transform: Transform) {
    const data = new RoomData();

    const pos = new RoomData();
    pos.Add("x", transform.localPosition.x);
    pos.Add("y", transform.localPosition.y);
    pos.Add("z", transform.localPosition.z);
    data.Add("position", pos.GetObject());
    this.room.Send("onChangedCameraTransform", data.GetObject());
  }

  private SendState(state: CharacterState) {
    const data = new RoomData();
    data.Add("state", state);
    if (state === CharacterState.Jump) {
      data.Add(
        "subState",
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.MotionV2
          .CurrentJumpState
      );
    }
    this.room.Send("onChangedState", data.GetObject());
  }

  SendAnimation(name: string, interactor: string) {
    const data = new RoomData();
    data.Add("animation", name);
    data.Add("interactor", interactor);
    this.room.Send("onChangedAnimation", data.GetObject());
  }

  SendGesture(name: string, isInfinite: boolean = false) {
    const data = new RoomData();
    data.Add("gesture", name);
    data.Add("isInfinite", isInfinite);
    this.room.Send("onChangedGesture", data.GetObject());
  }
  public Debug(obj: any) {
    const data = new RoomData();
    data.Add("sentence", obj);
    this.room.Send("DebugUpdate", data.GetObject());
  }
  private ParseVector3(vector3: Vector3Schema): Vector3 {
    return new Vector3(vector3.x, vector3.y, vector3.z);
  }
  private IsZeroPosition(pos: Vector3Schema) {
    return pos.x == null || pos.y == null || pos.z == null;
  }
}
