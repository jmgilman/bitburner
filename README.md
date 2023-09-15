# Bitburner Scripts

This repository contains my code for automating the Bitburner game.

## Setup

```bash
# Clone the repo
> git clone https://github.com/jmgilman/bitburner

# Install dependencies
> npm install

# Watch for changes
> npm run watch
```

Once the watch script is running, open the BitBurner game and perform the
following:

1. Navigate to Options -> Remote API
2. In the port field, enter the following value: 12525
3. Click Connect
4. The icon should turn green and the status should change to "online"

At this point, the watch script will compile all Typescript files and
automatically copy the scripts to the root of your home folder. Making changes
to any of the files will automatically recompile and copy the files to the game.

## Usage

### Scanner

To start the scanner:

```text
run scanner.js
```

The scanner will recursively scan the entire network and build a "cluster" of
all _valid_ servers. A _valid_ server is:

1. A server with more than 0GB of RAM
2. A server that can be successfully rooted

In case a server isn't already rooted, the scanner will automatically apply any
relevant exploits and root the server. When finished, the scanner will store all
servers in the home folder under `cluster.json.txt`. By default, this process
repeats every 60 seconds.

A cluster can be loaded for use in further scripts:

```typescript
import { Cluster } from "lib/cluster";
import { NS } from "@ns";

async function main(ns: NS): Promise<void> {
  const cluster = Cluster.fromFile(ns, '/cluster.json.txt')

  // .....
}
```
