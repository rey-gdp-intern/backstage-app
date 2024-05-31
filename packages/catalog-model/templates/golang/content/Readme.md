# Go Backend REST Server Template
Self made go REST API server template
## Requirements
### What you need
1. Golang 1.19
2. Docker
3. Working text editor or ide (Vim, Nano, Goland, VSCode, etc)
### How to start development
1. Clone this repository
2. Run `make init` to initialize project or `go mod tidy` if you want to cache the library instead of vendoring
3. Start docker
4. Ask the lead for the secret keys
5. Run `make services-up` to run all services
6. If you want to specify which service you're going to start, use `make services-up SERVICE={service name}`

## Maintainer
1. Farhandika Zahrir Mufti Guenia - 18220015@std.stei.itb.ac.id