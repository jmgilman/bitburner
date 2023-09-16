import { NS } from "@ns";
import * as attack from "lib/attack";
import { Cluster } from "lib/cluster";
import { Server } from "lib/server";
import { Script } from "lib/script";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')

    // Target server is closest server to HACKING_STAT/{TARGET_DIVISOR}
    const TARGET_DIVISOR = 3

    // Load the cluster
    let cluster = Cluster.fromFile(ns, '/cluster.json.txt')

    // Script names
    const GROW_SCRIPT_NAME = "grow.js"
    const HACK_SCRIPT_NAME = "hack.js"
    const WEAKEN_SCRIPT_NAME = "weaken.js"

    // Upload scripts
    ns.print("INFO Uploading scripts...")
    const growScript = new Script(ns, GROW_SCRIPT_NAME, "home")
    cluster.upload(growScript)

    const hackScript = new Script(ns, HACK_SCRIPT_NAME, "home")
    cluster.upload(hackScript)

    const weakenScript = new Script(ns, WEAKEN_SCRIPT_NAME, "home")
    cluster.upload(weakenScript)

    ns.print("INFO Entering main execution loop...")
    while (true) {
        cluster = Cluster.fromFile(ns, '/cluster.json.txt')
        ns.printf("INFO Loaded cluster with %d servers", cluster.servers.length)

        ns.print("INFO Finding target server...")
        const targetServer = findTargetServer(ns, cluster, TARGET_DIVISOR)

        ns.print(`INFO Target server is ${targetServer.name} with level ${targetServer.getHackingLevel()}`)

        // Weaken to minimum security level
        if (!targetServer.isWeakned()) {
            await attack.weakenAttack(ns, weakenScript, targetServer, cluster)
        }

        await ns.sleep(100)

        // Grow to max money
        if (!targetServer.hasMaxMoney()) {
            await attack.growthAttack(ns, growScript, weakenScript, targetServer, cluster)
        }

        await ns.sleep(100)

        // Initiate hack
        await attack.hackAttack(ns, hackScript, targetServer, cluster)

        ns.print("INFO Sleeping for 1 seconds...")
        await ns.sleep(1000)
    }
}

/**
 * Finds the server which is closest to the calculated target level.
 * @param ns The NetScript object.
 * @param cluster The cluster to search.
 * @param divisor The divisor to use when calculating the target level.
 * @returns The server which is closest to the target level.
 */
function findTargetServer(ns: NS, cluster: Cluster, divisor: number): Server {
    // Get a list of servers and their required hacking levels, sorted by
    // level.
    const serverLevels = cluster.servers
        .filter(svr => svr.name !== "home")
        .map(svr => {
            return {
                name: svr.name,
                level: svr.getHackingLevel()
            }
        }).sort((a, b) => a.level - b.level)

    // Pick the server which is closest to the target level.
    const targetLevel = Math.floor(ns.getHackingLevel() / divisor)
    let targetServer = serverLevels[0]
    let minDistance = Math.abs(targetLevel - targetServer.level)

    for (let i = 1; i < serverLevels.length; i++) {
        const svr = serverLevels[i]
        const distance = Math.abs(targetLevel - svr.level)
        if (distance < minDistance) {
            targetServer = svr
            minDistance = distance
        }
    }

    return cluster.findByName(targetServer.name)!
}