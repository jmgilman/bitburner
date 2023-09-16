import { NS } from "@ns";

/**
 * Main entrypoint
 */
export async function main(ns: NS): Promise<void> {
    if (ns.args.length < 1) {
        ns.tprint("Usage: weaken.js <target server> [buffer time]")
        return
    }

    let bufferTime = ns.args[1] ? Number(ns.args[1]) : 0
    await ns.weaken(String(ns.args[0]), { additionalMsec: bufferTime })
}