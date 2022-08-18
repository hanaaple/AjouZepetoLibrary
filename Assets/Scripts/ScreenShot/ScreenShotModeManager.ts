import { Animator, Camera, GameObject, Quaternion, Transform, Vector3 } from 'UnityEngine';
import { ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ClientStarter from '../ClientStarter';
import CaptureController from './CaptureController';
import IKController from './IKController';
import SelfieCamera from './SelfieCamera';

export default class ScreenShotModeManager extends ZepetoScriptBehaviour {

    private localPlayer: ZepetoPlayer
    private iKController: IKController

    public captureController: GameObject
    private capture : CaptureController

    public selfieCameraPrefab: GameObject
    private selfieCamera: Camera
    private zepetoCamera: Camera

    public selfieStickPrefab: GameObject
    private selfieStick: GameObject

    // Data
    private rightHandBone :string = "hand_R"

    Start() {
        this.capture = this.captureController.GetComponent<CaptureController>();
        
        // Zepeto Local player 관련 객체 캐싱
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.localPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
            this.zepetoCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;
        });
    }

    // 스크린샷 모드 시작 시 관련 설정 진행
    public StartScreenShotMode() {
        // 1. IK 설정
        this.selfieCamera = GameObject.Instantiate<GameObject>(this.selfieCameraPrefab).GetComponent<Camera>();

        let character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        let target = this.selfieCamera;
  
        // 2. SelfieCamera setting
        let selfieCamera: SelfieCamera = target.GetComponent<SelfieCamera>();
        selfieCamera.InitSetting(character.gameObject.transform);
        
        let grip = selfieCamera.GetGripObject();
        let playerAnimator = this.localPlayer.character.gameObject.GetComponentInChildren<Animator>();
        if(this.iKController == null){
            this.iKController = playerAnimator.gameObject.AddComponent<IKController>();
        }
        this.iKController.SetTargetAndGrip(target.transform, grip.transform);

        // 3. selfie stick을 캐릭터의 오른손에 고정
        if(this.selfieStick == null){
            this.selfieStick = GameObject.Instantiate<GameObject>(this.selfieStickPrefab);
            this.localPlayer.character.GetComponentsInChildren<Transform>().forEach((characterObj) => {
                if(characterObj.name == this.rightHandBone) {
                    this.selfieStick.transform.parent = characterObj;
                    this.selfieStick.transform.localPosition = Vector3.zero;
                    this.selfieStick.transform.localRotation = Quaternion.Euler(Vector3.zero);
                    // this.selfieStick.GetComponentInChildren<Renderer>().gameObject.layer = this.playerLayer;
                }
            });
        }
        //4. 처음에는 zepetoCamera로 설정, true - 서버에 메시지 보내지 않기
        this.SetZepetoCameraMode(true);
    }

    public ExitScreenShotMode(isThirdPersonView: boolean) {
        if(this.selfieCamera != null) {
            GameObject.Destroy(this.selfieCamera.gameObject);
            this.selfieCamera = null
        }

        // if(this.selfieStick != null) {

        //     // GameObject.Destroy(this.selfieStick.gameObject);
        //     // this.selfieStick = null
        // }
        if(!isThirdPersonView) {
            // 셀피 카메라 삭제
            // IK Pass 적용 해제
            this.SetIKPassActive(false);
            // 제페토 카메라 활성화
            this.zepetoCamera.gameObject.SetActive(true);
            ClientStarter.instance.GetRoom().Send("offSelfieMode")
        }
    }
    // 셀피 카메라 반환
    public GetSelfieCamera(): Camera {
        return this.selfieCamera;
    }
    // 제페토 카메라 반환
    public GetZepetoCamera(): Camera {
        return this.zepetoCamera;
    }

    // 셀피 카메라 활성화 여부를 결정
    public SetSelfieCameraActive(active: boolean) {
        this.selfieCamera.gameObject.SetActive(active);
    }

    // IKPass를 적용할지 여부를 결정
    public SetIKPassActive(active: boolean) {
        this.iKController.SetIKWeightActive(active);
        // iKController를 사용하는 시점이 셀피모드인 시점이므로 selfie stick도 이에 따라 활성/비활성
        this.selfieStick.SetActive(active);
    }

    // 카메라 설정을 위한 함수
    SetSelfieCameraMode() {
        ClientStarter.instance.GetRoom().Send("onSelfieMode")
        // 기존 제페토카메라 비활성화
        this.zepetoCamera.gameObject.SetActive(false);
        // 셀피 카메라 활성화
        this.SetSelfieCameraActive(true);
        // 셀카 포즈 설정을 위해 IKPass 활성화
        this.SetIKPassActive(true); 
        // 스크린샷 찍을 카메라를 셀피 카메라로 변경
        this.capture.SetCaptureCamera(this.selfieCamera);
        // 셀카봉 활성화
        this.selfieStick.SetActive(true);
    }

    SetZepetoCameraMode(isInit : boolean = false) {
        if(!isInit) ClientStarter.instance.GetRoom().Send("offSelfieMode")
        // 기존 제페토 카메라 활성화
        this.zepetoCamera.gameObject.SetActive(true);
        // 셀피 카메라 비활성화
        this.SetSelfieCameraActive(false);
        // 셀카 포즈 해제를 위해 IKPass 비활성화
        this.SetIKPassActive(false);
        // 스크린샷 찍을 카메라를 제페토 카메라로 변경
        this.capture.SetCaptureCamera(this.zepetoCamera);
        // 셀카봉 비활성화
        this.selfieStick.SetActive(false);
    }
}