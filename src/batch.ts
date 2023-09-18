import { NS } from "@ns";
import { Player } from "lib/player"
import { Cluster } from "lib/cluster";
import { Server } from "lib/server";
import { Script } from "lib/script";
import { Batch } from "lib/batch";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')

    while (true) {

        ns.print(`INFO ----------------------------------------`)
        ns.print(`INFO Starting new batch`)
        ns.print(`INFO ----------------------------------------`)

        let cluster = Cluster.fromFile(ns, '/cluster.json.txt')
        let target = cluster.findByName("hong-fang-tea")
        let greed = 0.03

        let batch = new Batch(
            ns,
            cluster.findByName("home")!,
            target!,
            greed,
            new Script(ns, "grow.js", "home"),
            new Script(ns, "hack.js", "home"),
            new Script(ns, "weaken.js", "home"),
        )

        let runs = Math.floor(cluster.findByName("home")!.getCurrentRAM() / batch.totalRAM)
        let beforeMoney = ns.getServerMoneyAvailable("home")
        let sleepTime = 0

        ns.print(`INFO Current security: ${target!.getSecurityLevel()}`)
        ns.print(`INFO Current money: $${target!.getCurrentMoney().toLocaleString("en-us")}/$${target!.getMaxMoney().toLocaleString("en-us")}`)
        ns.print(`INFO Target money: $${((target!.getCurrentMoney() * greed) * runs).toLocaleString("en-us")}`)
        ns.print(`INFO Running ${runs} batches...`)
        for (let i = 0; i < runs; i++) {
            sleepTime = batch.run()
            await ns.sleep(100)
        }

        ns.print(`INFO ----------------------------------------`)
        ns.print(`INFO Sleeping for ${(Math.round(sleepTime + 1000) / 1000)} seconds...`)
        ns.print(`INFO ----------------------------------------`)
        await ns.sleep(sleepTime + 1000)

        let gainedMoney = ns.getServerMoneyAvailable("home") - beforeMoney
        let moneyPerSecond = gainedMoney / ((sleepTime + (runs * 100) + 1000) / 1000)
        ns.print(`INFO Results from batches`)
        ns.print(`INFO Current security: ${target!.getSecurityLevel()} `)
        ns.print(`INFO Current money: $${target!.getCurrentMoney().toLocaleString("en-us")} `)
        ns.print(`INFO Gained money: $${gainedMoney.toLocaleString("en-us")} `)
        ns.print(`INFO Money per second: $${moneyPerSecond.toLocaleString("en-us")} `)
        ns.print(`INFO ----------------------------------------`)
    }

}