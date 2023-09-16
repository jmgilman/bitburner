import { NS } from "@ns"
import { hash, hashFilename } from "lib/hash"
import { Player } from "lib/player"
import { Script } from "lib/script"

export interface SerializedServer {
    name: string;
    children: SerializedServer[];
}

/**
 * Represents a server.
 */
export class Server {
    /**
     * The NetScript object.
     */
    ns: NS

    /**
     * The name of the server.
     */
    name: string

    /**
     * The child servers belonging to this server.
     */
    children: Server[]

    /**
     * Creates a new server.
     */
    constructor(ns: NS, name: string, children: Server[] = []) {
        this.ns = ns
        this.name = name
        this.children = children
    }

    /**
     * Returns all child servers.
     * @param includeSelf Whether to include the root server in the list.
     * @return A list of all child servers.
     */
    all(includeSelf: boolean = false): Server[] {
        let servers: Server[] = includeSelf ? [this] : []
        for (const child of this.children) {
            servers.push(...child.all(true))
        }
        return servers
    }

    /**
     * Returns whether the current server is able to be hacked by the given player.
     * @param player The player to check
     * @return True if the server can be hacked, false otherwise
     */
    canHack(player: Player): boolean {
        return (
            this.ns.getServerRequiredHackingLevel(this.name) <= player.getHackingLevel()
            && this.ns.getServerNumPortsRequired(this.name) <= player.getActiveExploits().length
        )
    }

    /**
     * Downloads the requested script from the server.
     * @param filename The script to download
     * @param withHash If true, also downloads the script's hash
     */
    download(script: Script, withHash: boolean = false) {
        const files = [script.filename]

        if (withHash) {
            files.push(hashFilename(script.filename))
        }

        this.ns.scp(files, 'home', this.name)
    }

    /**
     * Downloads the hash file for the given script.
     * @param script The script to download the hash for
     */
    downloadHash(script: Script) {
        this.ns.scp(hashFilename(script.filename), 'home', this.name)
    }

    /**
     * Executes the given script on this server.
     * @param script The script to execute
     * @param threads The number of threads to use
     * @param args The arguments to pass to the script
     */
    exec(script: Script, threads: number = 1, ...args: any[]) {
        this.ns.exec(script.filename, this.name, threads, ...args)
    }

    /**
     * Returns whether the local script is different from the remote version located on this server.
     * @param script The script to check
     * @return True if the script has changed, false otherwise
     */
    scriptChanged(script: Script): boolean {
        this.downloadHash(script)

        const remoteHash = parseInt(this.ns.read(hashFilename(script.filename)), 10)
        const localHash = hash(this.ns.read(script.filename))

        return localHash !== remoteHash
    }

    /**
     * Returns the current amount of free RAM available on this server
     * @return The current amount of free RAM available
     */
    getCurrentRAM(): number {
        return this.ns.getServerMaxRam(this.name) - this.ns.getServerUsedRam(this.name)
    }

    /**
     * Returns the current amount of money available on this server.
     * @returns The current amount of money available on this server
     */
    getCurrentMoney(): number {
        return this.ns.getServerMoneyAvailable(this.name)
    }

    /**
     * Calculates the number of threads required to grow this server to max.
     * @returns The number of threads required to grow this server to max
     */
    getGrowthThreads(): number {
        return Math.ceil(this.ns.growthAnalyze(this.name, this.getMaxMoney() / this.getCurrentMoney()))
    }

    /**
     * Returns the time required to grow this server to max.
     * @returns The time required to grow this server to max
     */
    getGrowthTime(): number {
        return this.ns.getGrowTime(this.name)
    }

    /**
     * Returns the hacking level required to hack this server.
     * @returns The hcaking level required to hack this server
     */
    getHackingLevel(): number {
        return this.ns.getServerRequiredHackingLevel(this.name)
    }

    /**
     * Calculates the number of threads required to hack this server.
     * @param money The amount of money to hack
     * @returns The number of threads required to hack this server
     */
    getHackThreads(money: number): number {
        return Math.ceil(this.ns.hackAnalyzeThreads(this.name, money))
    }

    /**
     * Returns the time required to hack this server.
     * @returns The time required to hack this server
     */
    getHackTime(): number {
        return this.ns.getHackTime(this.name)
    }

    /**
     * Returns the maximum RAM available on this server
     * @return The maximum RAM
     */
    getMaxRAM(): number {
        return this.ns.getServerMaxRam(this.name)
    }

    /**
     * Returns the maximum amount of money that can be stored on this server.
     * @returns The maximum amount of money that can be stored on this server
     */
    getMaxMoney(): number {
        return this.ns.getServerMaxMoney(this.name)
    }

    /**
     * Returns the minimum security level of this server.
     * @returns The minimum security level of this server
     */
    getMinSecurityLevel(): number {
        return this.ns.getServerMinSecurityLevel(this.name)
    }

    /**
     * Establishes root access on the server for the given player.
     * @param player The player to use for getting root access
     */
    getRoot(player: Player) {
        const exploits = player.getActiveExploits()
        const requiredPorts = this.ns.getServerNumPortsRequired(this.name)
        this.ns.print(`INFO Using ${exploits.length} exploits to root ${this.name} (need ${requiredPorts} ports)`)

        for (let i = 0; i < requiredPorts; i++) {
            exploits[i](this.name)
        }

        this.ns.nuke(this.name)
    }

    /**
     * Returns the maximum number of threads that can be used to run the given
     * script on this server.
     * @param script The script to check
     * @returns The maximum number of threads that can be used to run the given script
     */
    getScriptThreads(script: Script): number {
        const ram = this.getCurrentRAM()
        const scriptRAM = script.getRAM()

        return Math.floor(ram / scriptRAM)
    }

    /**
     * Returns the current security level of this server.
     * @returns The current security level of this server
     */
    getSecurityLevel(): number {
        return this.ns.getServerSecurityLevel(this.name)
    }

    /**
     * Calculates the number of threads required to weaken this server.
     * @returns The number of threads required to weaken this server
     */
    getWeakenThreads(): number {
        return Math.ceil(
            (this.getSecurityLevel() - this.getMinSecurityLevel()) / this.ns.weakenAnalyze(1)
        )
    }

    /**
     * Returns the time required to weaken this server.
     * @returns The time required to weaken this server
     */
    getWeakenTime(): number {
        return this.ns.getWeakenTime(this.name)
    }

    /**
     * Returns the current amount of RAM being used on this server
     * @return The current amount of RAM being used
     */
    getUsedRAM(): number {
        return this.ns.getServerUsedRam(this.name)
    }

    /**
     * Returns whether the file exists on this server or not.
     * @param filename The file to check for
     * @return True if the file exists, false otherwise
     */
    hasFile(filename: string): boolean {
        return this.ns.fileExists(filename, this.name)
    }

    /**
     * Returns whether the current server has the maximum amount of money or not.
     * @return True if the server has the maximum amount of money, false otherwise
     */
    hasMaxMoney(): boolean {
        return this.getMaxMoney() === this.getCurrentMoney()
    }

    /**
     * Returns whether the current server has been rooted or not.
     * @return True if the server has been rooted, false otherwise
     */
    isRooted(): boolean {
        return this.ns.hasRootAccess(this.name)
    }

    /**
     * Returns whether this server is a player purchased server.
     * @return True if this server is player purchased, false otherwise
     */
    isPurchasedServer(): boolean {
        return this.ns.getPurchasedServers().includes(this.name)
    }

    /**
     * Returns whether this server is weakened or not.
     * @return True if this server is weakened, false otherwise
     */
    isWeakned(): boolean {
        return this.ns.getServerSecurityLevel(this.name) <= this.ns.getServerMinSecurityLevel(this.name)
    }

    /**
     * Kills all scripts running on this server.
     */
    kilAll(): void {
        this.ns.killall(this.name)
    }

    /**
     * Kills the given script running on this server.
     * @param filename The name of the script
     */
    killScript(filename: string) {
        this.ns.scriptKill(filename, this.name)
    }

    /**
     * Executes the given script on this server, using the maximum number of threads.
     * @param filename The name of the script
     * @param args The arguments to pass to the script
     * @returns The number of threads used to execute the script
     */
    maxExec(script: Script, ...args: any[]) {
        const maxThreads = this.getScriptThreads(script)
        this.exec(script, maxThreads, ...args)

        return maxThreads
    }

    /**
     * Returns a JSON representation of this server.
     * @returns A JSON representation of this server.
     */
    toJSON(): object {
        return {
            name: this.name,
            children: this.children.map(child => child.toJSON()),
        }
    }

    /**
     * Uploads the given script to the server.
     * @param scruot The script to upload
     * @param withHash If true, will also upload a hash of the script
     */
    upload(script: Script, withHash: boolean = false) {
        const files = [script.filename]

        if (withHash) {
            const filenameHash = `${script.filename}.txt`
            const fileHash = hash(this.ns.read(script.filename))
            this.ns.write(hashFilename(script.filename), fileHash.toString(), 'w')
            files.push(hashFilename(script.filename))
        }

        this.ns.scp(files, this.name, 'home')
    }

    /**
     * Parses the given JSON data into a Server object.
     * @param data The raw JSON data
     * @param ns The NetScript object
     * @returns The parsed Server object
     */
    static fromJSON(data: SerializedServer, ns: NS): Server {
        const server = new Server(ns, data.name)
        server.children = data.children.map(childData => Server.fromJSON(childData, ns))
        return server
    }
}