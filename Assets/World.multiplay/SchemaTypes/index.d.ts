declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
		selfieWithPlayers: MapSchema<SelfieWithUser>;
		selfiePlayer: MapSchema<SelfieUser>;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		transform: Transform;
		state: number;
		animation: string;
		gesture: string;
		interactor: string;
		isInfinite: boolean;
	}
	class Transform extends Schema {
		position: Vector3;
		rotation: Vector3;
	}
	class Vector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
	class SelfieWithUser extends Schema {
		sessionId: string;
		withUser: MapSchema<User>;
	}
	class SelfieUser extends Schema {
		sessionId: string;
		cameraTransform: Transform;
	}
	class User extends Schema {
		sessionId: string;
	}
}