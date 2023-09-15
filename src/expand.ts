import { NS } from "@ns";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    const targetRAM = 16
    let i = 0
    const limit = ns.getPurchasedServerLimit()

    while (i < limit) {
        if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(targetRAM)) {
            // Buy server
            const hostname = ns.purchaseServer('expand', targetRAM)

            ns.scp('pwn.js', hostname)
            ns.exec('pwn.js', hostname, 3)
            ++i

            // Add server to list
            ns.write('serv.txt', hostname + '\n', 'a')
        }

        await ns.sleep(1000)
    }
}