import { NS } from "@ns";
import { hash, hashFilename } from "lib/hash"
import { Player } from "lib/player"

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
        let servers: Server[] = includeSelf ? [this] : [];
        for (const child of this.children) {
            servers.push(...child.all(true));
        }
        return servers;
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
     * Downloads the requested file from the server.
     * @param filename The file to download
     * @param withHash If true, also downloads the file's hash
     */
    download(filename: string, withHash: boolean = false) {
        const files = [filename]

        if (withHash) {
            files.push(hashFilename(filename))
        }

        this.ns.scp(files, 'home', this.name)
    }

    /**
     * Downloads the hash file for the given filename.
     * @param filename The file to download the hash for
     */
    downloadHash(filename: string) {
        this.ns.scp(hashFilename(filename), 'home', this.name)
    }

    /**
     * Executes the given script on this server.
     * @param filename The name of the script
     * @param threads The number of threads to use
     */
    exec(filename: string, threads: number = 1) {
        this.ns.exec(filename, this.name, threads)
    }

    /**
     * Returns whether the local file is different from the remote version located on this server.
     * @param filename The name of the file to check
     * @return True if the files have changed, false otherwise
     */
    fileChanged(filename: string): boolean {
        this.downloadHash(filename)

        const remoteHash = parseInt(this.ns.read(hashFilename(filename)), 10)
        const localHash = hash(this.ns.read(filename))

        return localHash !== remoteHash
    }

    /**
     * Returns the maximum RAM available on this server
     * @return The maximum RAM
     */
    getMaxRAM(): number {
        return this.ns.getServerMaxRam(this.name)
    }

    /**
     * Establishes root access on the server for the given player.
     * @param player The player to use for getting root access
     */
    getRoot(player: Player) {
        const exploits = player.getActiveExploits()
        const requiredPorts = this.ns.getServerNumPortsRequired(this.name)

        for (let i = 0; i < requiredPorts; i++) {
            exploits[i](this.name)
        }

        this.ns.nuke(this.name)
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
     * Kills the given script running on this server.
     * @param filename The name of the script
     */
    killScript(filename: string) {
        this.ns.scriptKill(filename, this.name)
    }

    /**
     * Executes the given script on this server, using the maximum number of threads.
     * @param filename The name of the script
     */
    maxExec(filename: string) {
        const ram = this.ns.getServerMaxRam(this.name)
        const scriptRAM = this.ns.getScriptRam(filename, this.name)
        const threads = Math.floor(ram / scriptRAM)

        this.exec(filename, threads)
    }

    /**
     * Uploads the given file to the server.
     * @param filename The file to upload
     * @param withHash If true, will also upload a hash of the file
     */
    upload(filename: string, withHash: boolean = false) {
        const files = [filename]

        if (withHash) {
            const filenameHash = `${filename}.txt`
            const fileHash = hash(this.ns.read(filename))
            this.ns.write(hashFilename(filename), fileHash.toString(), 'w')
            files.push(hashFilename(filename))
        }

        this.ns.scp(files, this.name, 'home')
    }
}