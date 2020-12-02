import { Container, LinearProgress } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MailIcon from "@material-ui/icons/Mail";
import MenuIcon from "@material-ui/icons/Menu";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";
import React, { useState } from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import "./App.css";
import StudentAssignmentPage from "./features/StudentAssignmentPage/StudentAssignmentPage";

// if (firebase.apps.length === 0) {
//     const firebaseApp = firebase.initializeApp(amyConfigs, "amy.app");
//     console.log("app name", firebaseApp.name);
//     const amy = initializeAmy({ firebaseApp });

//     amy.readyObserver((ready) => {
//         console.log("app name", firebaseApp.name);
//         console.log("ready", ready);
//     });

//     // amy.signInViaToken(
//     //     "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTYwNjgxMTg3NywiZXhwIjoxNjA2ODE1NDc3LCJpc3MiOiJhbXktLWFwcEBhcHBzcG90LmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJhbXktLWFwcEBhcHBzcG90LmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiJKYWlwdW5hX2RlbW8xX2RlbW9TdHVkZW50MSIsImNsYWltcyI6eyJzY2hvb2xJZCI6IkphaXB1bmFfZGVtbzEiLCJyb2xlIjoic3R1ZGVudCJ9fQ.Pg734O_ph7ThjqJ9rzuCFMBw4rwxr3mMBOeFnS0l8_zr6r5aUDE8pnq2v9-HotbFngjv0nmXb3RnBe9PWsdxYIytBEwe_2IDY5FzpbW-ClV_DwBGLHtoKH-lPBCUKHcNvAPhyz0VUT7rlz9V8ST10wfbhDIeWLzZKMOeVTffIjyp5LK3Bv1SfgujGz5flFGKrrzcjMc3Ia26NSL2F5ADP90XMYhYiy0HCZLEYNZYUYGXyeMILWHUV_-FhGoklhaMRxtcjhGwOcsqX1LuzPUAoRIH6wvWL2X_c_OGkjQ9T2PguYWuhHSuk-sThEg6WGroddnvs8FBq2LPhNbmHopSbA",
//     // );
// }

function Header() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(!open)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6">White Label for Amy.app</Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                container={window.document.body}
                open={open}
                onClick={() => {
                    setOpen(false);
                }}
            >
                <List>
                    <ListItem button component={Link} to="/">
                        <ListItemIcon>
                            <MailIcon />
                        </ListItemIcon>
                        <ListItemText primary={"Home"} />
                    </ListItem>
                </List>
            </Drawer>
        </>
    );
}

function App() {
    // const [user, loading] = useAuthState(firebase.auth());
    const loading = false;
    // we show a progress spinner until we know the definite state of the user. which is logged in or not
    if (loading) {
        return <LinearProgress />;
    }

    // if (!user) {
    //     return <Login />;
    // }

    return (
        <div style={{ backgroundColor: "#f5f5f5", height: "100vh", width: "100vw" }}>
            <Router>
                <Header />
                <Container maxWidth={false} style={{ padding: "20px" }}>
                    <Switch>
                        <Route path="/">
                            <StudentAssignmentPage />
                        </Route>
                    </Switch>
                </Container>
            </Router>
        </div>
    );
}

export default App;
