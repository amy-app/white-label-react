# Amy.app White Label Implementation in react

Welcome to the off official white label project for `Amy.app`.

<img src="images/amyScreen.png?raw=true" alt="Amy Screenshot" style="max-Height:400px"/>

## Getting started (client)

To get started, clone the repository and use `npm install` to install all dependencies.

After installing everything run `npm run https-start`

## Getting started (backend)

Set up amy key with `firebase functions:config:set amy.x-api-key=yourKey`

To start firebase emulator go to functions `cd backend/functions` and 

1. first make sure firebase config can be accessed by emulators with `firebase functions:config:get > .runtimeconfig.json` . Note this step is needed only when working with emulators.
2. Then run emulators with `npm run emulate`
3. Go to firebase auth emulator at `localhost:4000` and add a new user with some email/password
4. Now you can go to `https://localhost:3000` and use credentials from the step above to sign in to Amy

## Documentation

You can find out everything about how to use this project and the `Amy.app` SDK on https://docs.amy.app.
