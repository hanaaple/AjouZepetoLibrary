import { Application, GameObject, HideFlags, Input, Mathf, Quaternion, Time, Transform, Vector3 } from 'UnityEngine';
import { EventSystem } from 'UnityEngine.EventSystems';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ClientStarter from '../ClientStarter';
import SelfieRegistrant from './SelfieRegistrant';

export default class OnlineSelfieCamera extends ZepetoScriptBehaviour {

    public grip: GameObject

    public GetGripObject() :GameObject {
        return this.grip;
    }
}