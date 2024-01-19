# Quickstart for Development

After [development environment](./development-environment.md) has been set up: 

1. If k8s is running on your machine with the ruok containers, skip to step 2, else:

In local terminal (ctrl, shift, p -> new integrated terminal):

```
make build
make kind-push-all
make k8s-deploy
```


2. Forward ports to local machine.  In local terminal (ctrl, shift, p -> new integrated terminal):
```
make port-forward
```
Do not close this terminal - open a new one to continue. 

3. Add the 'ruok' database 

* In a web browser, navigate to http://localhost:8529/
* Username - root, no password, login
* In _system db, in the left menu, select databases.  Add a db called 'ruok'.  
* In the header, select the refresh icon near _system db.
* Log back into ruok database with the previous credentials.

4. Populate the database
```
cd api/src
python initialize_db.py
```

5. Populate the .env files

6. Spin up webhook server (listening for events from github)
```
cd /workspaces/ruok-service-autochecker/event-collectors/github-webhook-server
make forward-webhook
```
Note - you may need to direnv allow first
Leave this terminal open as well, open another terminal to continue. 

6. If you're working with the scanners, or need the database populated with a GitHub Repo scan, either re-send an event from github, or manually send one with NATS. 
```
nats pub "EventsScanner.githubEndpoints" "{\"endpoint\":\"https://github.com/PHACDataHub/ruok-service-autochecker\"}"
```

7. Update containers with dev changes 
Rebuid containers, push to kind (in local terminal)
```
make build
make kind-push-all
```
Once pushed, delete pod (using k9s) in order to propagate the new changes.