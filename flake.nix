{
  description = "Svelte F1 Guessgame";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.devshell.url = "github:numtide/devshell";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    devshell,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
        overlays = [devshell.overlays.default];
      };

      timple = pkgs.python312Packages.buildPythonPackage rec {
        pname = "timple";
        version = "0.1.8";

        src = pkgs.python312Packages.fetchPypi {
          inherit pname version;
          hash = "sha256-u8EgMA8BA6OpPlSg0ASRxLcIcv5psRIEcBpIicagXw8=";
        };

        doCheck = false;
        pyproject = true;

        # Build time deps
        nativeBuildInputs = with pkgs.python312Packages; [
          setuptools
        ];

        # Run time deps
        dependencies = with pkgs.python312Packages; [
          matplotlib
          numpy
        ];
      };

      fastf1 = pkgs.python312Packages.buildPythonPackage rec {
        pname = "fastf1";
        version = "3.4.4";

        src = pkgs.python312Packages.fetchPypi {
          inherit pname version;
          hash = "sha256-nELQtvzlLsUYyVaPe1KqvMmzHy5l5W7u1I6m8r8md/4=";
        };

        doCheck = false;
        pyproject = true;

        # Build time deps
        nativeBuildInputs = with pkgs.python312Packages; [
          hatchling
          hatch-vcs
        ];

        # Run time deps
        dependencies = with pkgs.python312Packages; [
          matplotlib
          numpy
          pandas
          python-dateutil
          requests
          requests-cache
          scipy
          rapidfuzz
          websockets
          timple
        ];
      };
    in {
      devShell = pkgs.devshell.mkShell {
        name = "Formula11";

        packages = with pkgs; [
          nodejs_23
          pocketbase

          sqlite # For sqlite console
          sqlitebrowser # To check low-level pocketbase data
        ];

        # Use $1 for positional args
        commands = [
          {
            name = "pb";
            help = "Serve PocketBase";
            command = "pocketbase serve --http 192.168.86.50:8090 --dev";
          }
          {
            name = "dev";
            help = "Serve Formula 11 (Dev)";
            command = "npm run dev -- --host --port 5173";
          }
          {
            name = "prod";
            help = "Serve Formula 11 (Prod)";
            command = "npm run build && npm run preview -- --host --port 5173";
          }
          {
            name = "check";
            help = "Continuously monitor for SvelteKit issues";
            command = "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch";
          }
        ];
      };
    });
}
