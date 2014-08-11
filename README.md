# LightPalette #
Light-weight, multi-content-form blog engine based on node.js, mongodb, and fw.mpa.

# Usage #
1. Ensure you have node.js>=0.10.0 and mongodb>=2.4.0 (>=2.6.0 if you need post content search support provided by mongodb).
1. Clone this repo, or just download the code.
1. Run `npm install .` in the root of this repo.
1. Put theme code into `client/theme/`. There is one in the `default/theme/` directory in this repo.
1. Put `favicon.ico` and `loading.gif` into `rc/` (optional).
1. Copy `config.json.sample` to `config.json`, and modify the configurations.
1. Run `FW=CACHE node app.js`. For debugging, run `FW=DEBUG node app.js`.
1. Now it's running on [localhost:1180](http://localhost:1180/)!
1. Visit [backstage](http://localhost:1180/backstage) and register an account. That will be an admin account.
1. Login with the admin account, and go to settings. Set all settings carefully.
1. Tell your friends that you are using LightPalette!

# LICENSE #
Copyright 2014 LastLeaf, MIT License.
