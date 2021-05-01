import { Amy } from "@amy-app/js-sdk";
import { AppPage, createAmyTheme } from "@amy-app/react-components";
import { useAmyObserver } from "@amy-app/react-components/dist/src/tools/amyHooks";
import { Button, CssBaseline, TextField } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import firebase from "firebase";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import "./index.css";
import "./pathways.css";
import reportWebVitals from "./reportWebVitals";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
}));

Amy.initialize();

const firebaseConfig = {
  apiKey: "AIzaSyAZ1chyFHO2_yCc4ESXA4vjUuM_66KfMlg",
  authDomain: "pathways-amy.firebaseapp.com",
  projectId: "pathways-amy",
  storageBucket: "pathways-amy.appspot.com",
  messagingSenderId: "595540530021",
  appId: "1:595540530021:web:8d999fa24b3235e058078c",
  measurementId: "G-JWGE4WX1QN"
};


const pathwaysAmyApp = firebase.initializeApp(firebaseConfig, 'pathways-amy');
const auth = firebase.auth(pathwaysAmyApp);
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

async function signInAndGetToken(signInPromise) {
  let token;
  try {
    await signInPromise;
    const { data } = await pathwaysAmyApp
      .functions('northamerica-northeast1')
      .httpsCallable('getAmyToken')();
    token = data.token;
  }
  catch (error) {
    alert(error.message);
    return;
  }
  try {
    await Amy.get().signInViaToken({ token });
    console.log("Amy is logged in. Wait for the magic to happen!");
  }
  catch (error) {
    alert(`Amy sign in error: ${error.message}`);
  }
}

if (window.location.hostname === 'localhost') {
  pathwaysAmyApp
    .functions('northamerica-northeast1')
    .useEmulator('localhost', 5001)
  auth.useEmulator('http://localhost:9099/')
}

const theme = createAmyTheme({
  typography: {
    fontFamily: ["Roboto", "sans-serif"].join(","),
  },
  backdrop: {
    background: '#f8f8f8',
    fadeBackground: true,
    useDarkText: true,
  },
  header: {
    background: '#fff',
    useDarkText: true,
  },
  login: {
    background: "rgb(255, 255, 255)",
    // background: "rgb(255, 255, 254)",
    hidePoweredBy: true,
  },
  palette: {
    action: {
      active: "rgb(255, 255, 255)"
      // active: "rgb(1,1,1)",
    },
    primary: {
      main: "rgba(0,0,0,.6)"
      // main: "rgb(255, 255, 255)",
    },
    secondary: {
      main: "#808080",
    },
  },
  shape: {
    borderRadius: 5,
  },
  row: {
    border: "2px solid",
    borderLeft: "8px solid",
    padding: "0px 15px",
  },
  instructionRow: {
    backgroundColor: "#59A6FF",
  },
  feedbackRow: {
    neutralBackgroundColor: "#59A6FF",
    positiveBackgroundColor: "#59A6FF",
    negativeBackgroundColor: "#59A6FF",
  },
  optionRow: {
    marginLeft: 10,
    correctBackgroundColor: "#FC9854",
    incorrectBackgroundColor: "#B3B3B3",
  },
  stickyInstruction: true,
  stickyOption: true,

  props: {
    MuiGrid: {
      spacing: 1,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <AppPageWrapper />
  </React.StrictMode>,
  document.getElementById("root"),
);

function AppPageWrapper() {
  const { user } = useAmyObserver();
  return (
    <div className={user ? 'logged-in' : 'logged-out'}>
      <img src="/logo.png" alt="logo" className="logo" />
      <AppPage
        login={<AuthSpace />}
        theme={theme}
      />
    </div>
  )
}

function AuthSpace() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const classes = useStyles();

  return (
    <div className={`${classes.paper} sign-in-form`}>
      <TextField
        variant="outlined"
        label="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <TextField
        value={password}
        placeholder="password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        className="green"
        onClick={() => {
          signInAndGetToken(auth.signInWithEmailAndPassword(email, password));
        }}
      >
        Sign In
      </Button>

      <GoogleLoginButton
        onClick={() => {
          signInAndGetToken(auth.signInWithPopup(googleProvider));
        }}
      />

      <FacebookLoginButton
        onClick={() => {
          signInAndGetToken(auth.signInWithPopup(facebookProvider));
        }}
      />
    </div>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
