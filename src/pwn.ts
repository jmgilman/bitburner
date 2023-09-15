import { NS } from "@ns";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    const target = 'harakiri-sushi'

    const maxMoney = ns.getServerMaxMoney(target)
    const minSecurity = ns.getServerMinSecurityLevel(target)

    if (ns.fileExists('BruteSSH.exe', 'home')) {
        ns.brutessh(target)
    }

    ns.nuke(target)

    while (true) {
        if (ns.getServerSecurityLevel(target) > minSecurity) {
            await ns.weaken(target)
        } else if (ns.getServerMoneyAvailable(target) < maxMoney) {
            await ns.grow(target)
        } else {
            await ns.hack(target)
        }
    }

}