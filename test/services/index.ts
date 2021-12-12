import { useServices } from "@digitak/gravity/services"
import { Cat } from "./Cat"
import { Dog } from "./Dog"

export const services = useServices({
	cat: new Cat(),
	dog: new Dog(),
})
