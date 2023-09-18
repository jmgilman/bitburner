import { NS } from "@ns";
import { Server } from "lib/server";
import { Script } from "lib/script";

export class Batch {

    ns: NS
    runner: Server
    target: Server
    greed: number
    growScript: Script
    hackScript: Script
    weakenScript: Script
    spacer: number

    constructor(
        ns: NS,
        runner: Server,
        target: Server,
        greed: number,
        growScript: Script,
        hackScript: Script,
        weakenScript: Script,
        spacer: number = 100,
    ) {
        this.ns = ns
        this.runner = runner
        this.target = target
        this.greed = greed
        this.growScript = growScript
        this.hackScript = hackScript
        this.weakenScript = weakenScript
        this.spacer = spacer
    }

    get hackThreads(): number {
        return this.target.getHackThreads(this.greed)
    }

    get hackWeakenThreads(): number {
        return Math.max(Math.ceil(this.target.getHackSecurityIncrease(this.hackThreads) / this.ns.weakenAnalyze(1)), 1)
    }

    get growThreads(): number {
        return this.target.getGrowthThreads(this.greed)
    }

    get growWeakenThreads(): number {
        return Math.max(Math.ceil(this.target.getGrowthSecurityIncrease(this.growThreads) / this.ns.weakenAnalyze(1)), 1)
    }

    get totalRAM(): number {
        return this.growScript.getRAM(this.growThreads) +
            this.hackScript.getRAM(this.hackThreads) +
            this.weakenScript.getRAM(this.hackWeakenThreads + this.growWeakenThreads)
    }

    get totalThreads(): number {
        return this.hackThreads + this.hackWeakenThreads + this.growThreads + this.growWeakenThreads
    }

    run(): number {
        let weakenGrowBuffer = this.spacer * 2
        let growBuffer = (this.target.getWeakenTime() - this.target.getGrowthTime()) + this.spacer
        let weakenHackBuffer = this.spacer * 0
        let hackBuffer = (this.target.getWeakenTime() - this.target.getHackTime()) - this.spacer

        this.runner.exec(this.weakenScript, this.growWeakenThreads, this.target.name, weakenGrowBuffer)
        this.runner.exec(this.growScript, this.growThreads, this.target.name, growBuffer)
        this.runner.exec(this.weakenScript, this.hackWeakenThreads, this.target.name, weakenHackBuffer)
        this.runner.exec(this.hackScript, this.hackThreads, this.target.name, hackBuffer)

        return this.target.getWeakenTime() + weakenGrowBuffer
    }

}