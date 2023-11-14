# k8s is a folder and a target, so we need to declare that `make k8s`
# should still run, even if there have been no changes to the k8s/
# folder.
.PHONY: k8s

APP_NAME := ruok
APP_VERSION := 0.0.1

# Figure out if podman or docker is being used as the container runtime
CONTAINER_RUNTIME := $(shell command -v podman 2> /dev/null || echo docker)

#   _           _ _     _ 
#  | |__  _   _(_) | __| |
#  | '_ \| | | | | |/ _` |
#  | |_) | |_| | | | (_| |
#  |_.__/ \__,_|_|_|\__,_|

# Build all images in the repo
build: build-ui-image build-api-image build-webhook-server-image build-graph-updater build-octokit-scanner build-cloned-repo-scanner build-web-endpoint-scanner

# Web UI Server
build-ui-image:
	$(CONTAINER_RUNTIME) build ./ui/ -t localhost/$(APP_NAME)-ui:$(APP_VERSION)

# GraphQL API
build-api-image:
	$(CONTAINER_RUNTIME) build ./api/ -t localhost/$(APP_NAME)-api:$(APP_VERSION)

# Scanners
build-octokit-scanner:
	$(CONTAINER_RUNTIME) build ./scanners/github-octokit-checks/ -t localhost/$(APP_NAME)-octokit-scanner:$(APP_VERSION)

build-cloned-repo-scanner:
	$(CONTAINER_RUNTIME) build ./scanners/github-cloned-repo-checks/ -t localhost/$(APP_NAME)-cloned-repo-scanner:$(APP_VERSION)

build-web-endpoint-scanner:
	$(CONTAINER_RUNTIME) build ./scanners/web-endpoint-checks/ -t localhost/$(APP_NAME)-web-endpoint-scanner:$(APP_VERSION)

# Webhook Server
build-webhook-server-image:
	$(CONTAINER_RUNTIME) build ./event-collectors/github-webhook-server/ -t localhost/$(APP_NAME)-webhook-server:$(APP_VERSION)

# Graph Updater
build-graph-updater:
	$(CONTAINER_RUNTIME) build ./graph-updater/ -t localhost/$(APP_NAME)-graph-updater:$(APP_VERSION)

kind-push-api:
	kind load docker-image localhost/$(APP_NAME)-api:$(APP_VERSION)

kind-push-webhook-server:
	kind load docker-image localhost/$(APP_NAME)-webhook-server:$(APP_VERSION)

kind-push-all: kind-push-webhook-server kind-push-api
	

#       _            _             
#    __| | ___ _ __ | | ___  _   _ 
#   / _` |/ _ \ '_ \| |/ _ \| | | |
#  | (_| |  __/ |_) | | (_) | |_| |
#   \__,_|\___| .__/|_|\___/ \__, |
#             |_|            |___/ 
k8s-deploy:
    # Deploy CRDs separately from rest of manifests to avoid race condition
	echo DEPLOY ARANGODB OPERATOR CRDS
	kubectl apply -k ./k8s/arangodb-crds/
	echo DEPLOY MAIN APPLICATION AFTER CRDS ARE INSTALLED
	sleep 2
	kubectl apply -k ./k8s/

k8s-destroy:
	kubectl delete -k ./k8s/
	kubectl delete -k ./k8s/arangodb-crds/

port-forward:
	kubectl port-forward svc/example-simple-single-ea 8529:8529 &
	kubectl port-forward svc/nats 4222:4222 &
	kubectl port-forward svc/webhook-server 3000:3000 &
	kubectl port-forward svc/graphql-api 4000:4000 &
	kubectl port-forward svc/ui-server 8080:8080