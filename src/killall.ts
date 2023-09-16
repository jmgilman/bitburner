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
    const cluster = Cluster.fromFile(ns, '/cluster.json.txt')
    for (const server of cluster.servers) {
        ns.print(`Killing all scripts on ${server.name}`)
        server.kilAll()
    }
}