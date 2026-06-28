REMOTE_HOST = root@11.123.150.51
REMOTE_DIR = /root/super-resume-maker

sync:
	rsync -avz --delete \
		--exclude 'node_modules' \
		--exclude '.git' \
		--exclude 'data/resumes/*.json' \
		--exclude 'client/dist' \
		./ $(REMOTE_HOST):$(REMOTE_DIR)/

start:
	npm run install:all && npm install && npm run dev

test:
	cd server && npx jest --forceExit
	cd client && npx vitest run

.PHONY: sync start test
