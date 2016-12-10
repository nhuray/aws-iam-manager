# aws-iam-manager

Manager your IAM Users, Roles, Groups and Policies using Github Repository with simple AWS Lambda function based on-top Serverless framework.

### Installation

1. ```npm install -g serverless@1.3.0```
2. Setup your AWS credentials in ```~/.aws/credentials```
3. Open ```serverless.yml``` and choose region where you'd like to deploy
4. Execute ```serverless deploy``` and wait for results.
5. Navigate to `https://console.aws.amazon.com/iam/home?region=<YOUR_REGION_NAME>#/users/GithubHookUser?section=security_credentials` and click `Create access key`. Wait couple seconds to generate and then download generated CSV file or copy `Access Key` & `Secret access key`. You'll need that data to setup Github hook.
6. Navigate to `https://console.aws.amazon.com/iam/home?region=<YOUR_REGION_NAME>#/users/GithubHookUser?section=permissions&policy=direct.githubhookuser.githubhookallowsnssubscriptionpolicy` and copy `Resource` value. It should something like this: `arn:aws:sns:us-east-1:YOUR_AWS_ACC_NUMBER:aws-iam-manager-dev-GithubNotifyTopic-xxxxx`.
7. Go to `https://github.com/YOUR_NAME/REPO/settings/hooks/new?service=amazonsns` and fill form with data you retrieved in steps 5 & 6. Lastly, click `Add Service`.
8. Now `aws-iam-manager` will continiously monitor your GitHub repo and reflect changes on AWS account.

### Private Repositories
In case your repository is private you need to include `access_token` in every request to Github API. To do that, generate new Personal Access Token, copy `secrets.yml.example` to `secrets.yml` (or run `npm run prepare-secrets`) and paste there.

### Local Development
For ease and speed of development it's highly recommended to test code locally using ```npm run invoke``` script which will run function locally with data from `event.json`.

For nicer output you should also consider installing `bunyan` globally. If not, feel free to remove `| bunyan` part from `package.json`.