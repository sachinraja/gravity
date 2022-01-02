import { Service } from '@digitak/gravity/services/Service';
import { Public } from './decorators/Public';

const sleep = (value: number) => new Promise((resolve) => setTimeout(resolve, value));

@Public
export class cat extends Service {
	name = 'A cat';

	async meow(enemy?: string) {
		await sleep(200);
		return `[to ${enemy ?? 'you'}] Meow!`;
	}
	attack(target: string) {
		return 'Shhhhhh!';
	}
}
