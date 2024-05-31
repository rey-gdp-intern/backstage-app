run-db:
	docker stop db-backstage
	docker rm db-backstage
	docker run --name db-backstage -p 5436:5432 -e POSTGRES_USER=backstage -e POSTGRES_PASSWORD=backstage -d postgres14-ethical

run:
	NODE_OPTIONS=--no-node-snapshot
	yarn dev

dbuild:
	docker image build --platform=linux/amd64 -t reyshazni/backstage-amd .

dpush:
	docker image build --platform=linux/amd64 -t reyshazni/backstage-amd .
	docker push reyshazni/backstage-amd

drun:
	docker run --platform=linux/amd64 -dp 7007:7007 reyshazni/backstage-amd

pf:
	kubectl port-forward -n backstage backstage-5f587868b9-fk2lw 7007