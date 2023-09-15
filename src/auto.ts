import { NS } from "@ns";
import { Player } from "lib/player"
import { scanAllServers } from "lib/scan";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    const pwnScript = "pwn.js"
    const player = new Player(ns)

    // Otherwise we generate A LOT of noise :)
    ns.disableLog('ALL')

    while (true) {
        ns.print("INFO Entering main loop...")

        ns.print("INFO Scanning the network for servers...")
        let servers = scanAllServers(ns).all()
        ns.printf("INFO Found %d servers", servers.length)

        const invalidServers = servers.filter(svr => !svr.isPurchasedServer() && !svr.canHack(player))
        ns.printf(
            "INFO Removing %d servers from processing as they currently cannot be hacked",
            invalidServers.length
        )
        servers = servers.filter(svr => !invalidServers.includes(svr))

        servers.forEach((server, index) => {
            ns.printf("INFO Processing '%s' (%d/%d)", server.name, index + 1, servers.length)

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