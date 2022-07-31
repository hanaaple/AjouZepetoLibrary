import { textChangeRangeIsUnchanged } from 'typescript'
import { AnimationClip, Camera, Collider, GameObject, LayerMask, Mathf, Random, Vector3 } from 'UnityEngine'
import { Button } from 'UnityEngine.UI'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import AnimationLinker from '../AnimationLinker'
import ClientStarter from '../ClientStarter'

export default class RandomFixedInteractor extends ZepetoScriptBehaviour {

    public interactButtonPrefab : GameObject
    private _interactButton : Button
    // @Header("애니메이션 이름을 넣으세요. ex) idle_cup인 경우 cup")
    public animationClip : AnimationClip[]
    // public fixedPoint : Transform
    public cameraOffset : Vector3
    public FixedPointOffset : Vector3
    private localCamera : Camera

    Start() {
        if(this.FixedPointOffset == undefined)
            this.FixedPointOffset = Vector3.zero
        if(this.cameraOffset == undefined)
            this.cameraOffset = Vector3.zero

        this._interactButton = GameObject.Instantiate<GameObject>(this.interactButtonPrefab).GetComponent<Button>()
        AnimationLinker.instance.AddInteractor(this._interactButton.gameObject)
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() =>{
            this.localCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera
        })

        this._interactButton.onClick.AddListener(() => {
            var aniClip = this.GetRandomAnimation()
            while(AnimationLinker.instance.GetPlayingGesture(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.id) == aniClip){
                if(this.animationClip.length == 1) break
                aniClip = this.GetRandomAnimation()
            }
            AnimationLinker.instance.PlayGesture(aniClip.name, true)
            console.log(aniClip)
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position = Vector3.op_Addition(this.transform.position, this.FixedPointOffset)
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.rotation = this.transform.rotation
            ClientStarter.instance.SendTransform(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform)
            this.StopAllCoroutines();
            this.StartCoroutine(this.CheckPlayerMove(aniClip))
        })
    }

    Update(){
        if((this._interactButton.gameObject.activeSelf || this._interactButton.gameObject.activeSelf) && this.localCamera != null){
            // console.log(this.cameraOffset)

            var screenPos = this.localCamera.WorldToScreenPoint(Vector3.op_Addition(this.transform.position, this.cameraOffset))
            // console.log(screenPos)
            this._interactButton.transform.position = screenPos
            this._interactButton.transform.position = screenPos

            // this.testButton.transform.LookAt(this.localCamera.transform)
        }
    }

    *CheckPlayerMove(aniClip : AnimationClip){
        while(true){
            if(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.tryMove){
                AnimationLinker.instance.StopGesture(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer);
                break
            }
            if(AnimationLinker.instance.GetPlayingGesture(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.id) != aniClip){
                break
            }
            yield null
        }
    }

    OnTriggerEnter(col : Collider){
        if(col.gameObject.layer == LayerMask.NameToLayer("LocalPlayer")){
            this._interactButton.gameObject.SetActive(true)
        }
    }

    OnTriggerExit(col : Collider){
        if(col.gameObject.layer == LayerMask.NameToLayer("LocalPlayer")){
            this._interactButton.gameObject.SetActive(false)
        }
    }

    GetRandomAnimation() : AnimationClip{
        var rndClipIndex = Mathf.Floor(Random.Range(0, this.animationClip.Length))
        console.log(rndClipIndex)
        console.log(this.animationClip[rndClipIndex])
        return this.animationClip[rndClipIndex]
    }
}