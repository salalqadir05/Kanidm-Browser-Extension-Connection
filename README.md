# Kanidm-webauth-linux-localy
I am building this repo to help out the kanidm server integration with website or extension.
`Steps you need to follow`

1-step
a) you must have a docker installed in your pc.
b) declare vloumn for the kanidm
    ```docker volume create kanidmd```
2-step
a) pull the docker conatiner with this command
   ```docker pull docker.io/kanidm/server:latest```
b) create new toml file with name server. you can create with this command.
   ```touch server.toml```
c) so we running locally we need set our domian and locally.first we need to run 
  i) ```nano server.toml```
  ii) paste the data like given below
      ```
      bindaddress = "[::]:8443"
      db_path = "/data/kanidm.db"
      tls_chain = "/data/chain.pem"
      tls_key = "/data/key.pem"
      domain = "localhost"
      origin = "https://localhost:8443"
      [online_backup]
      path = "/data/kanidm/backups/"
      schedule = "00 22 * * *"
      ```
  iii) ctrl + x and then press y and then press enter.
  iv)  after all the above steps run the given below commands:
        ```docker volume create kanidmd
           docker create --name kanidmd \
          -p '443:8443' \
          -p '636:3636' \
          -v kanidmd:/data \
          docker.io/kanidm/server:latest
          docker cp server.toml kanidmd:/data/server.toml
          docker run --rm -i -t -v kanidmd:/data \
          docker.io/kanidm/server:latest \
          kanidmd cert-generate
          docker start kanidmd```
v)  Recover the Admin Role Passwords for run given below commands.
        ```docker exec -i -t kanidmd \
           kanidmd recover-account admin
           docker exec -i -t kanidmd \
           kanidmd recover-account idm_admin```
vi) install kanidm-client in you pc through this link this official guide of the kanidm because every operating system installing guide is available https://kanidm.github.io/kanidm/stable/installing_client_tools.html
vii)  set the file with no extension 
         ```# ~/.config/kanidm
            uri = "https://localhost:443"
            verify_ca = false```
viii)  now you login as idm_admin because its manage the people accounts and password shown in the above commands.
        ```kanidm login --name idm_admin```

ix) now the last step for installation create a first person 
     ```kanidm person create salal salal```
        format of the command
       ```kanidm person create <your username> <Your Displayname>```
    after that run last command to set a password or passkey for the person
        ```kanidm person credential create-reset-token <your username>```
    




        
    
 







