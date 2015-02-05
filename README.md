# LightPalette #

LightPalette: Multi-Content-Form Blog Engine

LightPalette runs on linux (*nix, Windows are also possible) with node.js and mongodb.

# Basic Installation (on localhost as example) #

1. Ensure you have node.js>=0.10.0 and mongodb>=2.4.0.
1. Clone this repo, or just download it.
1. Run `npm install` in the root directory of this project.
1. Run `node .` in the root directory of this project. For debugging, run `FW=DEBUG node .`.
1. Visit installation guide at [localhost:1180](http://localhost:1180/). You need to provide mongodb connection information during installation.
1. After installation, you should be guided to [Sites Manager](http://localhost:1180/backstage/sites). Set a strong password and NEVER forget.
1. You can create LightPalette site instances in the sites manager. Create one, and allocate a host (with port, e.g. localhost:1280) to it.
1. In order to be able to visit LightPalette in a port other than 1180, you should use port redirection (see below) or reverse proxy.
1. After enabling the created instance, you can visit "/backstage" of the allocated host (e.g. http://localhost:1280/backstage).
1. In backstage, go to "settings" panel and configure carefully.
1. Go to "addons" panel and enable plugins you need. You should enable at least one post driver.
1. Done! Write you first LightPalette blog!

# Port Redirection with iptables #

You can setup port redirection simply with iptables on linux. The commands below shows how to redirect the tcp connection on port 1280 to port 1180.

```sh
# iptables -t nat -A PREROUTING -p tcp --dport 1280 -j REDIRECT --to-port 1180
# iptables-save
```

# Creating Plugins and Themes #

You are able to write your own plugins and themes!

1. Run LightPalette in debug mode (FW=DEBUG). Enable a site for debug your plugin or theme.
1. Global plugins and themes are placed in "plugins" and "themes" in the working directory of LightPalette.
1. Per-site plugins and theme are placed in "sites/_SiteId_/plugins" and "sites/_SiteId_/themes".
1. Plugins guide and themes guide are coming soon. Currently, you can read and modify the built-in plugins and the default theme.

# LICENSE #

The MIT License (MIT)

Copyright (c) 2014-2015 LastLeaf (Fu Boquan)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
