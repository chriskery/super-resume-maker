REMOTE_HOST = root@11.123.150.51
REMOTE_DIR = /root/super-resume-maker

sync:
	rsync -avz --delete \
		--exclude 'node_modules' \
		--exclude '.git' \
		--exclude 'data/resumes/*.json' \
		--exclude 'client/dist' \
		./ $(REMOTE_HOST):$(REMOTE_DIR)/

.PHONY: sync
