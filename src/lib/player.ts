import { NS } from "@ns";

/**
 * Represents the player.
 * @class Player
 * @property {NS} ns The NetScript object
 */
export class Player {
    /**
     * The NetScript object.
     * @type NS
     */
    ns: NS

    /**
     * Creates a new player object.
     * @param {NS} ns The NetScript object
     */
    constructor(ns: NS) {
        this.ns = ns
    }

    /**
     * Get the player's currently available exploits.
     * @return {Array<function(string): void>} A list of exploit functions
     */
    getActiveExploits() {
        const exploits = []
        if (this.ns.fileExists('BruteSSH.exe', 'home')) {
            exploits.push(this.ns.brutessh)
        }

        if (this.ns.fileExists('FTPCrack.exe', 'home')) {
            exploits.push(this.ns.ftpcrack)
        }

        return exploits
    }

    /**
     * Get the player's current hacking level.
     * @return {number} The hacking level
     */
    getHackingLevel() {
        return this.ns.getHackingLevel()
    }
}