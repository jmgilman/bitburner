import { NS } from "@ns";
import { Server } from "lib/server"

/**
 * Recursively scans a list of servers.
 * @param ns The NetScript object
 * @param parent The immediate parent server of the current server.
 * @param current The current server being scanned.
 * @return A list of servers found
 */
export function scan(ns: NS, parent: string, current: string): Server[] {
    const childNames = ns.scan(current).filter(server => server !== parent)
    let children = []

    for (const childName of childNames) {
        children.push(new Server(ns, childName, scan(ns, current, childName)))
    }

    return children
}

/**
 * Recursively scans all servers starting from the home server.
 * @param ns The NetScript object
 * @return The root server with all of its children
 */
export function scanAllServers(ns: NS): Server {
    return new Server(ns, 'home', scan(ns, '', 'home'))
}