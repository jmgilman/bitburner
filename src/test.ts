import { NS } from "@ns";
import { Player } from "lib/player"
import { Cluster } from "lib/cluster";
import { Server } from "lib/server";
import { Script } from "lib/script";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')

    let cluster = Cluster.fromFile(ns, '/cluster.json.txt')
    let target = cluster.findByName("phantasy")
    let growThreads = target?.getGrowthThreads()
    ns.tprint(`Current money: ${target?.getCurrentMoney()}`)
    ns.tprint(`Max money: ${target?.getMaxMoney()}`)
    ns.tprint(`Growth threads: ${growThreads}`)

    // let hackCoeff = ns.hackAnalyzeSecurity(1)
    // let weakenCoeff = ns.weakenAnalyze(1)
    // let ratio = hackCoeff / weakenCoeff
    // let threads = 434

    // let hackThreads = Math.floor(threads / (1 + ratio));
    // let weakenThreads = Math.floor(ratio * hackThreads);

    // ns.tprint(`Hack threads: ${hackThreads}`)
    // ns.tprint(`Weaken threads: ${weakenThreads}`)
}