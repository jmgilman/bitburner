import { NS } from "@ns";
import { Player } from "lib/player"
import { scanAllServers } from "lib/scan";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    const player = new Player(ns)
    ns.disableLog('ALL')

    ns.print("INFO Entering main scanning loop...")
    while (true) {
        let allServers = scanAllServers(ns).all(true)
        ns.printf("INFO Found %d servers", allServers.length)

        const servers = allServers
            .filter(svr => svr.isPurchasedServer() || svr.name === "home" ? true : svr.canHack(player))
            .filter(svr => svr.getMaxRAM() > 0)

        ns.printf("INFO Processing %d valid servers", servers.length)
        servers.forEach((server, index) => {
            ns.printf("INFO Processing '%s' (%d/%d)", server.name, index + 1, servers.length)

            if (!server.isPurchasedServer() && !server.isRooted()) {
                ns.print("WARN This server has not yet been rooted. Rooting...")
                server.getRoot(player)
            }
        })

        ns.printf("INFO Writing cluster.json.txt with %d servers...", servers.length)
        const jsonData = JSON.stringify(servers)
        ns.write('/cluster.json.txt', jsonData, 'w')

        ns.print("INFO Sleeping for 60 seconds...")
        await ns.sleep(60000)
    }
}