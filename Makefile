HOST ?= 0.0.0.0
PORT ?= 1313
OTHER ?= ""

# Example is `make serve HOST=192.168.1.19`
# To build with hidden drafts, (like pricing): make serve OTHER="--cleanDestinationDir --buildDrafts=false"
serve:
	hugo serve --baseURL http://$(HOST):$(PORT)/ --bind $(HOST) --port $(PORT) $(OTHER)

build:
	npm run build

clean:
	npm run clean
