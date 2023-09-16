import { NS } from "@ns";
import { SerializedServer, Server } from "lib/server";
import { Script } from "./script";

/**
 * Represents a cluster of servers.
 */
export class Cluster {
    /**
     * The NetScript object.
     */
    ns: NS

    /**
     * The servers in the cluster.
     */
    servers: Server[]

    /**
     * Creates a new cluster.
     * @param ns The NetScript object.
     * @param servers The servers in the cluster.
     */
    constructor(ns: NS, servers: Server[]) {
        this.ns = ns
        this.servers = servers
    }

    /**
     * Executes a script on the cluster.
     * @param script The script to execute.
     * @param maxThreads The maximum number of threads to use.
     * @returns The number of threads used.
     */
    exec(script: Script, maxThreads: number, ...args: any[]): number {
        let threads = 0
        const servers = this.servers.sort((a, b) => b.getScriptThreads(script) - a.getScriptThreads(script))

        for (const server of servers) {
            let serverThreads = server.getScriptThreads(script)
            if (serverThreads == 0) {
                continue
            } else if (serverThreads > (maxThreads - threads)) {
                serverThreads = maxThreads - threads
            }

            server.exec(script, serverThreads, ...args)
            threads += serverThreads

            if (threads >= maxThreads) {
                break
            }
        }

        return threads
    }

    /**
     * Finds a server by name.
     * @param name The name of the server to find
     * @returns The server with the given name, or null if no such server exists.
     */
    findByName(name: string): Server | null {
        for (const server of this.servers) {
            if (server.name === name) {
                return server
            }
        }

        return null
    }

    /**
     * Calculates the available number of threads for a script in the cluster.
     * @param script The script to check.
     * @returns The number of available threads.
     */
    getScriptThreads(script: Script): number {
        let threads = 0
        for (const server of this.servers) {
            threads += server.getScriptThreads(script)
        }
        return threads
    }

    /**
     * Uploads a script to all servers in the cluster.
     * @param script The script to upload.
     */
    upload(script: Script) {
        for (const server of this.servers) {
            server.upload(script)
        }
    }

    /**
     * Creates a new cluster from a file.
     * @param ns The NetScript object.
     * @param path The path to the file to load.
     * @returns A new cluster.
     */
    static fromFile(ns: NS, path: string): Cluster {
        const servers: Server[] = JSON
            .parse(ns.read(path))
            .map((data: SerializedServer) => Server.fromJSON(data, ns));

        return new Cluster(ns, servers)
    }
}