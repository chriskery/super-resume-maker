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
	ssh $(REMOTE_HOST) "cd $(REMOTE_DIR) && npm install --prefix server && npm install --prefix client && npm run dev"

test:
	cd server && npx jest --forceExit
	cd client && npx vitest run

.PHONY: sync start test
