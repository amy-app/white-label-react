import { Amy } from "@amy-app/js-sdk";
import { AppPage, createAmyTheme } from "@amy-app/react-components";
import { Button, CssBaseline, TextField } from "@material-ui/core";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

Amy.initialize();

const theme = createAmyTheme({
    palette: {
        primary: {
            main: "#002566",
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
        color: "#59A6FF",
    },
    feedbackRow: {
        neutralColor: "#59A6FF",
        positiveColor: "#59A6FF",
        negativeColor: "#59A6FF",
    },
    optionRow: {
        marginLeft: 10,
        correctColor: "#FC9854",
        incorrectColor: "#B3B3B3",
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
        <AppPage
            logoSrc={"/logo512.png"}
            login={<AuthSpace />}
            theme={theme}
        />
    </React.StrictMode>,
    document.getElementById("root"),
);

function AuthSpace() {
    const [token, setToken] = useState("");

    return (
        <>
            <TextField
                value={token}
                onChange={(e) => {
                    setToken(e.target.value);
                }}
            />
            <Button
                variant="outlined"
                color="primary"
                disabled={!token}
                onClick={() => {
                    // sign in
                    Amy.get().signInViaToken({ token }).then(() => {
                        console.log("Amy is logged in. Wait for the magic to happen!");
                    });
                }}
            >
                Login
            </Button>
        </>
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
