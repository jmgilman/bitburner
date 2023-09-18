import { NS } from "@ns"
import { Cluster } from "lib/cluster"
import { Server } from "lib/server"
import { Script } from "lib/script"

export async function growthAttack(ns: NS, growScript: Script, weakenScript: Script, target: Server, cluster: Cluster) {
    let remainingThreads = target.getGrowthThreadsMax()
    let growSecRatio = ns.growthAnalyzeSecurity(1) / ns.weakenAnalyze(1)

    while (remainingThreads > 0) {
        let clusterThreads = cluster.getScriptThreads(growScript)
        let weakenThreads = Math.max(Math.floor(growSecRatio * clusterThreads), 1)
        let availableThreads = clusterThreads - weakenThreads
        let growThreads = remainingThreads > availableThreads ? availableThreads : remainingThreads
        remainingThreads -= growThreads

        let timeBuffer = 0, waitTime = 0;
        if (target.getGrowthTime() > (target.getWeakenTime() + 100)) {
            timeBuffer = (target.getGrowthTime() - target.getWeakenTime()) + 100
            waitTime = target.getGrowthTime() + timeBuffer
        } else {
            waitTime = target.getWeakenTime() + 100
        }

        ns.print(`INFO (GROW) Growing target server ${target.name}:`)
        ns.print(`INFO (GROW)   Money: ${target.getCurrentMoney()} / ${target.getMaxMoney()}`)
        ns.print(`INFO (GROW)   Security: ${target.getSecurityLevel()} / ${target.getMinSecurityLevel()}`)
        ns.print(`INFO (GROW)   Cluster threads: ${clusterThreads}`)
        ns.print(`INFO (GROW)   Executing ${growThreads + weakenThreads} threads (${growThreads} grow, ${weakenThreads} weaken)`)
        ns.print(`INFO (GROW)   Growth time: ${target.getGrowthTime() / 1000} sec`)
        ns.print(`INFO (GROW)   Weaken time: ${target.getWeakenTime() / 1000} sec`)
        ns.print(`INFO (GROW)   Time buffer: ${timeBuffer / 1000} sec`)
        ns.print(`INFO (GROW)   Wait time: ${waitTime / 1000} sec`)
        ns.print(`INFO (GROW)   Have ${remainingThreads} threads remaining`)

        cluster.exec(growScript, growThreads, target.name, 0)
        cluster.exec(weakenScript, weakenThreads, target.name, timeBuffer)

        ns.print(`INFO (GROW) Sleeping for ${waitTime / 1000} seconds...`)
        await ns.sleep(waitTime)
    }
}

export async function hackAttack(ns: NS, hackScript: Script, target: Server, cluster: Cluster) {
    let hackedMoney = 0
    let startingMoney = target.getCurrentMoney()
    let targetMoney = target.getMaxMoney() * 0.75

    while (hackedMoney < targetMoney) {
        let clusterThreads = cluster.getScriptThreads(hackScript)
        let hackThreads = target.getHackThreads(targetMoney - hackedMoney)
        let totalThreads = hackThreads > clusterThreads ? clusterThreads : hackThreads

        let hackTime = target.getHackTime()

        ns.print(`INFO (HACK) Hacking target server ${target.name}:`)
        ns.print(`INFO (HACK)   Money: $${target.getCurrentMoney()} / ${target.getMaxMoney()}`)
        ns.print(`INFO (HACK)   Hacked: $${hackedMoney} / $${targetMoney}`)
        ns.print(`INFO (HACK)   Security: ${target.getSecurityLevel()} / ${target.getMinSecurityLevel()}`)
        ns.print(`INFO (HACK)   Executing ${totalThreads} threads`)
        ns.print(`INFO (HACK)   Hack time: ${hackTime / 1000} sec`)

        cluster.exec(hackScript, totalThreads, target.name, 0)

        ns.print(`INFO (HACK) Sleeping for ${hackTime / 1000} seconds...`)
        await ns.sleep(hackTime)

        hackedMoney = startingMoney - target.getCurrentMoney()
        ns.print(`INFO (HACK) Hacked $${hackedMoney}`)
    }
}

export async function weakenAttack(ns: NS, script: Script, target: Server, cluster: Cluster) {
    let weakenThreads = target.getWeakenThreads()
    let growSecRatio = ns.growthAnalyzeSecurity(1) / ns.weakenAnalyze(1)
    let clusterThreads = 0

    // Optimization: If the number of weaken threads that the grow attack will
    // use is greater than the number of weaken threads we calculated, then
    // we can return early.
    if (Math.max(Math.floor(growSecRatio * cluster.getScriptThreads(script)), 1) > weakenThreads) {
        ns.print("INFO (WEAKEN) Skipping weaken attack because grow attack will use more threads")
        return
    }

    while (true) {
        let weakenTime = target.getWeakenTime()
        clusterThreads = cluster.getScriptThreads(script)

        ns.print(`INFO (WEAKEN) Weakening target server ${target.name}:`)
        ns.print(`INFO (WEAKEN)   Security level (cur): ${target.getSecurityLevel()}`)
        ns.print(`INFO (WEAKEN)   Security level (min): ${target.getMinSecurityLevel()}`)
        ns.print(`INFO (WEAKEN)   Weaken time: ${weakenTime / 1000} sec`)
        ns.print(`INFO (WEAKEN)   Weaken threads: ${weakenThreads}`)
        ns.print(`INFO (WEAKEN)   Cluster threads: ${clusterThreads}`)

        if (weakenThreads < clusterThreads) {
            cluster.exec(script, weakenThreads, target.name)
            await ns.sleep(weakenTime)

            break
        } else {
            weakenThreads -= cluster.exec(script, clusterThreads, target.name)
            await ns.sleep(weakenTime)
        }
    }
}