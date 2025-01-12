HOST ?= 0.0.0.0
PORT ?= 1313

# Example is `make serve HOST=192.168.1.19`
serve:
	hugo serve --baseURL http://$(HOST):$(PORT)/ --bind $(HOST) --port $(PORT)

build:
	npm run build

clean:
	npm run clean
