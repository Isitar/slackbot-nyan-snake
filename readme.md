# Slackbot Nyan Snake

Fun little weekend project I had.
A slackbot that runs a snake game.

## installation (in k8s)
 - create a deployment with the image `isitar/slackbot-nyan-snake:stable`
   - exposed port: 3000 
   - environment variables `SLACK_BOT_TOKEN` and `LACK_SIGNING_SECRET`
 - setup ingress and redirect your `redirect url` from slack to your deployment (on port 3000)
 
## usage
add the app to your slack channel
send `game` to start a game.
send `game2` to start a game where every message gets deleted.
