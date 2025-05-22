# Kanidm-Browser-Extension-Connection-locally
I am building this repo to help out the kanidm server integration with website or extension.

## Steps to Follow

**1. Prerequisites:**

*   Ensure Docker is installed on your PC.
*   Create a Docker volume for Kanidm data:

    ```bash
    docker volume create kanidmd
    ```

**2. Installation:**

*   Pull the Kanidm server Docker image:

    ```bash
    docker pull docker.io/kanidm/server:latest
    ```
*   Create a `server.toml` file:

    ```bash
    touch server.toml
    ```
*   Configure `server.toml` for local development:

    1.  Open the file in a text editor:

        ```bash
        nano server.toml
        ```
    2.  Paste the following configuration:

        ```toml
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
    3.  Save and close the file (Ctrl+X, then Y, then Enter).
    4.  Run the following Docker commands:

        ```bash
        docker volume create kanidmd
        docker create --name kanidmd \
        -p '443:8443' \
        -p '636:3636' \
        -v kanidmd:/data \
        docker.io/kanidm/server:latest
        docker cp server.toml kanidmd:/data/server.toml
        docker run --rm -i -t -v kanidmd:/data \
        docker.io/kanidm/server:latest \
        kanidmd cert-generate
        docker start kanidmd
        ```
    5. Recover the Admin Role Passwords:

        ```bash
        docker exec -i -t kanidmd \
        kanidmd recover-account admin
        docker exec -i -t kanidmd \
        kanidm recover-account idm_admin
        ```
    6. Install the Kanidm client tools. Refer to the official Kanidm guide for your operating system: [https://kanidm.github.io/kanidm/stable/installing_client_tools.html](https://kanidm.github.io/kanidm/stable/installing_client_tools.html)

    7. Configure the Kanidm client (e.g., `~/.config/kanidm`):

        ```
        # ~/.config/kanidm
        uri = "https://localhost:443"
        verify_ca = false
        ```

    8. Log in as `idm_admin` to manage users and passwords:

        ```bash
        kanidm login --name idm_admin
        ```

    9. Create a user account:

        ```bash
        kanidm person create salal salal
        ```

        **Format:**

        ```bash
        kanidm person create <your username> <Your Displayname>
        ```

    10. Generate a password reset token for the user:

        ```bash
        kanidm person credential create-reset-token <your username>
        ```
    11. you will get the link and and QR code and you click on the redirect to reset password page then you set a password or passkey


**3. Setting Up System Oauth2 Account:**

   * Now, create a group for your Extension. If you want to fetch the `idm_account` password from the above Docker command, always select `idm_admin`.

      ```bash
      kanidm create group your_group_name
      ```

   * Then, create a `client_id` and `client_secret` for your Extension:

      1. Create an OAuth account:

         ```bash
         kanidm system oauth2 create your_account_name "your extension name or displayname" https://your_extension_id.chromiumapp.org/
         ```

      2. Add a redirect URL for that account:

         ```bash
         kanidm system oauth2 add-redirect-url your_account_name https://your_extension_id.chromiumapp.org/
         ```

      3. Update the scope you want, like `email`, `name`, `openid`, or anything else:

         ```bash
         kanidm system oauth2 update-scope-map your_account_name your_group_name openid email groups
         ```

      4. As the last step for this, run the command to show client secret:

         ```bash
         kanidm system oauth2 show-basic-secret your_account_name
         ```

   * Now you will get the client secret, and the client ID will be your account name. Put both into your environment file.

**4. Create Restful API Token As Admin:**

    * Now, run the commands below to create a new token set. First:

    ```bash
    kanidm service-account create public_api "Public API Client" idm_admin --name idm_admin
    kanidm service-account api-token generate --name idm_admin public_api "Public RW Token" --rw
    kanidm group add-members idm_people_on_boarding public_api --name idm_admin
    kanidm group add-members idm_group_admins public_api --name idm_admin
    ```

Now you will get the token. Set this and also the `client_id` and `client_secret` in the env.
