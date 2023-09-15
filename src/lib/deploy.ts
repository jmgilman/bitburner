import { NS } from "@ns";
import { Server } from "lib/server"

/**
 * Represents a script that is running on a server
 */
export class Script {
    /**
     * The NetScript object.
     */
    ns: NS

    /**
     * The filename of this script.
     */
    filename: string

    /**
     * The server this script is running on.
     */
    server: Server

    /** Creates a new script.
     * @param ns The NetScript object
     * @param filename The filename of the script
     */
    constructor(ns: NS, filename: string, server: Server) {
        this.ns = ns
        this.filename = filename
        this.server = server
    }

    /**
     * Returns the total RAM required by this script
     * @return The total RAM required
     */
    getRAM(): number {
        return this.ns.getScriptRam(this.filename, this.server.name)
    }

}

/**
 * Represents a group of scripts running on a server
 */
export class Pod {
    /**
     * The NetScript object.
     */
    ns: NS

    /**
     * The scripts that make up this pod.
     */
    scripts: Script[]

    /**
     * The server this pod is running on.
     */
    server: Server

    /**
     * Creates a new pod.
     * @param ns The NetScript object.
     * @param The scripts to create the pod with
     * @param The server to run this pod on
     */
    constructor(ns: NS, scripts: Script[], server: Server) {
        this.ns = ns
        this.scripts = scripts
        this.server = server
    }
}