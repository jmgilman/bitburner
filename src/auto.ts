import { NS } from "@ns";
import { Player } from "lib/player"
import { Cluster } from "lib/cluster";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    const pwnScript = "pwn.js"
    const player = new Player(ns)
    ns.disableLog('ALL')

    ns.print("INFO Loading cluster...")
    while (true) {
        const cluster = Cluster.fromFile(ns, '/cluster.json.txt')
        ns.printf("INFO Loaded cluster with %d servers", cluster.servers.length)

        cluster.servers.forEach((server, index) => {
            ns.printf("INFO Processing '%s' (%d/%d)", server.name, index + 1, cluster.servers.length)

            if (!server.isPurchasedServer() && !server.isRooted()) {
                ns.print("WARN This server has not yet been rooted. Rooting...")
                server.getRoot(player)
            }

            if (ns.getScriptRam(pwnScript, 'home') > server.getMaxRAM()) {
                ns.print("INFO Server doesn't have enough RAM to run script")
                return
            }

            if (!server.hasFile(pwnScript)) {
                ns.printf("WARN Missing %s on this server. Generating...", pwnScript)
                server.upload(pwnScript, true)
                server.maxExec(pwnScript)
            } else if (server.fileChanged(pwnScript)) {
                ns.printf("WARN Local copy of %s has changed. Uploading newer version...", pwnScript)
                server.upload(pwnScript, true)
                server.killScript(pwnScript)
                server.maxExec(pwnScript)
            }
        })

        ns.print("INFO Sleeping for 30 seconds...")
        await ns.sleep(30000)
    }
}