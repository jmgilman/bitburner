import { NS } from "@ns";
import { SerializedServer, Server } from "lib/server";

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