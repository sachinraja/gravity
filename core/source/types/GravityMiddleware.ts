import type { IncomingMessage, ServerResponse } from "http";
import { BaseServiceConstructor } from "../services/BaseService";
import { GravityAuthorizeFunction } from "./GravityAuthorizeFunction";
import { MaybePromise } from "./MaybePromise";

type OnRequestReceive<Context> = (request: IncomingMessage) => MaybePromise<{
	request: IncomingMessage;
	context: Context;
}>;

export type GravityMiddleware<Response = ServerResponse> = <
	Context = undefined,
>(
	input: {
		services: Record<string, BaseServiceConstructor<Context>>;
		apiPath?: string;
		onResponseSend?: (response: Response) => MaybePromise<Response>;
		authorize?: GravityAuthorizeFunction;
	} & (Context extends undefined
		? { onRequestReceive?: OnRequestReceive<Context> }
		: { onRequestReceive: OnRequestReceive<Context> }),
) => any;
