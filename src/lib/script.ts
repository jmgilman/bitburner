import { NS } from "@ns";
import { Server } from "lib/server"

/**
 * Represents a script
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
     * The hostname of the server where this script is located.
     */
    hostname: string

    /** Creates a new script.
     * @param ns The NetScript object
     * @param filename The filename of the script
     * @param hostname The hostname of the server where the script is located
     */
    constructor(ns: NS, filename: string, hostname: string = "home") {
        this.ns = ns
        this.filename = filename
        this.hostname = hostname
    }

    /**
     * Returns the total RAM required by this script
     * @param threads The number of threads to use
     * @return The total RAM required
     */
    getRAM(threads: number = 1): number {
        return this.ns.getScriptRam(this.filename, this.hostname) * threads
    }

}