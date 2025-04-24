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
  iv)  after all the above ste





