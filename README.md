# aeamy

This is dependent of signaling server ayame, because use ayame web sdk.  
You neet to run signaling server, and modify websocket endpoint.

## Dependency
- [ayame](https://github.com/OpenAyame/ayame)(signaling server)

## How to use
```sh
$ docker run --rm -it -d -p 8080:3000 aeamy
# Run signaling server ayame, and change wss endpoint.
```

## Deploy
```sh
$ firebase deploy hosting
```
