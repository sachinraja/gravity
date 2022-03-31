import { bunker } from "@digitak/bunker";
import type { IncomingHttpHeaders } from "http";
import { GravityError } from "../errors/GravityError";
import { BaseServiceConstructor } from "../services/BaseServiceConstructor";
import type { GravityAuthorizeFunction } from "../types/GravityAuthorizeFunction";
import { GravityResponse } from "../types/GravityResponse";
import { decodeParameters } from "./decodeParameters";
import { decodeUrl } from "./decodeUrl";
import { resolvePath } from "./resolvePath";
import { validateSignature } from "typezer/validate";
import { Type } from "typezer";

export async function resolveApiRequest<Context>({
	url,
	services,
	schema,
	headers,
	rawBody,
	context,
	authorize,
}: {
	url: string;
	services: Record<string, BaseServiceConstructor>;
	schema: Record<string, Record<string, Type>>;
	headers: IncomingHttpHeaders;
	rawBody: Uint8Array | null | undefined;
	context: Context;
	authorize: GravityAuthorizeFunction<Context> | undefined;
}): Promise<GravityResponse> {
	const encoding = headers["content-type"] == "x-bunker" ? "bunker" : "json";
	const [serviceName, ...path] = decodeUrl(url);

	if (!serviceName) {
		throw new GravityError("gravity/service-missing", {
			message: "Service missing.",
			status: 400,
		});
	}

	if (!path.length) {
		throw new GravityError("gravity/target-missing", {
			message: `Target missing when calling service '${serviceName}'.`,
			status: 400,
		});
	}

	const serviceConstructor = services[serviceName];
	if (!serviceConstructor) {
		throw new GravityError("gravity/service-inexistant", {
			message: `The service '${serviceName}' does not exist.`,
			status: 404,
		});
	}

	// we authorize the call
	await authorize?.({
		context,
		service: serviceConstructor,
		path,
	});

	const service = new serviceConstructor(context);
	const operation = resolvePath(serviceName, service, path);

	let resolved: unknown;

	if (typeof operation == "function") {
		const parameters = decodeParameters(headers, rawBody);
		const { errors } = validateSignature(schema[serviceName], path, parameters);
		if (errors?.length) {
			throw new GravityError("gravity/bad-parameters", {
				message: `Bad parameters: ${errors.join("\n")}`,
				status: 400,
			});
		}
		resolved = await operation.apply(service, parameters);
	} else resolved = await operation;

	return {
		status: 200,
		headers: {
			"content-type": encoding == "bunker" ? "x-bunker" : "application/json",
		},
		body: encoding == "bunker" ? bunker(resolved) : JSON.stringify(resolved),
	};
}
